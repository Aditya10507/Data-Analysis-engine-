from app.services.file_processing_service import process_uploaded_file
from app.tasks.celery_app import celery_app


@celery_app.task(name="process_file")
def process_file(job_id: str) -> None:
    """Orchestrate file processing for a queued job and return no content."""
    process_uploaded_file(job_id)
