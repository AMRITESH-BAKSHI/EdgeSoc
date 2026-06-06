from langgraph.graph import StateGraph, END

from backend.models.state import InvestigationState

from backend.agents.coordinator import create_investigation_plan
from backend.agents.log_agent import collect_relevant_logs
from backend.agents.ioc_agent import extract_iocs
from backend.agents.threat_agent import map_to_mitre
from backend.agents.report_agent import generate_report
from backend.services.alert_loader import (
    load_unprocessed_alerts
)
from backend.reports.report_builder import (
    build_human_report,
    save_report
)
from backend.services.alert_manager import mark_alert_processed

def coordinator_node(state: InvestigationState):

    plan = create_investigation_plan(
        state["alert"]
    )

    return {
        "plan": plan
    }


def log_node(state: InvestigationState):

    evidence = collect_relevant_logs(
        state["alert"],
        "logs/sample.log"
    )

    return {
        "evidence": evidence
    }


def ioc_node(state: InvestigationState):

    iocs = extract_iocs(
        state["evidence"]
    )

    return {
        "iocs": iocs
    }



def threat_node(state: InvestigationState):

    mitre = map_to_mitre(
        state["alert"]
    )

    return {
        "mitre": mitre
    }


def report_node(state: InvestigationState):

    report = generate_report(
        state["alert"],
        state["evidence"],
        state["iocs"],
        state["mitre"]
    )

    return {
        "report": report
    }   

def save_report_node(state):

    human_report = build_human_report(
        state["report"]
    )

    report_path = save_report(
    human_report,
    state["report"]["attack_type"]
)

    return {
        "report_path": report_path
    }


graph = StateGraph(
    InvestigationState
)



graph.add_node(
    "coordinator",
    coordinator_node
)

graph.add_node(
    "log_agent",
    log_node
)

graph.add_node(
    "ioc_agent",
    ioc_node
)

graph.add_node(
    "threat_agent",
    threat_node
)

graph.add_node(
    "report_agent",
    report_node
)
graph.add_node(
    "save_report",
    save_report_node
)

graph.set_entry_point(
    "coordinator"
)

graph.add_edge(
    "coordinator",
    "log_agent"
)

graph.add_edge(
    "log_agent",
    "ioc_agent"
)

graph.add_edge(
    "ioc_agent",
    "threat_agent"
)

graph.add_edge(
    "threat_agent",
    "report_agent"
)

graph.add_edge(
    "report_agent",
    "save_report"
)

graph.add_edge(
    "save_report",
    END
)   
workflow = graph.compile()




if __name__ == "__main__":
   alerts = load_unprocessed_alerts()

   for filepath, alert in alerts:

    result = workflow.invoke(
        {
            "alert": alert
        }
    )

    mark_alert_processed(
        filepath
    )