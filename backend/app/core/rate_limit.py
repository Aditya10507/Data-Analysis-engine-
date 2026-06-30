from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.requests import Request
from starlette.responses import JSONResponse

DEFAULT_RATE_LIMIT = "60/minute"
RATE_LIMIT_STATUS_CODE = 429


def create_rate_limiter() -> Limiter:
    """Create and return the shared request rate limiter."""
    return Limiter(key_func=get_remote_address, default_limits=[DEFAULT_RATE_LIMIT])


def build_rate_limit_response(
    request: Request,
    error: RateLimitExceeded,
) -> JSONResponse:
    """Build and return a shared envelope rate-limit response."""
    return JSONResponse(
        status_code=RATE_LIMIT_STATUS_CODE,
        content={"success": False, "data": None, "error": str(error.detail)},
    )
