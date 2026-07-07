import logging
from typing import Any

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.cleaning_review import CleaningReviewSubmission
from app.models.job import Job, JobStatus
from app.models.job_repository import fetch_job_record, update_job_record
from app.services.cleaning_plan_service import build_cleaning_review_plan
from app.services.file_processing_service import build_failed_result, read_job_dataframe
from app.services.redis_cache_service import invalidate_job_cache_sync

REVIEWING_STATUS = JobStatus.reviewing
QUEUED_STATUS = JobStatus.queued
FAILED_STATUS = JobStatus.failed

logger = logging.getLogger(__name__)


def prepare_cleaning_review(job_id: str) -> None:
    """Prepare a cleaning review job and return no content."""
    db_session = SessionLocal()
    try:
        job = fetch_job_record(db_session, job_id)
        dataframe = read_job_dataframe(job)
        update_job_record(db_session, job_id, REVIEWING_STATUS, build_review_result(job, dataframe))
    except Exception as error:
        logger.exception("Cleaning review preparation failed for job %s.", job_id)
        db_session.rollback()
        mark_review_failed(db_session, job_id, error)
        raise
    finally:
        db_session.close()


def approve_cleaning_review(db_session: Session, job_id: str, submission: CleaningReviewSubmission) -> dict[str, str]:
    """Persist cleaning choices, enqueue analysis, and return job details."""
    job = fetch_job_record(db_session, job_id)
    validate_review_state(job)
    result_json = build_approved_review_result(job, submission)
    invalidate_job_cache_sync(job_id)
    update_job_record(db_session, job_id, QUEUED_STATUS, result_json)
    from app.tasks.file_tasks import process_file

    process_file.delay(job_id)
    return {"job_id": job_id, "status": QUEUED_STATUS.value}


def build_review_result(job: Job, dataframe) -> dict[str, Any]:
    """Build and return a review-pending job result."""
    return {
        "cleaning_review": build_cleaning_review_plan(dataframe),
        "filename": job.filename,
        "message": "Review cleaning actions before analysis starts.",
    }


def build_approved_review_result(job: Job, submission: CleaningReviewSubmission) -> dict[str, Any]:
    """Build and return a queued job result with approved cleaning options."""
    review_result = job.result_json or {}
    return {
        **review_result,
        "cleaning_options": {choice.action: choice.is_enabled for choice in submission.choices},
        "message": "Cleaning choices approved. Analysis is queued.",
    }


def validate_review_state(job: Job) -> None:
    """Validate that a job can leave review and return no content."""
    if job.status != REVIEWING_STATUS:
        raise ValueError("Job is not waiting for cleaning review.")


def mark_review_failed(db_session: Session, job_id: str, error: Exception) -> None:
    """Persist a failed review state and return no content."""
    try:
        update_job_record(db_session, job_id, FAILED_STATUS, build_failed_result(error), str(error))
    except (KeyError, SQLAlchemyError):
        logger.exception("Failed to update job %s as failed.", job_id)
