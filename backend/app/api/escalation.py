from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..database.crud import create_escalation_record, list_escalation_records

router = APIRouter()

class EscalationRequest(BaseModel):
    conversation_id: Optional[str] = None
    question: str
    jurisdiction: str
    reason: str

class EscalationResponse(BaseModel):
    id: str
    conversation_id: Optional[str]
    question: str
    jurisdiction: str
    reason: str
    status: str
    created_at: str

@router.post("/", response_model=EscalationResponse)
async def submit_escalation(request: EscalationRequest, db: Session = Depends(get_db)):
    record = create_escalation_record(
        db,
        conversation_id=request.conversation_id,
        question=request.question,
        jurisdiction=request.jurisdiction,
        reason=request.reason,
    )
    return EscalationResponse(
        id=record.id,
        conversation_id=record.conversation_id,
        question=record.question,
        jurisdiction=record.jurisdiction,
        reason=record.reason,
        status=record.status,
        created_at=record.created_at.isoformat(),
    )

@router.get("/")
async def get_escalations(db: Session = Depends(get_db)):
    records = list_escalation_records(db)
    return {
        "escalations": [
            {
                "id": r.id,
                "conversation_id": r.conversation_id,
                "question": r.question,
                "jurisdiction": r.jurisdiction,
                "reason": r.reason,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in records
        ],
        "total": len(records)
    }
