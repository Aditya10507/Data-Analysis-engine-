import logging
import sys

import structlog

LOG_LEVEL = "INFO"


def configure_json_logging() -> None:
    """Configure structlog JSON logging and return no content."""
    logging.basicConfig(format="%(message)s", level=LOG_LEVEL, stream=sys.stdout)
    structlog.configure(
        cache_logger_on_first_use=True,
        logger_factory=structlog.stdlib.LoggerFactory(),
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
    )
