import os
from collections.abc import Generator

import jwt
import pytest

TEST_USER_ID = "11111111-1111-4111-8111-111111111111"

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/test")
os.environ.setdefault("ASYNC_DATABASE_URL", "postgresql+asyncpg://user:pass@localhost:5432/test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("S3_ENDPOINT", "http://localhost:9000")
os.environ.setdefault("S3_BUCKET", "test-bucket")
os.environ.setdefault("S3_ACCESS_KEY", "minio")
os.environ.setdefault("S3_SECRET_KEY", "minio-secret")
os.environ.setdefault("XAI_API_KEY", "test-xai-key")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("JWT_ALGORITHM", "HS256")


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Build and return authorized request headers."""
    token = jwt.encode(
        {"email": "analyst@example.com", "sub": TEST_USER_ID},
        os.environ["JWT_SECRET_KEY"],
        algorithm=os.environ["JWT_ALGORITHM"],
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def fake_db_session() -> object:
    """Return a fake database session object."""
    return object()


@pytest.fixture
def override_db(fake_db_session: object) -> Generator[None, None, None]:
    """Override FastAPI database dependency and return no content."""
    from app.core.database import get_db_session
    from app.main import app

    def yield_fake_db() -> Generator[object, None, None]:
        """Yield a fake database session."""
        yield fake_db_session

    app.dependency_overrides[get_db_session] = yield_fake_db
    try:
        yield
    finally:
        app.dependency_overrides.clear()
