import hashlib

JOB_RESULT_KEY_TEMPLATE = "job:{job_id}:result"
INSIGHT_KEY_TEMPLATE = "job:{job_id}:insight:{prompt_hash}"
INSIGHT_PATTERN_TEMPLATE = "job:{job_id}:insight:*"
SSE_STATE_KEY_TEMPLATE = "sse:insights:{connection_id}"


def build_job_result_key(job_id: str) -> str:
    """Build and return the Redis key for a completed job result."""
    return JOB_RESULT_KEY_TEMPLATE.format(job_id=job_id)


def build_insight_key(job_id: str, prompt_hash: str) -> str:
    """Build and return the Redis key for cached insight output."""
    return INSIGHT_KEY_TEMPLATE.format(job_id=job_id, prompt_hash=prompt_hash)


def build_insight_pattern(job_id: str) -> str:
    """Build and return the Redis key pattern for job insight caches."""
    return INSIGHT_PATTERN_TEMPLATE.format(job_id=job_id)


def build_sse_state_key(connection_id: str) -> str:
    """Build and return the Redis key for an SSE connection state."""
    return SSE_STATE_KEY_TEMPLATE.format(connection_id=connection_id)


def hash_prompt(prompt: str) -> str:
    """Hash an insight prompt and return a stable cache key fragment."""
    return hashlib.sha256(prompt.encode("utf-8")).hexdigest()
