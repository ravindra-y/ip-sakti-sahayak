def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "IP-SAKTI Sahayak"

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_chat_requires_question(client):
    response = client.post("/api/chat", json={"jurisdiction": "india"})
    assert response.status_code == 422 # Pydantic validation error

def test_chat_india_jurisdiction(client):
    response = client.post("/api/chat", json={
        "question": "What is patentable in India?",
        "jurisdiction": "india"
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert data["jurisdiction"] == "india"
    assert not data["abstained"]

def test_chat_international_jurisdiction(client):
    response = client.post("/api/chat", json={
        "question": "What is PCT?",
        "jurisdiction": "international"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["jurisdiction"] == "international"
    assert not data["abstained"]

def test_formulation_classify(client):
    response = client.post("/api/formulation/classify", json={
        "described_in_classical_text": True,
        "preparation_described_in_text": True,
        "ingredients_modified": False,
        "preparation_modified": False,
        "intended_use": "medicine"
    })
    assert response.status_code == 200
    assert response.json()["preliminary_classification"] == "ClassicalAyurvedicMedicine"

def test_abs_check(client):
    response = client.post("/api/abs/check", json={
        "biological_resource_involved": True,
        "resource_origin": "India",
        "ip_being_sought": True,
        "intended_purpose": "commercial",
        "organization_type": "indian_company"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["possible_compliance_areas"]) > 0
    assert data["human_escalation_recommended"] == True
