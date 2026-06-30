from app.models.health import HealthStatus

SERVICE_NAME = "ai-data-analyst-api"
STATUS_READY = "ready"


def fetch_health_status() -> HealthStatus:
    """Fetch and return the current API health status."""
    return HealthStatus(status=STATUS_READY, service=SERVICE_NAME)
