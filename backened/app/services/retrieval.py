"""
app/services/retrieval.py

Vector similarity search over DocumentChunk embeddings, scoped to either
a single project or all projects under a client. Never runs unscoped —
that would risk leaking one client's data into another's retrieval results.
"""

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import DocumentChunk, Document, Project
from app.services.embeddings import embed_text, EmbeddingError


class RetrievalError(Exception):
    """Raised when retrieval cannot be performed (bad scope, embedding failure, etc.)."""


async def search_chunks(
    db: AsyncSession,
    query: str,
    project_id: uuid.UUID | None = None,
    client_id: uuid.UUID | None = None,
    top_k: int = 5,
) -> list[dict]:
    """
   Basically A cosine similarity part of 
    """
    if project_id and client_id:
        raise RetrievalError("Provide only one of project_id or client_id, not both.")
    if not project_id and not client_id:
        raise RetrievalError("Must provide either project_id or client_id to scope retrieval.")

    try:
        query_vector = embed_text(query)
    except EmbeddingError as e:
        raise RetrievalError(f"Could not embed query: {e}") from e

    stmt = (
        select(
            DocumentChunk.id,
            DocumentChunk.document_id,
            DocumentChunk.chunk_index,
            DocumentChunk.content,
            Document.name.label("document_name"),
            Document.project_id,
            DocumentChunk.embedding.cosine_distance(query_vector).label("distance"),
        )
        .join(Document, Document.id == DocumentChunk.document_id)
    )

    if project_id:
        stmt = stmt.where(Document.project_id == project_id)
    else:
        # client-wide: join through Project to filter by client_id
        stmt = stmt.join(Project, Project.id == Document.project_id).where(
            Project.client_id == client_id
        )

    stmt = stmt.order_by("distance").limit(top_k)

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "chunk_id": str(row.id),
            "document_id": str(row.document_id),
            "document_name": row.document_name,
            "project_id": str(row.project_id),
            "chunk_index": row.chunk_index,
            "content": row.content,
            "similarity_score": 1 - row.distance,  
        }
        for row in rows
    ]


