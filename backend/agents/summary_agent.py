import requests


OLLAMA_URL = "http://localhost:11434/api/generate"


def generate_summary(report):

    prompt = f"""
You are a cybersecurity analyst.

Generate a cybersecurity executive summary.

Use ONLY the information provided.

Do NOT invent facts.
Do NOT speculate.
Do NOT mention impacts that are not provided.
Do NOT provide recommendations.

Write 3-5 professional sentences.

Attack Type: {report['attack_type']}
Severity: {report['severity']}
Source IP: {report['source_ip']}
Evidence Count: {report['evidence_count']}
MITRE Technique: {report['mitre']['technique_id']}
MITRE Name: {report['mitre']['technique_name']}

Keep the response professional and under 100 words.
"""

    payload = {
        "model": "qwen2.5:1.5b",
        "prompt": prompt,
        "stream": False,
        "options":{"temperature":0}
    }

    response = requests.post(
        OLLAMA_URL,
        json=payload
    )

    result = response.json()

    return result["response"]


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

    print(
        generate_summary(
            sample_report
        )
    )