from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..models.request_models import ConversationCreateRequest
from ..models.response_models import ConversationResponse
from ..database.crud import create_conversation, list_conversations, get_conversation, list_messages

router = APIRouter()

@router.post("", response_model=ConversationResponse)
def create_new_conversation(
    request: ConversationCreateRequest,
    db: Session = Depends(get_db)
):
    title = request.title or "New Conversation"
    conv = create_conversation(db, title, request.jurisdiction.value)
    
    return ConversationResponse(
        conversation_id=conv.id,
        title=conv.title,
        jurisdiction=conv.jurisdiction,
        created_at=conv.created_at.isoformat(),
        message_count=0
    )

@router.get("", response_model=List[ConversationResponse])
def get_conversations(db: Session = Depends(get_db)):
    conversations = list_conversations(db)
    
    results = []
    for conv in conversations:
        # Just getting a count, could optimize this
        messages = list_messages(db, conv.id)
        results.append(ConversationResponse(
            conversation_id=conv.id,
            title=conv.title,
            jurisdiction=conv.jurisdiction,
            created_at=conv.created_at.isoformat(),
            message_count=len(messages)
        ))
    return results

@router.get("/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    conv = get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = list_messages(db, conversation_id)
    
    return [{
        "id": m.id,
        "role": m.role,
        "content": m.content,
        "query_category": m.query_category,
        "retrieval_confidence": m.retrieval_confidence,
        "abstained": m.abstained,
        "created_at": m.created_at.isoformat()
    } for m in messages]
