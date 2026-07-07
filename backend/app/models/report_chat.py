from pydantic import BaseModel, Field

MAX_QUESTION_LENGTH = 500


class ReportChatRequest(BaseModel):
    """Represent a report assistant question request."""

    job_id: str = Field(min_length=1)
    question: str = Field(min_length=1, max_length=MAX_QUESTION_LENGTH)


class ReportChatResult(BaseModel):
    """Represent a report assistant answer response."""

    answer: str
    source: str
