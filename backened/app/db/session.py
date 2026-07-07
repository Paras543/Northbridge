"""
Async engine + session factory, pointed at Neon via DATABASE_URL.

Neon is serverless Postgres — the connection string is the only thing
that differs from a local Postgres setup. Everything else (models,
migrations, session handling) is standard SQLAlchemy async.
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.config import settings


def _normalize_neon_url(url: str) -> str:
    """
    Neon's dashboard gives you a libpq-style string with `sslmode=require`.
    asyncpg doesn't understand `sslmode` as a URL query param — it needs
    `ssl=require` instead (or SSL passed via connect_args). This swaps it
    so you can paste the Neon string directly into DATABASE_URL as-is.
    """
    url = url.replace("sslmode=require", "ssl=require")
    url = url.replace("&channel_binding=require", "")
    return url





engine = create_async_engine(
    _normalize_neon_url(settings.DATABASE_URL),
    pool_pre_ping=True,  # important for serverless DBs: connections can be recycled/dropped when idle
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """FastAPI dependency — yields a session per request."""
    async with AsyncSessionLocal() as session:
        yield session

