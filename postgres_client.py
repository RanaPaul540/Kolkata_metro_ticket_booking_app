from sqlalchemy import create_engine, Column, Integer, String, DateTime, Numeric
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings
import datetime

Base = declarative_base()

class SystemConfig(Base):
    __tablename__ = "system_config"
    key = Column(String(100), primary_key=True)
    config_value = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class WorkerHeartbeat(Base):
    __tablename__ = "worker_heartbeat"
    id = Column(Integer, primary_key=True)
    last_run_timestamp = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50))

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_number = Column(String(100), unique=True, nullable=False)
    source_station = Column(String(100), nullable=False)
    destination_station = Column(String(100), nullable=False)
    fare = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False) # 'ACTIVE', 'EXPIRED', 'USED'
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=False)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

# Database Engine initialization
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that provides a transactional scope.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
