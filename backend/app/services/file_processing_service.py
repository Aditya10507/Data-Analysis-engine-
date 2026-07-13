import logging
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any

import pandas as pd
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.job import Job, JobStatus
from app.models.job_repository import fetch_job_record, update_job_record
from app.services.analysis_engine import analyze_dataframe
from app.services.chart_generator import generate_chart_specs
from app.services.cleaning_service import clean_and_save_dataframe
from app.services.dataframe_reader_service import parse_dataframe_path
from app.services.insight_context_service import build_insight_context
from app.services.insight_service import generate_insights
from app.services.redis_cache_service import invalidate_job_cache_sync, set_cached_job_result_sync
from app.services.report_version_service import save_completed_report_version
from app.services.response_builder import build_job_response
from app.services.storage_service import build_object_name, download_object_file

PROCESSING_STATUS = JobStatus.processing
DONE_STATUS = JobStatus.done
FAILED_STATUS = JobStatus.failed

logger = logging.getLogger(__name__)


def process_uploaded_file(job_id: str) -> None:
    """Process a queued file job and return no content."""
    db_session = SessionLocal()
    try:
        invalidate_job_cache_sync(job_id)
        job = fetch_job_record(db_session, job_id)
        update_job_record(db_session, job_id, PROCESSING_STATUS, build_partial_result(job))
        result_json = process_job_file(job)
        save_completed_report_version(db_session, job_id, result_json)
        update_job_record(db_session, job_id, DONE_STATUS, result_json)
        set_cached_job_result_sync(job_id, result_json)
    except Exception as error:
        logger.exception("File processing failed for job %s.", job_id)
        db_session.rollback()
        mark_job_failed(db_session, job_id, error)
        raise
    finally:
        db_session.close()


def process_job_file(job: Job) -> dict[str, Any]:
    """Run the full file processing pipeline and return result JSON."""
    dataframe = read_job_dataframe(job)
    stats = analyze_dataframe(dataframe)
    cleaned_dataframe, cleaning_report = clean_and_save_dataframe(job.id, dataframe, read_cleaning_options(job))
    charts = generate_chart_specs(job.id, cleaned_dataframe)
    insights = generate_insights(build_insight_context(stats, cleaning_report))
    return build_job_response(
        job=job,
        status=DONE_STATUS.value,
        dataframe=cleaned_dataframe,
        stats=stats,
        cleaning_report=cleaning_report,
        charts=charts,
        insights=insights.model_dump()["insights"],
    )


def read_cleaning_options(job: Job) -> dict[str, bool]:
    """Read approved cleaning options from the job and return them."""
    result_json = job.result_json or {}
    options = result_json.get("cleaning_options")
    return options if isinstance(options, dict) else {}


def read_job_dataframe(job: Job) -> pd.DataFrame:
    """Download and parse a job file without retaining raw bytes in memory."""
    object_name = build_object_name(str(job.id), job.filename)
    with TemporaryDirectory() as temporary_directory:
        file_path = str(Path(temporary_directory) / Path(job.filename).name)
        download_object_file(object_name, file_path)
        return parse_dataframe_path(job.filename, file_path)


def build_partial_result(job: Job) -> dict[str, Any]:
    """Build and return a partial processing result."""
    return {"filename": job.filename, "message": "File processing has started."}


def mark_job_failed(db_session: Session, job_id: str, error: Exception) -> None:
    """Persist a failed job state and return no content."""
    try:
        update_job_record(
            db_session,
            job_id,
            FAILED_STATUS,
            build_failed_result(error),
            str(error),
        )
    except (KeyError, SQLAlchemyError):
        logger.exception("Failed to update job %s as failed.", job_id)


def build_failed_result(error: Exception) -> dict[str, Any]:
    """Build and return a failed processing result."""
    return {"error": str(error), "message": "File processing failed."}
