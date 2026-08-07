import json
from datetime import datetime
import uuid

from config import ALERTS_DIR


def generate_alert(
    attack_type,
    severity,
    source_ip,
    evidence
):
    ALERTS_DIR.mkdir(parents=True, exist_ok=True)

    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:8]}",
        "attack_type": attack_type,
        "severity": severity,
        "source_ip": source_ip,
        "evidence": evidence,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "processed": False
    }

    filename = ALERTS_DIR / f"{attack_type}_{int(datetime.now().timestamp())}.json"

    with open(filename, "w") as f:
        json.dump(alert, f, indent=4)

    print(f"[ALERT GENERATED] {filename}")
    print("ALERT_CREATED")


if __name__ == "__main__":
    generate_alert("sql_injection", "high", "192.168.1.45", "SELECT * FROM users WHERE '1'='1'")
    generate_alert("ddos", "high", "10.0.0.99", "Rate limit exceeded: 5000 req/sec")
    generate_alert("brute_force", "medium", "172.16.5.12", "Failed login attempts: 15")
