import logging

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from minio.error import S3Error
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.file_upload import FileUploadResult
from app.models.route_status import RouteStatus
from app.services.file_upload_service import create_upload_job
from app.services.route_status_service import build_route_status

logger = logging.getLogger(__name__)

ROUTE_NAME = "files"

router = APIRouter(prefix="/files", tags=["files"])


@router.get(
    "",
    response_model=ApiEnvelope[RouteStatus],
    description="Return readiness status for the files API stub.",
)
async def get_files_status() -> ApiEnvelope[RouteStatus]:
    """Return the files API stub status envelope."""
    try:
        return ApiEnvelope(success=True, data=build_route_status(ROUTE_NAME), error=None)
    except ValidationError as error:
        logger.exception("Files route status validation failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Files route status validation failed.",
        ) from error


@router.post(
    "/upload",
    response_model=ApiEnvelope[FileUploadResult],
    description="Upload a dataset file and create an asynchronous analysis job.",
)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[FileUploadResult]:
    """Upload a file and return the created analysis job envelope."""
    try:
        return await build_upload_response(request, file, db_session)
    except (UnicodeDecodeError, ValueError) as error:
        raise_bad_upload_request(error)
    except (SQLAlchemyError, S3Error, ValidationError) as error:
        raise_upload_server_error(error)


async def build_upload_response(
    request: Request,
    file: UploadFile,
    db_session: Session,
) -> ApiEnvelope[FileUploadResult]:
    """Build and return the upload response envelope."""
    try:
        file_bytes = await file.read()
        user_id = str(getattr(request.state, "user_id", ""))
        upload_result = create_upload_job(db_session, file, file_bytes, user_id)
        return ApiEnvelope(success=True, data=upload_result, error=None)
    except (UnicodeDecodeError, ValueError, SQLAlchemyError, S3Error, ValidationError):
        raise


def raise_bad_upload_request(error: UnicodeDecodeError | ValueError) -> None:
    """Raise a typed bad upload HTTP error and return no content."""
    logger.warning("File upload validation failed.")
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(error),
    ) from error


def raise_upload_server_error(error: SQLAlchemyError | S3Error | ValidationError) -> None:
    """Raise a typed upload server HTTP error and return no content."""
    logger.exception("File upload backend operation failed.")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="File upload backend operation failed.",
    ) from error
