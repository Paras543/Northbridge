from app.llm.client import llm
from app.core.graph.state import CaseState
from app.core.graph.schemas import ClientBrief
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.graph.schemas import SpecialistReport

def market_analyst(state:CaseState)->CaseState:
    market_report = llm.with_structured_output(SpecialistReport)
    market_report = market_report.invoke([
        SystemMessage(content="You are a market analyst at a consulting firm. Given the client's brief, assess market sizing, competitive landscape, and demand trends relevant to their decision. Return your findings, key metrics, and the assumptions your analysis relies on."),
        HumanMessage(content=state['client_brief'].model_dump_json())
    ])
    return {'market_report':market_report}



def Financial_analyst(state: CaseState) -> CaseState:
    financial_report = llm.with_structured_output(SpecialistReport)
    financial_report = financial_report.invoke([
        SystemMessage(content="You are a financial analyst at a consulting firm. Given the client's brief, assess unit economics, ROI, breakeven timeline, and financial feasibility relevant to their decision. Return your findings, key metrics, and the assumptions your analysis relies on."),
        HumanMessage(content=state['client_brief'].model_dump_json())
    ])

    return {'financial_report': financial_report }



def Risk_ops(state: CaseState) -> CaseState:
    risk_ops = llm.with_structured_output(SpecialistReport)
    risk_ops = risk_ops.invoke([
        SystemMessage(content="You are a risk and operations analyst at a consulting firm. Given the client's brief, assess execution feasibility, resource and timeline constraints, and regulatory or market risks relevant to their decision. Return your findings, key metrics, and the assumptions your analysis relies on."),
        HumanMessage(content = state['client_brief'].model_dump_json())
    ])
    return {'Risk_report': risk_ops}


