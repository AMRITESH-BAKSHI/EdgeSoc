import json
import os

from fastapi import APIRouter

router = APIRouter()


@router.get("/alerts")
def get_alerts():

    alerts = []

    if not os.path.exists("alerts"):
        return alerts

    for filename in os.listdir("alerts"):

        if filename.endswith(".json"):

            filepath = os.path.join(
                "alerts",
                filename
            )

            with open(filepath, "r") as f:
                alerts.append(
                    json.load(f)
                )

    return alerts