
from app.llm.client import llm
from app.core.graph.state import CaseState
from app.core.graph.schemas import ClientBrief
from langchain_core.messages import SystemMessage, HumanMessage




def client_brief(state:CaseState) -> CaseState:
    brief = llm.with_structured_output(ClientBrief)
    brief = brief.invoke([
        SystemMessage(content="You are a consulting intake specialist. Read the client's raw business problem and extract it into the structured brief format — identify the core question being asked, classify the problem type, list any stated constraints, and note whether the client has provided data."),
        HumanMessage(content=state['raw_brief'])
    ]
    )
    return {'client_brief':brief}



def problem_framing(state: CaseState) ->CaseState:
    final_framing = llm.with_structured_output(ClientBrief)
    final_framing = final_framing.invoke([
        SystemMessage(content="You are a senior consulting partner. Review this extracted client brief and sharpen it — restate the core_question as a single, unambiguous decision the firm must answer, and confirm or correct the problem_type classification if the analyst got it wrong."),
        HumanMessage(content=state['client_brief'].model_dump_json())
    ])
    return {'client_brief': final_framing}

