from sqlalchemy.orm import Session

from app.models.job import JobStatus
from app.models.job_repository import fetch_job_record
from app.models.job_status import JobStatusResult, JobStatusValue


def normalize_job_status(status: str | JobStatus) -> JobStatusValue:
    """Normalize and return a public job status value."""
    status_value = status.value if isinstance(status, JobStatus) else status

    if status_value in {"queued", "reviewing", "processing", "done", "failed"}:
        return status_value

    return "failed"


def fetch_job_status(db_session: Session, job_id: str) -> JobStatusResult:
    """Fetch and return persisted job status and partial results."""
    job = fetch_job_record(db_session, job_id)
    return JobStatusResult(
        error_msg=job.error_msg,
        job_id=str(job.id),
        result_json=job.result_json,
        status=normalize_job_status(job.status),
    )
