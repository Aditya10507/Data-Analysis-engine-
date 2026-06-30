from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe
from uuid import UUID

import jwt

from app.core.config import get_settings
from app.models.auth import TokenPair
from app.models.user import User
from app.services.redis_cache_service import create_async_redis_client

ACCESS_TOKEN_TTL_MINUTES = 15
REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60
REFRESH_TOKEN_BYTES = 48


def build_refresh_key(refresh_token: str) -> str:
    """Build and return the Redis refresh token key."""
    return f"refresh:{refresh_token}"


def create_access_token(user: User) -> str:
    """Create and return a signed JWT access token."""
    settings = get_settings()
    expires_at = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_TTL_MINUTES)
    payload = {"email": user.email, "exp": expires_at, "sub": str(user.id)}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


async def create_token_pair(user: User) -> TokenPair:
    """Create, persist, and return an access and refresh token pair."""
    refresh_token = token_urlsafe(REFRESH_TOKEN_BYTES)
    await store_refresh_token(refresh_token, user.id)
    return TokenPair(access_token=create_access_token(user), refresh_token=refresh_token)


async def store_refresh_token(refresh_token: str, user_id: UUID) -> None:
    """Store a refresh token in Redis and return no content."""
    redis_client = create_async_redis_client()
    try:
        await redis_client.set(
            build_refresh_key(refresh_token),
            str(user_id),
            ex=REFRESH_TOKEN_TTL_SECONDS,
        )
    finally:
        await redis_client.aclose()


async def consume_refresh_token(refresh_token: str) -> UUID:
    """Consume a refresh token from Redis and return its user ID."""
    redis_client = create_async_redis_client()
    try:
        user_id = await redis_client.get(build_refresh_key(refresh_token))
        if not user_id:
            raise KeyError("Refresh token was not found.")

        await redis_client.delete(build_refresh_key(refresh_token))
        return UUID(user_id)
    finally:
        await redis_client.aclose()
