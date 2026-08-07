import json

from config import ALERTS_DIR


def load_unprocessed_alerts():

    alerts = []

    if not ALERTS_DIR.exists():
        return alerts

    for filename in sorted(ALERTS_DIR.iterdir()):

        if filename.suffix != ".json":
            continue

        with open(
            filename,
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
                    str(filename),
                    alert
                )
            )

    return alerts
