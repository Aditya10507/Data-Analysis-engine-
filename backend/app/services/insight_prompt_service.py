import json

from app.models.insight import InsightContext

MAX_PROMPT_CHARS = 12000


def build_system_message() -> str:
    """Build and return the Grok analyst role message."""
    return (
        "You are a senior data analyst advising business operators. "
        "Find specific, actionable insights grounded in the supplied stats. "
        "Chain-of-thought instruction: think step by step privately before "
        "responding, but return only JSON and never include reasoning traces."
    )


def build_insight_prompt(context: InsightContext) -> str:
    """Build and return the Grok business insight prompt."""
    payload = build_profile_payload(context)
    prompt = "\n\n".join(
        [
            build_task_instruction(),
            build_json_schema_instruction(),
            build_few_shot_example(),
            f"Dataset profile JSON:\n{json.dumps(payload, default=str)}",
        ]
    )
    return trim_prompt(prompt)


def build_profile_payload(context: InsightContext) -> dict:
    """Build and return dataset profile payload for prompting."""
    return {
        "cleaning_report": context.cleaning_report,
        "columns": context.columns,
        "dataset_shape": context.shape,
        "top_stats_per_column": context.column_stats,
    }


def build_task_instruction() -> str:
    """Build and return the insight generation task instruction."""
    return (
        "Return exactly 5 business insights. Each body must mention concrete "
        "columns, observed values, percentages, or counts when available, plus "
        "a next action. Flag nulls, duplicates, outliers, or parsing issues as "
        "type warning. Avoid generic dashboard commentary."
    )


def build_json_schema_instruction() -> str:
    """Build and return the required JSON schema instruction."""
    return (
        "JSON schema: output must be a JSON array only, matching this schema: "
        '[{"headline": "string", "body": "2-3 sentence string", '
        '"type": "trend|warning|info"}].'
    )


def build_few_shot_example() -> str:
    """Build and return one example of a strong insight."""
    return (
        "Example insight: [{\"headline\":\"West region discount drag\","
        "\"body\":\"West has the highest average discount at 18% while revenue "
        "trails the dataset mean by 11%. Review discount approvals for West "
        "enterprise deals before the next sales cycle.\",\"type\":\"warning\"}]"
    )


def trim_prompt(prompt: str) -> str:
    """Trim and return the prompt within the configured size limit."""
    return prompt[:MAX_PROMPT_CHARS]


def build_empty_context() -> InsightContext:
    """Build and return a minimal insight context."""
    return InsightContext(
        cleaning_report={},
        column_stats={},
        columns=[],
        shape={"columns": 0, "rows": 0},
    )
