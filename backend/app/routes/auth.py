import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from redis.exceptions import RedisError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db_session
from app.models.api import ApiEnvelope
from app.models.auth import AuthCredentials, RefreshTokenRequest, TokenPair
from app.services.auth_service import login_user, refresh_user_tokens, register_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=ApiEnvelope[TokenPair],
    description="Register a new user and return JWT access and refresh tokens.",
)
async def register(
    credentials: AuthCredentials,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[TokenPair]:
    """Register a user and return token envelope."""
    try:
        token_pair = await register_user(db_session, credentials)
        return ApiEnvelope(success=True, data=token_pair, error=None)
    except (ValueError, IntegrityError) as error:
        raise_auth_error(error, status.HTTP_409_CONFLICT, str(error))
    except (SQLAlchemyError, RedisError, ValidationError) as error:
        raise_auth_server_error(error)


@router.post(
    "/login",
    response_model=ApiEnvelope[TokenPair],
    description="Authenticate a user and return JWT access and refresh tokens.",
)
async def login(
    credentials: AuthCredentials,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[TokenPair]:
    """Authenticate a user and return token envelope."""
    try:
        token_pair = await login_user(db_session, credentials)
        return ApiEnvelope(success=True, data=token_pair, error=None)
    except PermissionError as error:
        raise_auth_error(error, status.HTTP_401_UNAUTHORIZED, str(error))
    except (SQLAlchemyError, RedisError, ValidationError) as error:
        raise_auth_server_error(error)


@router.post(
    "/refresh",
    response_model=ApiEnvelope[TokenPair],
    description="Refresh JWT access and refresh tokens from a valid refresh token.",
)
async def refresh(
    request: RefreshTokenRequest,
    db_session: Session = Depends(get_db_session),
) -> ApiEnvelope[TokenPair]:
    """Refresh tokens and return token envelope."""
    try:
        token_pair = await refresh_user_tokens(db_session, request.refresh_token)
        return ApiEnvelope(success=True, data=token_pair, error=None)
    except KeyError as error:
        raise_auth_error(error, status.HTTP_401_UNAUTHORIZED, "Refresh token is invalid.")
    except (SQLAlchemyError, RedisError, ValidationError) as error:
        raise_auth_server_error(error)


def raise_auth_error(error: Exception, status_code: int, detail: str) -> None:
    """Raise a typed authentication HTTP error."""
    logger.warning("Authentication request failed.")
    raise HTTPException(status_code=status_code, detail=detail) from error


def raise_auth_server_error(error: Exception) -> None:
    """Raise a typed authentication server HTTP error."""
    logger.exception("Authentication backend operation failed.")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Authentication backend operation failed.",
    ) from error
