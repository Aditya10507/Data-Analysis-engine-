from uuid import UUID

from sqlalchemy.orm import Session

from app.models.job import Job, JobStatus
from app.models.job_history import JobHistoryItem, JobHistoryResult
from app.models.job_history_query import JobHistoryQuery
from app.models.job_repository import count_user_jobs, fetch_user_jobs
from app.services.job_status_service import normalize_job_status


def fetch_job_history(
    db_session: Session,
    user_id: str,
    query: JobHistoryQuery,
) -> JobHistoryResult:
    """Fetch and return paginated history for one user."""
    normalized_user_id = UUID(user_id)
    jobs = fetch_user_jobs(db_session, normalized_user_id, query)
    total = count_user_jobs(db_session, normalized_user_id, query)
    return JobHistoryResult(
        has_more=query.offset + len(jobs) < total,
        items=[build_history_item(job) for job in jobs],
        limit=query.limit,
        offset=query.offset,
        total=total,
    )


def build_history_item(job: Job) -> JobHistoryItem:
    """Build and return a public history item from a job."""
    row_count, column_count = read_result_shape(job.result_json)
    return JobHistoryItem(
        column_count=column_count,
        created_at=job.created_at,
        error_msg=job.error_msg,
        filename=job.filename,
        job_id=str(job.id),
        result_json=job.result_json,
        row_count=row_count,
        status=normalize_job_status(read_status_value(job.status)),
    )


def read_status_value(status: JobStatus | str) -> str:
    """Read and return a plain status value."""
    return status.value if isinstance(status, JobStatus) else status


def read_result_shape(result_json: dict | None) -> tuple[int, int]:
    """Read and return row and column count from a job result."""
    if not result_json:
        return 0, 0

    shape = result_json.get("shape", [0, 0])
    if not isinstance(shape, list) or len(shape) < 2:
        return 0, 0

    return int(shape[0]), int(shape[1])
