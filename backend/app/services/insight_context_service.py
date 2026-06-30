from typing import Any

from app.models.insight import InsightContext


def build_insight_context(stats: dict[str, Any], cleaning_report: dict[str, Any]) -> InsightContext:
    """Build and return validated context for Grok insight generation."""
    columns = [
        build_column_context(column_name, column_stats)
        for column_name, column_stats in stats.get("columns", {}).items()
    ]
    return InsightContext(
        cleaning_report=cleaning_report,
        column_stats=stats.get("columns", {}),
        columns=columns,
        shape=build_shape(stats),
    )


def build_column_context(column_name: str, column_stats: dict[str, Any]) -> dict[str, Any]:
    """Build and return one column context entry."""
    return {
        "dtype": column_stats.get("dtype"),
        "name": column_name,
        "semantic_type": column_stats.get("semantic_type"),
    }


def build_shape(stats: dict[str, Any]) -> dict[str, int]:
    """Build and return dataset shape context."""
    return {
        "columns": int(stats.get("column_count", 0)),
        "rows": int(stats.get("row_count", 0)),
    }
