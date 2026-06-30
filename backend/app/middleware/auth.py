import logging
from typing import Any

import jwt
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response

from app.core.config import Settings

AUTH_HEADER_PREFIX = "Bearer "
PROTECTED_PATH_PREFIX = "/api/v1"

logger = logging.getLogger(__name__)


class JwtAuthenticationMiddleware(BaseHTTPMiddleware):
    """Authenticate protected API requests with JWT bearer tokens."""

    def __init__(self, app, settings: Settings) -> None:
        """Initialize and return the JWT authentication middleware."""
        super().__init__(app)
        self.settings = settings

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        """Authenticate the request and return the downstream response."""
        try:
            if request.url.path.startswith(PROTECTED_PATH_PREFIX):
                self.authenticate_request(request)
            return await call_next(request)
        except HTTPException as error:
            logger.warning("JWT authentication rejected a request.")
            return self.build_error_response(error)
        except RuntimeError as error:
            logger.exception("JWT middleware failed during request handling.")
            return self.build_error_response(
                HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Authentication middleware failed.",
                )
            )

    def authenticate_request(self, request: Request) -> None:
        """Validate the JWT bearer token and return no content."""
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith(AUTH_HEADER_PREFIX):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing bearer token.",
            )

        token = auth_header.removeprefix(AUTH_HEADER_PREFIX)
        payload = self.decode_token(token)
        request.state.user_id = payload.get("sub", "anonymous")

    def decode_token(self, token: str) -> dict[str, Any]:
        """Decode the JWT token and return its claims."""
        try:
            return jwt.decode(
                token,
                self.settings.jwt_secret_key,
                algorithms=[self.settings.jwt_algorithm],
            )
        except jwt.PyJWTError as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid bearer token.",
            ) from error

    def build_error_response(self, error: HTTPException) -> JSONResponse:
        """Build and return an API envelope error response."""
        return JSONResponse(
            status_code=error.status_code,
            content={"success": False, "data": None, "error": error.detail},
        )
