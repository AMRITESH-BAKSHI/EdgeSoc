import json
import os


def load_unprocessed_alerts():

    alerts = []

    alerts_dir = "alerts"

    if not os.path.exists(alerts_dir):
        return alerts

    for filename in os.listdir(alerts_dir):

        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(
            alerts_dir,
            filename
        )

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as f:

            alert = json.load(f)

        if not alert.get(
            "processed",
            False
        ):
            alerts.append(
                (
                    filepath,
                    alert
                )
            )

    return alerts