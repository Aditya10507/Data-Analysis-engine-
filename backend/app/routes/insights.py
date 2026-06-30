import logging
from uuid import uuid4

import httpx
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import ValidationError
from starlette.responses import StreamingResponse

from app.models.api import ApiEnvelope
from app.models.insight import InsightContext, InsightListResult
from app.models.route_status import RouteStatus
from app.services.cache_key_service import hash_prompt
from app.services.insight_prompt_service import build_insight_prompt
from app.services.insight_service import generate_insights, stream_tracked_insights
from app.services.redis_cache_service import get_cached_insights, set_cached_insights
from app.services.route_status_service import build_route_status

logger = logging.getLogger(__name__)

ROUTE_NAME = "insights"

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get(
    "",
    response_model=ApiEnvelope[RouteStatus],
    description="Return readiness status for the insights API stub.",
)
async def get_insights_status() -> ApiEnvelope[RouteStatus]:
    """Return the insights API stub status envelope."""
    try:
        return ApiEnvelope(success=True, data=build_route_status(ROUTE_NAME), error=None)
    except ValidationError as error:
        logger.exception("Insights route status validation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Insights route status validation failed.",
        ) from error


@router.get(
    "/stream",
    description="Stream regenerated AI business insights as server-sent events.",
)
async def stream_ai_insights(
    job_id: str | None = Query(default=None),
) -> StreamingResponse:
    """Stream AI insight events as an SSE response."""
    try:
        connection_id = str(uuid4())
        stream = stream_tracked_insights(connection_id, job_id=job_id)
        return StreamingResponse(stream, media_type="text/event-stream")
    except RuntimeError as error:
        logger.exception("Insight streaming failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Insight streaming failed.",
        ) from error


@router.post(
    "/generate",
    response_model=ApiEnvelope[InsightListResult],
    description="Generate AI business insights from dataset stats and cleaning report.",
)
async def generate_ai_insights(context: InsightContext) -> ApiEnvelope[InsightListResult]:
    """Generate and return AI business insights."""
    try:
        cached_insights = await fetch_cached_insights(context)
        if cached_insights:
            return ApiEnvelope(success=True, data=cached_insights, error=None)

        insights = generate_insights(context)
        await cache_generated_insights(context, insights)
        return ApiEnvelope(success=True, data=insights, error=None)
    except (httpx.HTTPError, ValueError, ValidationError) as error:
        logger.exception("Insight generation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Insight generation failed.",
        ) from error


async def fetch_cached_insights(context: InsightContext) -> InsightListResult | None:
    """Fetch and return cached insights for a job prompt."""
    try:
        if not context.job_id:
            return None

        prompt_hash = hash_prompt(build_insight_prompt(context))
        cached_value = await get_cached_insights(context.job_id, prompt_hash)
        return InsightListResult.model_validate(cached_value) if cached_value else None
    except ValidationError:
        logger.exception("Cached insight validation failed.")
        return None


async def cache_generated_insights(
    context: InsightContext,
    insights: InsightListResult,
) -> None:
    """Cache generated insights for a job prompt and return no content."""
    if context.job_id:
        prompt_hash = hash_prompt(build_insight_prompt(context))
        await set_cached_insights(context.job_id, prompt_hash, insights.model_dump())
