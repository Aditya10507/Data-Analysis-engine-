from app.tasks.process_file import process_file


def test_process_file_task_orchestrates_service_call(monkeypatch) -> None:
    """Assert the Celery task delegates processing to the file service."""
    called_job_ids: list[str] = []
    monkeypatch.setattr(
        "app.tasks.process_file.process_uploaded_file",
        lambda job_id: called_job_ids.append(job_id),
    )
    process_file("job-123")
    assert called_job_ids == ["job-123"]
