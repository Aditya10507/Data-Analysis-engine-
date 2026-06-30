from app.services.grok_client import call_grok_insights


def test_call_grok_insights_parses_mocked_xai_response(monkeypatch) -> None:
    """Assert Grok client parses a mocked xAI API response into insights."""
    monkeypatch.setattr("app.services.grok_client.httpx.post", post_fake_grok_response)
    insights = call_grok_insights("Analyze this data.", "You are an analyst.")
    assert len(insights) == 5
    assert insights[0].headline == "Revenue is concentrated"
    assert insights[0].type == "trend"


def post_fake_grok_response(url, headers, json, timeout):
    """Return a fake successful Grok response."""
    assert headers["Authorization"] == "Bearer test-xai-key"
    return FakeGrokResponse()


class FakeGrokResponse:
    """Represent a mocked Grok HTTP response."""

    def raise_for_status(self) -> None:
        """Return no content for a successful response."""

    def json(self) -> dict:
        """Return a mocked Grok chat completion payload."""
        return {
            "choices": [{"message": {"content": build_insight_json()}}],
            "usage": {"total_tokens": 42},
        }


def build_insight_json() -> str:
    """Build and return a JSON insight list."""
    return str([
        {"headline": "Revenue is concentrated", "body": "North leads total revenue.", "type": "trend"},
        {"headline": "South is softer", "body": "South trails the sample.", "type": "warning"},
        {"headline": "Units align", "body": "Units move with revenue.", "type": "info"},
        {"headline": "CSV is compact", "body": "The dataset has clear columns.", "type": "info"},
        {"headline": "Monitor mix", "body": "Regional mix should be tracked.", "type": "trend"},
    ]).replace("'", '"')
