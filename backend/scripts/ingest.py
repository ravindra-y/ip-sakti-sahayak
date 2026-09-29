import argparse
import os
import sys
import uuid
from pypdf import PdfReader
from dotenv import load_dotenv

# Add backend to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

from app.utils.text_processing import clean_text, chunk_text, extract_pdf_with_fallback
from app.services.embeddings import embedding_service
from app.services.vector_store import VectorStoreService
from app.database.connection import SessionLocal, init_db
from app.database.crud import create_document_metadata
from app.config import settings

def main():
    parser = argparse.ArgumentParser(description="Ingest PDFs into IP-SAKTI Sahayak knowledge base")
    parser.add_argument("--file", required=True, help="Path to PDF file")
    parser.add_argument("--jurisdiction", required=True, choices=["india", "international"], help="Jurisdiction")
    parser.add_argument("--title", required=True, help="Document Title")
    parser.add_argument("--source", required=True, help="Document Source")
    parser.add_argument("--category", required=True, help="Document Category (e.g., PATENT, TRADEMARK)")
    parser.add_argument("--authority", required=True, help="Issuing Authority")
    parser.add_argument("--document-type", required=True, help="Document Type (e.g., Act, Rule)")
    parser.add_argument("--official-url", required=False, help="Official URL")
    parser.add_argument("--version", required=False, help="Version/Year")
    parser.add_argument("--publication-date", required=False, help="Publication Date")

    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"Error: File {args.file} not found.")
        sys.exit(1)
        
    if not args.file.lower().endswith('.pdf'):
        print(f"Error: Only PDF files are supported.")
        sys.exit(1)

    print(f"Initializing database and vector store...")
    init_db()
    vector_store = VectorStoreService(settings.chroma_db_path)
    vector_store.initialize()
    db = SessionLocal()
    
    try:
        print(f"Reading {args.file} with OCR fallback...")
        page_texts = extract_pdf_with_fallback(args.file)
        
        print("Cleaning and chunking text...")
        all_chunks = []
        chunk_metadata = []
        chunk_idx = 0
        doc_id = str(uuid.uuid4())
        
        for page_info in page_texts:
            cleaned = clean_text(page_info["text"])
            page_chunks = chunk_text(cleaned)
            for chunk in page_chunks:
                all_chunks.append(chunk)
                chunk_meta = {
                    "document_id": doc_id,
                    "title": args.title,
                    "source": args.source,
                    "jurisdiction": args.jurisdiction,
                    "category": args.category,
                    "authority": args.authority,
                    "document_type": args.document_type,
                    "chunk_number": chunk_idx,
                    "page_number": page_info["page"],
                    "filename": os.path.basename(args.file)
                }
                if args.version:
                    chunk_meta["version"] = args.version
                if args.publication_date:
                    chunk_meta["publication_date"] = args.publication_date
                if args.official_url:
                    chunk_meta["official_url"] = args.official_url
                    
                chunk_metadata.append(chunk_meta)
                chunk_idx += 1
        
        if not all_chunks:
            print("Error: Could not extract text from document.")
            sys.exit(1)
            
        print(f"Generated {len(all_chunks)} chunks. Encoding...")
        embeddings = embedding_service.encode(all_chunks)
        
        print("Storing in ChromaDB...")
        vector_store.add_document_chunks(args.jurisdiction, doc_id, all_chunks, embeddings, chunk_metadata)
        
        print("Storing in SQLite...")
        create_document_metadata(
            db,
            id=doc_id,
            title=args.title,
            source=args.source,
            jurisdiction=args.jurisdiction,
            category=args.category,
            authority=args.authority,
            document_type=args.document_type,
            version=args.version,
            publication_date=args.publication_date,
            official_url=args.official_url,
            chunk_count=len(all_chunks),
            file_path=args.file
        )
        
        print(f"Success! Document '{args.title}' ingested with ID: {doc_id}")
        
    except Exception as e:
        print(f"Error during ingestion: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
