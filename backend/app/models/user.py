from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

EMAIL_LENGTH = 320
HASHED_PASSWORD_LENGTH = 255


class User(Base):
    """Represent the persisted application user table."""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PostgresUUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(EMAIL_LENGTH), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(HASHED_PASSWORD_LENGTH), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
