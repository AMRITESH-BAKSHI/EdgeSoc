from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGINS, ensure_directories

from backend.routes.detect import router as detect_router
from backend.routes.alerts import router as alerts_router
from backend.routes.investigate import router as investigate_router
from backend.routes.reports import router as reports_router
from backend.routes.health import router as health_router

app = FastAPI(
    title="EdgeSOC",
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    # Creates logs/, state/, alerts/, backend/reports/generated/ (and an
    # empty logs/website.log) if they don't already exist, so a fresh
    # clone / fresh Jetson deployment doesn't need manual setup.
    ensure_directories()


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(investigate_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(health_router)
app.include_router(detect_router)


@app.get("/")
def home():
    return {
        "message": "EdgeSOC Running"
    }
