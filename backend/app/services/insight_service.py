import asyncio
import logging
from collections.abc import AsyncIterator

import httpx
from pydantic import ValidationError

from app.models.insight import Insight, InsightContext, InsightListResult, InsightStreamEvent
from app.services.groq_client import call_groq_insights
from app.services.insight_prompt_service import (
    build_empty_context,
    build_insight_prompt,
    build_system_message,
)
from app.services.redis_cache_service import set_sse_state

STREAM_DELAY_SECONDS = 0.05
CHUNK_SIZE = 18

logger = logging.getLogger(__name__)


def generate_insights(context: InsightContext) -> InsightListResult:
    """Generate and return Groq business insights."""
    try:
        prompt = build_insight_prompt(context)
        insights = call_groq_insights(prompt, build_system_message())
        return InsightListResult(insights=insights)
    except (httpx.HTTPError, ValueError, ValidationError):
        logger.exception("Groq insight fallback was used.")
        return InsightListResult(insights=build_fallback_insights())


async def stream_insights(context: InsightContext | None = None) -> AsyncIterator[str]:
    """Stream and return Groq business insight events as SSE text."""
    try:
        insights = generate_insights(context or build_empty_context()).insights
    except (httpx.HTTPError, ValueError, ValidationError) as error:
        logger.exception("Groq insight streaming fallback was used.")
        insights = build_fallback_insights()

    for index, insight in enumerate(insights):
        insight_id = str(index)
        yield format_sse_event(build_start_event(insight_id, insight))

        for chunk in chunk_text(insight.body):
            await asyncio.sleep(STREAM_DELAY_SECONDS)
            yield format_sse_event(InsightStreamEvent(event="chunk", id=insight_id, body=chunk))

        yield format_sse_event(InsightStreamEvent(event="end", id=insight_id))

    yield format_sse_event(InsightStreamEvent(event="done"))


async def stream_tracked_insights(
    connection_id: str,
    job_id: str | None,
) -> AsyncIterator[str]:
    """Track SSE connection state and return streamed insight events."""
    try:
        await set_sse_state(connection_id, build_sse_state(connection_id, job_id, "connected"))
        async for event in stream_insights():
            await set_sse_state(connection_id, build_sse_state(connection_id, job_id, "streaming"))
            yield event

        await set_sse_state(connection_id, build_sse_state(connection_id, job_id, "done"))
    except Exception as error:
        logger.exception("Tracked insight stream failed.")
        await set_sse_state(connection_id, build_sse_state(connection_id, job_id, "failed"))
        raise error


def build_sse_state(connection_id: str, job_id: str | None, state: str) -> dict[str, str | None]:
    """Build and return SSE connection state data."""
    return {"connection_id": connection_id, "job_id": job_id, "state": state}


def build_fallback_insights() -> list[Insight]:
    """Build and return fallback insights when Groq is unavailable."""
    return [
        Insight(
            type="trend",
            headline="Profile is ready",
            body="The dataset profile is ready for review. Use the generated stats to identify growth patterns and operational shifts.",
        ),
        Insight(
            type="warning",
            headline="Data quality matters",
            body="Nulls, duplicates, and outliers can skew decisions. Review the cleaning report before acting on any trend.",
        ),
        Insight(
            type="info",
            headline="More context will sharpen insights",
            body="Business-specific columns and cleaning results help the model produce better recommendations. Regenerate insights after processing completes.",
        ),
        Insight(
            type="warning",
            headline="AI insight service needs attention",
            body="The analysis completed, but Groq did not return live insights. Check the Groq API key, model access, and account limits before relying on generated recommendations.",
        ),
        Insight(
            type="info",
            headline="Charts are still usable",
            body="The dashboard charts and KPI cards are generated locally from the uploaded file. Use those outputs while the AI provider issue is resolved.",
        ),
    ]


def format_sse_event(event: InsightStreamEvent) -> str:
    """Serialize and return one SSE event payload."""
    return f"data: {event.model_dump_json()}\n\n"


def build_start_event(insight_id: str, insight: Insight) -> InsightStreamEvent:
    """Build and return the start event for an insight."""
    return InsightStreamEvent(
        event="start",
        headline=insight.headline,
        id=insight_id,
        kind=insight.type,
    )


def chunk_text(text: str) -> list[str]:
    """Split and return text chunks for streaming."""
    return [text[index:index + CHUNK_SIZE] for index in range(0, len(text), CHUNK_SIZE)]
