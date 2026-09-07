import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import uuid

from app.main import app
from app.database.connection import Base, get_db
from app.database import models as db_models  # Import models to register them with Base.metadata
from app.services.vector_store import VectorStoreService
from app.api.chat import get_rag_pipeline
from app.services.rag_pipeline import RAGPipeline
from app.services.ollama_client import OllamaClient
from app.models.response_models import ChatResponse, SourceCitation

# In-memory SQLite for testing — use StaticPool to share same connection
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool  # All sessions use the same connection, so in-memory DB is shared
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class MockOllamaClient(OllamaClient):
    def __init__(self):
        super().__init__("http://localhost", "mock-model")
        
    async def generate(self, prompt, system_prompt, max_tokens=1024):
        return "This is a mock response based on the provided context. Information only — not legal advice."

class MockVectorStore:
    def search(self, jurisdiction, query_embedding, top_k=5, where_filter=None):
        results = []
        if jurisdiction in ["india", "both"]:
            results.append({
                "id": "doc1_0",
                "document": "India patent law section 3.",
                "metadata": {
                    "document_id": "doc1",
                    "title": "Patents Act, 1970",
                    "source": "Ministry of Commerce",
                    "jurisdiction": "india",
                    "category": "PATENT",
                    "authority": "Government of India",
                    "document_type": "Act",
                    "chunk_number": 0,
                    "version": "2005",
                    "publication_date": "2005-01-01",
                    "official_url": "https://ipindia.gov.in"
                },
                "distance": 0.2
            })
        if jurisdiction in ["international", "both"]:
            results.append({
                "id": "doc2_0",
                "document": "PCT article 1.",
                "metadata": {
                    "document_id": "doc2",
                    "title": "Patent Cooperation Treaty",
                    "source": "WIPO",
                    "jurisdiction": "international",
                    "category": "PATENT",
                    "authority": "WIPO",
                    "document_type": "Treaty",
                    "chunk_number": 0,
                    "version": "current",
                    "official_url": "https://www.wipo.int/pct/en/"
                },
                "distance": 0.3
            })
        return results
        
    def add_document_chunks(self, *args, **kwargs):
        pass

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

def override_get_rag_pipeline():
    return RAGPipeline(MockVectorStore(), MockOllamaClient())

@pytest.fixture(scope="function")
def test_db():
    # Ensure all models are registered and tables created
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_rag_pipeline] = override_get_rag_pipeline
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    
@pytest.fixture
def mock_vector_store():
    return MockVectorStore()

