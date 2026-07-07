"""
In the route.py file we define the routing conditon and check condition of the graph

"""

from langgraph.types import Send
from app.core.graph.state import CaseState


def route_specialists(state: CaseState):
    problem_type = state['client_brief'].problem_type
    always_on = ['Financial_analyst', 'Risk_ops']
    routing = {
        'market_entry': ['market_analyst'],
        'growth_expansion': ['market_analyst'],
        'customer_retention': [],
        'pricing': ['market_analyst'],
        'cost_reduction': [],
        'operational_efficiency': [],
        'risk_assessment': [],
        'other': ['market_analyst'],
    }
    active = always_on + routing.get(problem_type, [])
    return [Send(node, state) for node in active]

def check_condition(state: CaseState) -> str:
    max_rounds = 3
    round_number = state.get('round_number', 0)
    if not state['critiques']:
        return 'proceed'
    latest_critique = state['critiques'][-1]
    if max_rounds <= round_number:
        return 'proceed'
    if latest_critique.severity in ('moderate', 'major'):
        return 'revise'
    return 'proceed'


def check_human_review(state: CaseState) -> str:
    review  = state['human_feedback']
    if review.approved:
        return 'approved'
    return 'not_approved'



