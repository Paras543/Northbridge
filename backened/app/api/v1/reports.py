"""
Reports API — list and retrieve generated consulting reports.

Reports are written by the LangGraph report_generation node and stored
in the `reports` table by case_service._save_report().  This router
exposes them for the frontend Reports page.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Report


router = APIRouter(prefix="/reports", tags=["reports"])


class ReportSummaryOut(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    case_thread_id: uuid.UUID | None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportDetailOut(ReportSummaryOut):
    content: str


@router.get("", response_model=list[ReportSummaryOut])
async def list_reports(
    project_id: uuid.UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Return all reports, optionally filtered by project."""
    query = select(Report)
    if project_id is not None:
        query = query.where(Report.project_id == project_id)
    query = query.order_by(Report.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{report_id}", response_model=ReportDetailOut)
async def get_report(report_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Return a single report including its full content."""
    report = await db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
