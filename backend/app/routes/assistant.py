import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.job_repository import fetch_job_record
from app.models.report_chat import ReportChatRequest, ReportChatResult
from app.services.report_chat_service import answer_report_question

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post(
    "/report-chat",
    response_model=ApiEnvelope[ReportChatResult],
    description="Answer a question using the stored charts and analysis report for a job.",
)
async def chat_with_report(
    request: ReportChatRequest,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[ReportChatResult]:
    """Answer a report question and return a response envelope."""
    try:
        job = fetch_job_record(db_session, request.job_id)
        if not job.result_json:
            raise ValueError("This job does not have a completed report yet.")

        answer = answer_report_question(job.result_json, request.question)
        return ApiEnvelope(success=True, data=answer, error=None)
    except (KeyError, ValueError) as error:
        raise_bad_report_chat_request(error)
    except (httpx.HTTPError, SQLAlchemyError, ValidationError) as error:
        raise_report_chat_server_error(error)


def raise_bad_report_chat_request(error: KeyError | ValueError) -> None:
    """Raise a typed bad report chat request error and return no content."""
    logger.warning("Report chat request failed.")
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error


def raise_report_chat_server_error(error: httpx.HTTPError | SQLAlchemyError | ValidationError) -> None:
    """Raise a typed report chat server error and return no content."""
    logger.exception("Report chat backend operation failed.")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Report assistant could not answer right now.",
    ) from error
