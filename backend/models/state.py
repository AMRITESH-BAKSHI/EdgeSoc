from typing import TypedDict


class InvestigationState(TypedDict):

    alert: dict

    plan: dict

    evidence: list

    iocs: dict

    mitre: dict

    report: dict

    report_path: str

    summary: str