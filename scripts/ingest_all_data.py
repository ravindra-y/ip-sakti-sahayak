#!/usr/bin/env python3
"""
IP-SAKTI Sahayak — Full Data Ingestion Script (API-based)

Ingests ALL real PDFs from the data/ folder (india and international)
into the vector store via the FastAPI upload endpoint.

Run AFTER starting the backend:
    cd backend && .\\venv\\Scripts\\python.exe ..\\scripts\\ingest_all_data.py
"""
import os
import re
import sys
import json
import requests
from pathlib import Path

BASE_URL = os.environ.get("API_URL", "http://localhost:8000")

# Base data directory (relative to repo root)
DATA_DIR = Path(__file__).parent.parent / "data"

# ── Directory to Metadata Mappings ──────────────────────────────────────────
INDIA_DIR_METADATA = {
    "01_PATENTS": {
        "category": "PATENT",
        "jurisdiction": "india",
        "authority": "Office of the Controller General of Patents, Designs & Trade Marks (CGPDTM)",
        "document_type": "Act/Rules",
    },
    "02_PATENT_GUIDELINES": {
        "category": "PATENT",
        "jurisdiction": "india",
        "authority": "Office of the Controller General of Patents, Designs & Trade Marks (CGPDTM)",
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
        "authority": "Geographical Indications Registry, CGPDTM",
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
        "authority": "Copyright Office, Government of India",
        "document_type": "Act/Rules",
    },
    "07_BIODIVERSITY_ABS": {
        "category": "ABS",
        "jurisdiction": "india",
        "authority": "National Biodiversity Authority (NBA)",
        "document_type": "Act/Rules/Regulations",
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
        "authority": "Food Safety and Standards Authority of India (FSSAI)",
        "document_type": "Regulations",
    },
    "10_PPVR": {
        "category": "TRADITIONAL_KNOWLEDGE",
        "jurisdiction": "india",
        "authority": "Protection of Plant Varieties and Farmers' Rights Authority (PPVFRA)",
        "document_type": "Act/Rules",
    },
    "12_SECONDARY_REFERENCE": {
        "category": "GENERAL",
        "jurisdiction": "india",
        "authority": "Various Government Sources",
        "document_type": "Reference",
    },
}

INTERNATIONAL_DIR_METADATA = {
    "01_Global_IP": {
        "category": "GENERAL",
        "jurisdiction": "international",
        "authority": "WIPO (World Intellectual Property Organization)",
        "document_type": "Convention/Treaty",
    },
    "02_PATENTS": {
        "category": "PATENT",
        "jurisdiction": "international",
        "authority": "WIPO (World Intellectual Property Organization)",
        "document_type": "Treaty/Guidelines",
    },
    "06_TRADITIONAL_KNOWLEDGE": {
        "category": "TRADITIONAL_KNOWLEDGE",
        "jurisdiction": "international",
        "authority": "WIPO (World Intellectual Property Organization)",
        "document_type": "Treaty",
    },
    "12_SECONDARY_REFERENCE": {
        "category": "GENERAL",
        "jurisdiction": "international",
        "authority": "BIRPI / WIPO",
        "document_type": "Reference",
    },
}

SKIP_DIRS = {"sample_docs", ".git", ".venv", "venv", "node_modules", "__pycache__"}


def resolve_pdf_metadata(pdf_path: Path, data_dir: Path) -> tuple[dict, str]:
    """Resolve jurisdiction, category, authority, and document type from path hierarchy."""
    try:
        rel = pdf_path.relative_to(data_dir)
        parts = rel.parts
    except ValueError:
        parts = pdf_path.parts

    parts_lower = [p.lower() for p in parts]

    # 1. Determine jurisdiction
    if "international" in parts_lower:
        jurisdiction = "international"
    elif "india" in parts_lower:
        jurisdiction = "india"
    else:
        jurisdiction = "india"

    # 2. Match directory metadata
    meta = None
    matched_dir = ""
    target_dict = INTERNATIONAL_DIR_METADATA if jurisdiction == "international" else INDIA_DIR_METADATA

    for part in parts:
        for k, v in target_dict.items():
            if part.lower() == k.lower():
                meta = dict(v)
                matched_dir = part
                break
        if meta:
            break

    # Fallback check against other dict
    if not meta:
        other_dict = INDIA_DIR_METADATA if jurisdiction == "international" else INTERNATIONAL_DIR_METADATA
        for part in parts:
            for k, v in other_dict.items():
                if part.lower() == k.lower():
                    meta = dict(v)
                    matched_dir = part
                    break
            if meta:
                break

    if not meta:
        meta = {
            "category": "GENERAL",
            "jurisdiction": jurisdiction,
            "authority": "WIPO / International" if jurisdiction == "international" else "Government of India",
            "document_type": "Document",
        }
        matched_dir = parts[0] if parts else ""

    meta["jurisdiction"] = jurisdiction

    # 3. Subdirectory refinements
    for part in parts:
        part_l = part.lower()
        if "single_drugs" in part_l:
            meta["document_type"] = "Ayurvedic Pharmacopoeia (Single Drugs)"
            meta["authority"] = "PCIM&H / Ministry of AYUSH, Government of India"
        elif "formulations" in part_l:
            meta["document_type"] = "Ayurvedic Pharmacopoeia (Formulations)"
            meta["authority"] = "PCIM&H / Ministry of AYUSH, Government of India"
        elif "siddha" in part_l:
            meta["authority"] = "PCIM&H / Ministry of AYUSH, Government of India"
            meta["category"] = "REGULATORY"
            meta["document_type"] = "Siddha Pharmacopoeia Amendment"
        elif "unani" in part_l:
            meta["authority"] = "PCIM&H / Ministry of AYUSH, Government of India"
            meta["category"] = "REGULATORY"
            meta["document_type"] = "Unani Formulary Amendment"
        elif "historical" in part_l:
            meta["document_type"] = "Historical Legal Document"
        elif "amendments" in part_l:
            meta["document_type"] = "Regulatory Amendment"

    return meta, matched_dir


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


def ingest_pdf(pdf_path: Path, meta: dict, source_label: str) -> bool:
    stem = pdf_path.stem
    while stem.lower().endswith(".pdf"):
        stem = stem[:-4].strip()
    title = stem.replace("_", " ").replace("-", " — ")
    title = re.sub(r"\s+", " ", title).strip()

    filename = pdf_path.name
    print(f"  → [{meta['jurisdiction'].upper()}/{meta['category']}] {filename[:55]}...")

    try:
        with open(pdf_path, "rb") as f:
            file_bytes = f.read()

        metadata = {
            "title": title,
            "source": source_label,
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
            timeout=180,
        )

        if resp.status_code in (200, 201):
            result = resp.json()
            chunks = result.get("chunk_count", "?")
            print(f"     ✓ Ingested: {chunks} chunks")
            return True
        else:
            msg = resp.text[:150]
            print(f"     ✗ Failed ({resp.status_code}): {msg}")
            return False

    except requests.exceptions.Timeout:
        print(f"     ✗ Timeout (PDF may be too large, consider backend/scripts/ingest_pdfs.py)")
        return False
    except Exception as e:
        print(f"     ✗ Error: {e}")
        return False


def main():
    print("=" * 65)
    print("  IP-SAKTI Sahayak — Real Data Ingestion (API)")
    print("=" * 65)

    if not DATA_DIR.exists():
        print(f"\nERROR: Data directory not found: {DATA_DIR}")
        sys.exit(1)

    if not check_health():
        print("\nStart the backend first!")
        print("Tip: You can also run offline batch ingestion directly:")
        print("    cd backend && .\\venv\\Scripts\\python.exe scripts\\ingest_pdfs.py")
        sys.exit(1)

    all_pdfs = sorted(DATA_DIR.rglob("*.pdf"))
    valid_pdfs = [p for p in all_pdfs if not any(skip in p.parts for skip in SKIP_DIRS)]

    print(f"Found {len(valid_pdfs)} PDF documents across all folders.\n")

    total_ok = 0
    total_fail = 0

    for pdf in valid_pdfs:
        meta, matched_dir = resolve_pdf_metadata(pdf, DATA_DIR)
        source_label = f"{meta['jurisdiction']}/{matched_dir} / {pdf.name}" if matched_dir else f"{meta['jurisdiction']} / {pdf.name}"
        ok = ingest_pdf(pdf, meta, source_label)
        if ok:
            total_ok += 1
        else:
            total_fail += 1

    print("\n" + "=" * 65)
    print(f"  Done! {total_ok} ingested, {total_fail} failed/skipped.")
    print("=" * 65)


if __name__ == "__main__":
    main()
