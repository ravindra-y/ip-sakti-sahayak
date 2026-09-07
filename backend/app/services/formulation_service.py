from ..models.request_models import FormulationClassifyRequest
from ..models.response_models import FormulationClassifyResponse

def classify_formulation(request: FormulationClassifyRequest) -> FormulationClassifyResponse:
    if request.described_in_classical_text and request.preparation_described_in_text and not request.ingredients_modified and not request.preparation_modified and request.intended_use == "medicine":
        preliminary_classification = "ClassicalAyurvedicMedicine"
        explanation = "Matches criteria for a classical Ayurvedic medicine as per Schedule I of the Drugs and Cosmetics Act."
        possible_next_questions = [
            "Is the formula from a text listed in the First Schedule of the Drugs and Cosmetics Act?",
            "Are all ingredients from permitted lists?"
        ]
        relevant_regulatory_categories = [
            "Drugs and Cosmetics Act, 1940 – Schedule I",
            "Ayurvedic, Siddha and Unani Drugs Technical Advisory Board norms"
        ]
    elif request.described_in_classical_text and (request.ingredients_modified or request.preparation_modified) and request.intended_use == "medicine":
        preliminary_classification = "PatentOrProprietaryAyurvedicMedicine"
        explanation = "Modifications to a classical formula may place this in the Patent or Proprietary medicine category."
        possible_next_questions = [
            "What is the nature of modifications?",
            "Is a trademark or brand name involved?",
            "Have you consulted a licensed manufacturer?"
        ]
        relevant_regulatory_categories = [
            "Drugs and Cosmetics Act, 1940 – Patent or Proprietary Medicines",
            "AYUSH licensing norms"
        ]
    elif not request.described_in_classical_text and request.intended_use == "medicine":
        preliminary_classification = "NewOrNonClassicalProduct"
        explanation = "Not traceable to classical texts — may require clinical evidence and new drug approval process."
        possible_next_questions = [
            "Has clinical or pre-clinical data been generated?",
            "Is any of the base formula derived from a classical text?"
        ]
        relevant_regulatory_categories = [
            "New Drug approval under Drugs and Cosmetics Act",
            "CDSCO guidelines"
        ]
    elif request.intended_use == "nutraceutical":
        preliminary_classification = "AyurvedaAaharNutraceutical"
        explanation = "Nutraceutical / Aahar products fall under food safety regulation."
        possible_next_questions = [
            "Is any medicinal claim being made?",
            "Is FSSAI registration planned?"
        ]
        relevant_regulatory_categories = [
            "Food Safety and Standards Act, 2006",
            "FSSAI regulations",
            "AYUSH guidelines if medicinal claims are made"
        ]
    elif request.intended_use == "cosmetic":
        preliminary_classification = "Cosmetic"
        explanation = "Cosmetic products are regulated under the Drugs and Cosmetics Act cosmetic provisions."
        possible_next_questions = [
            "Are any therapeutic or medicinal claims made?",
            "Have import/export requirements been verified?"
        ]
        relevant_regulatory_categories = [
            "Drugs and Cosmetics Act, 1940 – cosmetics provisions",
            "Bureau of Indian Standards norms"
        ]
    else:
        preliminary_classification = "Uncertain"
        explanation = "Insufficient information to determine a preliminary classification."
        possible_next_questions = []
        relevant_regulatory_categories = []

    return FormulationClassifyResponse(
        preliminary_classification=preliminary_classification,
        explanation=explanation,
        possible_next_questions=possible_next_questions,
        relevant_regulatory_categories=relevant_regulatory_categories,
        disclaimer="This is preliminary guidance only and not a legal or regulatory determination. Consult a licensed regulatory consultant or the Ministry of AYUSH for authoritative guidance."
    )
