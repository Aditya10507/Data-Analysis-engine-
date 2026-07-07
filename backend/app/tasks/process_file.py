from app.services.cleaning_review_service import prepare_cleaning_review as prepare_review
from app.services.file_processing_service import process_uploaded_file
from app.tasks.celery_app import celery_app


@celery_app.task(name="prepare_cleaning_review")
def prepare_cleaning_review(job_id: str) -> None:
    """Orchestrate cleaning review preparation and return no content."""
    prepare_review(job_id)


@celery_app.task(name="process_file")
def process_file(job_id: str) -> None:
    """Orchestrate file processing for a queued job and return no content."""
    process_uploaded_file(job_id)
