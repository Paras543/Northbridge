"""
Central app settings, loaded from environment variables.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Neon connection string, e.g.:
    # postgresql+asyncpg://<user>:<password>@<neon-host>/<db>?ssl=require
    DATABASE_URL: str

    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()


