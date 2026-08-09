import time

from config import (
    LOG_FILE,
    DDOS_THRESHOLD,
    DDOS_TIME_WINDOW,
)

from monitor.detection_state import (
    load_state,
    save_state,
    count_requests_in_window,
)

from monitor.checkpoint import (
    load_checkpoint,
    save_checkpoint,
    CHECKPOINT_FILE,
)

from monitor.rules import (
    SQL_PATTERNS,
    BRUTE_FORCE_THRESHOLD,
)

from monitor.parser import extract_ip, extract_timestamp, extract_username
from monitor.alert_generator import generate_alert

# -------------------------------------------------
# Read Logs
# -------------------------------------------------


def read_logs():

    last_position = load_checkpoint()

    print("=" * 50)
    print(f"Checkpoint File: {CHECKPOINT_FILE}")
    print(f"Last Position : {last_position}")

    try:

        with open(LOG_FILE, "r") as file:

            file.seek(last_position)

            new_logs = file.readlines()

            current_position = file.tell()

            print(f"Current Position : {current_position}")
            print(f"New Logs Read : {len(new_logs)}")

    except FileNotFoundError:

        print(f"[WARNING] Log file not found: {LOG_FILE}")
        return []

    save_checkpoint(current_position)

    print(f"Checkpoint Saved : {current_position}")
    print("=" * 50)

    return new_logs


def _line_timestamp_iso(line):
    """
    Extracts a timestamp from a raw log line and returns it as an ISO
    8601 string (JSON-serializable), or None if the line has no
    parseable timestamp. Falls back to "now" so alerts are never left
    with a null timestamp (which would break the frontend's sort-by-time
    and timestamp column).
    """

    dt = extract_timestamp(line)

    if dt is None:
        from datetime import datetime, timezone
        dt = datetime.now(timezone.utc)

    return dt.isoformat()


# -------------------------------------------------
# SQL Injection Detection
# -------------------------------------------------


def detect_sql_injection(logs):

    for line in logs:

        for pattern in SQL_PATTERNS:

            if pattern.lower() in line.lower():

                print("[DETECTED] SQL Injection")

                generate_alert(
                    attack_type="sql_injection",
                    severity="high",
                    source_ip=extract_ip(line) or "unknown",
                    evidence={"matched_pattern": pattern, "log_line": line.strip()},
                    timestamp=_line_timestamp_iso(line),
                    username=extract_username(line),
                )

                return True

    return False


# -------------------------------------------------
# Brute Force Detection
# -------------------------------------------------


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

        if failed_logins[ip] >= BRUTE_FORCE_THRESHOLD and ip not in active_alerts:

            print(f"[DETECTED] Brute Force from {ip}")

            generate_alert(
                attack_type="brute_force",
                severity="medium",
                source_ip=ip,
                evidence={"failed_attempts": failed_logins[ip]},
                timestamp=_line_timestamp_iso(line),
                username=extract_username(line),
            )

            active_alerts[ip] = True
            save_state(state)

            return True

    save_state(state)

    return False


# -------------------------------------------------
# DDoS Detection
# -------------------------------------------------


def detect_ddos(logs):

    now = time.time()

    state = load_state()

    ddos_requests = state.setdefault("ddos_requests", {})

    ddos_active_alerts = state.setdefault("ddos_active_alerts", {})

    ips_seen = set()
    # Remember one raw line per IP so we can extract a real timestamp
    # for the alert instead of only using time.time().
    last_line_for_ip = {}

    for line in logs:

        if "REQUEST" not in line:
            continue

        ip = extract_ip(line)

        if ip is None:
            continue

        ips_seen.add(ip)
        last_line_for_ip[ip] = line
        ddos_requests.setdefault(ip, []).append(now)

    triggered = False

    for ip in ips_seen:

        count = count_requests_in_window(state, ip, DDOS_TIME_WINDOW, now=now)

        if count >= DDOS_THRESHOLD and ip not in ddos_active_alerts:

            print(
                f"[DETECTED] DDoS from {ip} "
                f"({count} requests in last "
                f"{DDOS_TIME_WINDOW}s)"
            )

            generate_alert(
                attack_type="ddos",
                severity="high",
                source_ip=ip,
                evidence={
                    "request_count": count,
                    "time_window_seconds": DDOS_TIME_WINDOW,
                },
                timestamp=_line_timestamp_iso(last_line_for_ip[ip]),
                username=extract_username(last_line_for_ip[ip]),
            )

            ddos_active_alerts[ip] = True
            triggered = True

    save_state(state)

    return triggered


# -------------------------------------------------
# Main Detection Entry
# -------------------------------------------------


def run_detection():

    logs = read_logs()

    if not logs:
        return False

    sql_alert = detect_sql_injection(logs)
    brute_alert = detect_brute_force(logs)
    ddos_alert = detect_ddos(logs)

    return sql_alert or brute_alert or ddos_alert


def main():
    run_detection()


if __name__ == "__main__":
    main()
