from typing import Literal

from pydantic import BaseModel

JobStatusValue = Literal["queued", "processing", "done", "failed"]


class JobStatusResult(BaseModel):
    """Represent the current status of an analysis job."""

    error_msg: str | None
    job_id: str
    result_json: dict | None
    status: JobStatusValue
