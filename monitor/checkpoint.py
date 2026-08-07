import json

from config import CHECKPOINT_FILE

# Re-exported for backward compatibility with modules that import
# CHECKPOINT_FILE from here (e.g. monitor/detector.py's log statements).
__all__ = ["load_checkpoint", "save_checkpoint", "CHECKPOINT_FILE"]


def load_checkpoint():

    if not CHECKPOINT_FILE.exists():
        return 0

    try:

        with open(CHECKPOINT_FILE, "r") as file:
            data = json.load(file)

        return data.get("last_position", 0)

    except (json.JSONDecodeError, OSError):

        return 0


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
