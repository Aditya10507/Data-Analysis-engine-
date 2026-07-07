from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ReportVersionItem(BaseModel):
    """Represent one saved report version in API responses."""

    created_at: datetime
    result_json: dict[str, Any]
    version_id: str
    version_number: int


class ReportVersionList(BaseModel):
    """Represent all saved report versions for a job."""

    items: list[ReportVersionItem]
    job_id: str
