# IP-SAKTI Sahayak

**Multilingual RAG AI Assistant for Ayurveda Intellectual Property & Regulatory Guidance**

> **Information only — not legal advice.**

IP-SAKTI Sahayak is an open-source Retrieval-Augmented Generation (RAG) system providing guidance on Intellectual Property and regulatory matters related to Ayurveda. It retrieves information from authoritative indexed sources and generates plain-language explanations with mandatory source citations.

---

## Features

- **10 IP & Regulatory Categories**: Patent, Trademark, Geographical Indication, Design, Copyright, Traditional Knowledge, ABS, Regulatory, Formulation, General
- **Strict Jurisdiction Isolation**: India and International documents are stored in separate ChromaDB collections and never mixed unless explicitly requested
- **Mandatory Source Citations**: Every answer cites retrieved document sources
- **Retrieval Confidence Indicator**: Cosine-similarity based confidence score (not legal/factual certainty)
- **Safe Abstention**: Returns a safe abstention message when retrieved context is insufficient
- **Formulation Classifier**: Preliminary classification of Ayurvedic formulations
- **ABS Compliance Helper**: Structured Access and Benefit Sharing compliance questionnaire
- **Traditional Knowledge / Prior Art Pointer**: Identifies TK-related queries and suggests relevant sources
- **Conversation History**: SQLite-backed conversation and message storage
- **PDF Document Ingestion**: Pipeline for ingesting authoritative PDFs

---

## Architecture

```
React Frontend (Vite)
       |
FastAPI Backend (Python 3.11)
       |
  RAG Pipeline
  |          |
ChromaDB    Ollama (qwen3:1.7b)
(vectors)   (generation)
       |
    SQLite
  (metadata)
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.ai) installed and running
- Git

---

## Installation

### 1. Clone the Repository

```bash
git clone <repo-url>
cd ip-sakti-sahayak
```

### 2. Ollama Setup

Install Ollama from https://ollama.ai and pull the default model:

```bash
ollama pull qwen3:1.7b
ollama serve
```

Verify Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env if needed

# Initialize database directories
mkdir -p data/raw/india data/raw/international data/processed data/chroma_db
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

---

## Running the Application

### Backend

```bash
cd backend
# Activate venv first
.\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

Backend API available at: http://localhost:8000
API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm run dev
```

Frontend available at: http://localhost:5173

---

## Document Ingestion

Place your authoritative PDFs in:
- `backend/data/raw/india/` — for India jurisdiction documents
- `backend/data/raw/international/` — for International jurisdiction documents

Ingest a document:

```bash
cd backend
# Activate venv first

python scripts/ingest.py \
  --file data/raw/india/patents-act-1970.pdf \
  --jurisdiction india \
  --title "Patents Act, 1970 (as amended 2005)" \
  --source "Ministry of Commerce and Industry" \
  --category PATENT \
  --authority "Government of India" \
  --document-type "Act" \
  --official-url "https://ipindia.gov.in" \
  --version "2005 Amendment" \
  --publication-date "2005-01-01"
```

Seed authoritative source metadata (without uploading documents):

```bash
python scripts/seed_sources.py
```

---

## Running Tests

```bash
cd backend
# Activate venv first
python -m pytest tests/ -v
```

Run specific test files:
```bash
python -m pytest tests/test_jurisdiction.py -v    # Critical jurisdiction isolation tests
python -m pytest tests/test_abstention.py -v      # Safe abstention tests
python -m pytest tests/test_query_router.py -v    # Routing tests
```

---

## API Documentation

Full interactive API docs: http://localhost:8000/docs

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Service info |
| GET | /health | Health check |
| POST | /api/chat | RAG query |
| POST | /api/documents/upload | Upload PDF |
| GET | /api/documents | List documents |
| DELETE | /api/documents/{id} | Delete document |
| POST | /api/formulation/classify | Classify formulation |
| POST | /api/abs/check | ABS compliance check |
| GET | /api/sources | Knowledge base sources |
| POST | /api/conversations | Create conversation |
| GET | /api/conversations | List conversations |

### Chat Request Example

```json
POST /api/chat
{
  "question": "What are the requirements to patent an Ayurvedic formulation in India?",
  "jurisdiction": "india",
  "conversation_id": null
}
```

### Chat Response Fields

- `answer`: Generated answer from retrieved context
- `jurisdiction`: Jurisdiction the query was answered for
- `query_category`: Detected IP category (PATENT, TRADEMARK, etc.)
- `retrieval_confidence`: Float 0.0–1.0 (cosine similarity, not legal certainty)
- `sources`: Array of source citation objects
- `abstained`: Boolean — true if answer was not possible
- `disclaimer`: Always "Information only — not legal advice."

---

## Project Structure

```
ip-sakti-sahayak/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── api/                 # Route handlers
│   │   ├── services/            # Business logic & RAG
│   │   ├── database/            # SQLite ORM
│   │   ├── models/              # Pydantic schemas
│   │   └── utils/               # Text processing & validation
│   ├── data/
│   │   ├── raw/india/           # India PDF sources
│   │   ├── raw/international/   # International PDF sources
│   │   └── processed/           # Processed data
│   ├── scripts/
│   │   ├── ingest.py            # Document ingestion CLI
│   │   └── seed_sources.py      # Source metadata seeding
│   ├── tests/                   # pytest test suite
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route pages
│   │   ├── services/api.js      # Backend API client
│   │   ├── hooks/useChat.js     # Chat state management
│   │   └── styles/globals.css   # Design system
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## IP Categories Supported

1. **Patent** — Patentability, prior art, claims, PCT
2. **Trademark** — Brand registration, infringement, passing off
3. **Geographical Indication** — GI tags, regional product protection
4. **Design** — Industrial design registration
5. **Copyright** — Literary, artistic works, moral rights
6. **Traditional Knowledge** — TKDL, folk medicine, indigenous knowledge
7. **ABS** — Access and Benefit Sharing, Nagoya Protocol
8. **Regulatory** — AYUSH, Drugs and Cosmetics Act, GMP
9. **Formulation** — Classical vs proprietary classification
10. **General** — Other IP and regulatory queries

---

## Formulation Classification Categories

- Classical Ayurvedic Medicine
- Patent or Proprietary Ayurvedic Medicine
- New or Non-Classical Product
- Phytopharmaceutical
- Ayurveda-Aahar / Nutraceutical
- Cosmetic
- Uncertain

> **Preliminary guidance only** — not a legal or regulatory determination.

---

## Known Limitations

1. **Requires Ollama locally**: The system requires Ollama with `qwen3:1.7b` (or configured model) running locally or accessible via network.
2. **Knowledge base is empty by default**: No documents are pre-loaded. You must ingest authoritative PDFs to receive grounded answers.
3. **PDF extraction quality**: Text extraction quality depends on PDF structure. Scanned PDFs without OCR will not extract correctly.
4. **Retrieval confidence is not legal certainty**: The confidence score reflects cosine similarity between query and retrieved chunks, not accuracy or completeness of legal information.
5. **No authentication**: MVP does not include user authentication. Do not expose to the public internet without adding authentication.
6. **English primary**: While the project is designed for multilingual support, the current embedding model and prompts are optimized for English.
7. **Safe abstention threshold**: The default confidence threshold is 0.35. Adjust `CONFIDENCE_THRESHOLD` in `.env` based on your document collection.
8. **Not a substitute for legal advice**: This system is for informational purposes only. Always consult a qualified IP attorney for legal matters.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama API URL |
| OLLAMA_MODEL | qwen3:1.7b | LLM model name |
| EMBEDDING_MODEL | all-MiniLM-L6-v2 | Sentence transformer model |
| CHROMA_DB_PATH | ./data/chroma_db | ChromaDB storage path |
| SQLITE_DATABASE_PATH | ./data/ip_sakti.db | SQLite database path |
| TOP_K_RESULTS | 5 | Number of chunks to retrieve |
| CONFIDENCE_THRESHOLD | 0.35 | Minimum confidence to answer |
| MAX_FILE_SIZE_MB | 50 | Maximum upload file size |
| ALLOWED_ORIGINS | http://localhost:5173 | CORS allowed origins |

---

## License

This project is for informational and research purposes. See LICENSE file.

---

*IP-SAKTI Sahayak — Information only, not legal advice.*
