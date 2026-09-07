from app.services.query_router import route_query

def test_patent_routing():
    assert route_query("Can I patent my Ayurvedic formula?") == "PATENT"

def test_trademark_routing():
    assert route_query("How do I register a trademark for my brand?") == "TRADEMARK"

def test_gi_routing():
    assert route_query("What is a geographical indication tag?") == "GEOGRAPHICAL_INDICATION"

def test_traditional_knowledge_routing():
    assert route_query("TKDL prior art search") == "TRADITIONAL_KNOWLEDGE"

def test_abs_routing():
    assert route_query("Access and benefit sharing requirements") == "ABS"

def test_formulation_routing():
    assert route_query("classical formulation classification") == "FORMULATION"

def test_general_fallback():
    assert route_query("Hello, how are you?") == "GENERAL"
