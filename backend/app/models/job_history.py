from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.job_status import JobStatusValue

MAX_HISTORY_LIMIT = 50


class JobHistoryItem(BaseModel):
    """Represent one historical analysis job summary."""

    column_count: int
    created_at: datetime
    error_msg: str | None
    filename: str
    job_id: str
    result_json: dict[str, Any] | None
    row_count: int
    status: JobStatusValue


class JobHistoryResult(BaseModel):
    """Represent a paginated list of historical analysis jobs."""

    has_more: bool
    items: list[JobHistoryItem]
    limit: int = Field(gt=0, le=MAX_HISTORY_LIMIT)
    offset: int = Field(ge=0)
    total: int
