from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_ENV_FILE = ".env"


class Settings(BaseSettings):
    """Load and return application settings from environment variables."""

    database_url: str = Field(alias="DATABASE_URL")
    async_database_url: str | None = Field(default=None, alias="ASYNC_DATABASE_URL")
    redis_url: str = Field(alias="REDIS_URL")
    s3_endpoint: str = Field(alias="S3_ENDPOINT")
    s3_bucket: str = Field(alias="S3_BUCKET")
    s3_access_key: str = Field(alias="S3_ACCESS_KEY")
    s3_secret_key: str = Field(alias="S3_SECRET_KEY")
    groq_api_key: str | None = Field(default=None, alias="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.1-8b-instant", alias="GROQ_MODEL")
    jwt_secret_key: str = Field(alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")

    model_config = SettingsConfigDict(env_file=DEFAULT_ENV_FILE)


def get_settings() -> Settings:
    """Load and return validated application settings."""
    return Settings()
