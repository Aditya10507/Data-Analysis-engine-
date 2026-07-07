REPORT_KEYWORDS = {
    "action", "analysis", "anomalies", "anomaly", "chart", "clean", "column",
    "correlation", "dashboard", "data", "duplicate", "explain", "graph",
    "insight", "missing", "next", "null", "quality", "recommend", "report",
    "risk", "row", "sales", "trend", "value", "why",
}
OFF_TOPIC_ANSWER = "I can only answer questions about the charts and report produced for this dataset."


def is_report_question(question: str) -> bool:
    """Return whether a question is related to the produced report."""
    lowered_question = question.lower()
    return any(keyword in lowered_question for keyword in REPORT_KEYWORDS)
