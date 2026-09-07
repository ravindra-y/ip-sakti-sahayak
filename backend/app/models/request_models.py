from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

class Jurisdiction(str, Enum):
    INDIA = "india"
    INTERNATIONAL = "international"
    BOTH = "both"

class ChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    jurisdiction: Jurisdiction = Jurisdiction.INDIA
    conversation_id: Optional[str] = None
    include_formulation_hints: bool = False

class DocumentUploadMetadata(BaseModel):
    title: str
    source: str
    jurisdiction: Jurisdiction # Frontend should enforce INDIA or INTERNATIONAL
    category: str
    authority: str
    document_type: str
    version: Optional[str] = None
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    official_url: Optional[str] = None

class FormulationClassifyRequest(BaseModel):
    described_in_classical_text: bool
    preparation_described_in_text: bool
    ingredients_modified: bool
    preparation_modified: bool
    intended_use: str # (medicine|food|nutraceutical|cosmetic|other)
    additional_notes: Optional[str] = None

class ABSCheckRequest(BaseModel):
    biological_resource_involved: bool
    resource_origin: Optional[str] = None
    ip_being_sought: bool
    intended_purpose: str # (research|commercial|educational)
    organization_type: str # (individual|indian_company|foreign_entity|research_institution|msme)
    additional_context: Optional[str] = None

class ConversationCreateRequest(BaseModel):
    title: Optional[str] = None
    jurisdiction: Jurisdiction = Jurisdiction.INDIA
