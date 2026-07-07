"""
Persistent, Postgres-backed checkpointer (step 2 of the build roadmap).

Replaces InMemorySaver, which loses all in-flight case state — including
paused human_review() interrupts — the moment the process restarts.
This uses the same Neon database as the rest of the app, but through
psycopg (sync) rather than asyncpg, because the graph's node functions
are themselves synchronous (llm.invoke, not await). The two connections
(this one, and the async SQLAlchemy one in db/session.py) are entirely
independent and don't conflict — they just both point at Neon.

IMPORTANT: PostgresSaver.setup() must be called once (creates the
checkpointer's own tables: checkpoints, checkpoint_writes, etc.) before
first use. Safe to call repeatedly — it's idempotent.
"""
from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer

from app.config import settings

_pool: ConnectionPool | None = None
_saver: PostgresSaver | None = None

"""
This allows the schemas to be defined so that app just stucks with the allowed modules and classes for msgpack serialization.
"""
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
    settings.DATABASE_URL is in asyncpg form for the FastAPI/SQLAlchemy
    
    """
    plain = url.replace("postgresql+asyncpg://", "postgresql://")
    plain = plain.replace("ssl=require", "sslmode=require")
    return plain


def get_checkpointer() -> PostgresSaver:
    global _pool, _saver
    if _saver is None:
        conn_string = _to_psycopg_url(settings.DATABASE_URL)
        _pool = ConnectionPool(
            conninfo=conn_string,
            max_size=10,
            kwargs={"autocommit": True, "prepare_threshold": 0},
        )
        _saver = PostgresSaver(
            _pool,
            serde=JsonPlusSerializer(allowed_msgpack_modules=_ALLOWED_MSGPACK_MODULES),
        )
        _saver.setup()  
    return _saver



