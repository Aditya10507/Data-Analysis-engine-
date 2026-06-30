from sqlalchemy.orm import Session

from app.models.auth import AuthCredentials, TokenPair
from app.models.user_repository import (
    create_user_record,
    fetch_user_by_email,
    fetch_user_by_id,
)
from app.services.auth_token_service import consume_refresh_token, create_token_pair
from app.services.password_service import hash_password, verify_password


async def register_user(db_session: Session, credentials: AuthCredentials) -> TokenPair:
    """Register a user and return issued tokens."""
    if fetch_user_by_email(db_session, credentials.email):
        raise ValueError("An account with this email already exists.")

    user = create_user_record(
        db_session,
        credentials.email,
        hash_password(credentials.password),
    )
    return await create_token_pair(user)


async def login_user(db_session: Session, credentials: AuthCredentials) -> TokenPair:
    """Authenticate a user and return issued tokens."""
    user = fetch_user_by_email(db_session, credentials.email)

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise PermissionError("Email or password is incorrect.")

    return await create_token_pair(user)


async def refresh_user_tokens(db_session: Session, refresh_token: str) -> TokenPair:
    """Refresh tokens from a valid refresh token and return a new pair."""
    user_id = await consume_refresh_token(refresh_token)
    user = fetch_user_by_id(db_session, user_id)
    return await create_token_pair(user)
