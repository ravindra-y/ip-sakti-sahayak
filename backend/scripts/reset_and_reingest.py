#!/usr/bin/env python3
"""
IP-SAKTI Sahayak — Reset & Re-ingest
======================================
1. Deletes ALL existing document_metadata rows from SQLite (sample + duplicates).
2. Drops and recreates both ChromaDB collections (fresh slate).
3. Runs ingest_pdfs.ingest for every real PDF in /data.

Run from the backend/ directory:
    python scripts/reset_and_reingest.py
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv
load_dotenv(BACKEND_DIR / ".env")

from app.config import settings
from app.database.connection import SessionLocal, init_db
from app.database.models import DocumentMetadata
from app.services.vector_store import VectorStoreService
import chromadb

# Re-use the full ingestion logic from the existing script
from scripts.ingest_pdfs import discover_pdfs, ingest_pdf, get_file_hash, already_ingested

DATA_DIR = REPO_ROOT / "data"


def main():
    print("=" * 65)
    print("  IP-SAKTI — Reset & Re-ingest")
    print("=" * 65)

    # ── Step 1: Initialise DB ─────────────────────────────────────────────────
    print("\n[1/4] Initialising SQLite database...")
    init_db()
    db = SessionLocal()

    # ── Step 2: Wipe document_metadata table ────────────────────────────────
    print("[2/4] Deleting all existing document metadata rows...")
    deleted = db.query(DocumentMetadata).delete()
    db.commit()
    print(f"      -> Removed {deleted} rows from document_metadata")

    # ── Step 3: Drop & recreate ChromaDB collections ─────────────────────────
    print("[3/4] Resetting ChromaDB collections...")
    client = chromadb.PersistentClient(path=settings.chroma_db_path)
    for name in ["india_documents", "international_documents"]:
        try:
            client.delete_collection(name)
            print(f"      -> Deleted collection: {name}")
        except Exception:
            print(f"      -> Collection {name} did not exist (skipping)")

    vs = VectorStoreService(settings.chroma_db_path)
    vs.initialize()
    print("      -> Fresh collections created")

    # ── Step 4: Discover & ingest all PDFs ───────────────────────────────────
    print(f"\n[4/4] Discovering PDFs in: {DATA_DIR}")
    pdf_list = discover_pdfs(DATA_DIR, target_jurisdiction="all")
    print(f"      -> Found {len(pdf_list)} PDF files\n")

    stats = {"ingested": 0, "skipped_duplicate": 0, "skipped_no_text": 0, "failed": 0,
             "total_pages": 0, "total_chunks": 0}

    for i, pdf_info in enumerate(pdf_list, 1):
        pdf_path = pdf_info["path"]
        label = f"[{i:3d}/{len(pdf_list)}] {pdf_path.name[:60]}"
        print(f"  {label}")
        try:
            file_hash = get_file_hash(pdf_path)
            if already_ingested(db, file_hash):
                print(f"           -> already ingested (skipping)")
                stats["skipped_duplicate"] += 1
                continue

            result = ingest_pdf(pdf_info, vs, db, file_hash)
            if result["status"] == "ok":
                print(f"           -> {result['pages']} pages, {result['chunks']} chunks ✓")
                stats["ingested"] += 1
                stats["total_pages"] += result["pages"]
                stats["total_chunks"] += result["chunks"]
            else:
                print(f"           -> {result['status']} (skipped)")
                stats["skipped_no_text"] += 1
        except Exception as e:
            import traceback
            print(f"           -> FAILED: {e}")
            traceback.print_exc()
            stats["failed"] += 1

    db.close()

    chroma_stats = vs.get_collection_stats()
    print("\n" + "=" * 65)
    print("  DONE")
    print("=" * 65)
    print(f"  Newly ingested    : {stats['ingested']}")
    print(f"  Skipped (dup)     : {stats['skipped_duplicate']}")
    print(f"  Skipped (no text) : {stats['skipped_no_text']}")
    print(f"  Failed            : {stats['failed']}")
    print(f"  Pages processed   : {stats['total_pages']}")
    print(f"  Chunks created    : {stats['total_chunks']}")
    print(f"  ChromaDB india    : {chroma_stats['india']} chunks")
    print(f"  ChromaDB intl     : {chroma_stats['international']} chunks")
    print("=" * 65)
    if stats["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    main()

