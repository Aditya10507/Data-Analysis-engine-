import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError

from app.models.api import ApiEnvelope
from app.models.route_status import RouteStatus
from app.services.route_status_service import build_route_status

logger = logging.getLogger(__name__)

ROUTE_NAME = "analysis"

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.get(
    "",
    response_model=ApiEnvelope[RouteStatus],
    description="Return readiness status for the analysis API stub.",
)
async def get_analysis_status() -> ApiEnvelope[RouteStatus]:
    """Return the analysis API stub status envelope."""
    try:
        return ApiEnvelope(success=True, data=build_route_status(ROUTE_NAME), error=None)
    except ValidationError as error:
        logger.exception("Analysis route status validation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis route status validation failed.",
        ) from error
