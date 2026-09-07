import uuid
from sqlalchemy import Column, String, Float, Boolean, Text, Integer, DateTime
from datetime import datetime
from .connection import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    jurisdiction = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String) # Foreign key theoretically, keeping simple
    role = Column(String) # 'user' or 'assistant'
    content = Column(Text)
    query_category = Column(String, nullable=True)
    retrieval_confidence = Column(Float, nullable=True)
    abstained = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class DocumentMetadata(Base):
    __tablename__ = "document_metadata"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    source = Column(String)
    jurisdiction = Column(String)
    category = Column(String)
    authority = Column(String)
    document_type = Column(String)
    version = Column(String, nullable=True)
    publication_date = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    official_url = Column(String, nullable=True)
    chunk_count = Column(Integer, default=0)
    file_path = Column(String, nullable=True)
    ingested_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class EscalationRecord(Base):
    __tablename__ = "escalation_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String, nullable=True)
    question = Column(Text)
    jurisdiction = Column(String)
    reason = Column(Text)
    status = Column(String, default="pending")  # pending | reviewed
    created_at = Column(DateTime, default=datetime.utcnow)
