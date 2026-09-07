from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json
from ..database.connection import get_db
from ..database.crud import list_audit_logs

router = APIRouter()

@router.get("/")
async def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = list_audit_logs(db, limit=limit)
    result = []
    for log in logs:
        try:
            details = json.loads(log.details) if log.details else {}
        except Exception:
            details = {"raw": log.details}
        result.append({
            "id": log.id,
            "event_type": log.event_type,
            "details": details,
            "created_at": log.created_at.isoformat(),
        })
    return {"logs": result, "total": len(result)}
