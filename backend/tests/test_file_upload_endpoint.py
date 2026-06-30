from fastapi.testclient import TestClient

from app.main import app
from app.models.file_upload import FileUploadResult


def test_upload_endpoint_creates_queued_job(monkeypatch, auth_headers, override_db) -> None:
    """Assert upload endpoint validates multipart files and returns a queued job."""
    monkeypatch.setattr("app.routes.files.create_upload_job", build_fake_upload_job)
    client = TestClient(app)
    response = client.post(
        "/api/v1/files/upload",
        files={"file": ("sales.csv", b"region,revenue\nNorth,1200\n", "text/csv")},
        headers=auth_headers,
    )
    response_json = response.json()
    assert response.status_code == 200
    assert response_json["success"] is True
    assert response_json["data"]["status"] == "queued"
    assert response_json["data"]["job_id"] == "job-123"


def build_fake_upload_job(db_session, uploaded_file, file_bytes, user_id_value) -> FileUploadResult:
    """Build and return a fake upload result while asserting endpoint inputs."""
    assert uploaded_file.filename == "sales.csv"
    assert b"North" in file_bytes
    assert user_id_value == "11111111-1111-4111-8111-111111111111"
    return FileUploadResult(job_id="job-123", status="queued")
