from app.services.abstention import should_abstain, get_abstention_response

def test_abstain_when_no_results():
    abstained, reason = should_abstain([], 0.0, 0.35)
    assert abstained is True
    assert "No relevant documents" in reason

def test_abstain_when_low_confidence():
    results = [{"id": "1", "distance": 0.9}]
    abstained, reason = should_abstain(results, 0.2, 0.35)
    assert abstained is True
    assert "below threshold" in reason

def test_no_abstain_when_confidence_sufficient():
    results = [{"id": "1", "distance": 0.2}]
    abstained, reason = should_abstain(results, 0.8, 0.35)
    assert abstained is False
    assert reason is None

def test_abstention_message_format():
    msg = get_abstention_response()
    assert "sufficient authoritative information" in msg
