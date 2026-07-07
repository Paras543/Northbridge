
from app.llm.client import llm
from app.core.graph.state import CaseState
from langgraph.types import interrupt
from app.core.graph.schemas import HumanFeedback



def human_review(state: CaseState) -> CaseState:
    feedback = interrupt({
        'recommendation': state['final_recommendation'].model_dump(),
        'message': 'Please review the recommendation approve it or request the changes'
    })
    return {'human_feedback': HumanFeedback(**feedback)}



