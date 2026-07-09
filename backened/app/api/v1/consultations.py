from fastapi import APIRouter, Depends, HTTPException
from app.services.case_service import (
    start_case as start_case_service,
    resume_case as resume_case_service,
    get_case_status as get_case_status_service,
)
from app.api.v1.schemas import Start_case, Resume_case, Case_state

router = APIRouter(prefix="/consultations", tags=["consultations"])

@router.post("/start",response_model=Case_state)
async def start_case(request: Start_case):
    result = await start_case_service(request.raw_brief, request.project_id)
    return Case_state(**result)

async def resume_case(request: Resume_case, thread_id: str):
    result = await resume_case_service(
        thread_id=thread_id,
        approved=request.approved,
        requested_changes=request.request_changes,
    )
    return Case_state(**result)


@router.get("/{thread_id}", response_model=Case_state)
async def poll(thread_id: str):
    try:
        result = await get_case_status_service(thread_id)
    except Exception:
        
        raise HTTPException(status_code=404, detail="Case not found")
    return Case_state(**result)








    
    
