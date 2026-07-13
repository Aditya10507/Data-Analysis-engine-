from types import SimpleNamespace

import pandas as pd

from app.services.file_processing_service import process_job_file


def test_process_job_file_uses_dataframe_pipeline(monkeypatch) -> None:
    """Assert file processing builds a complete response from a real DataFrame."""
    dataframe = pd.DataFrame({"region": ["North", "South"], "revenue": [1200, 900]})
    monkeypatch.setattr("app.services.file_processing_service.read_job_dataframe", lambda job: dataframe)
    monkeypatch.setattr("app.services.file_processing_service.analyze_dataframe", build_stats)
    monkeypatch.setattr("app.services.file_processing_service.clean_and_save_dataframe", clean_dataframe)
    monkeypatch.setattr("app.services.file_processing_service.generate_chart_specs", build_charts)
    monkeypatch.setattr("app.services.file_processing_service.generate_insights", build_insights)
    monkeypatch.setattr("app.services.response_builder.create_presigned_get_url", lambda name, expiry: f"http://minio/{name}")
    job = SimpleNamespace(id="job-123", filename="sales.csv", result_json={})
    result = process_job_file(job)
    assert result["shape"] == [2, 2]
    assert result["preview"][0]["region"] == "North"
    assert len(result["insights"]) == 1


def build_stats(dataframe: pd.DataFrame) -> dict:
    """Build and return minimal stats for response construction."""
    return {"columns": {"region": {"dtype": "object"}, "revenue": {"dtype": "int64"}}}


def clean_dataframe(job_id: str, dataframe: pd.DataFrame, options: dict[str, bool]):
    """Return a cleaned DataFrame and report."""
    assert options == {}
    return dataframe, {"actions": [{"action": "none", "row_count": len(dataframe)}]}


def build_charts(job_id: str, dataframe: pd.DataFrame) -> dict:
    """Build and return minimal chart metadata."""
    return {"histograms": {}, "correlation_heatmap": None}


def build_insights(context):
    """Build and return fake insight model output."""
    return SimpleNamespace(model_dump=lambda: {"insights": [{"headline": "Revenue", "body": "North leads.", "type": "trend"}]})
