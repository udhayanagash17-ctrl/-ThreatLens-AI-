import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "ThreatLens AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = os.getenv("SECRET_KEY", "threatlens-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./threatlens.db")
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    AI_ENABLED: bool = os.getenv("AI_ENABLED", "true").lower() == "true"
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-3.5-turbo")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
