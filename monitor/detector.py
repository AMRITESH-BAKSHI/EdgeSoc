from detection_state import load_state, save_state
import os
from checkpoint import (
    load_checkpoint,
    save_checkpoint,
    CHECKPOINT_FILE
)
from rules import (
    SQL_PATTERNS,
    BRUTE_FORCE_THRESHOLD,
    DDOS_THRESHOLD
)

from parser import extract_ip
from alert_generator import generate_alert


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

                return


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

        failed_logins[ip] = failed_logins.get(ip, 0) + 1

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


# -----------------------------
# Main
# -----------------------------
def main():

    logs = read_logs()

    detect_sql_injection(logs)
    detect_brute_force(logs)
    detect_ddos(logs)


if __name__ == "__main__":
    main()