import os
from datetime import datetime
import uuid

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

REPORTS_DIR = os.path.join(
    BASE_DIR,
    "generated"
)
def build_human_report(report):

    report_text = f"""
====================================
EDGE SOC INVESTIGATION REPORT
====================================

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
{report['mitre']['technique_id']} - {report['mitre']['technique_name']}

Investigation Status:
Completed

Generated At:
{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

====================================
"""

    return report_text

def save_report(report_text,attack_type):

    os.makedirs(
        REPORTS_DIR,
        exist_ok=True
    )

    report_id = uuid.uuid4().hex[:8]

    filename = os.path.join(
        REPORTS_DIR,
        f"report_{attack_type}_{report_id}.txt"
    )

    with open(
        filename,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(report_text)

    print(
        f"[REPORT SAVED] {filename}"
    )

    return filename