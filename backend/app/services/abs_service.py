from ..models.request_models import ABSCheckRequest
from ..models.response_models import ABSCheckResponse

def check_abs(request: ABSCheckRequest) -> ABSCheckResponse:
    compliance_areas = []
    questions_requiring_verification = [
        "Has prior informed consent been obtained from knowledge holders or communities?",
        "Is the resource listed in the People's Biodiversity Register?",
        "Have you identified all jurisdictions applicable to your supply chain?"
    ]
    relevant_sources = [
        "Biological Diversity Act, 2002",
        "Biological Diversity Rules, 2004",
        "National Biodiversity Authority (nba.nic.in)",
        "Nagoya Protocol (CBD)",
        "Patents Act, 1970 — Section 10(4)"
    ]
    human_escalation_recommended = False
    escalation_reason = None

    if request.biological_resource_involved:
        compliance_areas.append("Biological Diversity Act, 2002 — access to biological resources may require prior approval from National Biodiversity Authority (NBA).")
        compliance_areas.append("Biodiversity Management Committees (BMCs) may need to be consulted if resource is sourced locally.")

    foreign_hints = ["foreign", "outside", "international", "abroad"]
    is_foreign_origin = request.resource_origin and any(h in request.resource_origin.lower() for h in foreign_hints)
    if is_foreign_origin or request.organization_type == "foreign_entity":
        compliance_areas.append("Nagoya Protocol — if the resource originates from a Party country, ABS obligations under the Nagoya Protocol may apply.")
        compliance_areas.append("Prior Informed Consent (PIC) and Mutually Agreed Terms (MAT) may be required from the country of origin.")

    if request.ip_being_sought:
        compliance_areas.append("Any IP application should disclose the source of biological material and any traditional knowledge used (Section 10(4) of the Patents Act, 1970, as amended).")
        compliance_areas.append("Non-disclosure of biological material source may be a ground for patent revocation.")

    if request.intended_purpose == "commercial":
        compliance_areas.append("Benefit sharing with the local community / knowledge holder may be required under the Biological Diversity Act, 2002.")
        human_escalation_recommended = True
        escalation_reason = "Commercial purpose involving biological resources typically requires formal NBA approval and benefit-sharing agreement."

    if request.intended_purpose == "research":
        compliance_areas.append("Research use may still require NBA approval if the research is collaborative with a foreign institution or leads to commercial outcomes.")

    if request.organization_type == "foreign_entity":
        human_escalation_recommended = True
        escalation_reason = "Foreign entities accessing Indian biological resources or traditional knowledge face mandatory NBA prior approval requirements."

    return ABSCheckResponse(
        possible_compliance_areas=compliance_areas,
        questions_requiring_verification=questions_requiring_verification,
        relevant_sources=relevant_sources,
        human_escalation_recommended=human_escalation_recommended,
        escalation_reason=escalation_reason,
        disclaimer="This is preliminary guidance only and not a statement of definitive legal obligations. Consult the National Biodiversity Authority and a qualified legal professional before proceeding."
    )
