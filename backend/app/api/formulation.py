from fastapi import APIRouter
from ..models.request_models import FormulationClassifyRequest
from ..models.response_models import FormulationClassifyResponse
from ..services.formulation_service import classify_formulation

router = APIRouter()

@router.post("/classify", response_model=FormulationClassifyResponse)
def classify(request: FormulationClassifyRequest):
    return classify_formulation(request)
