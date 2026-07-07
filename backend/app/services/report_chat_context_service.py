from typing import Any

MAX_COLUMNS = 12
MAX_INSIGHTS = 5
MAX_CLEANING_ACTIONS = 8
MAX_RANKED_ITEMS = 6


def build_report_chat_context(result_json: dict[str, Any]) -> dict[str, Any]:
    """Build and return a compact report context for LLM chat."""
    return {
        "charts": summarize_charts(result_json.get("charts", {})),
        "cleaning_report": result_json.get("cleaning_report", [])[:MAX_CLEANING_ACTIONS],
        "columns": summarize_columns(result_json.get("column_meta", {})),
        "data_quality": result_json.get("data_quality", {}),
        "filename": result_json.get("filename"),
        "insights": result_json.get("insights", [])[:MAX_INSIGHTS],
        "shape": result_json.get("shape", [0, 0]),
        "strongest_correlations": summarize_correlations(result_json.get("stats", {})),
        "stats": summarize_stats(result_json.get("stats", {})),
        "top_missing_columns": summarize_missing_columns(result_json.get("cleaning_report", [])),
    }


def summarize_columns(column_meta: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return report column metadata."""
    return dict(list(column_meta.items())[:MAX_COLUMNS])


def summarize_stats(stats: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return report statistics."""
    columns = stats.get("columns", {})
    return {
        "columns": summarize_column_stats(columns),
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


def summarize_column_stats(columns: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return useful per-column stats."""
    return {name: summarize_one_column_stats(stats) for name, stats in list(columns.items())[:MAX_COLUMNS]}


def summarize_one_column_stats(stats: dict[str, Any]) -> dict[str, Any]:
    """Summarize and return one column's report stats."""
    return {
        "dtype": stats.get("dtype"),
        "mean": stats.get("mean"),
        "null_count": stats.get("null_count"),
        "null_percent": stats.get("null_percent"),
        "semantic_type": stats.get("semantic_type"),
        "top_values": stats.get("top_values"),
        "unique_count": stats.get("unique_count"),
    }


def summarize_correlations(stats: dict[str, Any]) -> list[dict[str, Any]]:
    """Summarize and return strongest non-self correlations."""
    correlations = stats.get("correlation", {})
    pairs = build_correlation_pairs(correlations)
    return sorted(pairs, key=lambda item: abs(float(item["value"])), reverse=True)[:MAX_RANKED_ITEMS]


def build_correlation_pairs(correlations: dict[str, Any]) -> list[dict[str, Any]]:
    """Build and return unique correlation pairs."""
    pairs: list[dict[str, Any]] = []
    seen_pairs: set[tuple[str, str]] = set()
    for x_column, row in correlations.items():
        if isinstance(row, dict):
            pairs.extend(build_row_pairs(x_column, row, seen_pairs))
    return pairs


def build_row_pairs(x_column: str, row: dict[str, Any], seen_pairs: set[tuple[str, str]]) -> list[dict[str, Any]]:
    """Build and return correlation pairs for one row."""
    pairs = []
    for y_column, value in row.items():
        pair_key = tuple(sorted([x_column, y_column]))
        if x_column != y_column and pair_key not in seen_pairs and isinstance(value, int | float):
            seen_pairs.add(pair_key)
            pairs.append({"value": round(float(value), 4), "x_column": x_column, "y_column": y_column})
    return pairs


def summarize_missing_columns(cleaning_report: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Summarize and return columns affected by null filling."""
    fill_actions = [action for action in cleaning_report if action.get("action") == "fill_nulls"]
    return sorted(fill_actions, key=lambda item: int(item.get("row_count", 0)), reverse=True)[:MAX_RANKED_ITEMS]
