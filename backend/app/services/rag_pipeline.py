import time
import uuid
from typing import Optional
from sqlalchemy.orm import Session

from ..models.request_models import ChatRequest
from ..models.response_models import ChatResponse, SourceCitation
from ..utils.validators import validate_question
from ..config import settings

from .query_router import route_query
from .embeddings import embedding_service
from .vector_store import VectorStoreService
from .confidence import calculate_confidence
from .abstention import should_abstain, get_abstention_response
from .citation_extractor import extract_citations, build_context_string
from .ollama_client import OllamaClient, SYSTEM_PROMPT, OllamaUnavailableError
from ..database.crud import create_message

class RAGPipeline:
    def __init__(self, vector_store: VectorStoreService, ollama_client: OllamaClient):
        self.vector_store = vector_store
        self.ollama_client = ollama_client

    async def process_query(self, chat_request: ChatRequest, db: Session) -> ChatResponse:
        start_time = time.time()

        # 1. Validate
        is_valid, err_msg = validate_question(chat_request.question)
        if not is_valid:
            raise ValueError(err_msg)

        # 2. Route query
        category = route_query(chat_request.question)

        # 3. Encode
        query_embedding = embedding_service.encode_single(chat_request.question)

        # 4. Search
        search_results = self.vector_store.search(
            jurisdiction=chat_request.jurisdiction.value,
            query_embedding=query_embedding,
            top_k=settings.top_k_results,
        )

        # 5. Calculate confidence
        confidence = calculate_confidence(search_results)

        # 6. Check abstention
        abstained, abstention_reason = should_abstain(
            search_results, confidence, settings.confidence_threshold
        )

        sources = extract_citations(search_results)
        message_id = str(uuid.uuid4())
        conversation_id = chat_request.conversation_id or str(uuid.uuid4())

        if abstained:
            answer = get_abstention_response()
        else:
            # 7. RAG Generation
            context_str = build_context_string(search_results)
            user_prompt = f"Question: {chat_request.question}\n\nContext:\n{context_str}"

            try:
                answer = await self.ollama_client.generate(
                    prompt=user_prompt,
                    system_prompt=SYSTEM_PROMPT,
                )
            except OllamaUnavailableError:
                answer = (
                    get_abstention_response()
                    + "\n(Note: The AI generation service is currently unavailable.)"
                )
                abstained = True
                abstention_reason = "AI service unavailable"

        # Single log point — always executed exactly once per request
        self._log_message(db, conversation_id, "user", chat_request.question, category)
        self._log_message(
            db, conversation_id, "assistant", answer, category, confidence, abstained
        )

        # Write audit log
        from ..database.crud import create_audit_log
        source_ids = [s.document_id for s in sources] if sources else []
        try:
            create_audit_log(db, "rag_query", {
                "question": chat_request.question,
                "jurisdiction": chat_request.jurisdiction.value,
                "category": category,
                "source_ids": source_ids,
                "retrieval_confidence": round(confidence, 4),
                "abstained": abstained,
                "abstention_reason": abstention_reason,
            })
        except Exception:
            pass  # Audit log failure must never break query response

        return ChatResponse(
            answer=answer,
            jurisdiction=chat_request.jurisdiction.value,
            query_category=category,
            retrieval_confidence=confidence,
            sources=sources,
            abstained=abstained,
            abstention_reason=abstention_reason,
            conversation_id=conversation_id,
            message_id=message_id,
            processing_time_ms=(time.time() - start_time) * 1000,
        )

    def _log_message(
        self, db, conv_id, role, content, category=None, confidence=None, abstained=False
    ):
        if db:
            create_message(
                db,
                conversation_id=conv_id,
                role=role,
                content=content,
                query_category=category,
                retrieval_confidence=confidence,
                abstained=abstained,
            )

