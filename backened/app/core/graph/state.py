"""
In the State.py we assing the Case state and all to pass it on the graph
"""
from typing import TypedDict,Annotated
from app.core.graph.schemas import ClientBrief, SpecialistReport, ChallengeCritique, FinalRecommendation, HumanFeedback, RevisionDecision
import operator


class CaseState(TypedDict):
    raw_brief: str
    project_id: str
    client_brief: ClientBrief
    market_report: SpecialistReport | None
    financial_report: SpecialistReport | None
    Risk_report : SpecialistReport | None
    human_feedback: HumanFeedback
    final_recommendation : FinalRecommendation
    critiques: Annotated[list[ChallengeCritique],operator.add]
    round_number:int
    revision_decision: RevisionDecision
    report_path:str

    
    


