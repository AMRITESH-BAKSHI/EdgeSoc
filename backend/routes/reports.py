from fastapi import APIRouter

from config import REPORTS_DIR

router = APIRouter()


@router.get("/reports")
def get_reports():
    if not REPORTS_DIR.exists():
        return []

    reports = []
    for filename in sorted(REPORTS_DIR.iterdir()):
        if filename.suffix == ".txt":
            reports.append({
                "filename": filename.name
            })
    return reports


@router.get("/reports/{filename}")
def get_report(filename: str):
    filepath = REPORTS_DIR / filename

    if not filepath.exists():
        return {"error": "Report not found"}

    with open(filepath, "r", encoding="utf-8") as file:
        content = file.read()

    return {
        "filename": filename,
        "content": content
    }
