from typing import Any


def build_fallback_report_answer(context: dict[str, Any], question: str) -> str:
    """Build and return a report-grounded fallback answer."""
    lowered_question = question.lower()
    shape = context.get("shape", [0, 0])
    if "correlation" in lowered_question or "affect" in lowered_question:
        return build_correlation_fallback(context, shape)

    if "missing" in lowered_question or "null" in lowered_question:
        return build_missing_fallback(context, shape)

    if "quality" in lowered_question or "clean" in lowered_question:
        return build_quality_fallback(context, shape)

    if "trend" in lowered_question or "chart" in lowered_question:
        return build_trend_fallback(context, shape)

    return build_general_fallback(context, shape)


def build_correlation_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a correlation-focused fallback answer."""
    strongest_pairs = context.get("strongest_correlations", [])
    if not strongest_pairs:
        return f"I do not see enough numeric correlation data in this {shape[0]} row report to name a strongest driver."

    pair = strongest_pairs[0]
    return (
        f"The strongest visible relationship is {pair.get('x_column')} with {pair.get('y_column')} "
        f"at correlation {pair.get('value')}. Treat this as a relationship to investigate, not proof of causation."
    )


def build_missing_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a missing-values fallback answer."""
    top_missing = context.get("top_missing_columns", [])
    null_percent = context.get("stats", {}).get("null_percent")
    if top_missing:
        column = top_missing[0]
        return (
            f"Nulls are concentrated most in {column.get('column')}, with {column.get('row_count')} affected rows. "
            f"Overall missingness is {null_percent}. Review that column before trusting related charts."
        )

    return f"This report has {null_percent} overall missing values across {shape[0]} rows."


def build_quality_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a data-quality fallback answer."""
    actions = context.get("cleaning_report", [])
    action_names = [item.get("action") for item in actions if isinstance(item, dict)]
    return (
        f"The report covers {shape[0]} rows and {shape[1]} columns. "
        f"Cleaning actions recorded: {', '.join(action_names[:5]) or 'none found'}."
    )


def build_trend_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a trend/chart fallback answer."""
    columns = context.get("charts", {}).get("histogram_columns", [])
    return (
        f"The charts summarize {shape[0]} records. Start with {', '.join(columns[:4]) or 'the numeric columns'} "
        "and look for spikes, skew, or unusual gaps before acting on the insight."
    )


def build_general_fallback(context: dict[str, Any], shape: Any) -> str:
    """Build and return a general report fallback answer."""
    insights = context.get("insights", [])
    headline = insights[0].get("headline") if insights and isinstance(insights[0], dict) else None
    return (
        f"This report contains {shape[0]} rows and {shape[1]} columns. "
        f"{'Top insight: ' + headline + '. ' if headline else ''}"
        "Ask about a specific column, chart, nulls, correlations, or recommended action for a sharper answer."
    )
