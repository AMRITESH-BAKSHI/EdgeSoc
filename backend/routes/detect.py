from fastapi import APIRouter

from monitor.detector import run_detection
from backend.routes.investigate import investigate

router = APIRouter()


@router.post("/detect")
def detect():

    alert_created = run_detection()

    if alert_created:
        result = investigate()
    else:
        result = {
            "status": "No new alerts"
        }

    return {
        "status": "success",
        "alert_created": alert_created,
        "investigation": result
    }