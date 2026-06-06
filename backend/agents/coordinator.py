def create_investigation_plan(alert):

    attack_type = alert["attack_type"]

    plan = {
        "attack_type": attack_type,
        "steps": [
            "collect_logs",
            "extract_iocs",
            "map_mitre",
            "generate_report"
        ]
    }

    return plan

