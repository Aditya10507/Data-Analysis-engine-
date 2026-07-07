from typing import Any

import pandas as pd

from app.models.cleaning_review import CleaningReviewPlan
from app.services.analysis_semantics import is_date_column, is_numeric_column

OUTLIER_STD_MULTIPLIER = 3


def build_cleaning_review_plan(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Inspect a DataFrame and return proposed cleaning actions."""
    plan = CleaningReviewPlan(
        actions=[
            build_null_action(dataframe),
            build_duplicate_action(dataframe),
            build_outlier_action(dataframe),
            build_date_action(dataframe),
        ],
        initial_rows=int(len(dataframe)),
    )
    return plan.model_dump()


def build_null_action(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Build and return the proposed null-filling action."""
    null_counts = dataframe.isna().sum()
    affected_columns = int((null_counts > 0).sum())
    affected_rows = int(dataframe.isna().any(axis=1).sum())
    return {
        "action": "fill_nulls",
        "column_count": affected_columns,
        "description": "Fill missing numeric values with median and text values with mode.",
        "is_enabled": affected_rows > 0,
        "label": "Fill null values",
        "row_count": affected_rows,
    }


def build_duplicate_action(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Build and return the proposed duplicate-removal action."""
    duplicate_count = int(dataframe.duplicated().sum())
    return {
        "action": "remove_duplicates",
        "column_count": int(len(dataframe.columns)),
        "description": "Remove exact duplicate rows before profiling and insight generation.",
        "is_enabled": duplicate_count > 0,
        "label": "Remove duplicate rows",
        "row_count": duplicate_count,
    }


def build_outlier_action(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Build and return the proposed outlier-clipping action."""
    outlier_counts = [count_column_outliers(dataframe[column_name]) for column_name in dataframe.columns]
    affected_columns = sum(1 for count in outlier_counts if count > 0)
    return {
        "action": "clip_outliers",
        "column_count": affected_columns,
        "description": "Clip numeric values outside three standard deviations.",
        "is_enabled": affected_columns > 0,
        "label": "Clip numeric outliers",
        "row_count": int(sum(outlier_counts)),
    }


def build_date_action(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Build and return the proposed date-parsing action."""
    date_columns = [column_name for column_name in dataframe.columns if is_date_column(dataframe[column_name])]
    parsed_rows = sum(count_parseable_dates(dataframe[column_name]) for column_name in date_columns)
    return {
        "action": "parse_dates",
        "column_count": len(date_columns),
        "description": "Convert date-like text columns into real date values.",
        "is_enabled": len(date_columns) > 0,
        "label": "Parse date columns",
        "row_count": int(parsed_rows),
    }


def count_column_outliers(series: pd.Series) -> int:
    """Count and return values outside three standard deviations."""
    if not is_numeric_column(series):
        return 0

    standard_deviation = series.std()
    if pd.isna(standard_deviation) or standard_deviation == 0:
        return 0

    lower_bound = series.mean() - OUTLIER_STD_MULTIPLIER * standard_deviation
    upper_bound = series.mean() + OUTLIER_STD_MULTIPLIER * standard_deviation
    return int(((series < lower_bound) | (series > upper_bound)).sum())


def count_parseable_dates(series: pd.Series) -> int:
    """Count and return parseable date values in a series."""
    parsed_series = pd.to_datetime(series, errors="coerce", format="mixed")
    return int(parsed_series.notna().sum())
