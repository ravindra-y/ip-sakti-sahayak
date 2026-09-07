from app.services.citation_extractor import extract_citations, build_context_string

def test_citation_extraction_from_results():
    results = [{
        "metadata": {
            "document_id": "123",
            "title": "Test Title",
            "jurisdiction": "india"
        },
        "distance": 0.2
    }]
    
    citations = extract_citations(results)
    assert len(citations) == 1
    assert citations[0].document_id == "123"
    assert citations[0].title == "Test Title"
    assert citations[0].relevance_score == 0.8

def test_relevance_score_calculation():
    results = [{"metadata": {}, "distance": 0.3}]
    citations = extract_citations(results)
    assert abs(citations[0].relevance_score - 0.7) < 0.001

def test_context_string_format():
    results = [{
        "document": "This is a test document.",
        "metadata": {
            "title": "Act 1",
            "authority": "Gov",
            "jurisdiction": "india"
        }
    }]
    
    context = build_context_string(results)
    assert "[Source 1: Act 1 | Gov | india]" in context
    assert "This is a test document." in context
