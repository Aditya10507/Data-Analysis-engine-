from app.models.route_status import RouteStatus

STATUS_READY = "stub-ready"


def build_route_status(route: str) -> RouteStatus:
    """Build and return a readiness payload for a stub route."""
    return RouteStatus(route=route, status=STATUS_READY)
