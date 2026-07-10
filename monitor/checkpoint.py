import json
import os

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

CHECKPOINT_FILE = os.path.join(
    BASE_DIR,
    "state",
    "checkpoint.json"
)


def load_checkpoint():
    """
    Returns the last byte position that was processed.
    """

    if not os.path.exists(CHECKPOINT_FILE):
        return 0

    with open(CHECKPOINT_FILE, "r") as file:
        data = json.load(file)

    return data.get("last_position", 0)


def save_checkpoint(position):
    """
    Saves the latest byte position.
    """

    with open(CHECKPOINT_FILE, "w") as file:
        json.dump(
            {
                "last_position": position
            },
            file,
            indent=4
        )