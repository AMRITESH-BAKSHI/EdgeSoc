import uuid

from config import REPORTS_DIR


def build_human_report(report, summary):

    report_text = f"""
====================================
EDGE SOC INVESTIGATION REPORT
====================================

EXECUTIVE SUMMARY
------------------------------------

{summary}

====================================

INVESTIGATION DETAILS

Attack Type:
{report['attack_type']}

Severity:
{report['severity']}

Source IP:
{report['source_ip']}

Evidence Count:
{report['evidence_count']}

Indicators of Compromise:
{", ".join(report['iocs']['ips'])}

MITRE ATT&CK:
{report['mitre']['technique_id']} -
{report['mitre']['technique_name']}

====================================
"""

    return report_text


def save_report(report_text, attack_type):

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    report_id = uuid.uuid4().hex[:8]

    filename = REPORTS_DIR / f"report_{attack_type}_{report_id}.txt"

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(report_text)

    print(
        f"[REPORT SAVED] {filename}"
    )

    return str(filename)
