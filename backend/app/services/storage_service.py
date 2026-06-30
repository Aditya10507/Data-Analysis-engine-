from datetime import timedelta
from io import BytesIO
from urllib.parse import urlparse

from minio import Minio

from app.core.config import get_settings


def build_object_name(job_id: str, filename: str) -> str:
    """Build and return the raw-file object key."""
    return f"raw/{job_id}/{filename}"


def build_cleaned_object_name(job_id: str) -> str:
    """Build and return the cleaned-file object key."""
    return f"cleaned/{job_id}/cleaned.csv"


def build_chart_object_name(job_id: str, column_name: str) -> str:
    """Build and return the chart thumbnail object key."""
    return f"charts/{job_id}/{column_name}_hist.png"


def create_minio_client() -> Minio:
    """Create and return a configured MinIO client."""
    settings = get_settings()
    parsed_endpoint = urlparse(settings.s3_endpoint)
    endpoint = parsed_endpoint.netloc or parsed_endpoint.path
    is_secure = parsed_endpoint.scheme == "https"
    return Minio(
        endpoint,
        access_key=settings.s3_access_key,
        secret_key=settings.s3_secret_key,
        secure=is_secure,
    )


def ensure_bucket_exists(client: Minio, bucket_name: str) -> None:
    """Ensure the configured bucket exists and return no content."""
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)


def save_raw_file(job_id: str, filename: str, file_bytes: bytes) -> str:
    """Save raw file bytes to MinIO and return the object key."""
    object_name = build_object_name(job_id, filename)
    return save_object_bytes(object_name, file_bytes)


def save_object_bytes(object_name: str, file_bytes: bytes) -> str:
    """Save object bytes to MinIO and return the object key."""
    settings = get_settings()
    client = create_minio_client()
    ensure_bucket_exists(client, settings.s3_bucket)
    client.put_object(
        settings.s3_bucket,
        object_name,
        BytesIO(file_bytes),
        length=len(file_bytes),
    )
    return object_name


def read_object_bytes(object_name: str) -> bytes:
    """Read object bytes from MinIO and return them."""
    settings = get_settings()
    client = create_minio_client()
    response = client.get_object(settings.s3_bucket, object_name)
    try:
        return response.read()
    finally:
        response.close()
        response.release_conn()


def create_presigned_get_url(object_name: str, expiry_seconds: int) -> str:
    """Create and return a pre-signed MinIO download URL."""
    settings = get_settings()
    client = create_minio_client()
    return client.presigned_get_object(
        settings.s3_bucket,
        object_name,
        expires=timedelta(seconds=expiry_seconds),
    )
