from time import perf_counter
from uuid import UUID

import structlog
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.job import Job, JobStatus
from app.models.job_history_query import JobHistoryQuery

logger = structlog.get_logger(__name__)


def create_job_record(
    db_session: Session,
    job_id: UUID,
    user_id: UUID,
    filename: str,
    original_size_bytes: int,
) -> Job:
    """Create and return a queued job record."""
    job = Job(
        filename=filename,
        id=job_id,
        original_size_bytes=original_size_bytes,
        status=JobStatus.queued,
        user_id=user_id,
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)
    return job


def fetch_job_record(db_session: Session, job_id: str | UUID) -> Job:
    """Fetch and return one job record by ID."""
    job = db_session.get(Job, normalize_job_id(job_id))

    if not job:
        raise KeyError(str(job_id))

    return job


def fetch_user_jobs(
    db_session: Session,
    user_id: UUID,
    query: JobHistoryQuery,
) -> list[Job]:
    """Fetch and return paginated jobs for one user."""
    statement = build_user_jobs_statement(user_id, query)
    return list(db_session.scalars(statement).all())


def count_user_jobs(db_session: Session, user_id: UUID, query: JobHistoryQuery) -> int:
    """Count and return filtered jobs for one user."""
    statement = select(func.count()).select_from(Job).where(Job.user_id == user_id)
    statement = apply_job_filters(statement, query)
    return int(db_session.scalar(statement) or 0)


def update_job_record(
    db_session: Session,
    job_id: str | UUID,
    status: JobStatus,
    result_json: dict | None,
    error_msg: str | None = None,
) -> Job:
    """Update and return a job record status and result."""
    job = fetch_job_record(db_session, job_id)
    from_status = job.status
    start_time = perf_counter()
    job.error_msg = error_msg
    job.result_json = result_json
    job.status = status
    db_session.commit()
    db_session.refresh(job)
    log_job_transition(job, from_status, status, start_time)
    return job


def normalize_job_id(job_id: str | UUID) -> UUID:
    """Normalize a job identifier and return a UUID."""
    return job_id if isinstance(job_id, UUID) else UUID(job_id)


def build_user_jobs_statement(user_id: UUID, query: JobHistoryQuery):
    """Build and return the user jobs select statement."""
    statement = select(Job).where(Job.user_id == user_id)
    statement = apply_job_filters(statement, query)
    return statement.order_by(Job.created_at.desc()).limit(query.limit).offset(query.offset)


def apply_job_filters(statement, query: JobHistoryQuery):
    """Apply optional history filters and return the statement."""
    if query.filename:
        statement = statement.where(Job.filename.ilike(f"%{query.filename}%"))
    if query.start_date:
        statement = statement.where(Job.created_at >= query.start_date)
    if query.end_date:
        statement = statement.where(Job.created_at <= query.end_date)
    return statement


def log_job_transition(
    job: Job,
    from_status: JobStatus,
    to_status: JobStatus,
    start_time: float,
) -> None:
    """Log a persisted job state transition and return no content."""
    logger.info(
        "job_state_transition",
        duration_ms=round((perf_counter() - start_time) * 1000, 3),
        from_status=from_status.value,
        job_id=str(job.id),
        to_status=to_status.value,
    )
