import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError

from app.models.api import ApiEnvelope
from app.models.health import HealthStatus
from app.services.health_service import fetch_health_status

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=ApiEnvelope[HealthStatus],
    description="Return backend API health status for the frontend.",
)
async def get_health_status() -> ApiEnvelope[HealthStatus]:
    """Return the backend API health status envelope."""
    try:
        health_status = fetch_health_status()
        return ApiEnvelope(success=True, data=health_status, error=None)
    except ValidationError as error:
        logger.exception("Health status validation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Health status validation failed.",
        ) from error
