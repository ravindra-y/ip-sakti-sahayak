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

@router.get("/stats")
async def get_audit_stats(db: Session = Depends(get_db)):
    logs = list_audit_logs(db, limit=5000)
    
    total_queries = 0
    categories = {}
    abstentions = 0
    
    for log in logs:
        if log.event_type == "rag_query" or log.event_type == "chat_query":
            total_queries += 1
            try:
                details = json.loads(log.details)
                cat = details.get("category", "UNKNOWN")
                if not cat: cat = "UNKNOWN"
                categories[cat] = categories.get(cat, 0) + 1
                
                if details.get("abstained", False):
                    abstentions += 1
            except:
                pass
                
    category_list = [{"name": k, "value": v} for k, v in categories.items()]
    
    return {
        "total_queries": total_queries,
        "abstention_rate": round(abstentions / total_queries * 100, 1) if total_queries > 0 else 0,
        "categories": category_list,
        "total_abstentions": abstentions
    }
