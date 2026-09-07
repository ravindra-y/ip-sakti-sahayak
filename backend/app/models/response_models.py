from typing import List, Optional
from pydantic import BaseModel

class SourceCitation(BaseModel):
    document_id: str
    title: str
    source: str
    authority: str
    jurisdiction: str
    category: str
    document_type: str
    version: Optional[str] = None
    publication_date: Optional[str] = None
    official_url: Optional[str] = None
    chunk_number: int
    relevance_score: float

class ChatResponse(BaseModel):
    answer: str
    jurisdiction: str
    query_category: str
    retrieval_confidence: float
    sources: List[SourceCitation]
    abstained: bool
    abstention_reason: Optional[str] = None
    disclaimer: str = "Information only — not legal advice."
    conversation_id: str
    message_id: str
    processing_time_ms: float

class FormulationClassifyResponse(BaseModel):
    preliminary_classification: str
    explanation: str
    possible_next_questions: List[str]
    relevant_regulatory_categories: List[str]
    disclaimer: str = "This is preliminary guidance only and not a legal or regulatory determination."

class ABSCheckResponse(BaseModel):
    possible_compliance_areas: List[str]
    questions_requiring_verification: List[str]
    relevant_sources: List[str]
    human_escalation_recommended: bool
    escalation_reason: Optional[str] = None
    disclaimer: str = "This is preliminary guidance only. Consult a legal professional for definitive obligations."

class DocumentMetadataResponse(BaseModel):
    document_id: str
    title: str
    source: str
    jurisdiction: str
    category: str
    authority: str
    document_type: str
    version: Optional[str] = None
    publication_date: Optional[str] = None
    official_url: Optional[str] = None
    chunk_count: int
    ingested_at: str

class SourcesResponse(BaseModel):
    sources: List[DocumentMetadataResponse]
    total: int

class ConversationResponse(BaseModel):
    conversation_id: str
    title: str
    jurisdiction: str
    created_at: str
    message_count: int
