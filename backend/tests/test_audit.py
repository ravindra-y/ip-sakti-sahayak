"""
IP-SAKTI Sahayak — Comprehensive RAG Audit Test Suite
"""

import os
import sys
import uuid
import tempfile
import pytest
import asyncio

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.connection import Base
from app.database import models as _models
from app.database.crud import create_document_metadata, get_document_metadata, list_document_metadata
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.services.abstention import should_abstain, get_abstention_response
from app.services.confidence import calculate_confidence
from app.services.citation_extractor import extract_citations, build_context_string
from app.services.query_router import route_query
from app.utils.text_processing import clean_text, chunk_text
from app.utils.validators import validate_question, validate_file_type, validate_file_size


# --------------- shared fixtures ---------------

@pytest.fixture(scope="session")
def embedding_svc():
    return EmbeddingService()

@pytest.fixture()
def tmp_chroma(tmp_path):
    chroma_dir = str(tmp_path / "chroma")
    vs = VectorStoreService(chroma_dir)
    vs.initialize()
    return vs

@pytest.fixture()
def sqlite_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    yield db
    db.close()


def _india_sample(embedding_svc):
    text = (
        "Patents Act Sample. "
        "The Patents Act 1970 governs patent law in India. "
        "Section 3 lists non-patentable subject matter. "
        "Section 10 specifies requirements for patent specification. "
        "Traditional Knowledge is protected under Section 3p."
    )
    chunks = chunk_text(text, chunk_size=150, overlap=30)
    embeddings = embedding_svc.encode(chunks)
    doc_id = "india-patent-001"
    meta_list = [{"document_id": doc_id, "title": "Patents Act Sample",
                  "source": "GoI", "jurisdiction": "india", "category": "PATENT",
                  "authority": "GoI", "document_type": "Act", "chunk_number": i}
                 for i in range(len(chunks))]
    return doc_id, chunks, embeddings, meta_list


def _intl_sample(embedding_svc):
    text = (
        "TRIPS Sample. "
        "The Agreement on Trade-Related Aspects of Intellectual Property Rights TRIPS "
        "is administered by the World Trade Organization WTO. "
        "Article 27 defines patentable subject matter internationally. "
        "Article 39 protects undisclosed information and trade secrets."
    )
    chunks = chunk_text(text, chunk_size=150, overlap=30)
    embeddings = embedding_svc.encode(chunks)
    doc_id = "intl-trips-001"
    meta_list = [{"document_id": doc_id, "title": "TRIPS Sample",
                  "source": "WTO", "jurisdiction": "international", "category": "PATENT",
                  "authority": "WTO", "document_type": "Agreement", "chunk_number": i}
                 for i in range(len(chunks))]
    return doc_id, chunks, embeddings, meta_list


# ==== 1. CHUNKING ====
class TestChunking:
    def test_basic_chunking(self):
        chunks = chunk_text("word " * 200)
        assert len(chunks) > 0

    def test_empty_text_returns_empty(self):
        assert chunk_text("") == []
        assert chunk_text("   ") == []

    def test_no_space_text_no_infinite_loop(self):
        chunks = chunk_text("A" * 600, chunk_size=100, overlap=50)
        assert isinstance(chunks, list)

    def test_overlap_gte_chunk_size_no_infinite_loop(self):
        chunks = chunk_text("patent trademark " * 50, chunk_size=30, overlap=100)
        assert isinstance(chunks, list)

    def test_no_empty_chunks(self):
        for c in chunk_text("legal text " * 20):
            assert c.strip() != ""

    def test_chunk_size_respected(self):
        for c in chunk_text("word " * 300, chunk_size=100, overlap=10):
            assert len(c) <= 110

    def test_consecutive_chunks_overlap(self):
        chunks = chunk_text("w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 " * 5, chunk_size=40, overlap=15)
        if len(chunks) >= 2:
            assert len(set(chunks[0].split()) & set(chunks[1].split())) > 0


# ==== 2. EMBEDDINGS ====
class TestEmbeddings:
    def test_encode_single_shape(self, embedding_svc):
        v = embedding_svc.encode_single("patent law India")
        assert isinstance(v, list) and len(v) == 384

    def test_encode_batch(self, embedding_svc):
        vecs = embedding_svc.encode(["patent", "trademark", "copyright"])
        assert len(vecs) == 3

    def test_different_texts_different_vectors(self, embedding_svc):
        v1 = embedding_svc.encode_single("Patents Act India 1970")
        v2 = embedding_svc.encode_single("TRIPS Agreement WTO")
        assert v1 != v2

    def test_similar_texts_closer(self, embedding_svc):
        import math
        def cos(a, b):
            d = sum(x*y for x,y in zip(a,b))
            return d / (math.sqrt(sum(x*x for x in a)) * math.sqrt(sum(x*x for x in b)) + 1e-10)
        q = embedding_svc.encode_single("patent India")
        doc = embedding_svc.encode_single("Patents Act 1970 India")
        noise = embedding_svc.encode_single("monsoon rainfall season")
        assert cos(q, doc) > cos(q, noise)


# ==== 3. VECTOR STORE PERSISTENCE ====
class TestVectorStore:
    def test_initialize(self, tmp_chroma):
        stats = tmp_chroma.get_collection_stats()
        assert "india" in stats and "international" in stats

    def test_add_and_count(self, tmp_chroma):
        tmp_chroma.add_document_chunks("india", "d1", ["text"], [[0.1]*384],
            [{"document_id":"d1","title":"T","source":"S","jurisdiction":"india",
              "category":"PATENT","authority":"A","document_type":"Act","chunk_number":0}])
        assert tmp_chroma.get_collection_stats()["india"] == 1

    def test_persist_and_reload(self, tmp_path, embedding_svc):
        d = str(tmp_path / "persist")
        vs1 = VectorStoreService(d); vs1.initialize()
        chunks = ["persistent text"]
        vs1.add_document_chunks("india", "p1", chunks, embedding_svc.encode(chunks),
            [{"document_id":"p1","title":"T","source":"S","jurisdiction":"india",
              "category":"PATENT","authority":"A","document_type":"Act","chunk_number":0}])
        vs2 = VectorStoreService(d); vs2.initialize()
        assert vs2.get_collection_stats()["india"] == 1, "Persistence failed"

    def test_add_empty_chunks_noop(self, tmp_chroma):
        tmp_chroma.add_document_chunks("india", "noop", [], [], [])
        assert tmp_chroma.get_collection_stats()["india"] == 0

    def test_invalid_jurisdiction_raises(self, tmp_chroma):
        with pytest.raises(ValueError):
            tmp_chroma.add_document_chunks("both", "x", ["t"], [[0.1]*384], [{}])

    def test_search_empty_collection_no_crash(self, tmp_chroma, embedding_svc):
        q = embedding_svc.encode_single("patent")
        results = tmp_chroma.search("india", q, top_k=5)
        assert results == []

    def test_delete_removes_chunks(self, tmp_chroma, embedding_svc):
        chunks = ["a", "b"]
        embs = embedding_svc.encode(chunks)
        meta = [{"document_id":"del1","title":"T","source":"S","jurisdiction":"india",
                 "category":"PATENT","authority":"A","document_type":"Act","chunk_number":i}
                for i in range(2)]
        tmp_chroma.add_document_chunks("india", "del1", chunks, embs, meta)
        assert tmp_chroma.get_collection_stats()["india"] == 2
        tmp_chroma.delete_document("india", "del1")
        assert tmp_chroma.get_collection_stats()["india"] == 0


# ==== 4. JURISDICTION ISOLATION (CRITICAL) ====
class TestJurisdictionIsolation:

    @pytest.fixture(autouse=True)
    def seed(self, tmp_chroma, embedding_svc):
        self.vs = tmp_chroma
        self.emb = embedding_svc
        i_id, ic, ie, im = _india_sample(embedding_svc)
        self.vs.add_document_chunks("india", i_id, ic, ie, im)
        x_id, xc, xe, xm = _intl_sample(embedding_svc)
        self.vs.add_document_chunks("international", x_id, xc, xe, xm)

    def test_india_query_never_returns_international_doc(self):
        q = self.emb.encode_single("Patents Act India Section 3")
        results = self.vs.search("india", q, top_k=10)
        assert len(results) > 0
        for r in results:
            assert r["metadata"]["jurisdiction"] == "india", \
                f"ISOLATION FAILURE: India query returned international doc '{r['metadata']['title']}'"

    def test_international_query_never_returns_india_doc(self):
        q = self.emb.encode_single("TRIPS Article 27 WTO")
        results = self.vs.search("international", q, top_k=10)
        assert len(results) > 0
        for r in results:
            assert r["metadata"]["jurisdiction"] == "international", \
                f"ISOLATION FAILURE: Intl query returned India doc '{r['metadata']['title']}'"

    def test_both_gets_from_both(self):
        q = self.emb.encode_single("patent protection")
        results = self.vs.search("both", q, top_k=20)
        jurisdictions = {r["metadata"]["jurisdiction"] for r in results}
        assert "india" in jurisdictions
        assert "international" in jurisdictions

    def test_india_query_retrieves_india_title(self):
        q = self.emb.encode_single("Patents Act 1970 Section 3")
        results = self.vs.search("india", q, top_k=5)
        titles = [r["metadata"]["title"] for r in results]
        assert any("Patents Act" in t for t in titles)

    def test_intl_query_retrieves_trips_title(self):
        q = self.emb.encode_single("TRIPS Agreement Article 27")
        results = self.vs.search("international", q, top_k=5)
        titles = [r["metadata"]["title"] for r in results]
        assert any("TRIPS" in t for t in titles)

    def test_empty_db_returns_empty_all_jurisdictions(self, tmp_path, embedding_svc):
        vs = VectorStoreService(str(tmp_path / "empty")); vs.initialize()
        q = embedding_svc.encode_single("patent")
        assert vs.search("india", q) == []
        assert vs.search("international", q) == []
        assert vs.search("both", q) == []

    def test_irrelevant_query_low_confidence(self, embedding_svc):
        q = embedding_svc.encode_single("monsoon rainfall forecast")
        results = self.vs.search("india", q, top_k=5)
        if results:
            conf = calculate_confidence(results)
            assert conf < 0.95


# ==== 5. RETRIEVAL + METADATA ====
class TestRetrieval:
    def test_metadata_round_trips(self, tmp_chroma, embedding_svc):
        chunks = ["Section 3 non-patentable subjects"]
        embs = embedding_svc.encode(chunks)
        meta = [{"document_id":"rt1","title":"Patents Act Sample","source":"GoI",
                 "jurisdiction":"india","category":"PATENT","authority":"GoI",
                 "document_type":"Act","chunk_number":0,"version":"2005"}]
        tmp_chroma.add_document_chunks("india","rt1",chunks,embs,meta)
        q = embedding_svc.encode_single("Patents Act non-patentable")
        r = tmp_chroma.search("india", q, top_k=1)
        assert r[0]["metadata"]["document_id"] == "rt1"
        assert r[0]["metadata"]["version"] == "2005"

    def test_top_k_limits(self, tmp_chroma, embedding_svc):
        for i in range(5):
            text = [f"India patent para {i}"]
            embs = embedding_svc.encode(text)
            meta = [{"document_id":f"b{i}","title":f"D{i}","source":"S",
                     "jurisdiction":"india","category":"PATENT","authority":"A",
                     "document_type":"Act","chunk_number":0}]
            tmp_chroma.add_document_chunks("india",f"b{i}",text,embs,meta)
        q = embedding_svc.encode_single("India patent")
        assert len(tmp_chroma.search("india", q, top_k=3)) == 3

    def test_distances_ascending(self, tmp_chroma, embedding_svc):
        i_id, ic, ie, im = _india_sample(embedding_svc)
        tmp_chroma.add_document_chunks("india", i_id, ic, ie, im)
        q = embedding_svc.encode_single("Patents Act Section 3")
        results = tmp_chroma.search("india", q, top_k=5)
        dists = [r["distance"] for r in results]
        assert dists == sorted(dists)


# ==== 6. DUPLICATE DOCUMENT ====
class TestDuplicate:
    def test_same_content_twice_doubles_count(self, tmp_chroma, embedding_svc):
        chunks = ["patent law text"]
        embs = embedding_svc.encode(chunks)
        for did in ["dup-a", "dup-b"]:
            meta = [{"document_id":did,"title":"T","source":"S","jurisdiction":"india",
                     "category":"PATENT","authority":"A","document_type":"Act","chunk_number":0}]
            tmp_chroma.add_document_chunks("india", did, chunks, embs, meta)
        assert tmp_chroma.get_collection_stats()["india"] == 2


# ==== 7. CITATIONS ====
class TestCitations:
    RESULTS = [
        {"id":"d1_0","document":"Patents Act text.","metadata":{
            "document_id":"d1","title":"Patents Act Sample","source":"GoI",
            "authority":"GoI","jurisdiction":"india","category":"PATENT",
            "document_type":"Act","chunk_number":0,"official_url":"https://ipindia.gov.in"},
         "distance":0.15},
        {"id":"d2_0","document":"TRIPS text.","metadata":{
            "document_id":"d2","title":"TRIPS Sample","source":"WTO",
            "authority":"WTO","jurisdiction":"international","category":"PATENT",
            "document_type":"Agreement","chunk_number":0},
         "distance":0.25},
    ]

    def test_citation_count(self):
        assert len(extract_citations(self.RESULTS)) == 2

    def test_citation_fields(self):
        c = extract_citations(self.RESULTS)[0]
        assert c.document_id == "d1"
        assert c.title == "Patents Act Sample"
        assert c.official_url == "https://ipindia.gov.in"

    def test_relevance_score(self):
        citations = extract_citations(self.RESULTS)
        assert abs(citations[0].relevance_score - 0.85) < 0.01
        assert abs(citations[1].relevance_score - 0.75) < 0.01

    def test_missing_metadata_defaults(self):
        c = extract_citations([{"id":"x","document":"t","metadata":{},"distance":0.5}])[0]
        assert c.document_id == "" and c.title == "" and c.chunk_number == 0

    def test_jurisdiction_preserved(self):
        citations = extract_citations(self.RESULTS)
        assert citations[0].jurisdiction == "india"
        assert citations[1].jurisdiction == "international"

    def test_context_string_contains_titles(self):
        ctx = build_context_string(self.RESULTS)
        assert "Patents Act Sample" in ctx
        assert "TRIPS Sample" in ctx


# ==== 8. CONFIDENCE ====
class TestConfidence:
    def test_no_results_zero(self): assert calculate_confidence([]) == 0.0
    def test_perfect_match(self): assert calculate_confidence([{"distance":0.0}]) == 1.0
    def test_high_distance_low(self): assert calculate_confidence([{"distance":0.95}]) < 0.1
    def test_clamped_at_zero(self): assert calculate_confidence([{"distance":1.5}]) == 0.0
    def test_weighted(self):
        conf = calculate_confidence([{"distance":0.0}, {"distance":0.5}])
        assert 0.8 < conf < 0.9


# ==== 9. ABSTENTION ====
class TestAbstention:
    def test_no_results(self):
        ok, r = should_abstain([], 0.0, 0.35)
        assert ok and "No relevant" in r

    def test_below_threshold(self):
        ok, r = should_abstain([{"distance":0.9}], 0.1, 0.35)
        assert ok and "below threshold" in r

    def test_above_threshold(self):
        ok, r = should_abstain([{"distance":0.1}], 0.9, 0.35)
        assert not ok and r is None

    def test_exactly_at_threshold_passes(self):
        ok, _ = should_abstain([{"distance":0.0}], 0.35, 0.35)
        assert not ok

    def test_message_phrase(self):
        assert "sufficient authoritative information" in get_abstention_response()

    def test_reason_contains_values(self):
        _, r = should_abstain([{"distance":0.8}], 0.2, 0.35)
        assert "0.20" in r and "0.35" in r


# ==== 10. OLLAMA ====
class TestOllamaIntegration:
    @pytest.mark.asyncio
    async def test_unavailable_raises(self):
        from app.services.ollama_client import OllamaClient, OllamaUnavailableError
        c = OllamaClient("http://127.0.0.1:19999", "nomodel")
        with pytest.raises(OllamaUnavailableError):
            await c.generate("prompt", "system")

    @pytest.mark.asyncio
    async def test_pipeline_abstains_when_ollama_down(self, tmp_chroma, embedding_svc, sqlite_session):
        from app.services.ollama_client import OllamaClient
        from app.services.rag_pipeline import RAGPipeline
        from app.models.request_models import ChatRequest, Jurisdiction
        i_id, ic, ie, im = _india_sample(embedding_svc)
        tmp_chroma.add_document_chunks("india", i_id, ic, ie, im)
        pipeline = RAGPipeline(tmp_chroma, OllamaClient("http://127.0.0.1:19999", "nomodel"))
        req = ChatRequest(question="What is patentable in India?", jurisdiction=Jurisdiction.INDIA)
        resp = await pipeline.process_query(req, sqlite_session)
        assert resp.abstained is True
        assert "unavailable" in resp.answer.lower() or "sufficient authoritative" in resp.answer.lower()

    @pytest.mark.asyncio
    async def test_pipeline_logs_exactly_once(self, tmp_chroma, embedding_svc, sqlite_session):
        from app.services.rag_pipeline import RAGPipeline
        from app.models.request_models import ChatRequest, Jurisdiction
        from app.database.models import Message

        class AlwaysEmptyVS:
            def search(self, *a, **k): return []
        class NoopOllama:
            async def generate(self, *a, **k): return "answer"

        pipeline = RAGPipeline(AlwaysEmptyVS(), NoopOllama())
        req = ChatRequest(question="Xyz abc question", jurisdiction=Jurisdiction.INDIA)
        await pipeline.process_query(req, sqlite_session)
        msgs = sqlite_session.query(Message).all()
        assert sum(1 for m in msgs if m.role == "user") == 1
        assert sum(1 for m in msgs if m.role == "assistant") == 1


# ==== 11. SQLITE CONSISTENCY ====
class TestSQLite:
    def _doc(self, db, **kw):
        kwargs = dict(id=str(uuid.uuid4()), title="Patents Act Sample",
                      source="GoI", jurisdiction="india", category="PATENT",
                      authority="GoI", document_type="Act", chunk_count=3)
        kwargs.update(kw)
        return create_document_metadata(db, **kwargs)

    def test_create_retrieve(self, sqlite_session):
        doc = self._doc(sqlite_session)
        f = get_document_metadata(sqlite_session, doc.id)
        assert f and f.title == "Patents Act Sample"

    def test_filter_jurisdiction(self, sqlite_session):
        self._doc(sqlite_session, id="i1")
        self._doc(sqlite_session, id="i2")
        self._doc(sqlite_session, id="x1", jurisdiction="international", title="TRIPS Sample")
        assert len(list_document_metadata(sqlite_session, jurisdiction="india")) == 2
        assert len(list_document_metadata(sqlite_session, jurisdiction="international")) == 1

    def test_optional_fields_none_ok(self, sqlite_session):
        doc = self._doc(sqlite_session, version=None, official_url=None)
        f = get_document_metadata(sqlite_session, doc.id)
        assert f.version is None


# ==== 12. VALIDATORS ====
class TestValidators:
    def test_short_question(self): assert not validate_question("ab")[0]
    def test_empty_question(self): assert not validate_question("")[0]
    def test_long_question(self): assert not validate_question("x"*2001)[0]
    def test_valid_question(self): assert validate_question("What is a patent?")[0]
    def test_pdf_accepted(self): assert validate_file_type("doc.pdf","application/pdf")
    def test_octet_stream_accepted(self): assert validate_file_type("doc.pdf","application/octet-stream")
    def test_docx_rejected(self): assert not validate_file_type("doc.docx","application/pdf")
    def test_size_ok(self): assert validate_file_size(10*1024*1024, 50)
    def test_size_over(self): assert not validate_file_size(60*1024*1024, 50)


# ==== 13. ERROR HANDLING — CORRUPT PDF ====
class TestCorruptPDF:
    def test_garbled_text_handled(self):
        garbled = "\x00GARBAGE\xff\xfe" * 50
        chunks = chunk_text(clean_text(garbled))
        assert isinstance(chunks, list)

    def test_whitespace_only_produces_no_chunks(self):
        assert chunk_text(clean_text("   \n\n  ")) == []


# ==== 14. QUERY ROUTER ====
class TestQueryRouter:
    def test_patent(self): assert route_query("Can I patent my formulation in India?") == "PATENT"
    def test_tkdl(self): assert route_query("TKDL prior art search herbs") == "TRADITIONAL_KNOWLEDGE"
    def test_abs(self): assert route_query("Nagoya Protocol access and benefit sharing") == "ABS"
    def test_trademark(self): assert route_query("register a trademark for Ayurvedic brand") == "TRADEMARK"
    def test_gi(self): assert route_query("How do I get a GI tag for my product?") == "GEOGRAPHICAL_INDICATION"
    def test_formulation(self): assert route_query("Is my herbal formulation classical recipe?") == "FORMULATION"
    def test_general_fallback(self): assert route_query("Hello how are you") == "GENERAL"


# ==== 15. END-TO-END RAG ====
class TestE2ERAG:
    """
    End-to-end tests using real embeddings and ChromaDB.

    Note on confidence: ChromaDB's L2 distance for all-MiniLM-L6-v2 can
    exceed 1.0, so `similarity = 1 - distance` may be negative. This means
    a short synthetic corpus may produce confidence < threshold. We handle
    this in two ways:
      a) Use a richer, larger corpus and an exact-match query.
      b) Assert on jurisdiction isolation regardless of abstention.
    """

    def _make_rich_india_corpus(self, embedding_svc):
        """
        A larger corpus so at least one chunk is close to the query.
        The query itself appears verbatim in the corpus.
        """
        text = (
            "Patents Act Sample India. "
            "The Patents Act 1970 as amended in 2005 governs patent law in India. "
            "What is patentable under the Patents Act? "
            "An invention is patentable if it is novel, involves an inventive step, "
            "and is capable of industrial application as per the Patents Act India. "
            "Section 2 defines invention as a new product or process involving an inventive step. "
            "Section 3 lists what is not patentable including laws of nature and traditional knowledge. "
            "Section 10 requires full disclosure and best method in the patent specification. "
            "Section 43 grants patent rights to the applicant for 20 years from filing date. "
            "Patent applications in India are filed at the Indian Patent Office. "
            "Traditional Knowledge cannot be patented under Section 3p of the Patents Act. "
            "The TKDL Traditional Knowledge Digital Library protects Indian heritage. "
            "Ayurvedic formulations with known compositions are excluded from patent protection. "
            "Geographical Indications protect regional products under the GI Act India. "
            "Trademark registration is governed by the Trade Marks Act 1999 in India. "
            "The Controller General of Patents Designs and Trademarks is the authority. "
        ) * 3  # triple to get enough chunks for weighted confidence
        chunks = chunk_text(text, chunk_size=200, overlap=40)
        embeddings = embedding_svc.encode(chunks)
        doc_id = "india-rich-001"
        meta_list = [
            {
                "document_id": doc_id,
                "title": "Patents Act Sample",
                "source": "GoI",
                "jurisdiction": "india",
                "category": "PATENT",
                "authority": "Government of India",
                "document_type": "Act",
                "chunk_number": i,
            }
            for i in range(len(chunks))
        ]
        return doc_id, chunks, embeddings, meta_list

    def _make_rich_intl_corpus(self, embedding_svc):
        text = (
            "TRIPS Sample International. "
            "The Agreement on Trade-Related Aspects of Intellectual Property Rights TRIPS "
            "is an international agreement administered by the WTO World Trade Organization. "
            "What does TRIPS say about patents? "
            "Article 27 of TRIPS states that patents shall be available for any inventions "
            "in all fields of technology provided they are new, inventive, and industrially applicable. "
            "Article 28 describes the exclusive rights conferred by a patent under TRIPS. "
            "Article 39 of TRIPS protects undisclosed information and trade secrets internationally. "
            "TRIPS requires WTO member states to provide minimum IP protection standards. "
            "Compulsory licensing is permitted under TRIPS Article 31 for public health emergencies. "
            "The Doha Declaration clarified that TRIPS should be interpreted to protect public health. "
            "Geographical Indications are protected under TRIPS Articles 22 to 24. "
            "Copyright protection is required for at least 50 years under TRIPS Article 12. "
        ) * 3
        chunks = chunk_text(text, chunk_size=200, overlap=40)
        embeddings = embedding_svc.encode(chunks)
        doc_id = "intl-rich-001"
        meta_list = [
            {
                "document_id": doc_id,
                "title": "TRIPS Sample",
                "source": "WTO",
                "jurisdiction": "international",
                "category": "PATENT",
                "authority": "WTO",
                "document_type": "Agreement",
                "chunk_number": i,
            }
            for i in range(len(chunks))
        ]
        return doc_id, chunks, embeddings, meta_list

    @pytest.mark.asyncio
    async def test_india_answer_sources_are_india_only(self, tmp_chroma, embedding_svc, sqlite_session):
        """
        Critical: any sources returned by an India query must be India-jurisdiction.
        This holds regardless of whether abstention fires.
        """
        from app.services.rag_pipeline import RAGPipeline
        from app.services.ollama_client import OllamaClient
        from app.models.request_models import ChatRequest, Jurisdiction

        class M(OllamaClient):
            def __init__(self): pass
            async def generate(self, prompt, system_prompt, max_tokens=1024):
                return "Answer based on Patents Act. Information only — not legal advice."

        i_id, ic, ie, im = self._make_rich_india_corpus(embedding_svc)
        tmp_chroma.add_document_chunks("india", i_id, ic, ie, im)

        resp = await RAGPipeline(tmp_chroma, M()).process_query(
            ChatRequest(
                question="What is patentable under the Patents Act?",
                jurisdiction=Jurisdiction.INDIA,
            ),
            sqlite_session,
        )

        assert resp.jurisdiction == "india"
        # Jurisdiction isolation: every source must be India
        assert all(s.jurisdiction == "india" for s in resp.sources), \
            "India query returned non-India source citations"
        assert resp.disclaimer == "Information only — not legal advice."

    @pytest.mark.asyncio
    async def test_india_answer_does_not_abstain_with_rich_corpus(self, tmp_chroma, embedding_svc, sqlite_session):
        """
        With a rich corpus containing the query verbatim, confidence should
        exceed the 0.35 threshold and the pipeline should NOT abstain.
        """
        from app.services.rag_pipeline import RAGPipeline
        from app.services.ollama_client import OllamaClient
        from app.models.request_models import ChatRequest, Jurisdiction

        class M(OllamaClient):
            def __init__(self): pass
            async def generate(self, prompt, system_prompt, max_tokens=1024):
                return "Answer based on Patents Act. Information only — not legal advice."

        i_id, ic, ie, im = self._make_rich_india_corpus(embedding_svc)
        tmp_chroma.add_document_chunks("india", i_id, ic, ie, im)

        resp = await RAGPipeline(tmp_chroma, M()).process_query(
            ChatRequest(
                # Use the exact sentence embedded verbatim in the corpus
                question="What is patentable under the Patents Act?",
                jurisdiction=Jurisdiction.INDIA,
            ),
            sqlite_session,
        )

        assert not resp.abstained, (
            f"Pipeline abstained unexpectedly. "
            f"confidence={resp.retrieval_confidence:.3f}, "
            f"reason={resp.abstention_reason}"
        )
        assert resp.retrieval_confidence > 0.35
        assert len(resp.sources) > 0

    @pytest.mark.asyncio
    async def test_international_answer(self, tmp_chroma, embedding_svc, sqlite_session):
        from app.services.rag_pipeline import RAGPipeline
        from app.services.ollama_client import OllamaClient
        from app.models.request_models import ChatRequest, Jurisdiction

        class M(OllamaClient):
            def __init__(self): pass
            async def generate(self, prompt, system_prompt, max_tokens=1024):
                return "TRIPS context. Information only — not legal advice."

        x_id, xc, xe, xm = self._make_rich_intl_corpus(embedding_svc)
        tmp_chroma.add_document_chunks("international", x_id, xc, xe, xm)
        resp = await RAGPipeline(tmp_chroma, M()).process_query(
            ChatRequest(
                question="What does TRIPS say about patents?",
                jurisdiction=Jurisdiction.INTERNATIONAL,
            ),
            sqlite_session,
        )
        assert resp.jurisdiction == "international"
        assert all(s.jurisdiction == "international" for s in resp.sources)

    @pytest.mark.asyncio
    async def test_empty_db_abstains(self, tmp_chroma, embedding_svc, sqlite_session):
        from app.services.rag_pipeline import RAGPipeline
        from app.services.ollama_client import OllamaClient
        from app.models.request_models import ChatRequest, Jurisdiction

        class M(OllamaClient):
            def __init__(self): pass
            async def generate(self, prompt, system_prompt, max_tokens=1024): return "answer"

        resp = await RAGPipeline(tmp_chroma, M()).process_query(
            ChatRequest(question="What is TKDL?", jurisdiction=Jurisdiction.INDIA),
            sqlite_session,
        )
        assert resp.abstained is True
        assert "sufficient authoritative" in resp.answer.lower()


