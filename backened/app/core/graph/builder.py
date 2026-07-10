
from langgraph.graph import StateGraph,START,END
from app.core.graph.state import CaseState
from app.core.graph.checkpointer import get_checkpointer 
from app.core.graph.nodes.intake import client_brief
from app.core.graph.nodes.intake import problem_framing
from app.core.graph.nodes.specialist import market_analyst, Financial_analyst, Risk_ops
from app.core.graph.nodes.challenge import challenge_and_revise
from app.core.graph.nodes.partner_synthesis import partner_synthesis
from app.core.graph.nodes.human_review import human_review
from app.core.graph.nodes.report_generation import report_generation
from app.core.graph.routing import route_specialists, check_condition, check_human_review

graph = StateGraph(CaseState)
graph.add_node('client_brief',client_brief)
graph.add_node('problem_framing',problem_framing)
graph.add_node('market_analyst',market_analyst)
graph.add_node('Financial_analyst',Financial_analyst)
graph.add_node('Risk_ops',Risk_ops)
graph.add_node('challenge_and_revise',challenge_and_revise)
graph.add_node('partner_synthesis',partner_synthesis)
graph.add_node('human_review',human_review)
graph.add_node('report_generation',report_generation)


graph.add_edge(START,'client_brief')
graph.add_edge('client_brief','problem_framing')
graph.add_conditional_edges('problem_framing',route_specialists,['market_analyst', 'Financial_analyst', 'Risk_ops'])
graph.add_edge('market_analyst','challenge_and_revise')
graph.add_edge('Financial_analyst','challenge_and_revise')
graph.add_edge('Risk_ops','challenge_and_revise')
graph.add_conditional_edges('challenge_and_revise',check_condition,
    {'revise': 'market_analyst', 'proceed': 'partner_synthesis'})
graph.add_edge('partner_synthesis','human_review')
graph.add_conditional_edges('human_review',check_human_review,{'approved':'report_generation','not_approved': 'challenge_and_revise'})
graph.add_edge('report_generation',END)


_app = None

def get_graph_app():
    global _app
    if _app is None:
        _app = graph.compile(checkpointer=get_checkpointer())
    return _app




