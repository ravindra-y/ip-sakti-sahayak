from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database.connection import init_db
from .services.vector_store import VectorStoreService
from .api.chat import router as chat_router
from .api.documents import router as documents_router
from .api.formulation import router as formulation_router
from .api.abs_helper import router as abs_router
from .api.sources import router as sources_router
from .api.conversations import router as conversations_router
from .api.escalation import router as escalation_router
from .api.audit import router as audit_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite Database
    init_db()
    
    # Initialize Vector Store
    vector_store = VectorStoreService(settings.chroma_db_path)
    vector_store.initialize()
    
    yield

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description="Multilingual RAG assistant for Ayurveda IP and regulatory guidance",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api/chat")
app.include_router(documents_router, prefix="/api/documents")
app.include_router(formulation_router, prefix="/api/formulation")
app.include_router(abs_router, prefix="/api/abs")
app.include_router(sources_router, prefix="/api/sources")
app.include_router(conversations_router, prefix="/api/conversations")
app.include_router(escalation_router, prefix="/api/escalation")
app.include_router(audit_router, prefix="/api/audit")

@app.get("/")
async def root():
    return {"name": "IP-SAKTI Sahayak", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "database": "ok", "vector_store": "ok"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )
