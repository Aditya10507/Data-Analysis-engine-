from pydantic import BaseModel


class FileUploadResult(BaseModel):
    """Represent a created analysis job for an uploaded file."""

    job_id: str
    status: str
