from pathlib import PurePath
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.file_upload import FileUploadResult
from app.models.job_repository import create_job_record
from app.models.user_repository import ensure_user_record
from app.services.storage_service import save_raw_file
from app.tasks.file_tasks import process_file

ALLOWED_EXTENSIONS = {".csv", ".json", ".tsv", ".txt", ".xls", ".xlsx"}
ALLOWED_FORMATS_LABEL = "CSV, JSON, TSV, TXT, XLS, or XLSX"
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024
QUEUED_STATUS = "queued"
SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001"


def has_allowed_extension(file_name: str) -> bool:
    """Return whether an uploaded filename has a supported extension."""
    return any(file_name.lower().endswith(extension) for extension in ALLOWED_EXTENSIONS)


def validate_upload(uploaded_file: UploadFile, file_bytes: bytes) -> str:
    """Validate an upload and return the safe filename."""
    filename = PurePath(uploaded_file.filename or "").name

    if not filename:
        raise ValueError("Uploaded file must include a filename.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError("Uploaded file must be 50 MB or smaller.")

    if not has_allowed_extension(filename):
        raise ValueError(f"Uploaded file must be {ALLOWED_FORMATS_LABEL}.")

    return filename


def create_upload_job(
    db_session: Session,
    uploaded_file: UploadFile,
    file_bytes: bytes,
    user_id_value: str = SYSTEM_USER_ID,
) -> FileUploadResult:
    """Store an upload, create a job, enqueue processing, and return job details."""
    filename = validate_upload(uploaded_file, file_bytes)
    job_uuid = uuid4()
    user_id = parse_uuid(user_id_value)
    job_id = str(job_uuid)
    ensure_system_user(db_session, user_id_value, user_id)
    save_raw_file(job_id, filename, file_bytes)
    create_job_record(db_session, job_uuid, user_id, filename, len(file_bytes))
    process_file.delay(job_id)
    return FileUploadResult(job_id=job_id, status=QUEUED_STATUS)


def parse_uuid(value: str) -> UUID:
    """Parse and return a UUID from a string value."""
    return UUID(value)


def ensure_system_user(db_session: Session, user_id_value: str, user_id: UUID) -> None:
    """Ensure the fallback system user exists and return no content."""
    if user_id_value == SYSTEM_USER_ID:
        ensure_user_record(db_session, user_id)
