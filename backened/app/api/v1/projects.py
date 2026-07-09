import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import Project, Client

router = APIRouter(prefix="/projects", tags=["projects"])
class ProjectCreate(BaseModel):
    name:str
    description:str | None = None
    client_id:uuid.UUID

class ProjectOut(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    name: str
    description: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("",response_model=ProjectOut)
async def create_project(payload:ProjectCreate,db:AsyncSession = Depends(get_db)):
    client = await db.get(Client,payload.client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    project = Project(
        client_id = payload.client_id,
        name = payload.name,
        description = payload.description

    )

    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("",response_model=list[ProjectOut])
async def list_project(
    client_id:uuid.UUID | None = Query(default=None),db:AsyncSession = Depends(get_db)
):
    query = select(Project)
    if client_id is not None:
        query = query.where(Project.client_id == client_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project





