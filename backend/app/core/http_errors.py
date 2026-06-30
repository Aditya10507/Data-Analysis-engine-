from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse


def build_http_exception_response(
    request: Request,
    error: HTTPException,
) -> JSONResponse:
    """Build and return a shared envelope HTTP error response."""
    return JSONResponse(
        status_code=error.status_code,
        content={"success": False, "data": None, "error": str(error.detail)},
    )
