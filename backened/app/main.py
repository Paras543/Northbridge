"""
FastAPI application entrypoint.

Run with: uvicorn app.main:app --reload
(from inside backend/, with venv active)
"""
from fastapi import FastAPI

from app.api.v1.consultations import router as consultations_router

app = FastAPI(title="AI Consulting Platform API")

app.include_router(consultations_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}


