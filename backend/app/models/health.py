from pydantic import BaseModel


class HealthStatus(BaseModel):
    """Represent service health details for clients."""

    status: str
    service: str
