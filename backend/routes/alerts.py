import json

from fastapi import APIRouter

from config import ALERTS_DIR

router = APIRouter()


@router.get("/alerts")
def get_alerts():

    alerts = []

    if not ALERTS_DIR.exists():
        return alerts

    for filename in sorted(ALERTS_DIR.iterdir()):

        if filename.suffix == ".json":

            with open(filename, "r") as f:
                alerts.append(
                    json.load(f)
                )

    return alerts
