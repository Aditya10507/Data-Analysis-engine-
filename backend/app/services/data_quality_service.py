from typing import Any

PERCENT_MULTIPLIER = 100
MAX_SCORE = 100
NULL_PENALTY_WEIGHT = 0.45
DUPLICATE_PENALTY_WEIGHT = 0.35
OUTLIER_PENALTY_WEIGHT = 0.2
ISSUE_PENALTY = 3


def build_data_quality_score(stats: dict[str, Any], cleaning_report: dict[str, Any]) -> dict[str, Any]:
    """Calculate and return a data quality score with issue details."""
    rows = int(stats.get("row_count", 0))
    columns = stats.get("columns", {})
    actions = read_cleaning_actions(cleaning_report)
    null_percent = calculate_null_percent(columns, rows)
    duplicate_percent = calculate_action_percent(actions, "remove_duplicates", rows)
    outlier_percent = calculate_outlier_percent(actions, rows, count_numeric_columns(columns))
    issues = build_quality_issues(columns, actions, null_percent, duplicate_percent, outlier_percent)
    score = calculate_score(null_percent, duplicate_percent, outlier_percent, len(issues))
    return {
        "duplicate_percent": round(duplicate_percent, 2),
        "grade": build_grade(score),
        "issues": issues,
        "null_percent": round(null_percent, 2),
        "outlier_percent": round(outlier_percent, 2),
        "score": score,
    }


def read_cleaning_actions(cleaning_report: dict[str, Any]) -> list[dict[str, Any]]:
    """Read and return cleaning actions from the cleaning report."""
    actions = cleaning_report.get("actions", [])
    return actions if isinstance(actions, list) else []


def calculate_null_percent(columns: dict[str, Any], rows: int) -> float:
    """Calculate and return overall null percentage."""
    if not rows or not columns:
        return 0.0

    null_count = sum(int(column.get("null_count", 0)) for column in columns.values())
    return null_count / (rows * len(columns)) * PERCENT_MULTIPLIER


def calculate_action_percent(actions: list[dict[str, Any]], action_name: str, rows: int) -> float:
    """Calculate and return row percentage affected by one action."""
    if not rows:
        return 0.0

    row_count = sum(int(action.get("row_count", 0)) for action in actions if action.get("action") == action_name)
    return row_count / rows * PERCENT_MULTIPLIER


def calculate_outlier_percent(actions: list[dict[str, Any]], rows: int, numeric_columns: int) -> float:
    """Calculate and return numeric-cell percentage affected by outliers."""
    denominator = rows * numeric_columns
    if not denominator:
        return 0.0

    outlier_count = sum(int(action.get("row_count", 0)) for action in actions if action.get("action") == "clip_outliers")
    return outlier_count / denominator * PERCENT_MULTIPLIER


def count_numeric_columns(columns: dict[str, Any]) -> int:
    """Count and return numeric columns from analysis stats."""
    return sum(1 for column in columns.values() if column.get("numeric"))


def build_quality_issues(columns: dict[str, Any], actions: list[dict[str, Any]], null_percent: float, duplicate_percent: float, outlier_percent: float) -> list[dict[str, Any]]:
    """Build and return quality issue summaries."""
    issues = []
    append_metric_issue(issues, "Missing values", null_percent, "warning")
    append_metric_issue(issues, "Duplicate rows", duplicate_percent, "warning")
    append_metric_issue(issues, "Outliers clipped", outlier_percent, "info")
    issues.extend(build_column_issues(columns))
    issues.extend(build_date_parse_issues(actions))
    return issues[:8]


def append_metric_issue(issues: list[dict[str, Any]], label: str, percent: float, severity: str) -> None:
    """Append a metric issue when it is present and return no content."""
    if percent > 0:
        issues.append({"label": label, "severity": severity, "value": f"{percent:.1f}%"})


def build_column_issues(columns: dict[str, Any]) -> list[dict[str, Any]]:
    """Build and return suspicious column issue summaries."""
    issues = []
    for column_name, column in columns.items():
        if column.get("semantic_type") == "id" and int(column.get("null_count", 0)) > 0:
            issues.append({"label": f"{column_name} has missing IDs", "severity": "warning", "value": str(column.get("null_count"))})
    return issues


def build_date_parse_issues(actions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Build and return date parsing issue summaries."""
    return [
        {"label": f"{action.get('column')} parsed as date", "severity": "info", "value": str(action.get("row_count", 0))}
        for action in actions
        if action.get("action") == "parse_dates"
    ][:3]


def calculate_score(null_percent: float, duplicate_percent: float, outlier_percent: float, issue_count: int) -> int:
    """Calculate and return the final data quality score."""
    penalty = null_percent * NULL_PENALTY_WEIGHT + duplicate_percent * DUPLICATE_PENALTY_WEIGHT + outlier_percent * OUTLIER_PENALTY_WEIGHT + issue_count * ISSUE_PENALTY
    return max(0, min(MAX_SCORE, round(MAX_SCORE - penalty)))


def build_grade(score: int) -> str:
    """Build and return a letter grade from the score."""
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"
