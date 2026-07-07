import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.report_version_api import ReportVersionList
from app.services.report_version_service import list_report_versions

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["report versions"])


@router.get(
    "/{job_id}/versions",
    response_model=ApiEnvelope[ReportVersionList],
    description="Return saved report versions for a completed analysis job.",
)
async def get_report_versions(
    job_id: str,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[ReportVersionList]:
    """Fetch and return saved report versions for a job."""
    try:
        versions = list_report_versions(db_session, job_id)
        return ApiEnvelope(success=True, data=versions, error=None)
    except KeyError as error:
        logger.warning("Report versions were requested for an unknown job.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job was not found.") from error
    except (SQLAlchemyError, ValidationError) as error:
        logger.exception("Report version request failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Report version request failed.",
        ) from error
