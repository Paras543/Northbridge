

from app.llm.client import llm
from app.core.graph.state import CaseState
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.graph.schemas import FinalRecommendation

def partner_synthesis(state:CaseState) -> CaseState:
    final_llm = llm.with_structured_output(FinalRecommendation)
    combined_report = {
        'market_report': state.get('market_report').model_dump() if state.get('market_report') else None,
        'financial_report': state.get('financial_report').model_dump() if state.get('financial_report') else None,
        'risk_ops': state.get('Risk_report').model_dump() if state.get('Risk_report') else None,
        'critiques': [c.model_dump() for c in state['critiques']]

    }
    final_review = final_llm.invoke([
        SystemMessage(content="You are the senior partner reviewing this case before it goes to the client. Review the specialist reports and the critiques raised during internal challenge. Resolve any remaining disagreements, produce one clear recommendation, note which disagreements you overrode and why, and flag any residual risks."),
        HumanMessage(content=str(combined_report))
    ])

    return{'final_recommendation': final_review }



