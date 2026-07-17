import datetime
from sqlalchemy.orm import Session
from app.db.postgres_client import SystemConfig, WorkerHeartbeat
from app.db.sqlite_client import get_sqlite_conn
from app.core.security import decrypt_payload

def verify_and_unlock_system(db: Session):
    """
    Checks if the system is fully operational.
    1. Fetches config_value for 'system_a' from system_config (PostgreSQL).
    2. Fetches fragment_value for 'system_b' from vault_keys (SQLite).
    3. Fetches last_run_timestamp from worker_heartbeat (PostgreSQL) and ensures it is within 90 seconds.
    4. Decrypts the secret code if all checks pass.
    """
    checks = {
        "key_a_present": False,
        "key_b_present": False,
        "heartbeat_fresh": False
    }
    
    key_a = None
    key_b = None
    time_diff = None
    
    # 1. Fetch Key A from PostgreSQL
    try:
        config_a = db.query(SystemConfig).filter(SystemConfig.key == "system_a").first()
        if config_a and config_a.config_value:
            key_a = config_a.config_value
            checks["key_a_present"] = True
    except Exception as e:
        print(f"Error fetching Key A from PostgreSQL: {e}")
        
    # 2. Fetch Key B from SQLite
    try:
        with get_sqlite_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT fragment_value FROM vault_keys WHERE key = 'system_b';")
            row = cursor.fetchone()
            if row and row["fragment_value"]:
                key_b = row["fragment_value"]
                checks["key_b_present"] = True
    except Exception as e:
        print(f"Error fetching Key B from SQLite: {e}")

    # 3. Check worker heartbeat from PostgreSQL
    try:
        heartbeat = db.query(WorkerHeartbeat).filter(WorkerHeartbeat.id == 1).first()
        if heartbeat:
            last_run = heartbeat.last_run_timestamp
            now = datetime.datetime.now(datetime.timezone.utc)
            
            # Make naive or aware datetime comparison robust
            if last_run.tzinfo is None:
                # Convert last_run to utc naive or compare using naive utc now
                time_diff = (datetime.datetime.utcnow() - last_run).total_seconds()
            else:
                time_diff = (now - last_run).total_seconds()
                
            if time_diff <= 90:
                checks["heartbeat_fresh"] = True
    except Exception as e:
        print(f"Error checking worker heartbeat: {e}")

    # 4. If all checks pass, derive key, decrypt ciphertext and return secret code
    if checks["key_a_present"] and checks["key_b_present"] and checks["heartbeat_fresh"]:
        try:
            secret_code = decrypt_payload(key_a, key_b)
            if secret_code:
                return {
                    "status": "fully_operational",
                    "secret_code": secret_code,
                    "checks": checks,
                    "time_diff_seconds": time_diff
                }
            else:
                return {
                    "status": "error",
                    "secret_code": None,
                    "error_message": "Decryption succeeded but code did not match.",
                    "checks": checks,
                    "time_diff_seconds": time_diff
                }
        except Exception as e:
            return {
                "status": "error",
                "secret_code": None,
                "error_message": f"AES Decryption failed: {str(e)}",
                "checks": checks,
                "time_diff_seconds": time_diff
            }
            
    # If checks failed
    failure_reasons = []
    if not checks["key_a_present"]:
        failure_reasons.append("Key A missing from PostgreSQL")
    if not checks["key_b_present"]:
        failure_reasons.append("Key B missing from SQLite")
    if not checks["heartbeat_fresh"]:
        reason = f"Heartbeat expired or missing (diff: {time_diff}s)" if time_diff is not None else "Heartbeat record missing"
        failure_reasons.append(reason)
        
    return {
        "status": "error",
        "secret_code": None,
        "error_message": "System check failed: " + "; ".join(failure_reasons),
        "checks": checks,
        "time_diff_seconds": time_diff
    }
