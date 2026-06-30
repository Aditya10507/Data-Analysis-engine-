from datetime import datetime

from pydantic import BaseModel, Field

MAX_HISTORY_LIMIT = 50


class JobHistoryQuery(BaseModel):
    """Represent validated job history query filters."""

    end_date: datetime | None = None
    filename: str | None = None
    limit: int = Field(default=20, ge=1, le=MAX_HISTORY_LIMIT)
    offset: int = Field(default=0, ge=0)
    start_date: datetime | None = None
