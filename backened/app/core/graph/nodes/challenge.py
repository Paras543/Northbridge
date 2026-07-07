
from app.llm.client import llm
from app.core.graph.state import CaseState
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.graph.schemas import ChallengeCritique

def challenge_and_revise(state:CaseState):
    challenge_llm = llm.with_structured_output(ChallengeCritique)
    combined_report = {
        'market_report': state.get('market_report').model_dump() if state.get('market_report') else None,
        'financial_report': state.get('financial_report').model_dump() if state.get('financial_report') else None,
        'risk_ops': state.get('Risk_report').model_dump() if state.get('Risk_report') else None

    }
    challenge = challenge_llm.invoke([
        SystemMessage(content="You are a devil's advocate at a consulting firm. Review the specialist reports below and identify the single weakest assumption across them. Name which specialist it belongs to, state the assumption, and explain why it's weak."),
        HumanMessage(content=str(combined_report))
    ])
    current_round = state.get('round_number', 0)
    return {'critiques': [challenge], 'round_number': current_round + 1}

