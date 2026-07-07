from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Index, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ReportVersion(Base):
    """Represent a saved immutable report snapshot."""

    __tablename__ = "report_versions"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid4)
    job_id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    result_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("job_id", "version_number", name="uq_report_versions_job_version"),
        Index("ix_report_versions_job_created_at", "job_id", created_at.desc()),
    )
