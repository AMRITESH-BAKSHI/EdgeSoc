import json
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

STATE_FILE = os.path.join(
    BASE_DIR,
    "state",
    "detection_state.json"
)


def load_state():

    if not os.path.exists(STATE_FILE):

        return {
            "failed_logins": {},
            "active_alerts": {}
        }

    with open(STATE_FILE, "r") as file:

        return json.load(file)


def save_state(state):

    with open(STATE_FILE, "w") as file:

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

    save_state(state)

    print("[AFTER]", state)