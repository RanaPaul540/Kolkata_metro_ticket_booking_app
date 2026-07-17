import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.postgres_client import get_db, Ticket
from app.db.sqlite_client import get_sqlite_conn
from app.services.unlock_service import verify_and_unlock_system
from app.services.graph_engine import get_metro_route
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter()

# --- Request/Response Pydantic Schemas ---

class StationResponseSchema(BaseModel):
    id: int
    name: str
    line: str

@router.get("/allstations", response_model=List[StationResponseSchema])
def get_all_stations():
    """
    Fetches all metro stations and their line colors from the SQLite static database.
    """
    try:
        with get_sqlite_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, line FROM stations ORDER BY name, line;")
            rows = cursor.fetchall()
            return [{"id": row["id"], "name": row["name"], "line": row["line"]} for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stations from database: {str(e)}")


class SystemStatusResponse(BaseModel):
    status: str
    secret_code: Optional[str] = None
    error_message: Optional[str] = None
    checks: dict
    time_diff_seconds: Optional[float] = None

class TicketCreateSchema(BaseModel):
    source: str = Field(..., description="Source metro station name")
    destination: str = Field(..., description="Destination metro station name")
    fare: float = Field(..., description="Calculated ticket fare in INR")
    expires_in_minutes: int = Field(60, description="Lifespan of the ticket in minutes")

class TicketResponseSchema(BaseModel):
    id: int
    ticket_number: str
    source_station: str
    destination_station: str
    fare: float
    status: str
    created_at: datetime.datetime
    expires_at: datetime.datetime

    class Config:
        from_attributes = True

# --- API Endpoints ---

@router.get("/status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    """
    Evaluates the metro system security check and decrypts the clearance code if database
    vault values and the background thread heartbeats are valid.
    """
    res = verify_and_unlock_system(db)
    return res

@router.get("/route")
def calculate_route(
    source: str = Query(..., description="Starting station name"),
    destination: str = Query(..., description="Destination station name")
):
    """
    Calculates the shortest metro route, fares, and travel time itinerary using Dijkstra's algorithm.
    """
    try:
        route_info = get_metro_route(source, destination)
        return route_info
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graph routing service error: {str(e)}")

@router.get("/tickets", response_model=List[TicketResponseSchema])
def list_tickets(db: Session = Depends(get_db)):
    """
    Lists all tickets registered in the database, ordered by creation date descending.
    """
    try:
        tickets = db.query(Ticket).order_by(Ticket.created_at.desc()).all()
        return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tickets: {str(e)}")

@router.post("/tickets", response_model=TicketResponseSchema, status_code=201)
def purchase_ticket(ticket_data: TicketCreateSchema, db: Session = Depends(get_db)):
    """
    Creates a new metro ticket. Computes expiration timestamp and generates a unique ID.
    """
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(minutes=ticket_data.expires_in_minutes)
        
        # Generate clean ticket number prefixing KMETRO-
        ticket_num = f"KMETRO-{uuid.uuid4().hex[:8].upper()}"
        
        new_ticket = Ticket(
            ticket_number=ticket_num,
            source_station=ticket_data.source,
            destination_station=ticket_data.destination,
            fare=ticket_data.fare,
            status="ACTIVE",
            created_at=now,
            expires_at=expires_at
        )
        
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        return new_ticket
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to book ticket: {str(e)}")
