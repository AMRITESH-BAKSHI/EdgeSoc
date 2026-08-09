import json
import uuid

from config import ALERTS_DIR


def generate_alert(
    attack_type,
    severity,
    source_ip,
    evidence,
    timestamp=None,
    username=None,
):
    ALERTS_DIR.mkdir(parents=True, exist_ok=True)

    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:8]}",
        "attack_type": attack_type,
        "severity": severity,
        "source_ip": source_ip,
        "username": username,
        "evidence": evidence,
        "timestamp": timestamp,
        "processed": False,
    }

    filename = ALERTS_DIR / f"{attack_type}_{uuid.uuid4().hex[:8]}.json"

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(alert, f, indent=4)

    print(f"[ALERT GENERATED] {filename}")
    print("ALERT_CREATED")

    return alert


if __name__ == "__main__":
    generate_alert(
        "sql_injection",
        "high",
        "192.168.1.45",
        "SELECT * FROM users WHERE '1'='1'",
        timestamp="2026-08-08T09:29:53.607Z",
        username=None,
    )

    generate_alert(
        "ddos",
        "high",
        "10.0.0.99",
        "Rate limit exceeded: 5000 req/sec",
        timestamp="2026-08-08T09:30:00.000Z",
        username=None,
    )

    generate_alert(
        "brute_force",
        "medium",
        "172.16.5.12",
        "Failed login attempts: 15",
        timestamp="2026-08-08T09:30:39.916Z",
        username="randomperson.lucky@gmail.com",
    )