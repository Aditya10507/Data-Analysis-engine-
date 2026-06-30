from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.core.database import Base
from app.models import job, user  # noqa: F401

config = context.config
target_metadata = Base.metadata

if config.config_file_name:
    fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    """Run Alembic migrations without a live database connection."""
    context.configure(
        literal_binds=True,
        target_metadata=target_metadata,
        url=get_settings().database_url,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run Alembic migrations with a live database connection."""
    config_section = config.get_section(config.config_ini_section) or {}
    config_section["sqlalchemy.url"] = get_settings().database_url
    connectable = engine_from_config(
        config_section,
        poolclass=pool.NullPool,
        prefix="sqlalchemy.",
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
