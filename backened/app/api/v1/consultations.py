"""
Consultations API — start, resume, poll, and list case threads.
"""

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas import StartCase, ResumeCase, CaseState
from app.db.session import get_db
from app.db.models import Consultation
from app.services.case_service import (
    start_case as start_case_service,
    resume_case as resume_case_service,
    get_case_status as get_case_status_service,
)


router = APIRouter(prefix="/consultations", tags=["consultations"])


class ConsultationSummaryOut(BaseModel):
    id: uuid.UUID
    thread_id: uuid.UUID
    project_id: uuid.UUID
    status: str
    raw_brief: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── List ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ConsultationSummaryOut])
async def list_consultations(
    project_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Return all consultations, optionally filtered by project_id."""
    query = select(Consultation)
    if project_id is not None:
        query = query.where(Consultation.project_id == project_id)
    query = query.order_by(Consultation.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


# ── Start a new case ──────────────────────────────────────────────────────────

@router.post("/start", response_model=CaseState)
async def start_case(request: StartCase):
    result = await start_case_service(request.raw_brief, request.project_id)
    return CaseState(**result)


# ── Resume a paused (interrupted) case ───────────────────────────────────────

@router.post("/{thread_id}/resume", response_model=CaseState)
async def resume_case(request: ResumeCase, thread_id: str):
    result = await resume_case_service(
        thread_id=thread_id,
        approved=request.approved,
        requested_changes=request.request_changes,
    )
    return CaseState(**result)


# ── Poll a single case by thread_id ──────────────────────────────────────────

@router.get("/{thread_id}", response_model=CaseState)
async def poll(thread_id: str):
    try:
        result = await get_case_status_service(thread_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=404, detail="Case not found")
    return CaseState(**result)
