from typing import Any

import numpy as np
import pandas as pd

from app.services.analysis_semantics import detect_semantic_type, is_numeric_column

HISTOGRAM_BIN_COUNT = 20
PERCENT_MULTIPLIER = 100


def analyze_dataframe(dataframe: pd.DataFrame) -> dict[str, Any]:
    """Analyze a DataFrame and return column stats plus correlations."""
    null_counts = dataframe.isna().sum()
    unique_counts = dataframe.nunique(dropna=True)
    numeric_dataframe = dataframe.select_dtypes(include=["number"])
    return {
        "column_count": int(dataframe.shape[1]),
        "columns": build_column_stats(dataframe, null_counts, unique_counts),
        "correlation_matrix": build_correlation_matrix(numeric_dataframe),
        "row_count": int(dataframe.shape[0]),
    }


def build_column_stats(
    dataframe: pd.DataFrame,
    null_counts: pd.Series,
    unique_counts: pd.Series,
) -> dict[str, dict[str, Any]]:
    """Build and return stats for every column."""
    stats_by_column: dict[str, dict[str, Any]] = {}

    for column_name in dataframe.columns:
        series = dataframe[column_name]
        stats_by_column[str(column_name)] = build_single_column_stats(
            str(column_name),
            series,
            int(null_counts[column_name]),
            int(unique_counts[column_name]),
            len(dataframe),
        )

    return stats_by_column


def build_single_column_stats(
    column_name: str,
    series: pd.Series,
    null_count: int,
    unique_count: int,
    row_count: int,
) -> dict[str, Any]:
    """Build and return stats for one column."""
    numeric_series = pd.to_numeric(series, errors="coerce")
    is_numeric = is_numeric_column(series)
    return {
        "dtype": str(series.dtype),
        "histogram": build_histogram(numeric_series) if is_numeric else None,
        "null_count": null_count,
        "null_percent": calculate_percent(null_count, row_count),
        "numeric": build_numeric_stats(numeric_series) if is_numeric else None,
        "semantic_type": detect_semantic_type(column_name, series, unique_count, row_count),
        "top_values": build_top_values(series),
        "unique_count": unique_count,
    }


def calculate_percent(value: int, total: int) -> float:
    """Calculate and return a rounded percentage."""
    return round((value / total) * PERCENT_MULTIPLIER, 4) if total else 0.0

def build_top_values(series: pd.Series) -> list[dict[str, Any]]:
    """Build and return the top five non-null values and counts."""
    value_counts = series.dropna().value_counts().head(5)
    return [
        {"count": int(count), "value": normalize_value(value)}
        for value, count in value_counts.items()
    ]

def build_numeric_stats(numeric_series: pd.Series) -> dict[str, float | None]:
    """Build and return numeric summary stats."""
    clean_series = numeric_series.dropna()

    if clean_series.empty:
        return {"max": None, "mean": None, "min": None, "std": None}

    return {
        "max": normalize_number(clean_series.max()),
        "mean": normalize_number(clean_series.mean()),
        "min": normalize_number(clean_series.min()),
        "std": normalize_number(clean_series.std()),
    }

def build_histogram(numeric_series: pd.Series) -> dict[str, list[float] | list[int]]:
    """Build and return a 20-bin histogram for numeric data."""
    clean_values = numeric_series.dropna().to_numpy()

    if clean_values.size == 0:
        return {"bin_edges": [], "counts": []}

    counts, bin_edges = np.histogram(clean_values, bins=HISTOGRAM_BIN_COUNT)
    return {
        "bin_edges": [normalize_number(value) for value in bin_edges],
        "counts": [int(value) for value in counts],
    }

def build_correlation_matrix(numeric_dataframe: pd.DataFrame) -> dict[str, dict[str, float]]:
    """Build and return the full numeric correlation matrix."""
    if numeric_dataframe.empty:
        return {}

    correlation = numeric_dataframe.corr().replace([np.inf, -np.inf], np.nan).fillna(0)
    return {
        str(column_name): {
            str(index_name): normalize_number(value)
            for index_name, value in correlation[column_name].items()
        }
        for column_name in correlation.columns
    }

def normalize_value(value: Any) -> Any:
    """Normalize scalar values and return JSON-friendly output."""
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    return value.item() if hasattr(value, "item") else value

def normalize_number(value: Any) -> float:
    """Normalize numeric values and return a Python float."""
    return round(float(value), 6)
