import re
from dataclasses import dataclass
from tempfile import TemporaryDirectory
from pathlib import Path
from typing import Any

import pandas as pd

from app.services.analysis_semantics import is_date_column, is_numeric_column
from app.services.storage_service import build_cleaned_object_name, save_object_file

OUTLIER_STD_MULTIPLIER = 3
CleaningOptions = dict[str, bool]


@dataclass
class CleaningResult:
    """Represent a cleaned DataFrame and its report."""

    dataframe: pd.DataFrame
    report: dict[str, Any]


def clean_dataframe(dataframe: pd.DataFrame, options: CleaningOptions | None = None) -> CleaningResult:
    """Clean a DataFrame and return cleaned data plus a report."""
    cleaned_dataframe = dataframe.copy()
    report = {"actions": [], "initial_rows": int(len(cleaned_dataframe))}
    cleaned_dataframe = normalize_columns(cleaned_dataframe, report)
    if is_cleaning_enabled(options, "parse_dates"):
        cleaned_dataframe = parse_date_columns(cleaned_dataframe, report)
    if is_cleaning_enabled(options, "fill_nulls"):
        cleaned_dataframe = fill_null_values(cleaned_dataframe, report)
    if is_cleaning_enabled(options, "remove_duplicates"):
        cleaned_dataframe = remove_duplicate_rows(cleaned_dataframe, report)
    if is_cleaning_enabled(options, "clip_outliers"):
        cleaned_dataframe = clip_numeric_outliers(cleaned_dataframe, report)
    report["options"] = options or {}
    report["final_rows"] = int(len(cleaned_dataframe))
    return CleaningResult(dataframe=cleaned_dataframe, report=report)


def clean_and_save_dataframe(
    job_id: str,
    dataframe: pd.DataFrame,
    options: CleaningOptions | None = None,
) -> tuple[pd.DataFrame, dict[str, Any]]:
    """Clean, save a DataFrame to MinIO, and return data plus report."""
    result = clean_dataframe(dataframe, options)
    object_name = save_cleaned_dataframe(job_id, result.dataframe)
    result.report["cleaned_object_name"] = object_name
    return result.dataframe, result.report


def is_cleaning_enabled(options: CleaningOptions | None, action: str) -> bool:
    """Read and return whether a cleaning action is enabled."""
    return True if options is None else options.get(action, True)


def normalize_columns(dataframe: pd.DataFrame, report: dict[str, Any]) -> pd.DataFrame:
    """Normalize columns to snake_case and return the DataFrame."""
    renamed_columns = {column: to_snake_case(str(column)) for column in dataframe.columns}
    report["actions"].append({"action": "normalize_columns", "columns": renamed_columns})
    return dataframe.rename(columns=renamed_columns)


def parse_date_columns(dataframe: pd.DataFrame, report: dict[str, Any]) -> pd.DataFrame:
    """Parse date-like strings and return the DataFrame."""
    for column_name in dataframe.columns:
        if is_date_column(dataframe[column_name]):
            parsed_series = pd.to_datetime(dataframe[column_name], errors="coerce", format="mixed")
            parsed_count = int(parsed_series.notna().sum())
            dataframe[column_name] = parsed_series
            report["actions"].append(build_action("parse_dates", column_name, parsed_count))

    return dataframe


def fill_null_values(dataframe: pd.DataFrame, report: dict[str, Any]) -> pd.DataFrame:
    """Fill null values and return the DataFrame."""
    for column_name in dataframe.columns:
        null_count = int(dataframe[column_name].isna().sum())
        if null_count == 0:
            continue

        fill_value = build_fill_value(dataframe[column_name])
        dataframe[column_name] = dataframe[column_name].fillna(fill_value)
        report["actions"].append(build_action("fill_nulls", column_name, null_count))

    return dataframe


def build_fill_value(series: pd.Series) -> Any:
    """Build and return the null fill value for a column."""
    if is_numeric_column(series):
        return series.median()

    mode_values = series.mode(dropna=True)
    return mode_values.iloc[0] if not mode_values.empty else "missing"


def remove_duplicate_rows(dataframe: pd.DataFrame, report: dict[str, Any]) -> pd.DataFrame:
    """Remove exact duplicate rows and return the DataFrame."""
    duplicate_count = int(dataframe.duplicated().sum())
    report["actions"].append({"action": "remove_duplicates", "row_count": duplicate_count})
    return dataframe.drop_duplicates().reset_index(drop=True)


def clip_numeric_outliers(dataframe: pd.DataFrame, report: dict[str, Any]) -> pd.DataFrame:
    """Clip numeric outliers beyond three standard deviations and return data."""
    for column_name in dataframe.columns:
        if is_numeric_column(dataframe[column_name]):
            dataframe[column_name] = clip_column_outliers(dataframe[column_name], column_name, report)

    return dataframe


def clip_column_outliers(series: pd.Series, column_name: str, report: dict[str, Any]) -> pd.Series:
    """Clip a numeric column and return the clipped series."""
    standard_deviation = series.std()
    if pd.isna(standard_deviation) or standard_deviation == 0:
        return series

    lower_bound = series.mean() - OUTLIER_STD_MULTIPLIER * standard_deviation
    upper_bound = series.mean() + OUTLIER_STD_MULTIPLIER * standard_deviation
    outlier_count = int(((series < lower_bound) | (series > upper_bound)).sum())
    report["actions"].append(build_action("clip_outliers", column_name, outlier_count))
    return series.clip(lower=lower_bound, upper=upper_bound)


def save_cleaned_dataframe(job_id: str, dataframe: pd.DataFrame) -> str:
    """Save cleaned DataFrame as CSV to MinIO and return object key."""
    object_name = build_cleaned_object_name(job_id)
    with TemporaryDirectory() as temporary_directory:
        file_path = str(Path(temporary_directory) / "cleaned.csv")
        dataframe.to_csv(file_path, index=False)
        return save_object_file(object_name, file_path)


def to_snake_case(value: str) -> str:
    """Convert a column name to snake_case and return it."""
    normalized_value = re.sub(r"[^0-9a-zA-Z]+", "_", value.strip().lower())
    return re.sub(r"_+", "_", normalized_value).strip("_") or "column"


def build_action(action: str, column_name: str, row_count: int) -> dict[str, Any]:
    """Build and return one cleaning report action."""
    return {"action": action, "column": column_name, "row_count": row_count}
