from app.services.abs_service import check_abs
from app.models.request_models import ABSCheckRequest

def test_abs_biological_resource_triggers_compliance():
    req = ABSCheckRequest(
        biological_resource_involved=True,
        ip_being_sought=False,
        intended_purpose="research",
        organization_type="individual"
    )
    res = check_abs(req)
    assert any("Biological Diversity Act" in area for area in res.possible_compliance_areas)

def test_abs_foreign_entity_triggers_nagoya():
    req = ABSCheckRequest(
        biological_resource_involved=True,
        ip_being_sought=False,
        intended_purpose="research",
        organization_type="foreign_entity"
    )
    res = check_abs(req)
    assert any("Nagoya Protocol" in area for area in res.possible_compliance_areas)
    assert res.human_escalation_recommended is True

def test_abs_commercial_purpose_triggers_escalation():
    req = ABSCheckRequest(
        biological_resource_involved=True,
        ip_being_sought=False,
        intended_purpose="commercial",
        organization_type="indian_company"
    )
    res = check_abs(req)
    assert res.human_escalation_recommended is True

def test_abs_ip_sought_triggers_disclosure_requirement():
    req = ABSCheckRequest(
        biological_resource_involved=True,
        ip_being_sought=True,
        intended_purpose="research",
        organization_type="indian_company"
    )
    res = check_abs(req)
    assert any("Section 10(4)" in area for area in res.possible_compliance_areas)

def test_abs_disclaimer_always_present():
    req = ABSCheckRequest(
        biological_resource_involved=False,
        ip_being_sought=False,
        intended_purpose="educational",
        organization_type="individual"
    )
    res = check_abs(req)
    assert len(res.disclaimer) > 0
