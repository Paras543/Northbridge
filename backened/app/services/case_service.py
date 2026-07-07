"""
In the Case service.py file here we define the connection between the pause/resume function and fastapi endpoint 
Here we actual deaclare the Thread Id and config like the concept in the Persistance we do 

"""

import uuid
from langgraph.types import Command
from app.core.graph.builder import app as graph_app

def start_Case(raw_brief:str) -> dict:
    """"
    THis everytime we start a new case we create a new thread id and return it to the user 
    
    """
    thread_id = str(uuid.uuid4())
    config = {'configurable': {'thread_id': thread_id}}
    result = graph_app.invoke({'raw_brief': raw_brief},config=config)
    return _buildresponse(thread_id,result,config)




def resume_Case(thread_id:str, approved:bool, request_changes:list[str] | None = None):
    """
    This function is used to resume the case with the given thread id
    """
    config = {'configurable': {'thread_id': thread_id}}
    feedback ={
        'approved':approved,
        'request_changes': request_changes or []

        
    }
    result = graph_app.invoke(Command(resume=feedback),config=config )
    return _buildresponse(thread_id,result,config)

def get_case_state(thread_id:str) -> dict:
    """
    This function is used to get the case state with the given thread id
    """
    config = {'configurable': {'thread_id': thread_id}}
    snapshot = graph_app.get_state(config)
    if snapshot.next:
        # there's a pending node (e.g. human_review) waiting on this thread
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


def _buildresponse(thread_id:str, result:dict, config:dict) -> dict:
    """
    This function is used to build the response for the case service
    """
  
    snapshot = graph_app.get_state(config)

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
        "data": result,
    }















