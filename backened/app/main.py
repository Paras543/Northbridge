"""
FastAPI application entrypoint.

Run with: uvicorn app.main:app --reload
(from inside backend/, with venv active)
"""
from fastapi import FastAPI

from app.api.v1.consultations import router as consultations_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.clients import router as clients_router
from app.api.v1.projects import router as projects_router
from app.api.v1.documents import router as documents_router

app = FastAPI(title="AI Consulting Platform API")

app.include_router(consultations_router, prefix="/api/v1")
app.include_router(consultations_router, prefix="/api/v1")
app.include_router(organizations_router, prefix="/api/v1")
app.include_router(clients_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(documents_router,prefix="/api/v1")




@app.get("/health")
def health():
    return {"status": "ok"}


