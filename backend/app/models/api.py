from typing import Generic, TypeVar

from pydantic import BaseModel

ResponseData = TypeVar("ResponseData")


class ApiEnvelope(BaseModel, Generic[ResponseData]):
    """Represent the shared API response envelope."""

    success: bool
    data: ResponseData | None
    error: str | None
