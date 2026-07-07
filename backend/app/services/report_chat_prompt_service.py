import json
from typing import Any

MAX_CHAT_TOKENS = 700


def build_report_chat_payload(context: dict[str, Any], question: str, model: str) -> dict[str, Any]:
    """Build and return a Groq payload for grounded report chat."""
    return {
        "max_tokens": MAX_CHAT_TOKENS,
        "messages": [
            {"role": "system", "content": build_system_message()},
            {"role": "user", "content": build_user_message(context, question)},
        ],
        "model": model,
        "temperature": 0.1,
    }


def build_system_message() -> str:
    """Build and return the grounded report assistant system message."""
    return (
        "You are a senior data analyst embedded in an AI data analyst app. "
        "Answer only from the provided report context. If the answer is not in the "
        "context, say what is missing and suggest which chart or column to inspect. "
        "Do not invent values, columns, causes, or business facts. Keep answers "
        "specific, concise, and actionable. Use bullets only when they improve clarity."
    )


def build_user_message(context: dict[str, Any], question: str) -> str:
    """Build and return the grounded report chat user message."""
    schema_instruction = (
        "Answer the question using only this report context. Include the relevant "
        "metric, column, chart, or cleaning action when available."
    )
    return f"{schema_instruction}\n\nReport context:\n{json.dumps(context, default=str)}\n\nQuestion: {question}"
