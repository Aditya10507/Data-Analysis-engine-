from time import perf_counter
from typing import Any

import httpx
import structlog

from app.core.config import Settings, get_settings
from app.models.report_chat import ReportChatResult
from app.services.groq_client import GROQ_ENDPOINT, build_headers, extract_tokens_used, resolve_groq_api_key
from app.services.report_chat_context_service import build_report_chat_context
from app.services.report_chat_fallback_service import build_fallback_report_answer
from app.services.report_chat_guard_service import OFF_TOPIC_ANSWER, is_report_question
from app.services.report_chat_prompt_service import build_report_chat_payload

REQUEST_TIMEOUT_SECONDS = 30

logger = structlog.get_logger(__name__)


def answer_report_question(result_json: dict[str, Any], question: str) -> ReportChatResult:
    """Answer a report-related question and return an assistant result."""
    if not is_report_question(question):
        return ReportChatResult(answer=OFF_TOPIC_ANSWER, source="guardrail")

    context = build_report_chat_context(result_json)
    try:
        answer = call_groq_report_chat(context, question, get_settings())
        return ReportChatResult(answer=answer, source="groq")
    except (httpx.HTTPError, ValueError) as error:
        logger.warning("report_chat_fallback_used", error=str(error))
        return ReportChatResult(answer=build_fallback_report_answer(context, question), source="report")


def call_groq_report_chat(context: dict[str, Any], question: str, settings: Settings) -> str:
    """Call Groq and return a report-grounded assistant answer."""
    start_time = perf_counter()
    try:
        response = httpx.post(
            GROQ_ENDPOINT,
            headers=build_headers(resolve_groq_api_key(settings)),
            json=build_report_chat_payload(context, question, settings.groq_model),
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response_json = response.json()
        log_report_chat_call(response_json, start_time, True)
        return parse_chat_answer(response_json)
    except httpx.HTTPError:
        log_report_chat_call({}, start_time, False)
        raise


def parse_chat_answer(response_json: dict[str, Any]) -> str:
    """Parse and return the assistant answer text."""
    return str(response_json["choices"][0]["message"]["content"]).strip()


def log_report_chat_call(response_json: dict[str, Any], start_time: float, is_success: bool) -> None:
    """Log a report chat Groq API call and return no content."""
    logger.info(
        "groq_report_chat_call",
        latency_ms=round((perf_counter() - start_time) * 1000, 3),
        success=is_success,
        tokens_used=extract_tokens_used(response_json),
    )
