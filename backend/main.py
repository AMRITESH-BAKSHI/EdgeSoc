from fastapi import FastAPI

from backend.routes.alerts import router as alerts_router

app = FastAPI(
    title="EdgeSOC",
    version="1.0.0"
)

app.include_router(alerts_router)


@app.get("/")
def home():
    return {
        "message": "EdgeSOC Running"
    }