from collections.abc import Sequence

from alembic import op

revision: str = "202607070001"
down_revision: str | None = "202606280001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add reviewing status to the job_status enum."""
    op.execute("ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'reviewing'")


def downgrade() -> None:
    """Leave reviewing status in place because PostgreSQL cannot drop enum values safely."""
    pass
