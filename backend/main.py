from fastapi import FastAPI

from backend.routes.alerts import router as alerts_router
from backend.routes.investigate import (
    router as investigate_router
)
from backend.routes.reports import (
    router as reports_router
)
app = FastAPI(
    title="EdgeSOC",
    version="1.0.0"
)
app.include_router(
    investigate_router
)
app.include_router(alerts_router)
app.include_router(
    reports_router
)

@app.get("/")
def home():
    return {
        "message": "EdgeSOC Running"
    }