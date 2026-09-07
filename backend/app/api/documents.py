from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import json
from pypdf import PdfReader
import datetime

from ..database.connection import get_db
from ..models.request_models import DocumentUploadMetadata
from ..models.response_models import DocumentMetadataResponse
from ..database.crud import create_document_metadata, list_document_metadata, delete_document_metadata, update_document_chunk_count
from ..utils.validators import validate_file_type, validate_file_size
from ..utils.text_processing import clean_text, chunk_text
from ..services.embeddings import embedding_service
from ..services.vector_store import VectorStoreService
from ..config import settings

router = APIRouter()

def get_vector_store():
    vs = VectorStoreService(settings.chroma_db_path)
    vs.initialize()
    return vs

@router.post("/upload", response_model=DocumentMetadataResponse)
async def upload_document(
    file: UploadFile = File(...),
    metadata: str = Form(...),
    db: Session = Depends(get_db),
    vector_store: VectorStoreService = Depends(get_vector_store)
):
    try:
        meta_dict = json.loads(metadata)
        meta = DocumentUploadMetadata(**meta_dict)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid metadata: {str(e)}")


    if not validate_file_type(file.filename, file.content_type):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if not validate_file_size(size, settings.max_file_size_mb):
        raise HTTPException(status_code=400, detail=f"File exceeds maximum size of {settings.max_file_size_mb}MB")


    # Save file
    jurisdiction = meta.jurisdiction.value
    raw_dir = os.path.join("data", "raw", jurisdiction)
    os.makedirs(raw_dir, exist_ok=True)

    doc_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".pdf"
    file_path = os.path.join(raw_dir, f"{doc_id}{ext}")

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    # Extract text — clean up orphan file on any failure
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        try:
            os.remove(file_path)
        except OSError:
            pass
        raise HTTPException(status_code=422, detail=f"Failed to read PDF: {str(e)}")

    text = clean_text(text)
    chunks = chunk_text(text)

    if not chunks:
        try:
            os.remove(file_path)
        except OSError:
            pass
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from document. "
                   "Ensure the PDF is not scanned-only / image-only."
        )

    # Generate embeddings
    embeddings = embedding_service.encode(chunks)

    # Store metadata in DB
    db_doc = create_document_metadata(
        db,
        id=doc_id,
        title=meta.title,
        source=meta.source,
        jurisdiction=jurisdiction,
        category=meta.category,
        authority=meta.authority,
        document_type=meta.document_type,
        version=meta.version,
        publication_date=meta.publication_date,
        effective_date=meta.effective_date,
        official_url=meta.official_url,
        file_path=file_path,
        chunk_count=len(chunks),
    )

    # Store in ChromaDB — only include metadata values that are not None
    chunk_metadata_list = []
    for i in range(len(chunks)):
        chunk_meta: dict = {
            "document_id": doc_id,
            "title": meta.title,
            "source": meta.source,
            "jurisdiction": jurisdiction,
            "category": meta.category,
            "authority": meta.authority,
            "document_type": meta.document_type,
            "chunk_number": i,
        }
        if meta.version:
            chunk_meta["version"] = meta.version
        if meta.publication_date:
            chunk_meta["publication_date"] = meta.publication_date
        if meta.effective_date:
            chunk_meta["effective_date"] = meta.effective_date
        if meta.official_url:
            chunk_meta["official_url"] = meta.official_url

        chunk_metadata_list.append(chunk_meta)

    vector_store.add_document_chunks(jurisdiction, doc_id, chunks, embeddings, chunk_metadata_list)

    return DocumentMetadataResponse(
        document_id=doc_id,
        title=meta.title,
        source=meta.source,
        jurisdiction=jurisdiction,
        category=meta.category,
        authority=meta.authority,
        document_type=meta.document_type,
        version=meta.version,
        publication_date=meta.publication_date,
        official_url=meta.official_url,
        chunk_count=len(chunks),
        ingested_at=db_doc.ingested_at.isoformat(),
    )


@router.get("", response_model=List[DocumentMetadataResponse])
def get_documents(
    jurisdiction: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    docs = list_document_metadata(db, jurisdiction, category)
    return [DocumentMetadataResponse(
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

@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    vector_store: VectorStoreService = Depends(get_vector_store)
):
    from ..database.crud import get_document_metadata
    doc = get_document_metadata(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    jurisdiction = doc.jurisdiction
    
    # Delete from DB
    delete_document_metadata(db, document_id)
    
    # Delete from vector store
    vector_store.delete_document(jurisdiction, document_id)
    
    return {"deleted": True}
