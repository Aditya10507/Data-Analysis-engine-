import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.job_history import JobHistoryResult
from app.models.job_history_query import JobHistoryQuery
from app.models.job_status import JobStatusResult
from app.services.job_history_service import fetch_job_history
from app.services.job_status_service import fetch_job_status
from app.services.redis_cache_service import get_cached_job_result, set_cached_job_result

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get(
    "",
    response_model=ApiEnvelope[JobHistoryResult],
    description="Return paginated analysis job history for the authenticated user.",
)
async def list_jobs(
    request: Request,
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    filename: str | None = Query(default=None),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[JobHistoryResult]:
    """Fetch and return authenticated user job history."""
    try:
        query = build_history_query(limit, offset, filename, start_date, end_date)
        user_id = read_request_user_id(request)
        history = fetch_job_history(db_session, user_id, query)
        return ApiEnvelope(success=True, data=history, error=None)
    except (ValueError, ValidationError) as error:
        logger.exception("Job history request validation failed.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job history request validation failed.",
        ) from error
    except SQLAlchemyError as error:
        logger.exception("Job history database operation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Job history database operation failed.",
        ) from error


def build_history_query(
    limit: int,
    offset: int,
    filename: str | None,
    start_date: datetime | None,
    end_date: datetime | None,
) -> JobHistoryQuery:
    """Build and return a validated history query model."""
    return JobHistoryQuery(
        end_date=end_date,
        filename=filename,
        limit=limit,
        offset=offset,
        start_date=start_date,
    )


def read_request_user_id(request: Request) -> str:
    """Read and return the authenticated request user id."""
    return str(getattr(request.state, "user_id", ""))


@router.get(
    "/{job_id}/status",
    response_model=ApiEnvelope[JobStatusResult],
    description="Return the current processing status for an analysis job.",
)
async def get_job_status(
    job_id: str,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[JobStatusResult]:
    """Fetch and return the current job status envelope."""
    try:
        cached_response = await build_cached_status_response(job_id)
        if cached_response:
            return cached_response

        job_status = fetch_job_status(db_session, job_id)
        await cache_completed_job_status(job_status)
        return ApiEnvelope(success=True, data=job_status, error=None)
    except KeyError as error:
        logger.warning("Job status was requested for an unknown job.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job was not found.",
        ) from error
    except SQLAlchemyError as error:
        logger.exception("Job status database operation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Job status database operation failed.",
        ) from error
    except ValidationError as error:
        raise_job_status_validation_error(error)


async def build_cached_status_response(job_id: str) -> ApiEnvelope[JobStatusResult] | None:
    """Build and return a cached job status response when available."""
    cached_result = await get_cached_job_result(job_id)
    return build_cached_job_response(job_id, cached_result) if cached_result else None


async def cache_completed_job_status(job_status: JobStatusResult) -> None:
    """Cache a completed job status result and return no content."""
    if job_status.status == "done" and job_status.result_json:
        await set_cached_job_result(job_status.job_id, job_status.result_json)


def build_cached_job_response(
    job_id: str,
    result_json: dict,
) -> ApiEnvelope[JobStatusResult]:
    """Build and return a cached completed job status response."""
    job_status = JobStatusResult(
        error_msg=None,
        job_id=job_id,
        result_json=result_json,
        status="done",
    )
    return ApiEnvelope(success=True, data=job_status, error=None)


def raise_job_status_validation_error(error: ValidationError) -> None:
    """Raise a typed job status validation HTTP error."""
    logger.exception("Job status response validation failed.")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Job status response validation failed.",
    ) from error
