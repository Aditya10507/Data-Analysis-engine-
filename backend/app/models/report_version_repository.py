from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.job_repository import normalize_job_id
from app.models.report_version import ReportVersion


def create_report_version(db_session: Session, job_id: str | UUID, result_json: dict) -> ReportVersion:
    """Create and return the next report version for a job."""
    normalized_job_id = normalize_job_id(job_id)
    version = ReportVersion(
        job_id=normalized_job_id,
        result_json=result_json,
        version_number=read_next_version_number(db_session, normalized_job_id),
    )
    db_session.add(version)
    db_session.commit()
    db_session.refresh(version)
    return version


def fetch_report_versions(db_session: Session, job_id: str | UUID) -> list[ReportVersion]:
    """Fetch and return report versions for one job."""
    statement = (
        select(ReportVersion)
        .where(ReportVersion.job_id == normalize_job_id(job_id))
        .order_by(ReportVersion.version_number.desc())
    )
    return list(db_session.scalars(statement).all())


def read_next_version_number(db_session: Session, job_id: UUID) -> int:
    """Read and return the next version number for a job."""
    statement = select(func.max(ReportVersion.version_number)).where(ReportVersion.job_id == job_id)
    return int(db_session.scalar(statement) or 0) + 1
