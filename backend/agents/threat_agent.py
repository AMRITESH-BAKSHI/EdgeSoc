MITRE_MAPPING = {
    "sql_injection": {
        "technique_id": "T1190",
        "technique_name": "Exploit Public-Facing Application"
    },
    "brute_force": {
        "technique_id": "T1110",
        "technique_name": "Brute Force"
    },
    "ddos": {
        "technique_id": "T1498",
        "technique_name": "Network Denial of Service"
    }
}

def map_to_mitre(alert):
    attack_type = alert["attack_type"]
    return MITRE_MAPPING.get(
        attack_type,
        {
            "technique_id": "UNKNOWN",
            "technique_name": "Unknown Technique"
        }
    )

def threat_agent_node(state: dict):
    current_alert = state.get("current_alert")
    if not current_alert:
        return state

    mitre_data = map_to_mitre(current_alert)
    print(f"[THREAT AGENT] Mapped to MITRE: {mitre_data['technique_id']}")

    updated_metadata = state.get("metadata", {})
    updated_metadata["mitre_id"] = mitre_data["technique_id"]
    updated_metadata["mitre_name"] = mitre_data["technique_name"]

    return {
        **state,
        "metadata": updated_metadata,
        "threat_level": "high" if current_alert.get("severity") == "high" else "medium"
    }