from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202606280001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

JOB_STATUS_ENUM_NAME = "job_status"


def upgrade() -> None:
    """Create users and jobs schema objects."""
    job_status = build_job_status_enum()
    job_status.create(op.get_bind(), checkfirst=True)
    create_users_table()
    create_jobs_table(build_job_status_enum(create_type=False))
    create_jobs_user_created_index()


def downgrade() -> None:
    """Drop users and jobs schema objects."""
    op.drop_index("ix_jobs_user_id_created_at", table_name="jobs")
    op.drop_table("jobs")
    op.drop_table("users")
    build_job_status_enum().drop(op.get_bind(), checkfirst=True)


def build_job_status_enum(create_type: bool = True) -> postgresql.ENUM:
    """Build and return the PostgreSQL job status enum."""
    return postgresql.ENUM(
        "queued",
        "processing",
        "done",
        "failed",
        create_type=create_type,
        name=JOB_STATUS_ENUM_NAME,
    )


def create_users_table() -> None:
    """Create the users table and return no content."""
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )


def create_jobs_table(job_status: postgresql.ENUM) -> None:
    """Create the jobs table and return no content."""
    op.create_table(
        "jobs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("original_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("status", job_status, nullable=False),
        sa.Column("result_json", postgresql.JSONB(), nullable=True),
        sa.Column("error_msg", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_jobs_user_id_users"),
    )


def create_jobs_user_created_index() -> None:
    """Create the jobs user and descending created timestamp index."""
    op.create_index(
        "ix_jobs_user_id_created_at",
        "jobs",
        ["user_id", sa.text("created_at DESC")],
    )
