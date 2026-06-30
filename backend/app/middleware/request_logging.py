from time import perf_counter

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

UNKNOWN_USER_ID = "anonymous"

logger = structlog.get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log each HTTP request with structured JSON fields."""

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """Log the request outcome and return the downstream response."""
        start_time = perf_counter()
        try:
            response = await call_next(request)
            log_request(request, response.status_code, start_time)
            return response
        except Exception:
            log_request(request, 500, start_time)
            raise


def calculate_duration_ms(start_time: float) -> float:
    """Calculate and return elapsed request time in milliseconds."""
    return round((perf_counter() - start_time) * 1000, 3)


def get_request_user_id(request: Request) -> str:
    """Read and return the request user identifier."""
    return str(getattr(request.state, "user_id", UNKNOWN_USER_ID))


def log_request(request: Request, status_code: int, start_time: float) -> None:
    """Log one HTTP request outcome and return no content."""
    logger.info(
        "http_request",
        duration_ms=calculate_duration_ms(start_time),
        method=request.method,
        path=request.url.path,
        status_code=status_code,
        user_id=get_request_user_id(request),
    )
