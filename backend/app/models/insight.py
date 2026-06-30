from typing import Literal

from pydantic import BaseModel

InsightKind = Literal["trend", "warning", "info"]
InsightEventKind = Literal["start", "chunk", "end", "done"]


class Insight(BaseModel):
    """Represent one business insight card."""

    body: str
    headline: str
    type: InsightKind


class InsightStreamEvent(BaseModel):
    """Represent one server-sent insight stream event."""

    body: str | None = None
    event: InsightEventKind
    headline: str | None = None
    id: str | None = None
    kind: InsightKind | None = None


class InsightContext(BaseModel):
    """Represent dataset context for Grok insight generation."""

    cleaning_report: dict
    column_stats: dict
    columns: list[dict]
    job_id: str | None = None
    shape: dict[str, int]


class InsightListResult(BaseModel):
    """Represent generated business insights."""

    insights: list[Insight]
