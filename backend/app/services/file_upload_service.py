from pathlib import PurePath
from uuid import UUID, uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.file_upload import FileUploadResult
from app.models.job_repository import create_job_record
from app.models.user_repository import ensure_user_record
from app.services.storage_service import save_raw_stream
from app.tasks.file_tasks import prepare_cleaning_review

ALLOWED_EXTENSIONS = {".csv", ".json", ".tsv", ".txt", ".xls", ".xlsx"}
ALLOWED_FORMATS_LABEL = "CSV, JSON, TSV, TXT, XLS, or XLSX"
BYTES_PER_GIBIBYTE = 1024 * 1024 * 1024
MAX_FILE_SIZE_BYTES = BYTES_PER_GIBIBYTE
MAX_FILE_SIZE_LABEL = "1 GB"
QUEUED_STATUS = "queued"
SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001"


def has_allowed_extension(file_name: str) -> bool:
    """Return whether an uploaded filename has a supported extension."""
    return any(file_name.lower().endswith(extension) for extension in ALLOWED_EXTENSIONS)


def validate_upload(uploaded_file: UploadFile, file_size: int) -> str:
    """Validate an upload and return the safe filename."""
    filename = PurePath(uploaded_file.filename or "").name

    if not filename:
        raise ValueError("Uploaded file must include a filename.")

    if file_size > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"Uploaded file must be {MAX_FILE_SIZE_LABEL} or smaller.")

    if not has_allowed_extension(filename):
        raise ValueError(f"Uploaded file must be {ALLOWED_FORMATS_LABEL}.")

    return filename


def create_upload_job(
    db_session: Session,
    uploaded_file: UploadFile,
    user_id_value: str = SYSTEM_USER_ID,
) -> FileUploadResult:
    """Store an upload, create a job, enqueue review preparation, and return details."""
    file_size = read_upload_size(uploaded_file)
    filename = validate_upload(uploaded_file, file_size)
    job_uuid = uuid4()
    user_id = parse_uuid(user_id_value)
    job_id = str(job_uuid)
    ensure_system_user(db_session, user_id_value, user_id)
    save_raw_stream(job_id, filename, uploaded_file.file, file_size)
    create_job_record(db_session, job_uuid, user_id, filename, file_size)
    prepare_cleaning_review.delay(job_id)
    return FileUploadResult(job_id=job_id, status=QUEUED_STATUS)


def read_upload_size(uploaded_file: UploadFile) -> int:
    """Read and return upload size without loading file contents into memory."""
    if uploaded_file.size is not None:
        return uploaded_file.size
    current_position = uploaded_file.file.tell()
    uploaded_file.file.seek(0, 2)
    file_size = uploaded_file.file.tell()
    uploaded_file.file.seek(current_position)
    return file_size


def parse_uuid(value: str) -> UUID:
    """Parse and return a UUID from a string value."""
    return UUID(value)


def ensure_system_user(db_session: Session, user_id_value: str, user_id: UUID) -> None:
    """Ensure the fallback system user exists and return no content."""
    if user_id_value == SYSTEM_USER_ID:
        ensure_user_record(db_session, user_id)
