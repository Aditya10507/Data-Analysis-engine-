from pydantic import BaseModel


class RouteStatus(BaseModel):
    """Represent a stub route readiness payload."""

    route: str
    status: str
