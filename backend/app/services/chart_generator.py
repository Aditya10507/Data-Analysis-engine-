import json
from io import BytesIO
from typing import Any

import matplotlib
import pandas as pd
import plotly.graph_objects as go

from app.services.cleaning_service import to_snake_case
from app.services.storage_service import build_chart_object_name, save_object_bytes

matplotlib.use("Agg")

import matplotlib.pyplot as plt

HISTOGRAM_BIN_COUNT = 20
THUMBNAIL_DPI = 100
THUMBNAIL_HEIGHT_INCHES = 1.5
THUMBNAIL_WIDTH_INCHES = 2


def generate_chart_specs(job_id: str, dataframe: pd.DataFrame) -> dict[str, Any]:
    """Generate chart specs, save thumbnails, and return chart metadata."""
    numeric_dataframe = dataframe.select_dtypes(include=["number"])
    histograms = build_histogram_specs(job_id, numeric_dataframe)
    return {
        "correlation_heatmap": build_correlation_heatmap(numeric_dataframe),
        "histograms": histograms,
    }


def build_histogram_specs(job_id: str, dataframe: pd.DataFrame) -> dict[str, Any]:
    """Build and return histogram specs for numeric columns."""
    return {
        str(column_name): build_histogram_spec(job_id, str(column_name), dataframe[column_name])
        for column_name in dataframe.columns
    }


def build_histogram_spec(job_id: str, column_name: str, series: pd.Series) -> dict[str, Any]:
    """Build and return one histogram chart spec."""
    clean_series = pd.to_numeric(series, errors="coerce").dropna()
    thumbnail_object_name = save_histogram_thumbnail(job_id, column_name, clean_series)
    return {
        "plotly_json": build_plotly_histogram(column_name, clean_series),
        "thumbnail_object_name": thumbnail_object_name,
    }


def build_plotly_histogram(column_name: str, series: pd.Series) -> dict[str, Any]:
    """Build and return a Plotly histogram JSON spec."""
    figure = go.Figure(data=[go.Histogram(x=series.tolist(), nbinsx=HISTOGRAM_BIN_COUNT)])
    figure.update_layout(title=f"{column_name} distribution", bargap=0.05)
    return json.loads(figure.to_json())


def save_histogram_thumbnail(job_id: str, column_name: str, series: pd.Series) -> str:
    """Render, save, and return the histogram thumbnail object key."""
    figure, axis = plt.subplots(
        figsize=(THUMBNAIL_WIDTH_INCHES, THUMBNAIL_HEIGHT_INCHES),
        dpi=THUMBNAIL_DPI,
    )
    axis.hist(series.tolist(), bins=HISTOGRAM_BIN_COUNT, color="#2563eb")
    axis.set_title(column_name, fontsize=8)
    axis.tick_params(axis="both", labelsize=6)
    figure.tight_layout(pad=0.3)
    return save_thumbnail_figure(job_id, column_name, figure)


def save_thumbnail_figure(job_id: str, column_name: str, figure) -> str:
    """Save a Matplotlib figure to MinIO and return its object key."""
    image_buffer = BytesIO()
    figure.savefig(image_buffer, format="png")
    plt.close(figure)
    object_name = build_chart_object_name(job_id, to_snake_case(column_name))
    return save_object_bytes(object_name, image_buffer.getvalue())


def build_correlation_heatmap(dataframe: pd.DataFrame) -> dict[str, Any] | None:
    """Build and return a Plotly correlation heatmap JSON spec."""
    if dataframe.empty:
        return None

    correlation = dataframe.corr().fillna(0)
    figure = go.Figure(
        data=[
            go.Heatmap(
                colorscale="RdBu",
                x=list(correlation.columns),
                y=list(correlation.index),
                z=correlation.values.tolist(),
                zmax=1,
                zmin=-1,
            )
        ]
    )
    figure.update_layout(title="Correlation matrix")
    return json.loads(figure.to_json())
