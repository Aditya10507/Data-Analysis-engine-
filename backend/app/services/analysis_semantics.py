from typing import Literal

import pandas as pd

DATE_SAMPLE_SIZE = 1000
DATE_PARSE_THRESHOLD = 0.8
CATEGORY_UNIQUE_LIMIT = 50
CATEGORY_RATIO_LIMIT = 0.05
ID_RATIO_LIMIT = 0.95

SemanticType = Literal["id", "date", "category", "continuous", "boolean"]


def detect_semantic_type(
    column_name: str,
    series: pd.Series,
    unique_count: int,
    row_count: int,
) -> SemanticType:
    """Detect and return the semantic type for a column."""
    if is_boolean_column(series, unique_count):
        return "boolean"

    if is_date_column(series):
        return "date"

    if is_id_column(column_name, unique_count, row_count):
        return "id"

    if is_category_column(unique_count, row_count):
        return "category"

    return "continuous" if is_numeric_column(series) else "category"


def is_category_column(unique_count: int, row_count: int) -> bool:
    """Return whether a column is semantically categorical."""
    unique_ratio = unique_count / row_count if row_count else 0
    return unique_count <= CATEGORY_UNIQUE_LIMIT or unique_ratio <= CATEGORY_RATIO_LIMIT


def is_boolean_column(series: pd.Series, unique_count: int) -> bool:
    """Return whether a column is semantically boolean."""
    if pd.api.types.is_bool_dtype(series):
        return True

    values = set(series.dropna().astype(str).str.lower().unique())
    return unique_count <= 2 and values.issubset({"true", "false", "0", "1", "yes", "no"})


def is_date_column(series: pd.Series) -> bool:
    """Return whether a column is semantically date-like."""
    if pd.api.types.is_datetime64_any_dtype(series):
        return True

    sample = series.dropna().head(DATE_SAMPLE_SIZE)
    if sample.empty or is_numeric_column(series):
        return False

    parsed_dates = pd.to_datetime(sample, errors="coerce", format="mixed")
    return parsed_dates.notna().mean() >= DATE_PARSE_THRESHOLD


def is_id_column(column_name: str, unique_count: int, row_count: int) -> bool:
    """Return whether a column is semantically identifier-like."""
    unique_ratio = unique_count / row_count if row_count else 0
    return column_name.lower().endswith("id") or unique_ratio >= ID_RATIO_LIMIT


def is_numeric_column(series: pd.Series) -> bool:
    """Return whether a column should receive numeric analysis."""
    return pd.api.types.is_numeric_dtype(series) and not pd.api.types.is_bool_dtype(series)
