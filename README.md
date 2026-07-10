# EdgeSOC

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black)
![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)
![Llama](https://img.shields.io/badge/Llama-3.2%201B-purple)

> **AI-Powered Multi-Agent Autonomous Security Investigation Platform
> for Edge Devices**

EdgeSOC is an autonomous Security Operations Center (SOC) platform that
detects cyber attacks, generates structured alerts, automatically
investigates incidents using a LangGraph multi-agent workflow, maps
attacks to the MITRE ATT&CK framework, generates AI-powered executive
summaries using **Llama 3.2 (1B)** running locally with Ollama, and
presents the results through a modern Next.js dashboard.

------------------------------------------------------------------------

# Features

-   Incremental log monitoring using checkpoints
-   Persistent detection state
-   Brute Force detection
-   SQL Injection detection
-   DDoS detection
-   Automatic JSON alert generation
-   FastAPI backend APIs
-   LangGraph multi-agent investigation
-   MITRE ATT&CK mapping
-   AI executive summaries (Llama 3.2 via Ollama)
-   Automated report generation
-   Next.js dashboard
-   Alert lifecycle management

------------------------------------------------------------------------

# Architecture

``` text
Website
   │
   ▼
website.log
   │
   ▼
Checkpoint Manager
   │
   ▼
Detection Engine
   │
   ▼
Alert Generator
   │
   ▼
FastAPI Backend
   │
   ▼
LangGraph Workflow
 ├── Coordinator Agent
 ├── Log Agent
 ├── IOC Agent
 ├── Threat Agent
 ├── Report Agent
 └── Summary Agent
   │
   ▼
Investigation Report
   │
   ▼
Next.js Dashboard
```

------------------------------------------------------------------------

# Detection Workflow

``` text
User Login
   ↓
website.log
   ↓
Read only NEW logs (Checkpoint)
   ↓
Stateful Detection
   ↓
Alert JSON
   ↓
Automatic Investigation
   ↓
MITRE Mapping
   ↓
AI Executive Summary
   ↓
Incident Report
   ↓
Dashboard
```

------------------------------------------------------------------------

# Project Structure

``` text
EdgeSOC/
├── frontend/
├── backend/
│   ├── agents/
│   ├── graph/
│   ├── models/
│   ├── reports/
│   ├── routes/
│   ├── services/
│   └── main.py
├── monitor/
├── alerts/
├── logs/
├── state/
├── README.md
└── requirements.txt
```

------------------------------------------------------------------------

# Technology Stack

  Component         Technology
  ----------------- -----------------------------------
  Frontend          Next.js, TypeScript, Tailwind CSS
  Backend           FastAPI
  AI                Ollama + Llama 3.2 (1B)
  Agent Framework   LangGraph
  Detection         Python
  Mapping           MITRE ATT&CK

------------------------------------------------------------------------

# Installation

## Clone

``` bash
git clone https://github.com/<your-username>/EdgeSOC.git
cd EdgeSOC
```

## Python Environment

``` bash
python -m venv venv
```

Windows:

``` bash
venv\Scripts\activate
```

Linux/macOS:

``` bash
source venv/bin/activate
```

## Install Python Dependencies

``` bash
pip install -r requirements.txt
```

If needed:

``` bash
pip install fastapi uvicorn requests langgraph langchain-core
```

## Install Frontend

``` bash
cd frontend
npm install
```

## Install Ollama

Install Ollama from https://ollama.com

Verify:

``` bash
ollama --version
```

Download the model:

``` bash
ollama pull llama3.2:1b
```

------------------------------------------------------------------------

# Running EdgeSOC

## 1. Start FastAPI

``` bash
uvicorn backend.main:app --reload
```

## 2. Start Dashboard

``` bash
cd frontend
npm run dev
```

Dashboard:

``` text
http://localhost:3000
```

API:

``` text
http://localhost:8000
```

------------------------------------------------------------------------

# Alert Lifecycle

``` text
Attack
  ↓
Alert Generated
  ↓
Investigation
  ↓
MITRE Mapping
  ↓
Executive Summary
  ↓
Report Saved
  ↓
Alert Processed
  ↓
Detection State Reset
```

------------------------------------------------------------------------

# Dashboard Modules

-   Dashboard
-   Alerts
-   Reports
-   Health Monitoring

------------------------------------------------------------------------

# Scalability

EdgeSOC is designed with scalability in mind:

-   Incremental log processing using checkpoints
-   Persistent detection state
-   Modular agent architecture
-   FastAPI service-based backend
-   Ready for Kafka/RabbitMQ integration
-   Suitable for NVIDIA Jetson Orin Nano deployment

------------------------------------------------------------------------

# Future Roadmap

-   Kafka/RabbitMQ integration
-   PostgreSQL persistence
-   Docker deployment
-   Edge deployment on NVIDIA Jetson
-   Additional attack modules
-   SIEM integration

------------------------------------------------------------------------

# Contributing

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit changes.
4.  Push your branch.
5.  Open a Pull Request.

------------------------------------------------------------------------

# Troubleshooting

-   Ensure Ollama is running before investigation.
-   Pull the Llama model with `ollama pull llama3.2:1b`.
-   Verify FastAPI is running on port 8000.
-   Verify the Next.js dashboard is running on port 3000.

------------------------------------------------------------------------

# License

MIT License.

------------------------------------------------------------------------

# Acknowledgements

Built as an academic cybersecurity research project demonstrating
autonomous incident detection and investigation using multi-agent AI
workflows.
