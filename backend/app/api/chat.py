from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.connection import get_db
from ..models.request_models import ChatRequest
from ..models.response_models import ChatResponse
from ..services.rag_pipeline import RAGPipeline
from ..services.vector_store import VectorStoreService
from ..services.ollama_client import OllamaClient
from ..database.crud import create_audit_log
from ..config import settings

router = APIRouter()

# Dependency injection for services
def get_rag_pipeline():
    vs = VectorStoreService(settings.chroma_db_path)
    # Important: wait for lifespan to init it properly, but here we can just attach to existing
    vs.initialize()
    oc = OllamaClient(settings.ollama_base_url, settings.ollama_model)
    return RAGPipeline(vs, oc)

@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    pipeline: RAGPipeline = Depends(get_rag_pipeline)
):
    try:
        response = await pipeline.process_query(request, db)
        
        # Log to audit log
        create_audit_log(db, "chat_query", {
            "conversation_id": response.conversation_id,
            "question": request.question,
            "jurisdiction": request.jurisdiction.value,
            "category": response.query_category,
            "abstained": response.abstained
        })
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
