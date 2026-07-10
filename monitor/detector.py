from monitor.detection_state import load_state, save_state
import os
from monitor.checkpoint import (
    load_checkpoint,
    save_checkpoint,
    CHECKPOINT_FILE
)
from monitor.rules import (
    SQL_PATTERNS,
    BRUTE_FORCE_THRESHOLD,
    DDOS_THRESHOLD
)

from monitor.parser import extract_ip
from monitor.alert_generator import generate_alert


# -----------------------------
# Absolute Paths
# -----------------------------
BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

LOG_FILE = os.path.join(
    BASE_DIR,
    "logs",
    "website.log"
)


# -----------------------------
# Read Logs
def read_logs():

    last_position = load_checkpoint()

    print("=" * 50)
    print(f"Checkpoint File: {CHECKPOINT_FILE}")
    print(f"Last Position : {last_position}")

    with open(LOG_FILE, "r") as file:

        file.seek(last_position)

        new_logs = file.readlines()

        current_position = file.tell()

        print(f"Current Position : {current_position}")
        print(f"New Logs Read : {len(new_logs)}")

    save_checkpoint(current_position)

    print(f"Checkpoint Saved : {current_position}")
    print("=" * 50)

    return new_logs

# -----------------------------
# SQL Injection Detection
# -----------------------------
def detect_sql_injection(logs):

    for line in logs:

        for pattern in SQL_PATTERNS:

            if pattern.lower() in line.lower():

                print("[DETECTED] SQL Injection")

                generate_alert(
                    attack_type="sql_injection",
                    severity="high",
                    source_ip="unknown",
                    evidence={
                        "matched_pattern": pattern,
                        "log_line": line.strip()
                    }
                )

                return True
    return False;


# -----------------------------
# Brute Force Detection
# -----------------------------

def detect_brute_force(logs):

    state = load_state()

    failed_logins = state["failed_logins"]
    active_alerts = state["active_alerts"]

    for line in logs:

        if "LOGIN_FAILED" not in line:
            continue

        ip = extract_ip(line)

        if ip is None:
            continue
        print(f"Loaded state: {state}")

        failed_logins[ip] = failed_logins.get(ip, 0) + 1
        print(f"IP={ip}, Count={failed_logins[ip]}")
        if (
            failed_logins[ip] >= BRUTE_FORCE_THRESHOLD
            and ip not in active_alerts
        ):

            print(f"[DETECTED] Brute Force from {ip}")

            generate_alert(
                attack_type="brute_force",
                severity="medium",
                source_ip=ip,
                evidence={
                    "failed_attempts": failed_logins[ip]
                }
            )

            active_alerts[ip] = True
            save_state(state)
            return True

    save_state(state)
    return False


# -----------------------------
# DDoS Detection
# -----------------------------
def detect_ddos(logs):

    request_counts = {}

    for line in logs:

        if "REQUEST" not in line:
            continue

        ip = extract_ip(line)

        if ip is None:
            continue

        request_counts[ip] = request_counts.get(ip, 0) + 1

    for ip, count in request_counts.items():

        if count >= DDOS_THRESHOLD:

            print(f"[DETECTED] DDoS from {ip}")

            generate_alert(
                attack_type="ddos",
                severity="high",
                source_ip=ip,
                evidence={
                    "request_count": count
                }
            )
            return True
    return False

# -----------------------------
# Main
# -----------------------------
def run_detection():

    logs = read_logs()

    sql_alert = detect_sql_injection(logs)
    brute_alert = detect_brute_force(logs)
    ddos_alert = detect_ddos(logs)

    return sql_alert or brute_alert or ddos_alert


def main():
    run_detection()


if __name__ == "__main__":
    main()