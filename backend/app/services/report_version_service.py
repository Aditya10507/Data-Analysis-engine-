from app.models.job_repository import fetch_job_record
from app.models.report_version import ReportVersion
from app.models.report_version_api import ReportVersionItem, ReportVersionList
from app.models.report_version_repository import create_report_version, fetch_report_versions
from sqlalchemy.orm import Session


def save_completed_report_version(db_session: Session, job_id: str, result_json: dict) -> ReportVersion:
    """Save a completed report snapshot and return the version."""
    return create_report_version(db_session, job_id, result_json)


def list_report_versions(db_session: Session, job_id: str) -> ReportVersionList:
    """Fetch saved report versions and return an API model."""
    fetch_job_record(db_session, job_id)
    versions = fetch_report_versions(db_session, job_id)
    return ReportVersionList(
        items=[build_version_item(version) for version in versions],
        job_id=job_id,
    )


def build_version_item(version: ReportVersion) -> ReportVersionItem:
    """Build and return one report version API item."""
    return ReportVersionItem(
        created_at=version.created_at,
        result_json=version.result_json,
        version_id=str(version.id),
        version_number=version.version_number,
    )
