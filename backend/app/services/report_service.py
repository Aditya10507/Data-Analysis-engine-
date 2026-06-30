import base64
from html import escape
from typing import Any

from weasyprint import HTML

from app.models.job import Job
from app.services.storage_service import read_object_bytes

CHART_LIMIT = 3
INSIGHT_LIMIT = 5


def build_report_pdf(job: Job) -> bytes:
    """Build and return a PDF report for a completed job."""
    result = validate_job_result(job)
    return HTML(string=build_report_html(job, result)).write_pdf()


def validate_job_result(job: Job) -> dict[str, Any]:
    """Validate and return a completed job result payload."""
    if not job.result_json:
        raise ValueError("Job result is not ready for export.")

    return job.result_json


def build_report_html(job: Job, result: dict[str, Any]) -> str:
    """Build and return the report HTML document."""
    return f"""
    <html>
      <head><meta charset="utf-8"><style>{build_report_css()}</style></head>
      <body>
        <h1>AI Data Analyst Report</h1>
        <p class="muted">{escape(job.filename)}</p>
        {build_kpi_section(result)}
        {build_insights_section(result)}
        {build_charts_section(result)}
      </body>
    </html>
    """


def build_report_css() -> str:
    """Build and return CSS for the generated report."""
    return """
    body { color: #0f172a; font-family: DejaVu Sans, sans-serif; margin: 32px; }
    h1 { font-size: 26px; margin-bottom: 4px; }
    h2 { border-bottom: 1px solid #cbd5e1; font-size: 18px; padding-bottom: 6px; }
    .muted { color: #64748b; font-size: 12px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(4, 1fr); }
    .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
    .label { color: #64748b; font-size: 11px; text-transform: uppercase; }
    .value { font-size: 22px; font-weight: 700; margin-top: 8px; }
    .insight { margin-bottom: 12px; }
    img { border: 1px solid #cbd5e1; border-radius: 8px; margin: 8px 0; width: 220px; }
    """


def build_kpi_section(result: dict[str, Any]) -> str:
    """Build and return the KPI cards HTML."""
    rows, columns = read_shape(result)
    cards = [
        ("Rows", f"{rows:,}"),
        ("Columns", f"{columns:,}"),
        ("Nulls overall", format_percent(calculate_null_percent(result))),
        ("Insights", str(len(read_insights(result)))),
    ]
    return f"<h2>KPIs</h2><section class=\"grid\">{''.join(map(build_kpi_card, cards))}</section>"


def build_kpi_card(card: tuple[str, str]) -> str:
    """Build and return one KPI card HTML string."""
    label, value = card
    return f"<div class=\"card\"><div class=\"label\">{escape(label)}</div><div class=\"value\">{escape(value)}</div></div>"


def build_insights_section(result: dict[str, Any]) -> str:
    """Build and return the top insights HTML."""
    insights = read_insights(result)[:INSIGHT_LIMIT]
    insight_html = "".join(build_insight_item(insight) for insight in insights)
    return f"<h2>Top Insights</h2><section>{insight_html or '<p>No insights available.</p>'}</section>"


def build_insight_item(insight: dict[str, Any]) -> str:
    """Build and return one insight HTML item."""
    headline = escape(str(insight.get("headline", "Insight")))
    body = escape(str(insight.get("body", "")))
    return f"<article class=\"insight\"><strong>{headline}</strong><p>{body}</p></article>"


def build_charts_section(result: dict[str, Any]) -> str:
    """Build and return embedded chart image HTML."""
    images = [build_chart_image(object_name) for object_name in read_chart_objects(result)]
    return f"<h2>Key Charts</h2><section>{''.join(images) or '<p>No chart thumbnails available.</p>'}</section>"


def build_chart_image(object_name: str) -> str:
    """Build and return one embedded chart image tag."""
    image_bytes = read_object_bytes(object_name)
    encoded_image = base64.b64encode(image_bytes).decode("ascii")
    return f'<img alt="Chart thumbnail" src="data:image/png;base64,{encoded_image}" />'


def read_chart_objects(result: dict[str, Any]) -> list[str]:
    """Read and return up to three chart thumbnail object names."""
    histograms = result.get("charts", {}).get("histograms", {})
    if not isinstance(histograms, dict):
        return []

    object_names = [
        value.get("thumbnail_object_name")
        for value in histograms.values()
        if isinstance(value, dict)
    ]
    return [str(name) for name in object_names if name][:CHART_LIMIT]


def read_shape(result: dict[str, Any]) -> tuple[int, int]:
    """Read and return result shape as row and column counts."""
    shape = result.get("shape", [0, 0])
    if not isinstance(shape, list) or len(shape) < 2:
        return 0, 0

    return int(shape[0]), int(shape[1])


def read_insights(result: dict[str, Any]) -> list[dict[str, Any]]:
    """Read and return report insights from the job result."""
    insights = result.get("insights", [])
    return insights if isinstance(insights, list) else []


def calculate_null_percent(result: dict[str, Any]) -> float:
    """Calculate and return average column null percentage."""
    columns = result.get("stats", {}).get("columns", {})
    null_values = [float(item.get("null_percent", 0)) for item in columns.values()]
    return sum(null_values) / len(null_values) if null_values else 0


def format_percent(value: float) -> str:
    """Format and return a percentage label."""
    return f"{value:.1f}%"
