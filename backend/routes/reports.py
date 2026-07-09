from fastapi import APIRouter
import os

router = APIRouter()

# Dynamically resolve the absolute path so it never gets lost
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORTS_DIR = os.path.join(BASE_DIR, "reports", "generated")

@router.get("/reports")
def get_reports():
    if not os.path.exists(REPORTS_DIR):
        return []

    reports = []
    for filename in os.listdir(REPORTS_DIR):
        if filename.endswith(".txt"):
            reports.append({
                "filename": filename
            })
    return reports

@router.get("/reports/{filename}")
def get_report(filename: str):
    filepath = os.path.join(REPORTS_DIR, filename)

    if not os.path.exists(filepath):
        return {"error": "Report not found"}

    with open(filepath, "r", encoding="utf-8") as file:
        content = file.read()

    return {
        "filename": filename,
        "content": content
    }