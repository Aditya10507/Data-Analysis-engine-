from celery import Celery

from app.core.config import get_settings

CELERY_APP_NAME = "ai_data_analyst"
CELERY_TASK_MODULES = ["app.tasks.process_file"]


def create_celery_app() -> Celery:
    """Create and return the Celery application for worker orchestration."""
    settings = get_settings()
    return Celery(
        CELERY_APP_NAME,
        broker=settings.redis_url,
        backend=settings.redis_url,
        include=CELERY_TASK_MODULES,
    )


celery_app = create_celery_app()
