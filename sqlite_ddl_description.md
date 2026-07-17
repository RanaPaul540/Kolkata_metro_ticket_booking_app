# Kolkata Metro Metadata Graph Database Schema

## Overview

This database models the Kolkata Metro network as a graph. Each metro station is represented as a node, while railway tracks and interchange corridors are represented as edges.

The schema is designed to support:

- Route finding
- Shortest path algorithms
- Fare calculation
- Travel time estimation
- Multi-line interchange routing
- Graph-based traversal algorithms


---

# Entity Relationship Diagram

```text
                  +------------------+
                  |    stations      |
                  +------------------+
                  | id (PK)          |
                  | name             |
                  | line             |
                  +------------------+
                     ▲            ▲
                     │            │
      station_a_id   │            │ station_b_id
                     │            │
              +---------------------------+
              |       connections         |
              +---------------------------+
              | id (PK)                   |
              | station_a_id (FK)         |
              | station_b_id (FK)         |
              | travel_time_minutes       |
              | fare_inr                  |
              +---------------------------+

                     ▲            ▲
                     │            │
 station_from_id     │            │ station_to_id
                     │            │
              +---------------------------+
              |      interchanges         |
              +---------------------------+
              | id (PK)                   |
              | station_from_id (FK)      |
              | station_to_id (FK)        |
              | transfer_time_minutes     |
              +---------------------------+
```

---

# Table: `stations`

Stores every metro station in the Kolkata Metro network.

A station is uniquely identified by the combination of:

- Station Name
- Metro Line

This allows stations with the same physical name but belonging to different lines (interchange stations) to exist as separate records.

Example:

| Station | Line |
|----------|------|
| Esplanade | Blue |
| Esplanade | Green |
| Esplanade | Purple |

These are three independent nodes connected through the `interchanges` table.

---

## DDL

```sql
CREATE TABLE stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    line TEXT NOT NULL,
    UNIQUE(name, line)
);
```

---

## Columns

### id

**Type**

```
INTEGER
```

Primary key.

Auto-generated unique identifier for each station.

Example

```
12
```

---

### name

**Type**

```
TEXT
```

Human-readable station name.

Examples

- Dakshineswar
- Esplanade
- Noapara
- Park Street

---

### line

**Type**

```
TEXT
```

Metro line on which the station exists.

Examples

- Blue
- Green
- Purple
- Orange
- Yellow
- Pink

---

## Constraints

### Primary Key

```
id
```

---

### Unique Constraint

```
(name, line)
```

Prevents duplicate station definitions.

Allowed

| name | line |
|------|------|
| Esplanade | Blue |
| Esplanade | Green |

Not Allowed

| name | line |
|------|------|
| Esplanade | Blue |
| Esplanade | Blue |

---

# Table: `connections`

Represents railway track connections between adjacent stations on the same metro line.

Each row is a directed edge in the transportation graph.

Although railway tracks are physically bidirectional, the application stores **both directions** explicitly to simplify graph traversal.

Example

```
Dakshineswar → Baranagar
Baranagar → Dakshineswar
```

Both records exist independently.

---

## DDL

```sql
CREATE TABLE connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_a_id INTEGER NOT NULL,
    station_b_id INTEGER NOT NULL,
    travel_time_minutes INTEGER NOT NULL,
    fare_inr INTEGER NOT NULL,
    FOREIGN KEY(station_a_id) REFERENCES stations(id),
    FOREIGN KEY(station_b_id) REFERENCES stations(id)
);
```

---

## Columns

### id

Primary key.

Auto-generated.

---

### station_a_id

**Type**

```
INTEGER
```

Foreign key referencing the origin station.

References

```
stations(id)
```

---

### station_b_id

**Type**

```
INTEGER
```

Foreign key referencing the destination station.

References

```
stations(id)
```

---

### travel_time_minutes

**Type**

```
INTEGER
```

Estimated travel time between the two connected stations.

Unit

```
Minutes
```

Examples

| From | To | Time |
|------|----|------|
| Central | Chandni Chowk | 2 |
| Dum Dum | Belgachia | 3 |

---

### fare_inr

**Type**

```
INTEGER
```

Base fare for travelling between the two adjacent stations.

Unit

```
Indian Rupees (₹)
```

Examples

```
5
10
```

---

## Relationships

```
connections.station_a_id
        ↓
stations.id
```

```
connections.station_b_id
        ↓
stations.id
```

---

## Graph Interpretation

Each row represents an edge.

```
Station A ---------> Station B
```

Weight attributes

- Travel Time
- Fare

---

## Example

| station_a | station_b | Time | Fare |
|------------|-----------|------|------|
| Esplanade | Park Street | 2 | 5 |

---

# Table: `interchanges`

Represents walking connections between stations belonging to different metro lines.

Unlike `connections`, these edges do **not** represent train movement.

Instead, they represent passenger transfer corridors.

Examples

- Blue → Green
- Green → Purple
- Orange → Yellow

---

## DDL

```sql
CREATE TABLE interchanges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_from_id INTEGER NOT NULL,
    station_to_id INTEGER NOT NULL,
    transfer_time_minutes INTEGER NOT NULL,
    FOREIGN KEY(station_from_id) REFERENCES stations(id),
    FOREIGN KEY(station_to_id) REFERENCES stations(id)
);
```

---

## Columns

### id

Primary key.

Auto-generated.

---

### station_from_id

Foreign key referencing the source station.

```
stations(id)
```

---

### station_to_id

Foreign key referencing the destination station.

```
stations(id)
```

---

### transfer_time_minutes

Estimated walking time required to change lines.

Unit

```
Minutes
```

Examples

| From | To | Time |
|------|----|------|
| Esplanade Blue | Esplanade Green | 5 |
| Park Street Blue | Park Street Purple | 4 |

---

## Relationships

```
interchanges.station_from_id
        ↓
stations.id
```

```
interchanges.station_to_id
        ↓
stations.id
```

---

## Graph Interpretation

Represents pedestrian movement.

```
Blue Line Station
        │
        │ Walk
        ▼
Green Line Station
```

---

# Graph Model

The database forms a weighted directed graph.

## Vertices

```
stations
```

Each station is a node.

---

## Railway Edges

```
connections
```

Attributes

- travel_time_minutes
- fare_inr

---

## Walking Edges

```
interchanges
```

Attributes

- transfer_time_minutes

---

# Example Route

```
Dakshineswar (Blue)
        │
        ▼
Baranagar
        │
        ▼
Noapara
        │
        ▼
Dum Dum
        │
        ▼
...
        ▼
Esplanade (Blue)
        │
        │ 5 min transfer
        ▼
Esplanade (Green)
        │
        ▼
Sealdah
        ▼
Sector V
```

---

# Design Decisions

## Separate Station per Line

Interchange stations are modeled as distinct nodes rather than a single shared node.

Advantages

- Explicit transfer costs
- Accurate routing
- Support for station-specific metadata
- Cleaner graph traversal

---

## Directed Connections

Connections are stored in both directions.

Instead of inferring reverse edges during query execution,

```
A → B
```

and

```
B → A
```

are stored explicitly.

Advantages

- Simpler SQL
- Faster graph traversal
- Easier integration with graph algorithms

---

## Explicit Interchanges

Transfers are stored independently from train tracks.

This allows:

- Walking time estimation
- Different transfer costs
- Future support for accessibility routes
- Station-specific transfer metadata

---

# Summary

| Table | Purpose |
|---------|----------|
| `stations` | Stores metro stations as graph nodes |
| `connections` | Stores train-track edges between adjacent stations with travel time and fare |
| `interchanges` | Stores walking-transfer edges between different metro lines |

The resulting schema models the Kolkata Metro network as a weighted directed graph, enabling efficient route planning, fare estimation, travel-time calculation, and multi-line navigation.