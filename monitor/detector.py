from rules import (
    SQL_PATTERNS,
    BRUTE_FORCE_THRESHOLD,
    DDOS_THRESHOLD
)
from parser import extract_ip
from alert_generator import generate_alert



def read_logs():
    with open("logs/sample.log", "r") as file:
        return file.readlines()

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



def detect_brute_force(logs):
    failed_logins = {}

    for line in logs:

        if "LOGIN_FAILED" not in line:
            continue

        ip = extract_ip(line)

        if ip is None:
            continue

        failed_logins[ip] = failed_logins.get(ip, 0) + 1

    for ip, count in failed_logins.items():

        if count >= BRUTE_FORCE_THRESHOLD:

            print(f"[DETECTED] Brute Force from {ip}")

            generate_alert(
                attack_type="brute_force",
                severity="medium",
                source_ip=ip,
                evidence={
                    "failed_attempts": count
                }
            )


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


def main():
    logs = read_logs()

    detect_sql_injection(logs)
    detect_brute_force(logs)
    detect_ddos(logs)


if __name__ == "__main__":
    main()