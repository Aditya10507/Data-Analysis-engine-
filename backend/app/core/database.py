from collections.abc import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings

DATABASE_POOL_PRE_PING = True


class Base(DeclarativeBase):
    """Provide the shared SQLAlchemy declarative base."""


def build_async_database_url(database_url: str, async_database_url: str | None) -> str:
    """Build and return an asyncpg SQLAlchemy database URL."""
    if async_database_url:
        return async_database_url

    return database_url.replace("postgresql+psycopg://", "postgresql+asyncpg://")


settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=DATABASE_POOL_PRE_PING)
async_engine = create_async_engine(
    build_async_database_url(settings.database_url, settings.async_database_url),
    pool_pre_ping=DATABASE_POOL_PRE_PING,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def create_database_tables() -> None:
    """Create configured ORM tables and return no content."""
    from app.models import job, user  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db_session() -> Generator[Session, None, None]:
    """Yield and close a SQLAlchemy session."""
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield and close an async SQLAlchemy session."""
    async with AsyncSessionLocal() as async_session:
        yield async_session
