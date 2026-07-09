from app.llm.client import llm
from app.core.graph.state import CaseState
from app.core.graph.schemas import ClientBrief
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.graph.schemas import SpecialistReport
from app.services.specialist_context import get_context_for_project


async def market_analyst(state: CaseState) -> CaseState:
    context = await get_context_for_project(
        query="market sizing, competitive landscape, demand trends",
        project_id=state['project_id'],
    )

    market_report = llm.with_structured_output(SpecialistReport)
    market_report = await market_report.ainvoke([
        SystemMessage(content=(
            "You are a market analyst at a consulting firm. Given the client's brief "
            "and any supporting documents provided, assess market sizing, competitive "
            "landscape, and demand trends relevant to their decision. If supporting "
            "documents are provided, ground your findings in them and cite the source "
            "document by name. Return your findings, key metrics, and the assumptions "
            "your analysis relies on."
        )),
        HumanMessage(content=(
            f"Client brief:\n{state['client_brief'].model_dump_json()}\n\n"
            f"Supporting documents (may be empty if none uploaded yet):\n{context}"
        ))
    ])
    return {'market_report': market_report}


async def Financial_analyst(state: CaseState) -> CaseState:
    context = await get_context_for_project(
        query="unit economics, ROI, breakeven timeline, financial feasibility",
        project_id=state['project_id'],
    )

    financial_report = llm.with_structured_output(SpecialistReport)
    financial_report = await financial_report.ainvoke([
        SystemMessage(content=(
            "You are a financial analyst at a consulting firm. Given the client's brief "
            "and any supporting documents provided, assess unit economics, ROI, breakeven "
            "timeline, and financial feasibility relevant to their decision. If supporting "
            "documents are provided, ground your findings in them and cite the source "
            "document by name. Return your findings, key metrics, and the assumptions "
            "your analysis relies on."
        )),
        HumanMessage(content=(
            f"Client brief:\n{state['client_brief'].model_dump_json()}\n\n"
            f"Supporting documents (may be empty if none uploaded yet):\n{context}"
        ))
    ])
    return {'financial_report': financial_report}


async def Risk_ops(state: CaseState) -> CaseState:
    context = await get_context_for_project(
        query="execution feasibility, resource and timeline constraints, regulatory or market risks",
        project_id=state['project_id'],
    )

    risk_ops = llm.with_structured_output(SpecialistReport)
    risk_ops = await risk_ops.ainvoke([
        SystemMessage(content=(
            "You are a risk and operations analyst at a consulting firm. Given the client's "
            "brief and any supporting documents provided, assess execution feasibility, "
            "resource and timeline constraints, and regulatory or market risks relevant to "
            "their decision. If supporting documents are provided, ground your findings in "
            "them and cite the source document by name. Return your findings, key metrics, "
            "and the assumptions your analysis relies on."
        )),
        HumanMessage(content=(
            f"Client brief:\n{state['client_brief'].model_dump_json()}\n\n"
            f"Supporting documents (may be empty if none uploaded yet):\n{context}"
        ))
    ])
    return {'Risk_report': risk_ops}


