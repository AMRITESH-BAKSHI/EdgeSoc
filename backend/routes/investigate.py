from fastapi import APIRouter
from monitor.detection_state import clear_ip
from backend.services.alert_loader import (
    load_unprocessed_alerts
)

from backend.services.alert_manager import (
    mark_alert_processed
)

from backend.graph.workflow import (
    workflow
)
router = APIRouter()


@router.get("/investigate")
def investigate():

    alerts = load_unprocessed_alerts()

    processed_count = 0

    for filepath, alert in alerts:

        workflow.invoke(
            {
                "alert": alert
            }
        )

        mark_alert_processed(filepath)

        clear_ip(
        alert["source_ip"]
        )

        processed_count += 1

    return {
        "status": "success",
        "processed_alerts": processed_count
    }