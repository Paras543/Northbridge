"""
Persistent, Postgres-backed async checkpointer.

Replaces InMemorySaver and the sync PostgresSaver. Since our graph contains
async nodes (market_analyst, Financial_analyst, Risk_ops) and runs in an
async FastAPI context, we MUST use the async checkpointer (AsyncPostgresSaver)
so that graph_app.ainvoke works correctly without throwing NotImplementedError.
"""

from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer

from app.config import settings

_pool: AsyncConnectionPool | None = None
_saver: AsyncPostgresSaver | None = None

_ALLOWED_MSGPACK_MODULES = [
    ("app.core.graph.schemas", "ClientBrief"),
    ("app.core.graph.schemas", "SpecialistReport"),
    ("app.core.graph.schemas", "ChallengeCritique"),
    ("app.core.graph.schemas", "FinalRecommendation"),
    ("app.core.graph.schemas", "HumanFeedback"),
    ("app.core.graph.schemas", "RevisionDecision"),
]


def _to_psycopg_url(url: str) -> str:
    """
    settings.DATABASE_URL is in asyncpg form for the FastAPI/SQLAlchemy connection.
    We convert it to a standard postgresql url for psycopg.
    """
    plain = url.replace("postgresql+asyncpg://", "postgresql://")
    plain = plain.replace("ssl=require", "sslmode=require")
    return plain


def get_checkpointer() -> AsyncPostgresSaver:
    global _pool, _saver
    if _saver is None:
        conn_string = _to_psycopg_url(settings.DATABASE_URL)
        # We pass open=False so it is not opened at import time.
        # This avoids "AsyncConnectionPool open with no running loop" errors.
        # The pool is opened inside setup_checkpointer() during startup lifespan.
        _pool = AsyncConnectionPool(
            conninfo=conn_string,
            max_size=10,
            open=False,
            kwargs={"autocommit": True, "prepare_threshold": 0},
        )
        _saver = AsyncPostgresSaver(
            _pool,
            serde=JsonPlusSerializer(allowed_msgpack_modules=_ALLOWED_MSGPACK_MODULES),
        )
    return _saver


async def setup_checkpointer() -> None:
    """Idempotently initialize checkpointer tables in the database."""
    saver = get_checkpointer()
    if _pool is not None:
        await _pool.open()
    await saver.setup()
