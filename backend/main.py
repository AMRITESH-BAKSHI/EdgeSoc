from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.alerts import router as alerts_router
from backend.routes.investigate import router as investigate_router
from backend.routes.reports import router as reports_router
# 1. IMPORT YOUR HEALTH ROUTER HERE
from backend.routes.health import router as health_router

app = FastAPI(
    title="EdgeSOC",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)
# ---------------------------

app.include_router(investigate_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(health_router)

@app.get("/")
def home():
    return {
        "message": "EdgeSOC Running"
    }