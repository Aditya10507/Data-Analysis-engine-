import json
from json import JSONDecodeError
from time import perf_counter
from typing import Any

import httpx
from pydantic import ValidationError
import structlog

from app.core.config import Settings, get_settings
from app.models.insight import Insight

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"
REQUEST_TIMEOUT_SECONDS = 30
REQUIRED_INSIGHT_COUNT = 5
MAX_OUTPUT_TOKENS = 1200

logger = structlog.get_logger(__name__)


def call_groq_insights(prompt: str, system_message: str) -> list[Insight]:
    """Call GroqCloud and return parsed business insights."""
    settings = get_settings()
    start_time = perf_counter()
    try:
        response = httpx.post(
            GROQ_ENDPOINT,
            headers=build_headers(resolve_groq_api_key(settings)),
            json=build_payload(prompt, system_message, settings),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response_json = response.json()
        log_groq_call(response_json, start_time, True)
        return parse_groq_response(response_json)
    except httpx.HTTPError as error:
        log_groq_call({}, start_time, False)
        raise error


def resolve_groq_api_key(settings: Settings) -> str:
    """Resolve and return the configured Groq API key."""
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY is missing.")

    return settings.groq_api_key


def build_headers(api_key: str) -> dict[str, str]:
    """Build and return Groq request headers."""
    return {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}


def build_payload(prompt: str, system_message: str, settings: Settings) -> dict[str, Any]:
    """Build and return the Groq chat completion payload."""
    return {
        "max_tokens": MAX_OUTPUT_TOKENS,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt},
        ],
        "model": settings.groq_model,
        "temperature": 0.2,
    }


def parse_groq_response(response_json: dict[str, Any]) -> list[Insight]:
    """Parse and return insights from a Groq response."""
    try:
        content = response_json["choices"][0]["message"]["content"]
        parsed_content = json.loads(extract_json_array(content))
        insights = [Insight.model_validate(item) for item in parsed_content]
        return validate_insight_count(insights)
    except (KeyError, IndexError, TypeError, JSONDecodeError, ValidationError) as error:
        raise ValueError("Groq response could not be parsed as insights.") from error


def extract_json_array(content: str) -> str:
    """Extract and return the JSON array from model text."""
    start_index = content.find("[")
    end_index = content.rfind("]")

    if start_index < 0 or end_index < start_index:
        raise ValueError("Groq response did not include a JSON array.")

    return content[start_index:end_index + 1]


def validate_insight_count(insights: list[Insight]) -> list[Insight]:
    """Validate and return exactly five insights."""
    if len(insights) != REQUIRED_INSIGHT_COUNT:
        raise ValueError("Groq response did not include exactly five insights.")

    return insights


def log_groq_call(response_json: dict[str, Any], start_time: float, is_success: bool) -> None:
    """Log a Groq API call outcome and return no content."""
    logger.info(
        "groq_api_call",
        latency_ms=round((perf_counter() - start_time) * 1000, 3),
        success=is_success,
        tokens_used=extract_tokens_used(response_json),
    )


def extract_tokens_used(response_json: dict[str, Any]) -> int:
    """Extract and return Groq token usage from a response."""
    usage = response_json.get("usage", {})
    return int(usage.get("total_tokens", 0))
