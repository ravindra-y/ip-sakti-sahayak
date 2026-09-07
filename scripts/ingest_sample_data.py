#!/usr/bin/env python3
"""
IP-SAKTI Sahayak — Sample Data Ingestion Script

Ingests the demonstration knowledge base documents into the running backend.
Run AFTER the FastAPI server is started:
    python scripts/ingest_sample_data.py
"""
import os
import sys
import requests
import json
from pathlib import Path

BASE_URL = os.environ.get("API_URL", "http://localhost:8000")
SAMPLE_DOCS_DIR = Path(__file__).parent.parent / "data" / "sample_docs"

DOCUMENTS_METADATA = [
    {
        "filename": "india_patents_act_sample.txt",
        "metadata": {
            "title": "Patents Act 1970 (as amended) — Traditional Knowledge Provisions [SAMPLE]",
            "source": "Office of the Controller General of Patents, Designs & Trade Marks",
            "jurisdiction": "india",
            "category": "Patents",
            "authority": "CGPDTM, Government of India",
            "document_type": "Act Summary",
            "version": "2005 Amendment",
            "publication_date": "2005",
            "official_url": "https://ipindia.gov.in/patents.htm"
        }
    },
    {
        "filename": "india_tkdl_sample.txt",
        "metadata": {
            "title": "Traditional Knowledge Digital Library (TKDL) — Overview [SAMPLE]",
            "source": "CSIR and Ministry of AYUSH",
            "jurisdiction": "india",
            "category": "Traditional Knowledge",
            "authority": "CSIR / Ministry of AYUSH",
            "document_type": "Overview",
            "version": "2001+",
            "publication_date": "2001",
            "official_url": "https://www.tkdl.res.in/"
        }
    },
    {
        "filename": "india_biological_diversity_act_sample.txt",
        "metadata": {
            "title": "Biological Diversity Act 2002 — ABS Provisions [SAMPLE]",
            "source": "National Biodiversity Authority",
            "jurisdiction": "india",
            "category": "Biological Diversity",
            "authority": "NBA, Government of India",
            "document_type": "Act Summary",
            "version": "Act No. 18 of 2003",
            "publication_date": "2002",
            "official_url": "https://nbaindia.org/"
        }
    },
    {
        "filename": "india_gi_act_sample.txt",
        "metadata": {
            "title": "Geographical Indications of Goods Act 1999 [SAMPLE]",
            "source": "GI Registry, CGPDTM",
            "jurisdiction": "india",
            "category": "Geographical Indications",
            "authority": "GI Registry, Government of India",
            "document_type": "Act Summary",
            "version": "Act No. 48 of 1999",
            "publication_date": "1999",
            "official_url": "https://ipindia.gov.in/geographical-indications.htm"
        }
    },
    {
        "filename": "international_trips_sample.txt",
        "metadata": {
            "title": "TRIPS Agreement — Traditional Knowledge Provisions [SAMPLE]",
            "source": "World Trade Organisation",
            "jurisdiction": "international",
            "category": "Patents",
            "authority": "WTO",
            "document_type": "Treaty Summary",
            "version": "1994",
            "publication_date": "1994",
            "official_url": "https://www.wto.org/english/docs_e/legal_e/27-trips.pdf"
        }
    },
    {
        "filename": "international_nagoya_protocol_sample.txt",
        "metadata": {
            "title": "Nagoya Protocol on ABS — Traditional Knowledge Provisions [SAMPLE]",
            "source": "CBD Secretariat, United Nations",
            "jurisdiction": "international",
            "category": "Biological Diversity",
            "authority": "Convention on Biological Diversity (CBD)",
            "document_type": "Protocol Summary",
            "version": "2014 (entered into force)",
            "publication_date": "2010",
            "official_url": "https://www.cbd.int/abs/"
        }
    },
]


def ingest_document(doc_config: dict) -> bool:
    import tempfile
    from fpdf import FPDF

    filename = doc_config["filename"]
    metadata = doc_config["metadata"]
    filepath = SAMPLE_DOCS_DIR / filename

    if not filepath.exists():
        print(f"  ERROR: File not found: {filepath}")
        return False

    print(f"  Ingesting: {metadata['title']}")

    with open(filepath, "r", encoding="utf-8") as f:
        text_content = f.read()

    # Create a temporary PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    # Multi_cell handles text wrapping
    pdf.multi_cell(0, 10, text_content.encode('latin-1', 'replace').decode('latin-1'))
    
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = tmp.name
    
    try:
        pdf.output(tmp_path)
        with open(tmp_path, "rb") as f:
            pdf_bytes = f.read()
    finally:
        os.remove(tmp_path)

    # Post as multipart/form-data with the PDF file as application/pdf
    files_pdf = {
        "file": (filename.replace('.txt', '.pdf'), pdf_bytes, "application/pdf"),
    }
    data = {
        "metadata": json.dumps(metadata)
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/documents/upload",
            files=files_pdf,
            data=data,
            timeout=60,
        )
        if response.status_code in (200, 201):
            result = response.json()
            print(f"  SUCCESS: {result.get('title', 'Document')} — {result.get('chunk_count', '?')} chunks")
            return True
        else:
            print(f"  FAILED ({response.status_code}): {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"  ERROR: Cannot connect to {BASE_URL}. Is the backend running?")
        return False
    except Exception as e:
        print(f"  ERROR: {e}")
        return False


def check_health():
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=5)
        if r.status_code == 200:
            print(f"Backend health: OK ({BASE_URL})")
            return True
        else:
            print(f"Backend health check failed: {r.status_code}")
            return False
    except Exception as e:
        print(f"Cannot reach backend at {BASE_URL}: {e}")
        return False


def main():
    print("=" * 60)
    print("IP-SAKTI Sahayak — Sample Data Ingestion")
    print("=" * 60)

    if not check_health():
        print("\nStart the backend first: cd backend && uvicorn app.main:app --reload")
        sys.exit(1)

    print(f"\nSample docs directory: {SAMPLE_DOCS_DIR}")
    print(f"Documents to ingest: {len(DOCUMENTS_METADATA)}\n")

    success_count = 0
    for doc in DOCUMENTS_METADATA:
        result = ingest_document(doc)
        if result:
            success_count += 1
        print()

    print("=" * 60)
    print(f"Ingestion complete: {success_count}/{len(DOCUMENTS_METADATA)} documents ingested.")
    if success_count < len(DOCUMENTS_METADATA):
        print("WARNING: Some documents failed to ingest. Check backend logs.")
    print("=" * 60)


if __name__ == "__main__":
    main()
