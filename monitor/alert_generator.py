import json
import os
from datetime import datetime
import uuid

def generate_alert(
    attack_type,
    severity,
    source_ip,
    evidence
):
    os.makedirs("alerts", exist_ok=True)

    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:8]}",
        "attack_type": attack_type,
        "severity": severity,
        "source_ip": source_ip,
        "evidence": evidence,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    filename = (
        f"alerts/{attack_type}_"
        f"{int(datetime.now().timestamp())}.json"
    )

    with open(filename, "w") as f:
        json.dump(alert, f, indent=4)

    print(f"[ALERT GENERATED] {filename}")