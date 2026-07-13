from typing import Any

import pandas as pd

from app.models.job import Job
from app.services.data_quality_service import build_data_quality_score
from app.services.storage_service import (
    build_cleaned_object_name,
    build_object_name,
    create_presigned_get_url,
)

DOWNLOAD_EXPIRY_SECONDS = 60 * 60
INTERACTIVE_SAMPLE_ROWS = 10000


def build_job_response(
    job: Job,
    status: str,
    dataframe: pd.DataFrame,
    stats: dict[str, Any],
    cleaning_report: dict[str, Any],
    charts: dict[str, Any],
    insights: list[dict[str, Any]],
) -> dict[str, Any]:
    """Assemble and return the final job result JSON."""
    return {
        "charts": charts,
        "cleaning_report": build_cleaning_report(cleaning_report),
        "column_meta": build_column_meta(stats),
        "data_quality": build_data_quality_score(stats, cleaning_report),
        "download_urls": build_download_urls(job),
        "filename": job.filename,
        "insights": insights,
        "job_id": str(job.id),
        "preview": build_preview(dataframe),
        "shape": [int(dataframe.shape[0]), int(dataframe.shape[1])],
        "stats": stats,
        "status": status,
    }


def build_cleaning_report(cleaning_report: dict[str, Any]) -> list[dict[str, Any]]:
    """Build and return the cleaning report action list."""
    actions = cleaning_report.get("actions", [])
    return actions if isinstance(actions, list) else []


def build_column_meta(stats: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Build and return metadata for every analyzed column."""
    columns = stats.get("columns", {})
    return {
        column_name: build_single_column_meta(column_stats)
        for column_name, column_stats in columns.items()
    }


def build_single_column_meta(column_stats: dict[str, Any]) -> dict[str, Any]:
    """Build and return metadata for one analyzed column."""
    return {
        "dtype": column_stats.get("dtype"),
        "null_count": column_stats.get("null_count"),
        "null_percent": column_stats.get("null_percent"),
        "semantic_type": column_stats.get("semantic_type"),
        "unique_count": column_stats.get("unique_count"),
    }


def build_download_urls(job: Job) -> dict[str, str]:
    """Build and return one-hour pre-signed download URLs."""
    return {
        "cleaned_csv": create_presigned_get_url(
            build_cleaned_object_name(str(job.id)),
            DOWNLOAD_EXPIRY_SECONDS,
        ),
        "original": create_presigned_get_url(
            build_object_name(str(job.id), job.filename),
            DOWNLOAD_EXPIRY_SECONDS,
        ),
    }


def build_preview(dataframe: pd.DataFrame) -> list[dict[str, Any]]:
    """Build and return the first rows as JSON-friendly records."""
    preview_frame = dataframe.head(INTERACTIVE_SAMPLE_ROWS)
    cleaned_frame = preview_frame.astype(object).where(pd.notna(preview_frame), None)
    return cleaned_frame.map(normalize_preview_value).to_dict("records")


def normalize_preview_value(value: Any) -> Any:
    """Normalize one preview value and return JSON-friendly output."""
    if value is None:
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    return value.item() if hasattr(value, "item") else value
