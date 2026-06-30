import bcrypt

TEXT_ENCODING = "utf-8"


def hash_password(password: str) -> str:
    """Hash a plain password with bcrypt and return the encoded hash."""
    password_bytes = password.encode(TEXT_ENCODING)
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode(TEXT_ENCODING)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash and return the result."""
    password_bytes = password.encode(TEXT_ENCODING)
    hashed_bytes = hashed_password.encode(TEXT_ENCODING)
    return bcrypt.checkpw(password_bytes, hashed_bytes)
