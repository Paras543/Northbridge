from pydantic import BaseModel
class Start_case(BaseModel):
    raw_brief:str
    project_id:str

class Resume_case(BaseModel):
    approved:bool
    request_changes:list[str] | None = None

class Case_state(BaseModel):
    thread_id:str
    status:str
    data:dict | None = None

