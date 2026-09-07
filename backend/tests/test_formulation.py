from app.services.formulation_service import classify_formulation
from app.models.request_models import FormulationClassifyRequest

def test_classical_classification():
    req = FormulationClassifyRequest(
        described_in_classical_text=True,
        preparation_described_in_text=True,
        ingredients_modified=False,
        preparation_modified=False,
        intended_use="medicine"
    )
    res = classify_formulation(req)
    assert res.preliminary_classification == "ClassicalAyurvedicMedicine"
    assert "preliminary guidance" in res.disclaimer

def test_proprietary_classification():
    req = FormulationClassifyRequest(
        described_in_classical_text=True,
        preparation_described_in_text=True,
        ingredients_modified=True,
        preparation_modified=False,
        intended_use="medicine"
    )
    res = classify_formulation(req)
    assert res.preliminary_classification == "PatentOrProprietaryAyurvedicMedicine"

def test_nutraceutical_classification():
    req = FormulationClassifyRequest(
        described_in_classical_text=False,
        preparation_described_in_text=False,
        ingredients_modified=False,
        preparation_modified=False,
        intended_use="nutraceutical"
    )
    res = classify_formulation(req)
    assert res.preliminary_classification == "AyurvedaAaharNutraceutical"

def test_cosmetic_classification():
    req = FormulationClassifyRequest(
        described_in_classical_text=False,
        preparation_described_in_text=False,
        ingredients_modified=False,
        preparation_modified=False,
        intended_use="cosmetic"
    )
    res = classify_formulation(req)
    assert res.preliminary_classification == "Cosmetic"

def test_new_product_classification():
    req = FormulationClassifyRequest(
        described_in_classical_text=False,
        preparation_described_in_text=False,
        ingredients_modified=False,
        preparation_modified=False,
        intended_use="medicine"
    )
    res = classify_formulation(req)
    assert res.preliminary_classification == "NewOrNonClassicalProduct"

def test_disclaimer_always_present():
    req = FormulationClassifyRequest(
        described_in_classical_text=False,
        preparation_described_in_text=False,
        ingredients_modified=False,
        preparation_modified=False,
        intended_use="other"
    )
    res = classify_formulation(req)
    assert len(res.disclaimer) > 0
