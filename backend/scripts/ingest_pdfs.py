#!/usr/bin/env python3
"""
IP-SAKTI Sahayak — Batch PDF Ingestion Script
================================================
Discovers all PDFs in the canonical /data directory (one level up from backend/),
extracts text page-by-page, chunks with metadata, embeds, and stores in ChromaDB.

Usage (from the backend/ directory):
    python scripts/ingest_pdfs.py [--data-dir PATH] [--force]

Options:
    --data-dir PATH   Override path to PDF root directory
                      (default: <repo-root>/data)
    --reset           Clear the vector store before ingesting (fresh rebuild)
    --dry-run         Print what would be done without actually ingesting

Run from the backend/ directory so that .env is loaded automatically.
"""
import argparse
import hashlib
import json
import os
import sys
import uuid
from pathlib import Path

# ── Path setup ──────────────────────────────────────────────────────────────
# backend/scripts/ingest_pdfs.py -> backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
# backend/ -> repo root
REPO_ROOT = BACKEND_DIR.parent
DEFAULT_DATA_DIR = REPO_ROOT / "data"

sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from app.config import settings
from app.utils.text_processing import clean_text, chunk_text
from app.services.embeddings import embedding_service
from app.services.vector_store import VectorStoreService
from app.database.connection import SessionLocal, init_db
from app.database.crud import create_document_metadata, list_document_metadata


# ── Category and jurisdiction mapping based on directory names ────────────────
DIR_METADATA = {
    "01_PATENTS": {
        "category": "PATENT",
        "jurisdiction": "india",
        "authority": "Office of the Controller General of Patents, Designs & Trade Marks",
        "document_type": "Act/Rules",
    },
    "02_PATENT_GUIDELINES": {
        "category": "PATENT",
        "jurisdiction": "india",
        "authority": "Office of the Controller General of Patents, Designs & Trade Marks",
        "document_type": "Guidelines",
    },
    "03_TRADEMARK": {
        "category": "TRADEMARK",
        "jurisdiction": "india",
        "authority": "Trade Marks Registry, CGPDTM",
        "document_type": "Act/Rules",
    },
    "04_GI": {
        "category": "GEOGRAPHICAL_INDICATION",
        "jurisdiction": "india",
        "authority": "GI Registry, CGPDTM",
        "document_type": "Act/Rules",
    },
    "05_DESIGNS": {
        "category": "DESIGN",
        "jurisdiction": "india",
        "authority": "Designs Wing, CGPDTM",
        "document_type": "Act/Rules",
    },
    "06_COPYRIGHT": {
        "category": "COPYRIGHT",
        "jurisdiction": "india",
        "authority": "Copyright Office, India",
        "document_type": "Act/Rules",
    },
    "07_BIODIVERSITY_ABS": {
        "category": "ABS",
        "jurisdiction": "india",
        "authority": "National Biodiversity Authority",
        "document_type": "Act/Rules",
    },
    "08_AYUSH_REGULATORY": {
        "category": "REGULATORY",
        "jurisdiction": "india",
        "authority": "Ministry of AYUSH / CDSCO",
        "document_type": "Act/Rules",
    },
    "09_FSSAI": {
        "category": "REGULATORY",
        "jurisdiction": "india",
        "authority": "Food Safety and Standards Authority of India",
        "document_type": "Regulations",
    },
    "10_PPVR": {
        "category": "TRADITIONAL_KNOWLEDGE",
        "jurisdiction": "india",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority",
        "document_type": "Act/Rules",
    },
    "12_SECONDARY_REFERENCE": {
        "category": "GENERAL",
        "jurisdiction": "india",
        "authority": "Various",
        "document_type": "Reference",
    },
}

# Directories to skip entirely
SKIP_DIRS = {"sample_docs"}


def get_file_hash(path: Path) -> str:
    """SHA256 of the first 64KB of the file — fast dedup fingerprint."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read(65536))
    return h.hexdigest()


def discover_pdfs(data_dir: Path) -> list[dict]:
    """
    Walk the data directory, returning a list of dicts:
        {path, title, jurisdiction, category, authority, document_type, source}
    """
    pdfs = []
    for pdf_path in sorted(data_dir.rglob("*.pdf")):
        # Skip dirs
        if any(skip in pdf_path.parts for skip in SKIP_DIRS):
            continue

        # Determine top-level category dir
        try:
            rel = pdf_path.relative_to(data_dir)
            top_dir = rel.parts[0]
        except ValueError:
            top_dir = ""

        meta = DIR_METADATA.get(top_dir, {
            "category": "GENERAL",
            "jurisdiction": "india",
            "authority": "Government of India",
            "document_type": "Document",
        })

        # Build a human-readable title from the filename
        title = pdf_path.stem
        # Clean up common filename artifacts
        title = title.replace("_", " ").replace("-", " — ").strip()

        pdfs.append({
            "path": pdf_path,
            "title": title,
            "source": f"{top_dir} / {pdf_path.name}",
            "jurisdiction": meta["jurisdiction"],
            "category": meta["category"],
            "authority": meta["authority"],
            "document_type": meta["document_type"],
            "official_url": None,
        })
    return pdfs


def extract_text_with_pages(pdf_path: Path) -> list[dict]:
    """
    Extract text from each page of the PDF.
    Returns a list of {page_num, text} dicts.
    """
    from pypdf import PdfReader
    pages = []
    try:
        reader = PdfReader(str(pdf_path))
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""
            if text.strip():
                pages.append({"page_num": i + 1, "text": clean_text(text)})
    except Exception as e:
        print(f"    WARN: Could not read {pdf_path.name}: {e}")
    return pages


def already_ingested(db, file_hash: str) -> bool:
    """
    Check if a document with this file hash already exists in the DB.
    We store the hash in the 'version' field as 'hash:<sha256>'.
    """
    docs = list_document_metadata(db)
    for d in docs:
        if d.version and d.version.startswith(f"hash:{file_hash}"):
            return True
    return False


def ingest_pdf(
    pdf_info: dict,
    vector_store: VectorStoreService,
    db,
    file_hash: str,
) -> dict:
    """
    Extract, chunk, embed, and store a single PDF.
    Returns stats dict.
    """
    pdf_path: Path = pdf_info["path"]
    jurisdiction = pdf_info["jurisdiction"]

    # 1. Extract text per page
    pages = extract_text_with_pages(pdf_path)
    if not pages:
        return {"status": "skipped_no_text", "chunks": 0, "pages": 0}

    # 2. Build chunks with page-level metadata
    all_chunks = []
    all_metadata = []
    doc_id = str(uuid.uuid4())

    chunk_idx = 0
    for page in pages:
        page_chunks = chunk_text(page["text"], chunk_size=600, overlap=80)
        for chunk in page_chunks:
            if not chunk.strip():
                continue
            meta = {
                "document_id": doc_id,
                "title": pdf_info["title"],
                "source": pdf_info["source"],
                "jurisdiction": jurisdiction,
                "category": pdf_info["category"],
                "authority": pdf_info["authority"],
                "document_type": pdf_info["document_type"],
                "chunk_number": chunk_idx,
                "page_number": page["page_num"],
                "filename": pdf_path.name,
            }
            if pdf_info.get("official_url"):
                meta["official_url"] = pdf_info["official_url"]

            all_chunks.append(chunk)
            all_metadata.append(meta)
            chunk_idx += 1

    if not all_chunks:
        return {"status": "skipped_no_chunks", "chunks": 0, "pages": len(pages)}

    # 3. Generate embeddings
    embeddings = embedding_service.encode(all_chunks)

    # 4. Store in ChromaDB
    vector_store.add_document_chunks(
        jurisdiction=jurisdiction,
        document_id=doc_id,
        chunks=all_chunks,
        embeddings=embeddings,
        metadata_list=all_metadata,
    )

    # 5. Store metadata in SQLite
    create_document_metadata(
        db,
        id=doc_id,
        title=pdf_info["title"],
        source=pdf_info["source"],
        jurisdiction=jurisdiction,
        category=pdf_info["category"],
        authority=pdf_info["authority"],
        document_type=pdf_info["document_type"],
        version=f"hash:{file_hash}",   # store hash for dedup
        publication_date=None,
        official_url=pdf_info.get("official_url"),
        chunk_count=len(all_chunks),
        file_path=str(pdf_path),
    )

    return {
        "status": "ok",
        "chunks": len(all_chunks),
        "pages": len(pages),
        "doc_id": doc_id,
    }


def main():
    parser = argparse.ArgumentParser(description="Batch-ingest PDFs into IP-SAKTI Sahayak")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help=f"Root directory containing PDFs (default: {DEFAULT_DATA_DIR})",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear vector store before ingesting (fresh rebuild)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would be ingested without actually doing it",
    )
    args = parser.parse_args()

    data_dir: Path = args.data_dir.resolve()

    print("=" * 65)
    print("  IP-SAKTI Sahayak — Batch PDF Ingestion")
    print("=" * 65)
    print(f"  Data directory : {data_dir}")
    print(f"  ChromaDB path  : {settings.chroma_db_path}")
    print(f"  SQLite path    : {settings.sqlite_database_path}")
    print(f"  Reset mode     : {args.reset}")
    print(f"  Dry-run        : {args.dry_run}")
    print("=" * 65)

    if not data_dir.exists():
        print(f"\nERROR: Data directory not found: {data_dir}")
        sys.exit(1)

    # Discover PDFs
    print("\nDiscovering PDFs...")
    pdf_list = discover_pdfs(data_dir)
    print(f"  Found {len(pdf_list)} PDF files")

    if not pdf_list:
        print("No PDFs found. Exiting.")
        sys.exit(0)

    if args.dry_run:
        print("\nDRY-RUN — would ingest:")
        for p in pdf_list:
            print(f"  [{p['jurisdiction'].upper()}/{p['category']}] {p['title']}")
        print(f"\nTotal: {len(pdf_list)} PDFs")
        return

    # Initialize DB and vector store
    print("\nInitialising database...")
    init_db()
    db = SessionLocal()

    print("Initialising vector store...")
    vs = VectorStoreService(settings.chroma_db_path)
    vs.initialize()

    if args.reset:
        print("WARNING: --reset requested. Clearing existing vector store...")
        # Delete all docs in both collections
        import chromadb
        client = chromadb.PersistentClient(path=settings.chroma_db_path)
        for name in ["india_documents", "international_documents"]:
            try:
                client.delete_collection(name)
                print(f"  Deleted collection: {name}")
            except Exception:
                pass
        vs = VectorStoreService(settings.chroma_db_path)
        vs.initialize()

    # Ingest
    stats = {
        "total": len(pdf_list),
        "ingested": 0,
        "skipped_duplicate": 0,
        "skipped_no_text": 0,
        "failed": 0,
        "total_pages": 0,
        "total_chunks": 0,
    }

    print(f"\nIngesting {len(pdf_list)} PDFs...\n")
    for i, pdf_info in enumerate(pdf_list, 1):
        pdf_path = pdf_info["path"]
        print(f"  [{i:3d}/{len(pdf_list)}] {pdf_path.name[:60]}")

        try:
            file_hash = get_file_hash(pdf_path)

            if already_ingested(db, file_hash):
                print(f"           → already ingested (skipping)")
                stats["skipped_duplicate"] += 1
                continue

            result = ingest_pdf(pdf_info, vs, db, file_hash)

            if result["status"] == "ok":
                print(f"           → {result['pages']} pages, {result['chunks']} chunks ✓")
                stats["ingested"] += 1
                stats["total_pages"] += result["pages"]
                stats["total_chunks"] += result["chunks"]
            else:
                print(f"           → {result['status']} (skipped)")
                stats["skipped_no_text"] += 1

        except Exception as e:
            import traceback
            print(f"           → FAILED: {e}")
            traceback.print_exc()
            stats["failed"] += 1

    db.close()

    # Summary
    chroma_stats = vs.get_collection_stats()
    print("\n" + "=" * 65)
    print("  INGESTION COMPLETE")
    print("=" * 65)
    print(f"  Documents found     : {stats['total']}")
    print(f"  Newly ingested      : {stats['ingested']}")
    print(f"  Already ingested    : {stats['skipped_duplicate']}")
    print(f"  Skipped (no text)   : {stats['skipped_no_text']}")
    print(f"  Failed              : {stats['failed']}")
    print(f"  Pages processed     : {stats['total_pages']}")
    print(f"  Chunks created      : {stats['total_chunks']}")
    print(f"  ChromaDB india      : {chroma_stats['india']} chunks")
    print(f"  ChromaDB intl       : {chroma_stats['international']} chunks")
    print("=" * 65)

    if stats["failed"] > 0:
        print(f"\nWARNING: {stats['failed']} document(s) failed to ingest.")
        sys.exit(1)
    else:
        print("\nVector store updated successfully.")


if __name__ == "__main__":
    main()
