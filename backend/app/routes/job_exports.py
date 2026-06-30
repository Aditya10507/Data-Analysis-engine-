import logging

from fastapi import APIRouter, Depends, HTTPException, Response, status
from minio.error import S3Error
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.job_repository import fetch_job_record
from app.services.report_service import build_report_pdf

logger = logging.getLogger(__name__)
PDF_MEDIA_TYPE = "application/pdf"

router = APIRouter(prefix="/jobs", tags=["job exports"])


@router.get(
    "/{job_id}/report.pdf",
    description="Generate and download a PDF report for a completed analysis job.",
)
async def download_job_report(
    job_id: str,
    db_session: Session = Depends(get_db_session),
) -> Response:
    """Generate and return a completed job PDF report download."""
    try:
        job = fetch_job_record(db_session, job_id)
        pdf_bytes = build_report_pdf(job)
        return build_pdf_response(job.filename, pdf_bytes)
    except KeyError as error:
        raise_job_export_error(error, status.HTTP_404_NOT_FOUND, "Job was not found.")
    except ValueError as error:
        raise_job_export_error(error, status.HTTP_409_CONFLICT, str(error))
    except (OSError, S3Error, SQLAlchemyError) as error:
        logger.exception("Job report export failed.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Job report export failed.",
        ) from error


def build_pdf_response(filename: str, pdf_bytes: bytes) -> Response:
    """Build and return an attachment response for PDF bytes."""
    report_filename = f"{filename}.report.pdf"
    return Response(
        content=pdf_bytes,
        headers={"Content-Disposition": f'attachment; filename="{report_filename}"'},
        media_type=PDF_MEDIA_TYPE,
    )


def raise_job_export_error(error: Exception, status_code: int, detail: str) -> None:
    """Raise a typed job export HTTP error."""
    logger.warning("Job report export request failed.")
    raise HTTPException(status_code=status_code, detail=detail) from error
