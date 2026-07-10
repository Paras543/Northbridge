"""
Service layer for starting, resuming, and polling cases. Fully async.
Also maintains a Consultation row per thread_id so cases are listable
and filterable by project — the graph's own checkpointer state isn't
queryable that way.
"""
import uuid
from datetime import datetime

from langgraph.types import Command
from sqlalchemy import select

from app.core.graph.builder import get_graph_app
from app.db.session import AsyncSessionLocal
from app.db.models import Report, Consultation, ConsultationStatus


async def start_case(raw_brief: str, project_id: str) -> dict:
    graph_app = get_graph_app()
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    async with AsyncSessionLocal() as session:
        session.add(Consultation(
            thread_id=uuid.UUID(thread_id),
            project_id=uuid.UUID(project_id),
            status=ConsultationStatus.RUNNING.value,
            raw_brief=raw_brief,
        ))
        await session.commit()

    result = await graph_app.ainvoke(
        {"raw_brief": raw_brief, "project_id": project_id},
        config=config,
    )

    return await _build_response(thread_id, result, config)


async def resume_case(thread_id: str, approved: bool, requested_changes: list[str] | None = None) -> dict:
    graph_app = get_graph_app()
    config = {"configurable": {"thread_id": thread_id}}

    feedback = {
        "approved": approved,
        "requested_changes": requested_changes or [],
    }

    result = await graph_app.ainvoke(Command(resume=feedback), config=config)

    return await _build_response(thread_id, result, config)


async def get_case_status(thread_id: str) -> dict:
    graph_app = get_graph_app()
    config = {"configurable": {"thread_id": thread_id}}
    snapshot = await graph_app.aget_state(config)

    # Empty snapshot — either thread never existed or the process restarted.
    # Fall back to the DB Consultation record to give an accurate status.
    if not snapshot.values and not snapshot.next:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(Consultation).where(Consultation.thread_id == uuid.UUID(thread_id))
            )
            consultation = result.scalar_one_or_none()
        if consultation is None:
            raise ValueError(f"Thread {thread_id} not found")
        return {
            "thread_id": thread_id,
            "status": consultation.status,
            "data": None,
        }

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


async def _update_consultation_status(thread_id: str, status: str) -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Consultation).where(Consultation.thread_id == uuid.UUID(thread_id))
        )
        consultation = result.scalar_one_or_none()
        if consultation:
            consultation.status = status
            consultation.updated_at = datetime.utcnow()
            await session.commit()


async def _build_response(thread_id: str, result: dict, config: dict) -> dict:
    graph_app = get_graph_app()
    snapshot = await graph_app.aget_state(config)

    if snapshot.next:
        interrupts = snapshot.tasks[0].interrupts if snapshot.tasks else []
        payload = interrupts[0].value if interrupts else None
        await _update_consultation_status(thread_id, ConsultationStatus.INTERRUPTED.value)
        return {
            "thread_id": thread_id,
            "status": "interrupted",
            "data": payload,
        }

    project_id = result.get("project_id")
    report_text = result.get("report_path")
    if project_id and report_text:
        await _save_report(project_id=project_id, thread_id=thread_id, content=report_text)

    await _update_consultation_status(thread_id, ConsultationStatus.COMPLETED.value)

    return {
        "thread_id": thread_id,
        "status": "completed",
        "data": result,
    }


async def _save_report(project_id: str, thread_id: str, content: str) -> None:
    async with AsyncSessionLocal() as session:
        report = Report(
            project_id=uuid.UUID(project_id),
            name=f"Consultation Report {thread_id[:8]}",
            content=content,
            case_thread_id=uuid.UUID(thread_id),
        )
        session.add(report)
        await session.commit()



        