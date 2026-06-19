# EdgeSOC

## Multi-Agent Autonomous Security Investigation Platform

EdgeSOC is an AI-powered Security Operations Center (SOC) assistant that automatically investigates cybersecurity alerts using a multi-agent architecture built with LangGraph.

The platform is designed to run locally and eventually be deployed on NVIDIA Jetson edge devices.

---

# Current Project Status

## Completed Features

### Detection Engine

Detects:

* SQL Injection
* Brute Force Attacks
* DDoS Attacks

---

### Alert Generation

Generates structured alert files in JSON format.

Example:

```json
{
    "alert_id": "ALT-a1b2c3d4",
    "attack_type": "ddos",
    "severity": "high",
    "source_ip": "192.168.1.20",
    "processed": false,
    "evidence": {
        "request_count": 5
    }
}
```

---

### FastAPI Backend

Provides backend services for alert management and future dashboard integration.

---

### Multi-Agent Investigation Pipeline

Implemented using LangGraph.

Agents:

1. Coordinator Agent
2. Log Agent
3. IOC Agent
4. Threat Agent
5. Report Agent

---

### Human Report Generation

Creates analyst-friendly investigation reports.

Example:

```
EDGE SOC INVESTIGATION REPORT

Attack Type:
ddos

Severity:
high

Source IP:
192.168.1.20

Evidence Count:
5

MITRE ATT&CK:
T1498 - Network Denial of Service
```

---

### AI Executive Summary

Uses Ollama + Qwen 2.5 (1.5B) to generate executive summaries from investigation reports.

Example:

```
A high-severity DDoS attack was identified from source IP
192.168.1.20. The activity was mapped to MITRE ATT&CK
T1498 (Network Denial of Service).
```

---

# Current Architecture

```
Logs
 ↓

Detection Engine
 ↓

Alert JSON
 ↓

Alert Loader
 ↓

LangGraph Workflow
 ↓

Coordinator Agent
 ↓

Log Agent
 ↓

IOC Agent
 ↓

Threat Agent
 ↓

Report Agent
 ↓

Save Report Agent
 ↓

Summary Agent
 ↓

Final Investigation Report
```

---

# Project Structure

```
EdgeSOC
│
├── alerts/
│
├── logs/
│
├── monitor/
│   ├── detector.py
│   ├── parser.py
│   └── alert_generator.py
│
├── backend/
│   │
│   ├── agents/
│   │   ├── coordinator.py
│   │   ├── log_agent.py
│   │   ├── ioc_agent.py
│   │   ├── threat_agent.py
│   │   ├── report_agent.py
│   │   └── summary_agent.py
│   │
│   ├── graph/
│   │   └── workflow.py
│   │
│   ├── routes/
│   │   └── alerts.py
│   │
│   ├── services/
│   │   ├── alert_loader.py
│   │   ├── alert_manager.py
│   │   └── investigation_service.py
│   │
│   ├── reports/
│   │   ├── report_builder.py
│   │   └── generated/
│   │
│   ├── models/
│   │   └── state.py
│   │
│   └── main.py
│
└── README.md
```

---

# LangGraph Workflow

```
START
 ↓

Coordinator Agent
 ↓

Log Agent
 ↓

IOC Agent
 ↓

Threat Agent
 ↓

Report Agent
 ↓

Save Report Agent
 ↓

Summary Agent
 ↓

END
```

---

# Agent Responsibilities

## Coordinator Agent

Creates investigation plans.

Input:

* Alert

Output:

* Investigation Plan

---

## Log Agent

Collects relevant evidence from logs.

Input:

* Alert

Output:

* Relevant Log Entries

---

## IOC Agent

Extracts Indicators of Compromise (IOCs).

Examples:

* IP Addresses

Output:

* IOC List

---

## Threat Agent

Maps attacks to MITRE ATT&CK.

Examples:

| Attack Type   | MITRE Technique |
| ------------- | --------------- |
| SQL Injection | T1190           |
| Brute Force   | T1110           |
| DDoS          | T1498           |

---

## Report Agent

Builds structured investigation reports.

---

## Summary Agent

Uses Qwen 2.5 through Ollama to generate executive summaries.

---

# Alert Lifecycle

```
Attack Detected
 ↓

Alert Generated
 ↓

processed = false
 ↓

Investigation
 ↓

Report Generated
 ↓

processed = true
```

---

# Technologies Used

## Backend

* Python
* FastAPI

## Agent Framework

* LangGraph

## AI

* Ollama
* Qwen 2.5 1.5B

## Future

* PostgreSQL
* Docker
* NVIDIA Jetson Orin Nano
* Next.js Dashboard

---

# Planned Features

* FastAPI investigation endpoints
* Security dashboard
* Real website attack monitoring
* PostgreSQL storage
* Docker deployment
* NVIDIA Jetson deployment
* Additional attack detection modules
* Real-time monitoring

---

# Project Goal

Create a privacy-preserving, edge-deployable SOC assistant capable of automatically investigating cybersecurity alerts, correlating evidence, generating reports, and assisting analysts without relying on cloud infrastructure.




# Getting Started

## 1. Fork the Repository

Click the **Fork** button on GitHub to create your own copy of the repository.

Then clone it:

```bash
git clone <YOUR_FORK_URL>
```

Example:

```bash
git clone https://github.com/username/EdgeSOC.git
```

Move into the project:

```bash
cd EdgeSOC
```

---

## 2. Create a Python Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / Mac:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

If requirements.txt is not available yet:

```bash
pip install fastapi
pip install uvicorn
pip install langgraph
pip install langchain-core
pip install requests
```

---

## 4. Install Ollama

Download and install Ollama from:

https://ollama.com

Verify installation:

```bash
ollama --version
```

---

## 5. Download the AI Model

```bash
ollama pull qwen2.5:1.5b
```

Verify model:

```bash
ollama list
```

---

## 6. Project Folder Setup

Ensure these folders exist:

```text
alerts/
logs/

backend/reports/generated/
```

Create them if necessary.

---

## 7. Run the Detection Engine

```bash
python monitor/detector.py
```

This generates alert files inside:

```text
alerts/
```

---

## 8. Start FastAPI Backend

```bash
uvicorn backend.main:app --reload
```

Verify:

```text
http://127.0.0.1:8000
```

Expected response:

```json
{
  "message": "EdgeSOC Running"
}
```

---

## 9. Run the Investigation Workflow

```bash
python -m backend.graph.workflow
```

This will:

1. Load unprocessed alerts
2. Execute LangGraph workflow
3. Investigate alerts
4. Generate reports
5. Save reports
6. Mark alerts as processed

---

## 10. Generated Reports

Reports are automatically saved inside:

```text
backend/reports/generated/
```

Example:

```text
report_brute_force_a4b8c9.txt

report_sql_injection_b2f1d7.txt

report_ddos_f8e2a1.txt
```

---

## 11. Git Workflow for Team Members

Before starting work:

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/<feature-name>
```

Example:

```bash
git checkout -b feature/dashboard
```

Commit changes:

```bash
git add .
git commit -m "Implemented dashboard alerts page"
```

Push:

```bash
git push origin feature/dashboard
```

Create a Pull Request on GitHub.

---

## Current Workflow

```text
Logs
 ↓

Detector
 ↓

Alert JSON
 ↓

Alert Loader
 ↓

LangGraph
 ↓

Coordinator Agent
 ↓

Log Agent
 ↓

IOC Agent
 ↓

Threat Agent
 ↓

Report Agent
 ↓

Summary Agent
 ↓

Saved Investigation Report
```
