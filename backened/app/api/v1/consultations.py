from fastapi import APIRouter, Depends, HTTPException
from app.services.case_service import start_Case, resume_Case, get_case_state
from app.api.v1.schemas import Start_case, Resume_case, Case_state

router = APIRouter(prefix="/consultations", tags=["consultations"])

@router.post("/start",response_model=Case_state)
def start_case(request: Case_state):
    result = start_Case(request.raw_brief)
    return Case_state(**result)

@router.post("/{thread_id}/resume", response_model=Case_state)
def resume_case(request: Resume_case, thread_id: str):
    result = resume_Case(request.approved, request.request_changes, thread_id=thread_id)
    return Case_state(**result)

@router.get("/{thread_id}", response_model=Case_state)
def poll(thread_id: str):
    try:
        result = get_case_state(thread_id)
    except Exception:
        # thread_id doesn't exist / no checkpoint found for it
        raise HTTPException(status_code=404, detail="Case not found")
    return Case_state(**result)






    
