from typing import List
from ..models.response_models import SourceCitation

def extract_citations(search_results: List[dict]) -> List[SourceCitation]:
    citations = []
    for result in search_results:
        meta = result.get("metadata", {})
        distance = result.get("distance", 1.0)
        
        # Calculate relevance score: 1 - distance, clipped to 0-1
        relevance = max(0.0, min(1.0, 1.0 - distance))
        
        citations.append(SourceCitation(
            document_id=meta.get("document_id", ""),
            title=meta.get("title", ""),
            source=meta.get("source", ""),
            authority=meta.get("authority", ""),
            jurisdiction=meta.get("jurisdiction", ""),
            category=meta.get("category", ""),
            document_type=meta.get("document_type", ""),
            version=meta.get("version"),
            publication_date=meta.get("publication_date"),
            official_url=meta.get("official_url"),
            chunk_number=meta.get("chunk_number", 0),
            relevance_score=relevance
        ))
    return citations

def build_context_string(search_results: List[dict]) -> str:
    context_parts = []
    for i, result in enumerate(search_results):
        meta = result.get("metadata", {})
        text = result.get("document", "")
        title = meta.get("title", "Unknown Title")
        authority = meta.get("authority", "Unknown Authority")
        jurisdiction = meta.get("jurisdiction", "Unknown Jurisdiction")
        
        context_parts.append(f"[Source {i+1}: {title} | {authority} | {jurisdiction}]\n{text}")
        
    return "\n\n".join(context_parts)
