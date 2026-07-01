from typing import Any

MAX_COLUMNS = 12
MAX_INSIGHTS = 5
MAX_CLEANING_ACTIONS = 8


def build_report_chat_context(result_json: dict[str, Any]) -> dict[str, Any]:
    """Build and return a compact report context for LLM chat."""
    return {
        "charts": summarize_charts(result_json.get("charts", {})),
        "cleaning_report": result_json.get("cleaning_report", [])[:MAX_CLEANING_ACTIONS],
        "columns": summarize_columns(result_json.get("column_meta", {})),
        "filename": result_json.get("filename"),
        "insights": result_json.get("insights", [])[:MAX_INSIGHTS],
        "shape": result_json.get("shape", [0, 0]),
        "stats": summarize_stats(result_json.get("stats", {})),
    }


def summarize_columns(column_meta: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return report column metadata."""
    return dict(list(column_meta.items())[:MAX_COLUMNS])


def summarize_stats(stats: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return report statistics."""
    columns = stats.get("columns", {})
    return {
        "columns": dict(list(columns.items())[:MAX_COLUMNS]),
        "correlation": stats.get("correlation", {}),
        "duplicate_row_percent": stats.get("duplicate_row_percent"),
        "null_percent": stats.get("null_percent"),
    }


def summarize_charts(charts: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return chart availability metadata."""
    histograms = charts.get("histograms", {})
    return {
        "correlation_heatmap": bool(charts.get("correlation_heatmap")),
        "histogram_columns": list(histograms.keys())[:MAX_COLUMNS],
    }
