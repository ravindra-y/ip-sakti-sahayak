from fastapi import APIRouter
from ..models.request_models import ABSCheckRequest
from ..models.response_models import ABSCheckResponse
from ..services.abs_service import check_abs

router = APIRouter()

@router.post("/check", response_model=ABSCheckResponse)
def check_abs_endpoint(request: ABSCheckRequest):
    return check_abs(request)
