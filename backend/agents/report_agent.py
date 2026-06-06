def generate_report(
    alert,
    evidence,
    iocs,
    mitre
):

    report = {
        "attack_type": alert["attack_type"],
        "severity": alert["severity"],
        "source_ip": alert["source_ip"],
        "evidence_count": len(evidence),
        "iocs": iocs,
        "mitre": mitre
    }

    return report
