from backend.agents.coordinator import create_investigation_plan
from backend.agents.log_agent import collect_relevant_logs
from backend.agents.ioc_agent import extract_iocs
from backend.agents.threat_agent import map_to_mitre
from backend.agents.report_agent import generate_report
from backend.reports.report_builder import (
    build_human_report,
    save_report
)

def run_investigation(alert):

    # Step 1: Coordinator
    plan = create_investigation_plan(alert)

    print("\n[Coordinator Agent]")
    print(plan)

    # Step 2: Log Agent
    evidence = collect_relevant_logs(
        alert,
        "logs/sample.log"
    )

    print("\n[Log Agent]")
    print(evidence)

    # Step 3: IOC Agent
    iocs = extract_iocs(evidence)

    print("\n[IOC Agent]")
    print(iocs)

    # Step 4: Threat Agent
    mitre = map_to_mitre(alert)

    print("\n[Threat Agent]")
    print(mitre)

    # Step 5: Report Agent
    report = generate_report(
        alert,
        evidence,
        iocs,
        mitre
    )

   

    human_report = build_human_report(report)
    save_report(human_report)
    print(human_report)

    print("\n[Report Agent]")
    print(report)

    return report



if __name__ == "__main__":

    sample_alert = {
        "attack_type": "brute_force",
        "severity": "medium",
        "source_ip": "192.168.1.10"
    }

    final_report = run_investigation(
        sample_alert
    )

    print("\n========== FINAL REPORT ==========")
    print(final_report)