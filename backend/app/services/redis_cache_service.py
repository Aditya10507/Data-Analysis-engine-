import json
import logging
from typing import Any

from redis import Redis, asyncio as aioredis
from redis.exceptions import RedisError

from app.core.config import get_settings
from app.services.cache_key_service import (
    build_insight_key,
    build_insight_pattern,
    build_job_result_key,
    build_sse_state_key,
)

JOB_RESULT_TTL_SECONDS = 60 * 60
INSIGHT_TTL_SECONDS = 30 * 60
SSE_STATE_TTL_SECONDS = 60 * 60

logger = logging.getLogger(__name__)


def create_sync_redis_client() -> Redis:
    """Create and return a synchronous Redis client."""
    return Redis.from_url(get_settings().redis_url, decode_responses=True)


def create_async_redis_client() -> aioredis.Redis:
    """Create and return an aioredis-compatible Redis client."""
    return aioredis.from_url(get_settings().redis_url, decode_responses=True)


async def get_cached_job_result(job_id: str) -> dict[str, Any] | None:
    """Fetch and return a cached completed job result."""
    return await get_cached_json(build_job_result_key(job_id))


async def set_cached_job_result(job_id: str, result_json: dict[str, Any]) -> None:
    """Cache a completed job result and return no content."""
    await set_cached_json(build_job_result_key(job_id), result_json, JOB_RESULT_TTL_SECONDS)


async def get_cached_insights(job_id: str, prompt_hash: str) -> dict[str, Any] | None:
    """Fetch and return cached insight output for a prompt hash."""
    return await get_cached_json(build_insight_key(job_id, prompt_hash))


async def set_cached_insights(job_id: str, prompt_hash: str, insights: dict[str, Any]) -> None:
    """Cache insight output for a prompt hash and return no content."""
    await set_cached_json(build_insight_key(job_id, prompt_hash), insights, INSIGHT_TTL_SECONDS)


async def set_sse_state(connection_id: str, state: dict[str, Any]) -> None:
    """Store SSE connection state in Redis and return no content."""
    await set_cached_json(build_sse_state_key(connection_id), state, SSE_STATE_TTL_SECONDS)


async def get_cached_json(key: str) -> dict[str, Any] | None:
    """Fetch and return a JSON Redis value."""
    client = create_async_redis_client()
    try:
        cached_value = await client.get(key)
        return json.loads(cached_value) if cached_value else None
    except (RedisError, json.JSONDecodeError):
        logger.exception("Redis cache read failed for key %s.", key)
        return None
    finally:
        await client.aclose()


async def set_cached_json(key: str, value: dict[str, Any], ttl_seconds: int) -> None:
    """Store a JSON Redis value and return no content."""
    client = create_async_redis_client()
    try:
        await client.set(key, json.dumps(value, default=str), ex=ttl_seconds)
    except (RedisError, TypeError):
        logger.exception("Redis cache write failed for key %s.", key)
    finally:
        await client.aclose()


def set_cached_job_result_sync(job_id: str, result_json: dict[str, Any]) -> None:
    """Cache a completed job result from sync code and return no content."""
    set_cached_json_sync(build_job_result_key(job_id), result_json, JOB_RESULT_TTL_SECONDS)


def invalidate_job_cache_sync(job_id: str) -> None:
    """Invalidate cached job and insight data from sync code."""
    client = create_sync_redis_client()
    try:
        client.delete(build_job_result_key(job_id))
        delete_pattern_sync(client, build_insight_pattern(job_id))
    except RedisError:
        logger.exception("Redis cache invalidation failed for job %s.", job_id)
    finally:
        client.close()


def set_cached_json_sync(key: str, value: dict[str, Any], ttl_seconds: int) -> None:
    """Store a JSON Redis value from sync code and return no content."""
    client = create_sync_redis_client()
    try:
        client.set(key, json.dumps(value, default=str), ex=ttl_seconds)
    except (RedisError, TypeError):
        logger.exception("Redis cache write failed for key %s.", key)
    finally:
        client.close()


def delete_pattern_sync(client: Redis, pattern: str) -> None:
    """Delete matching Redis keys from sync code and return no content."""
    for key in client.scan_iter(pattern):
        client.delete(key)
