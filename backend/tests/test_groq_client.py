import json

from app.services.groq_client import call_groq_insights


def test_call_groq_insights_parses_mocked_response(monkeypatch) -> None:
    """Assert the Groq client returns five validated business insights."""
    monkeypatch.setenv("GROQ_API_KEY", "test-groq-key")
    monkeypatch.setattr("app.services.groq_client.httpx.post", post_fake_response)
    insights = call_groq_insights("Analyze this data.", "You are an analyst.")
    assert len(insights) == 5
    assert insights[0].headline == "Revenue is concentrated"
    assert insights[0].type == "trend"


def post_fake_response(url, headers, json, timeout):
    """Return a successful mocked Groq response."""
    assert url == "https://api.groq.com/openai/v1/chat/completions"
    assert headers["Authorization"] == "Bearer test-groq-key"
    return FakeGroqResponse()


class FakeGroqResponse:
    """Represent a successful Groq API response."""

    def raise_for_status(self) -> None:
        """Return no content because the response is successful."""

    def json(self) -> dict:
        """Return a valid mocked chat completion payload."""
        return {
            "choices": [{"message": {"content": build_insight_json()}}],
            "usage": {"total_tokens": 42},
        }


def build_insight_json() -> str:
    """Build and return five JSON-encoded insights."""
    insights = [
        {"headline": "Revenue is concentrated", "body": "North leads revenue.", "type": "trend"},
        {"headline": "South is softer", "body": "South trails the sample.", "type": "warning"},
        {"headline": "Units align", "body": "Units move with revenue.", "type": "info"},
        {"headline": "Data is compact", "body": "The columns are consistent.", "type": "info"},
        {"headline": "Monitor mix", "body": "Track the regional mix.", "type": "trend"},
    ]
    return json.dumps(insights)
