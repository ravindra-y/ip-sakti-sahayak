#!/usr/bin/env python3
"""
IP-SAKTI Sahayak — Full Data Ingestion Script

Ingests ALL real PDFs from the data/ folder into the vector store.
Run AFTER starting the backend:
    cd backend && .\\venv\\Scripts\\python.exe ..\\scripts\\ingest_all_data.py

Folder -> Category mapping:
    01_PATENTS              -> Patents / india
    02_PATENT_GUIDELINES    -> Patents / india
    03_TRADEMARK            -> Trademark / india
    04_GI                   -> Geographical Indications / india
    05_DESIGNS              -> Industrial Designs / india
    06_COPYRIGHT            -> Copyright / india
    07_BIODIVERSITY_ABS     -> Biological Diversity / india
    08_AYUSH_REGULATORY     -> AYUSH Regulatory / india
    09_FSSAI                -> Food Safety / india
    10_PPVR                 -> Plant Variety Protection / india
    12_SECONDARY_REFERENCE  -> Secondary Reference / india
"""
import os
import sys
import requests
import json
from pathlib import Path

BASE_URL = os.environ.get("API_URL", "http://localhost:8000")

# Base data directory (relative to repo root)
DATA_DIR = Path(__file__).parent.parent / "data"

# Folder -> (category, authority, document_type) mapping
FOLDER_MAP = {
    "01_PATENTS": {
        "category": "Patents",
        "authority": "CGPDTM, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "02_PATENT_GUIDELINES": {
        "category": "Patents",
        "authority": "CGPDTM, Government of India",
        "document_type": "Guidelines",
        "jurisdiction": "india",
    },
    "03_TRADEMARK": {
        "category": "Trademark",
        "authority": "Trade Marks Registry, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "04_GI": {
        "category": "Geographical Indications",
        "authority": "GI Registry, CGPDTM, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "05_DESIGNS": {
        "category": "Industrial Designs",
        "authority": "Designs Wing, CGPDTM, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "06_COPYRIGHT": {
        "category": "Copyright",
        "authority": "Copyright Office, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "07_BIODIVERSITY_ABS": {
        "category": "Biological Diversity",
        "authority": "National Biodiversity Authority (NBA), Government of India",
        "document_type": "Act/Rules/Regulations",
        "jurisdiction": "india",
    },
    "08_AYUSH_REGULATORY": {
        "category": "AYUSH Regulatory",
        "authority": "Ministry of AYUSH / CDSCO, Government of India",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "09_FSSAI": {
        "category": "Food Safety",
        "authority": "Food Safety and Standards Authority of India (FSSAI)",
        "document_type": "Regulations",
        "jurisdiction": "india",
    },
    "10_PPVR": {
        "category": "Plant Variety Protection",
        "authority": "Protection of Plant Varieties and Farmers Rights Authority (PPVFRA)",
        "document_type": "Act/Rules",
        "jurisdiction": "india",
    },
    "12_SECONDARY_REFERENCE": {
        "category": "Secondary Reference",
        "authority": "Various Government Sources",
        "document_type": "Reference Document",
        "jurisdiction": "india",
    },
}


def check_health():
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        if r.status_code == 200:
            print(f"✓ Backend OK ({BASE_URL})")
            return True
        print(f"✗ Backend health check failed: {r.status_code}")
        return False
    except Exception as e:
        print(f"✗ Cannot reach backend: {e}")
        return False


def ingest_pdf(pdf_path: Path, meta: dict) -> bool:
    filename = pdf_path.name
    title = pdf_path.stem.replace("_", " ").replace("-", " ")
    print(f"  → {filename[:60]}...")

    try:
        with open(pdf_path, "rb") as f:
            file_bytes = f.read()

        metadata = {
            "title": title,
            "source": meta["authority"],
            "jurisdiction": meta["jurisdiction"],
            "category": meta["category"],
            "authority": meta["authority"],
            "document_type": meta["document_type"],
        }

        files = {"file": (filename, file_bytes, "application/pdf")}
        data = {"metadata": json.dumps(metadata)}

        resp = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files,
            data=data,
            timeout=120,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            chunks = result.get("chunk_count", "?")
            print(f"     ✓ Ingested: {chunks} chunks")
            return True
        else:
            # If already exists or another error, skip
            msg = resp.text[:150]
            print(f"     ✗ Failed ({resp.status_code}): {msg}")
            return False

    except requests.exceptions.Timeout:
        print(f"     ✗ Timeout (PDF may be too large)")
        return False
    except Exception as e:
        print(f"     ✗ Error: {e}")
        return False


def main():
    print("=" * 65)
    print("  IP-SAKTI Sahayak — Real Data Ingestion")
    print("=" * 65)

    if not check_health():
        print("\nStart the backend first!")
        sys.exit(1)

    total_ok = 0
    total_fail = 0

    for folder_name, meta in FOLDER_MAP.items():
        folder_path = DATA_DIR / folder_name
        if not folder_path.exists():
            continue

        # Get all PDFs recursively
        pdfs = sorted(folder_path.rglob("*.pdf"))
        if not pdfs:
            continue

        print(f"\n[{folder_name}] — {meta['category']} ({len(pdfs)} PDFs)")

        for pdf in pdfs:
            ok = ingest_pdf(pdf, meta)
            if ok:
                total_ok += 1
            else:
                total_fail += 1

    print("\n" + "=" * 65)
    print(f"  Done! {total_ok} ingested, {total_fail} failed/skipped.")
    print("=" * 65)


if __name__ == "__main__":
    main()
