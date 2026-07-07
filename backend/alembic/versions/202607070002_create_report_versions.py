from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "202607070002"
down_revision: str | None = "202607070001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the report_versions table."""
    op.create_table(
        "report_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("result_json", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"], name="fk_report_versions_job_id_jobs"),
        sa.UniqueConstraint("job_id", "version_number", name="uq_report_versions_job_version"),
    )
    op.create_index("ix_report_versions_job_created_at", "report_versions", ["job_id", sa.text("created_at DESC")])


def downgrade() -> None:
    """Drop the report_versions table."""
    op.drop_index("ix_report_versions_job_created_at", table_name="report_versions")
    op.drop_table("report_versions")
