from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.consultations import router as consultations_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.clients import router as clients_router
from app.api.v1.projects import router as projects_router
from app.api.v1.documents import router as documents_router
from app.api.v1.retrieval import router as retrieval_router
from app.api.v1.reports import router as reports_router
from app.auth.dependencies import get_current_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly initialise the Postgres checkpointer so its tables exist
    # before the first graph call instead of failing inside a request handler.
    from app.core.graph.checkpointer import setup_checkpointer
    await setup_checkpointer()
    yield


app = FastAPI(title="AI Consulting Platform API", lifespan=lifespan)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the Next.js dev server (port 3000) and any localhost port to call the
# API from the browser.  In production, replace with your actual frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_auth = [Depends(get_current_user)]

app.include_router(consultations_router, prefix="/api/v1", dependencies=_auth)
app.include_router(organizations_router, prefix="/api/v1", dependencies=_auth)
app.include_router(clients_router,       prefix="/api/v1", dependencies=_auth)
app.include_router(projects_router,      prefix="/api/v1", dependencies=_auth)
app.include_router(documents_router,     prefix="/api/v1", dependencies=_auth)
app.include_router(retrieval_router,     prefix="/api/v1", dependencies=_auth)
app.include_router(reports_router,       prefix="/api/v1", dependencies=_auth)


@app.get("/health")
def health():
    return {"status": "ok"}
