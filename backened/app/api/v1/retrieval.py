"""
Retrieval endpoint — vector similarity search over document chunks,
scoped to a project or a client.
"""

import uuid
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.retrieval import search_chunks, RetrievalError


router = APIRouter(prefix="/retrieval", tags=["retrieval"])


class SearchRequest(BaseModel):
    query: str
    project_id: uuid.UUID | None = None
    client_id: uuid.UUID | None = None
    top_k: int = 5


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    project_id: str
    chunk_index: int
    content: str
    similarity_score: float


@router.post("/search", response_model=list[SearchResult])
async def search(request: SearchRequest, db: AsyncSession = Depends(get_db)):
    try:
        results = await search_chunks(
            db,
            query=request.query,
            project_id=request.project_id,
            client_id=request.client_id,
            top_k=request.top_k,
        )
    except RetrievalError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return results





