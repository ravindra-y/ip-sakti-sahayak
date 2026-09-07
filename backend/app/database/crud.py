from sqlalchemy.orm import Session
from . import models
import json

def create_conversation(db: Session, title: str, jurisdiction: str) -> models.Conversation:
    db_item = models.Conversation(title=title, jurisdiction=jurisdiction)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_conversation(db: Session, conversation_id: str) -> models.Conversation | None:
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()

def list_conversations(db: Session, limit: int = 50):
    return db.query(models.Conversation).order_by(models.Conversation.updated_at.desc()).limit(limit).all()

def create_message(db: Session, conversation_id: str, role: str, content: str, **kwargs) -> models.Message:
    db_item = models.Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        **kwargs
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def list_messages(db: Session, conversation_id: str):
    return db.query(models.Message).filter(models.Message.conversation_id == conversation_id).order_by(models.Message.created_at.asc()).all()

def create_document_metadata(db: Session, **kwargs) -> models.DocumentMetadata:
    db_item = models.DocumentMetadata(**kwargs)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def get_document_metadata(db: Session, document_id: str) -> models.DocumentMetadata | None:
    return db.query(models.DocumentMetadata).filter(models.DocumentMetadata.id == document_id).first()

def list_document_metadata(db: Session, jurisdiction: str = None, category: str = None):
    query = db.query(models.DocumentMetadata)
    if jurisdiction:
        query = query.filter(models.DocumentMetadata.jurisdiction == jurisdiction)
    if category:
        query = query.filter(models.DocumentMetadata.category == category)
    return query.all()

def delete_document_metadata(db: Session, document_id: str) -> bool:
    db_item = get_document_metadata(db, document_id)
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def update_document_chunk_count(db: Session, document_id: str, chunk_count: int) -> models.DocumentMetadata:
    db_item = get_document_metadata(db, document_id)
    if db_item:
        db_item.chunk_count = chunk_count
        db.commit()
        db.refresh(db_item)
    return db_item

def create_audit_log(db: Session, event_type: str, details_dict: dict) -> models.AuditLog:
    db_item = models.AuditLog(
        event_type=event_type,
        details=json.dumps(details_dict)
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def create_escalation_record(db: Session, conversation_id: str, question: str, jurisdiction: str, reason: str) -> models.EscalationRecord:
    db_item = models.EscalationRecord(
        conversation_id=conversation_id,
        question=question,
        jurisdiction=jurisdiction,
        reason=reason,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def list_escalation_records(db: Session, limit: int = 100):
    return db.query(models.EscalationRecord).order_by(models.EscalationRecord.created_at.desc()).limit(limit).all()

def list_audit_logs(db: Session, limit: int = 100):
    return db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(limit).all()
