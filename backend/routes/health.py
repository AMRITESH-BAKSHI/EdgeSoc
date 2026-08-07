import time
import requests
from fastapi import APIRouter

from config import FRONTEND_URL

router = APIRouter()


@router.get("/health-status")
def get_website_health():
    start_time = time.time()
    try:
        response = requests.get(FRONTEND_URL, timeout=3)
        latency = round((time.time() - start_time) * 1000)

        if response.status_code == 200:
            status = "UP"
        else:
            status = "DEGRADED"

        return {
            "status": status,
            "status_code": response.status_code,
            "latency_ms": latency
        }

    except requests.exceptions.RequestException as e:
        return {
            "status": "DOWN",
            "status_code": 500,
            "latency_ms": 0,
            "error": str(e)
        }
