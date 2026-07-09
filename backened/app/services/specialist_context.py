import uuid
from app.db.session import AsyncSessionLocal  
from app.services.retrieval import search_chunks, RetrievalError


async def get_context_for_project(query: str, project_id: str, top_k: int = 5) -> str:
    """
    Returns a formatted string of the top_k most relevant chunks for this
    project, ready to drop into a specialist's prompt. Returns an empty
    string if nothing is found or retrieval fails — never raises.
    """
    try:
        project_uuid = uuid.UUID(project_id)
    except (ValueError, TypeError):
        return ""

    async with AsyncSessionLocal() as db:
        try:
            results = await search_chunks(db, query=query, project_id=project_uuid, top_k=top_k)
        except RetrievalError:
            return ""

    if not results:
        return ""

    formatted = "\n\n".join(
        f"[Source: {r['document_name']}, chunk {r['chunk_index']}]\n{r['content']}"
        for r in results
    )
    return formatted




