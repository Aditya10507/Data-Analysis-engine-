import enum
from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

FILENAME_LENGTH = 255
JOB_STATUS_ENUM_NAME = "job_status"


class JobStatus(str, enum.Enum):
    """Represent supported persisted job statuses."""

    queued = "queued"
    processing = "processing"
    done = "done"
    failed = "failed"


class Job(Base):
    """Represent the persisted analysis job table."""

    __tablename__ = "jobs"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(
        PostgresUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    filename: Mapped[str] = mapped_column(String(FILENAME_LENGTH), nullable=False)
    original_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name=JOB_STATUS_ENUM_NAME),
        nullable=False,
    )
    result_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_msg: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    __table_args__ = (
        Index("ix_jobs_user_id_created_at", "user_id", created_at.desc()),
    )
