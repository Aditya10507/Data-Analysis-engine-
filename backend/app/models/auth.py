from pydantic import BaseModel, EmailStr, Field

MIN_PASSWORD_LENGTH = 8


class AuthCredentials(BaseModel):
    """Represent email and password authentication input."""

    email: EmailStr
    password: str = Field(min_length=MIN_PASSWORD_LENGTH)


class RefreshTokenRequest(BaseModel):
    """Represent refresh-token authentication input."""

    refresh_token: str


class TokenPair(BaseModel):
    """Represent issued access and refresh tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
