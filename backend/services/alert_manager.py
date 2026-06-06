import json


def mark_alert_processed(filepath):

    with open(
        filepath,
        "r",
        encoding="utf-8"
    ) as f:

        alert = json.load(f)

    alert["processed"] = True

    with open(
        filepath,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            alert,
            f,
            indent=4
        )