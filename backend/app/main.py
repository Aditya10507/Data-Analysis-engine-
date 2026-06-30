from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import get_settings
from app.core.http_errors import build_http_exception_response
from app.core.logging import configure_json_logging
from app.core.rate_limit import build_rate_limit_response, create_rate_limiter
from app.middleware.auth import JwtAuthenticationMiddleware
from app.middleware.request_logging import RequestLoggingMiddleware
from app.routes.auth import router as auth_router
from app.routes.api import router as api_router
from app.routes.health import router as health_router

API_TITLE = "AI Data Analyst API"
API_VERSION = "0.1.0"
LOCAL_FRONTEND_ORIGINS = ["http://localhost", "http://localhost:5173", "http://127.0.0.1"]


def create_app() -> FastAPI:
    """Create and return the FastAPI application."""
    configure_json_logging()
    settings = get_settings()
    limiter = create_rate_limiter()
    app = FastAPI(title=API_TITLE, version=API_VERSION)
    app.state.limiter = limiter
    app.add_exception_handler(HTTPException, build_http_exception_response)
    app.add_exception_handler(RateLimitExceeded, build_rate_limit_response)
    app.add_middleware(JwtAuthenticationMiddleware, settings=settings)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=LOCAL_FRONTEND_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth_router)
    app.include_router(health_router)
    app.include_router(api_router)
    return app


app = create_app()
