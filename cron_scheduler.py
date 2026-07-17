import threading
import time
import datetime
from app.db.postgres_client import SessionLocal, Ticket, WorkerHeartbeat

def run_cleanup():
    """
    Executes the background database updates:
    1. Sets ticket status to 'EXPIRED' if expires_at has passed.
    2. Updates the worker_heartbeat timestamp and status.
    """
    db = SessionLocal()
    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        
        # 1. Update expired tickets
        expired_count = db.query(Ticket).filter(
            Ticket.expires_at < now,
            Ticket.status == 'ACTIVE'
        ).update(
            {Ticket.status: 'EXPIRED'},
            synchronize_session=False
        )
        
        # 2. Update heartbeat record
        heartbeat = db.query(WorkerHeartbeat).filter(WorkerHeartbeat.id == 1).first()
        if not heartbeat:
            heartbeat = WorkerHeartbeat(
                id=1, 
                last_run_timestamp=now, 
                status="RUNNING"
            )
            db.add(heartbeat)
        else:
            heartbeat.last_run_timestamp = now
            heartbeat.status = "RUNNING"
            
        db.commit()
        print(f"[{now.isoformat()}] Cron Job run complete. Status: Expired {expired_count} tickets. Heartbeat updated.")
    except Exception as e:
        db.rollback()
        print(f"[{datetime.datetime.now().isoformat()}] Cron Job failed: {str(e)}")
    finally:
        db.close()

def start_cron_scheduler():
    """
    Spawns the worker thread to execute database cleanup tasks in a 1-minute loop.
    """
    def worker_loop():
        # Wait a short moment to let DB bootstrap if needed, then run immediately
        time.sleep(2)
        run_cleanup()
        while True:
            time.sleep(60)
            run_cleanup()

    thread = threading.Thread(target=worker_loop, name="MetroCronScheduler", daemon=True)
    thread.start()
    print("Background Cron Scheduler thread started.")
    return thread
