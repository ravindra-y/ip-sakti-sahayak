from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from ..database.connection import get_db
from ..models.response_models import SourcesResponse, DocumentMetadataResponse
from ..database.crud import list_document_metadata

router = APIRouter()

@router.get("", response_model=SourcesResponse)
def get_sources(
    jurisdiction: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    docs = list_document_metadata(db, jurisdiction, category)
    
    source_docs = [DocumentMetadataResponse(
        document_id=d.id,
        title=d.title,
        source=d.source,
        jurisdiction=d.jurisdiction,
        category=d.category,
        authority=d.authority,
        document_type=d.document_type,
        version=d.version,
        publication_date=d.publication_date,
        official_url=d.official_url,
        chunk_count=d.chunk_count,
        ingested_at=d.ingested_at.isoformat()
    ) for d in docs]
    
    return SourcesResponse(
        sources=source_docs,
        total=len(source_docs)
    )
