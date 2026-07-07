import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.cleaning_review import CleaningReviewSubmission
from app.models.file_upload import FileUploadResult
from app.services.cleaning_review_service import approve_cleaning_review

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["cleaning review"])


@router.post(
    "/{job_id}/cleaning-review",
    response_model=ApiEnvelope[FileUploadResult],
    description="Approve or skip proposed cleaning actions before analysis starts.",
)
async def submit_cleaning_review(
    job_id: str,
    submission: CleaningReviewSubmission,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[FileUploadResult]:
    """Approve cleaning choices and return the queued job response."""
    try:
        result = approve_cleaning_review(db_session, job_id, submission)
        return ApiEnvelope(success=True, data=FileUploadResult(**result), error=None)
    except KeyError as error:
        logger.warning("Cleaning review was submitted for an unknown job.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job was not found.",
        ) from error
    except ValueError as error:
        logger.warning("Cleaning review approval was rejected.")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error
    except (SQLAlchemyError, ValidationError) as error:
        logger.exception("Cleaning review approval failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cleaning review approval failed.",
        ) from error
