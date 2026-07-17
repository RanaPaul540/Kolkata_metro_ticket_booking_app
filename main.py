from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.worker.cron_scheduler import start_cron_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print("FastAPI app starting up. Launching background worker thread...")
    start_cron_scheduler()
    yield
    # Shutdown actions
    print("FastAPI app shutting down...")

app = FastAPI(
    title="Kolkata Metro Booking & Verification System API",
    description="Backend services for Dijkstra metro routing, secure unlocking and ticket bookings",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes under the /api prefix
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "service": "Kolkata Metro Booking & Verification System",
        "documentation": "/docs",
        "status": "online"
    }
