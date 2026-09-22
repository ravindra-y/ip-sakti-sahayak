from typing import List


def extract_citations(search_results: List[dict]) -> list:
    """Extract SourceCitation objects from ChromaDB search results."""
    from ..models.response_models import SourceCitation
    citations = []
    for result in search_results:
        meta = result.get("metadata", {})
        distance = result.get("distance", 1.0)

        # Relevance score: 1 - distance, clipped to [0, 1]
        relevance = max(0.0, min(1.0, 1.0 - distance))

        # page_number may be stored as int or string in ChromaDB
        raw_page = meta.get("page_number")
        page_number = int(raw_page) if raw_page is not None else None

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
            page_number=page_number,
            filename=meta.get("filename"),
            relevance_score=relevance,
        ))
    return citations


def build_context_string(search_results: List[dict]) -> str:
    """Build a context block for the LLM prompt, including page-level source information."""
    context_parts = []
    for i, result in enumerate(search_results):
        meta = result.get("metadata", {})
        text = result.get("document", "")
        title = meta.get("title", "Unknown Title")
        authority = meta.get("authority", "Unknown Authority")
        jurisdiction = meta.get("jurisdiction", "Unknown Jurisdiction")
        page = meta.get("page_number")
        page_info = f" | p.{page}" if page else ""

        context_parts.append(
            f"[Source {i+1}: {title} | {authority} | {jurisdiction}{page_info}]\n{text}"
        )

    return "\n\n".join(context_parts)
