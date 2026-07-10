import requests

OLLAMA_URL = "http://localhost:11434/api/chat"


def generate_summary(report):

    messages = [
        {
            "role": "system",
            "content": (
                "You are a Security Operations Center (SOC) analyst.\n"
                "You are generating reports for a simulated university cybersecurity laboratory.\n\n"
                "Rules:\n"
                "- Use ONLY the information provided.\n"
                "- Never invent facts.\n"
                "- Never speculate.\n"
                "- Never mention impacts unless explicitly provided.\n"
                "- Never provide recommendations.\n"
                "- Write exactly 3 professional sentences."
            )
        },
        {
            "role": "user",
            "content": f"""
Generate an executive summary for the following incident.

Attack Type: {report['attack_type']}
Severity: {report['severity']}
Source IP: {report['source_ip']}
Evidence Count: {report['evidence_count']}
MITRE Technique ID: {report['mitre']['technique_id']}
MITRE Technique Name: {report['mitre']['technique_name']}
"""
        }
    ]

    payload = {
        "model": "llama3.2:1b",
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0,
            "num_ctx": 2048
        }
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        result = response.json()

        return result["message"]["content"].strip()

    except Exception as e:
        return f"Summary generation failed: {e}"


if __name__ == "__main__":

    sample_report = {
        "attack_type": "ddos",
        "severity": "high",
        "source_ip": "192.168.1.20",
        "evidence_count": 5,
        "mitre": {
            "technique_id": "T1498",
            "technique_name": "Network Denial of Service"
        }
    }

    print("\n==============================")
    print(" EDGE SOC - SUMMARY AGENT")
    print("==============================\n")

    summary = generate_summary(sample_report)

    print(summary)