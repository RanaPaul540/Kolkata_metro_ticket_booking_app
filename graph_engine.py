import heapq
from collections import defaultdict
from app.db.sqlite_client import get_sqlite_conn


def _load_graph(conn):
    """
    Loads stations and builds a weighted adjacency list from both the
    connections (train-track) and interchanges (walking-transfer) tables.
    Each station-line row in `stations` is treated as an independent graph node,
    matching the schema's "separate station per line" design.
    """
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, line FROM stations;")
    station_by_id = {row["id"]: {"name": row["name"], "line": row["line"]} for row in cursor.fetchall()}

    adjacency = defaultdict(list)

    cursor.execute("SELECT station_a_id, station_b_id, travel_time_minutes, fare_inr FROM connections;")
    for row in cursor.fetchall():
        adjacency[row["station_a_id"]].append({
            "to": row["station_b_id"],
            "weight": row["travel_time_minutes"],
            "fare": row["fare_inr"],
            "edge_type": "ride",
        })

    cursor.execute("SELECT station_from_id, station_to_id, transfer_time_minutes FROM interchanges;")
    for row in cursor.fetchall():
        adjacency[row["station_from_id"]].append({
            "to": row["station_to_id"],
            "weight": row["transfer_time_minutes"],
            "fare": 0,
            "edge_type": "transfer",
        })

    return station_by_id, adjacency


def _dijkstra(source_ids, dest_ids, adjacency):
    """
    Multi-source, multi-target Dijkstra over travel-time (connections) and
    transfer-time (interchanges) as edge weights. Returns the end node id
    reached with the lowest total time, plus predecessor info to rebuild the path.
    """
    dist = {sid: 0 for sid in source_ids}
    prev = {}
    visited = set()
    pq = [(0, sid) for sid in source_ids]
    heapq.heapify(pq)

    while pq:
        d, node = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)

        for edge in adjacency.get(node, []):
            neighbor = edge["to"]
            new_dist = d + edge["weight"]
            if neighbor not in dist or new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = (node, edge["edge_type"], edge["fare"])
                heapq.heappush(pq, (new_dist, neighbor))

    reached = [nid for nid in dest_ids if nid in dist]
    if not reached:
        return None, dist, prev

    end_node = min(reached, key=lambda nid: dist[nid])
    return end_node, dist, prev


def _reconstruct_path(end_node, source_ids, prev):
    """Walks the prev-pointer chain back to a source node and returns it in travel order."""
    path_nodes = [end_node]
    edges = []  # edges[i] is the edge taken from path_nodes[i] to path_nodes[i+1] once reversed
    node = end_node
    while node in prev:
        parent, edge_type, fare = prev[node]
        edges.append((edge_type, fare))
        path_nodes.append(parent)
        node = parent

    path_nodes.reverse()
    edges.reverse()
    return path_nodes, edges


def get_metro_route(source_name: str, destination_name: str):
    """
    Computes the shortest route (based on travel time) between the source and
    destination metro stations using Dijkstra's algorithm.
    Reads station, connection, and interchange graphs dynamically from SQLite.
    """
    if not source_name or not destination_name:
        raise ValueError("Both source and destination station names are required.")

    with get_sqlite_conn() as conn:
        station_by_id, adjacency = _load_graph(conn)

    source_ids = [sid for sid, s in station_by_id.items() if s["name"].strip().lower() == source_name.strip().lower()]
    dest_ids = [sid for sid, s in station_by_id.items() if s["name"].strip().lower() == destination_name.strip().lower()]

    if not source_ids:
        raise ValueError(f"Source station '{source_name}' was not found in the metro network.")
    if not dest_ids:
        raise ValueError(f"Destination station '{destination_name}' was not found in the metro network.")
    if set(source_ids) & set(dest_ids):
        raise ValueError("Source and destination stations cannot be the same.")

    end_node, dist, prev = _dijkstra(source_ids, dest_ids, adjacency)

    if end_node is None:
        raise ValueError(f"No route could be found between '{source_name}' and '{destination_name}'.")

    path_nodes, edges = _reconstruct_path(end_node, source_ids, prev)

    total_fare = sum(fare for (_edge_type, fare) in edges)
    total_time = dist[end_node]
    interchanges_count = sum(1 for (edge_type, _fare) in edges if edge_type == "transfer")

    itinerary = []
    for idx, node_id in enumerate(path_nodes):
        station = station_by_id[node_id]
        is_interchange = idx < len(edges) and edges[idx][0] == "transfer"
        transfer_to = station_by_id[path_nodes[idx + 1]]["line"] if is_interchange else None

        itinerary.append({
            "station_name": station["name"],
            "line": station["line"],
            "is_interchange": is_interchange,
            "transfer_to": transfer_to,
        })

    return {
        "route_summary": {
            "source": source_name,
            "destination": destination_name,
            "total_fare_inr": total_fare,
            "total_travel_time_minutes": total_time,
            "interchanges_count": interchanges_count,
        },
        "ordered_itinerary": itinerary,
    }
