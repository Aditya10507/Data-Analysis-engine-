import json
from time import perf_counter
from typing import Any

import httpx
import structlog

from app.core.config import Settings, get_settings
from app.models.report_chat import ReportChatResult
from app.services.groq_client import GROQ_ENDPOINT, build_headers, extract_tokens_used, resolve_groq_api_key
from app.services.report_chat_context_service import build_report_chat_context

MAX_CHAT_TOKENS = 500
REQUEST_TIMEOUT_SECONDS = 30
REPORT_KEYWORDS = {
    "action", "anomalies", "anomaly",
    "chart", "column", "correlation", "dashboard", "data", "duplicate", "graph",
    "explain", "insight", "missing", "next", "null", "recommend", "report",
    "risk", "row", "trend", "value",
}
OFF_TOPIC_ANSWER = "I can only answer questions about the charts and report produced for this dataset."

logger = structlog.get_logger(__name__)


def answer_report_question(result_json: dict[str, Any], question: str) -> ReportChatResult:
    """Answer a report-related question and return an assistant result."""
    if not is_report_question(question):
        return ReportChatResult(answer=OFF_TOPIC_ANSWER)

    settings = get_settings()
    context = build_report_chat_context(result_json)
    try:
        answer = call_groq_report_chat(context, question, settings)
    except (httpx.HTTPError, ValueError) as error:
        logger.warning("report_chat_fallback_used", error=str(error))
        answer = build_fallback_report_answer(context, question)

    return ReportChatResult(answer=answer)


def is_report_question(question: str) -> bool:
    """Return whether a question is related to the produced report."""
    lowered_question = question.lower()
    return any(keyword in lowered_question for keyword in REPORT_KEYWORDS)


def call_groq_report_chat(context: dict[str, Any], question: str, settings: Settings) -> str:
    """Call Groq and return a report-grounded assistant answer."""
    start_time = perf_counter()
    try:
        response = httpx.post(
            GROQ_ENDPOINT,
            headers=build_headers(resolve_groq_api_key(settings)),
            json=build_payload(context, question, settings),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response_json = response.json()
        log_report_chat_call(response_json, start_time, True)
        return parse_chat_answer(response_json)
    except httpx.HTTPError:
        log_report_chat_call({}, start_time, False)
        raise


def build_payload(context: dict[str, Any], question: str, settings: Settings) -> dict[str, Any]:
    """Build and return a Groq report chat payload."""
    return {
        "max_tokens": MAX_CHAT_TOKENS,
        "messages": [
            {"role": "system", "content": build_system_message()},
            {"role": "user", "content": build_user_message(context, question)},
        ],
        "model": settings.groq_model,
        "temperature": 0.1,
    }


def build_system_message() -> str:
    """Build and return the report assistant system message."""
    return (
        "You answer only questions about the provided data analysis report, charts, "
        "columns, data quality, and generated insights. If unrelated, refuse briefly."
    )


def build_user_message(context: dict[str, Any], question: str) -> str:
    """Build and return the report assistant user message."""
    return f"Report JSON:\n{json.dumps(context, default=str)}\n\nQuestion: {question}"


def parse_chat_answer(response_json: dict[str, Any]) -> str:
    """Parse and return the assistant answer text."""
    return str(response_json["choices"][0]["message"]["content"]).strip()


def build_fallback_report_answer(context: dict[str, Any], question: str) -> str:
    """Build and return a report-grounded fallback answer."""
    lowered_question = question.lower()
    shape = context.get("shape", [0, 0])
    if "correlation" in lowered_question:
        return build_correlation_fallback(context, shape)

    if "missing" in lowered_question or "null" in lowered_question:
        return build_missing_fallback(context, shape)

    if "trend" in lowered_question:
        return build_trend_fallback(context, shape)

    return build_general_fallback(context, shape)


def build_correlation_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a correlation chart fallback answer."""
    columns = context.get("charts", {}).get("histogram_columns", [])
    return (
        f"This correlation view compares numeric relationships across {shape[1]} columns. "
        f"Start with the strongest red or blue cells, then validate whether those fields are business-related. "
        f"Numeric columns detected include: {', '.join(columns[:6]) or 'not available'}."
    )


def build_missing_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a missing-values fallback answer."""
    null_percent = context.get("stats", {}).get("null_percent")
    return (
        f"The missing-values chart helps judge data reliability across {shape[0]} rows. "
        f"Overall null percentage is {null_percent if null_percent is not None else 'not available'}. "
        "Prioritize columns with the tallest bars before trusting KPIs or AI insights."
    )


def build_trend_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a trend chart fallback answer."""
    return (
        f"The trend chart shows numeric movement across the row order for {shape[0]} records. "
        "Look for sudden jumps, flatlines, and repeated spikes because they often signal outliers, grouped records, or data-entry issues."
    )


def build_general_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a general report fallback answer."""
    insights = context.get("insights", [])
    headline = insights[0].get("headline") if insights and isinstance(insights[0], dict) else None
    return (
        f"This report contains {shape[0]} rows and {shape[1]} columns. "
        f"{'Top insight: ' + headline + '. ' if headline else ''}"
        "Groq is temporarily unavailable, so this answer is generated from the saved report summary."
    )


def log_report_chat_call(response_json: dict[str, Any], start_time: float, is_success: bool) -> None:
    """Log a report chat Groq API call and return no content."""
    logger.info(
        "groq_report_chat_call",
        latency_ms=round((perf_counter() - start_time) * 1000, 3),
        success=is_success,
        tokens_used=extract_tokens_used(response_json),
    )
