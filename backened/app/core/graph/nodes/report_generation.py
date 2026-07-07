from app.llm.client import llm
from app.core.graph.state import CaseState
from langchain_core.messages import SystemMessage, HumanMessage

def report_generation(state:CaseState):
    report = llm.invoke([
        SystemMessage(content="You are a consulting report writer. Turn this final recommendation into a polished client-facing report with sections: Situation, Complication, Recommendation, Supporting analysis, and Risks."),
        HumanMessage(content=state['final_recommendation'].model_dump_json())
    ])
    
    return {'report_path': report.content}


