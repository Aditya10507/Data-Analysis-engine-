from uuid import UUID
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User

SYSTEM_USER_EMAIL = "system@local.dev"
SYSTEM_USER_HASHED_PASSWORD = "system-user-no-login"


def ensure_user_record(db_session: Session, user_id: UUID) -> User:
    """Fetch or create a user record and return it."""
    user = db_session.get(User, user_id)

    if user:
        return user

    user = User(
        id=user_id,
        email=SYSTEM_USER_EMAIL,
        hashed_password=SYSTEM_USER_HASHED_PASSWORD,
    )
    db_session.add(user)
    db_session.flush()
    return user


def fetch_user_by_email(db_session: Session, email: str) -> User | None:
    """Fetch and return a user by email when present."""
    statement = select(User).where(User.email == email)
    return db_session.execute(statement).scalar_one_or_none()


def fetch_user_by_id(db_session: Session, user_id: UUID) -> User:
    """Fetch and return a user by ID."""
    user = db_session.get(User, user_id)

    if not user:
        raise KeyError(str(user_id))

    return user


def create_user_record(db_session: Session, email: str, hashed_password: str) -> User:
    """Create and return a persisted user record."""
    user = User(id=uuid4(), email=email, hashed_password=hashed_password)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
