import json
import time

from config import DETECTION_STATE_FILE

DEFAULT_STATE = {
    "failed_logins": {},
    "active_alerts": {},
    # ip -> list of unix timestamps (floats) for recent requests.
    # Used for time-windowed DDoS counting instead of a permanently
    # cumulative counter (see config.DDOS_TIME_WINDOW).
    "ddos_requests": {},
    "ddos_active_alerts": {},
}


def load_state():

    if not DETECTION_STATE_FILE.exists():
        # Return a fresh copy so callers can mutate it safely.
        return {key: (val.copy() if isinstance(val, dict) else val) for key, val in DEFAULT_STATE.items()}

    with open(DETECTION_STATE_FILE, "r") as file:
        state = json.load(file)

    # Backfill keys for state files written by older versions of the app.
    for key, default_value in DEFAULT_STATE.items():
        state.setdefault(key, default_value.copy() if isinstance(default_value, dict) else default_value)

    return state


def save_state(state):

    with open(DETECTION_STATE_FILE, "w") as file:
        json.dump(
            state,
            file,
            indent=4
        )


def clear_ip(ip):

    print(f"[CLEAR_IP] Clearing state for {ip}")

    state = load_state()

    print("[BEFORE]", state)

    if ip in state["failed_logins"]:
        del state["failed_logins"][ip]

    if ip in state["active_alerts"]:
        del state["active_alerts"][ip]

    if ip in state.get("ddos_requests", {}):
        del state["ddos_requests"][ip]

    if ip in state.get("ddos_active_alerts", {}):
        del state["ddos_active_alerts"][ip]

    save_state(state)

    print("[AFTER]", state)


def record_request(ip, timestamp=None):
    """
    Append a request timestamp for `ip` and persist it.
    Call this once per observed REQUEST log line during detection.
    """

    if timestamp is None:
        timestamp = time.time()

    state = load_state()

    timestamps = state["ddos_requests"].get(ip, [])
    timestamps.append(timestamp)
    state["ddos_requests"][ip] = timestamps

    save_state(state)

    return state


def count_requests_in_window(state, ip, window_seconds, now=None):
    """
    Returns the number of requests from `ip` within the last
    `window_seconds`, and prunes older timestamps out of `state`
    (caller is responsible for saving `state` afterward if the
    pruned result should persist).
    """

    if now is None:
        now = time.time()

    timestamps = state["ddos_requests"].get(ip, [])
    recent = [ts for ts in timestamps if now - ts <= window_seconds]

    state["ddos_requests"][ip] = recent

    return len(recent)
