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

