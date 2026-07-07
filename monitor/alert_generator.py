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
    # Fix 1: Force it to go up one level to the root 'alerts' folder
    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "alerts"))
    os.makedirs(target_dir, exist_ok=True)

    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:8]}",
        "attack_type": attack_type,
        "severity": severity,
        "source_ip": source_ip,
        "evidence": evidence,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "processed": False # Fix 2: Essential for frontend dashboard status mapping!
    }

    # Generate filename using the unified absolute path layout context
    filename = os.path.join(
        target_dir, 
        f"{attack_type}_{int(datetime.now().timestamp())}.json"
    )

    with open(filename, "w") as f:
        json.dump(alert, f, indent=4)

    print(f"[ALERT GENERATED] {filename}")

if __name__ == "__main__":
    generate_alert("sql_injection", "high", "192.168.1.45", "SELECT * FROM users WHERE '1'='1'")
    generate_alert("ddos", "high", "10.0.0.99", "Rate limit exceeded: 5000 req/sec")
    generate_alert("brute_force", "medium", "172.16.5.12", "Failed login attempts: 15")