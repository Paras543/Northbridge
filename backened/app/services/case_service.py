"""
Service layer for starting, resuming, and polling cases.
Now fully async, since the graph contains async specialist nodes
(market_analyst, Financial_analyst, Risk_ops) and must run through
the async execution path.
"""
import uuid

from langgraph.types import Command

from app.core.graph.builder import app as graph_app
from app.db.session import AsyncSessionLocal
from app.db.models import Report


async def start_case(raw_brief: str, project_id: str) -> dict:
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    result = await graph_app.ainvoke(
        {"raw_brief": raw_brief, "project_id": project_id},
        config=config,
    )

    return await _build_response(thread_id, result, config)


async def resume_case(thread_id: str, approved: bool, requested_changes: list[str] | None = None) -> dict:
    config = {"configurable": {"thread_id": thread_id}}

    feedback = {
        "approved": approved,
        "requested_changes": requested_changes or [],
    }

    result = await graph_app.ainvoke(Command(resume=feedback), config=config)

    return await _build_response(thread_id, result, config)


async def get_case_status(thread_id: str) -> dict:
    config = {"configurable": {"thread_id": thread_id}}
    snapshot = await graph_app.aget_state(config)

    if snapshot.next:
        interrupts = snapshot.tasks[0].interrupts if snapshot.tasks else []
        payload = interrupts[0].value if interrupts else None
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "data": payload,
        }

    return {
        "thread_id": thread_id,
        "status": "completed",
        "data": snapshot.values,
    }


async def _build_response(thread_id: str, result: dict, config: dict) -> dict:
    snapshot = await graph_app.aget_state(config)

    if snapshot.next:
        interrupts = snapshot.tasks[0].interrupts if snapshot.tasks else []
        payload = interrupts[0].value if interrupts else None
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "data": payload,
        }

    project_id = result.get("project_id")
    report_text = result.get("report_path")
    if project_id and report_text:
        await _save_report(project_id=project_id, thread_id=thread_id, content=report_text)

    return {
        "thread_id": thread_id,
        "status": "completed",
        "data": result,
    }


async def _save_report(project_id: str, thread_id: str, content: str) -> None:
    """
    Persists the generated report as a Report row. No more asyncio.run()
    bridge needed — everything above this call is already async, so we
    just await the session directly.
    """
    async with AsyncSessionLocal() as session:
        report = Report(
            project_id=uuid.UUID(project_id),
            name=f"Consultation Report {thread_id[:8]}",
            content=content,
            case_thread_id=uuid.UUID(thread_id),
        )
        session.add(report)
        await session.commit()



