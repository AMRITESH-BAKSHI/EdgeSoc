"""
EdgeSOC - Shared Configuration Module
======================================

This module is the single source of truth for every filesystem path,
threshold, and external-service URL used across the project.

Both the `backend/` package and the `monitor/` package import from here
directly (never from each other's internals), which avoids circular
imports while guaranteeing every module agrees on where things live.

All paths are resolved relative to PROJECT_ROOT (this file's directory),
not the current working directory, so the app behaves identically no
matter how or from where it's launched (uvicorn --reload, systemd
service, Docker CMD, etc.).

Values can be overridden via a `.env` file at the project root (see
`.env.example`). Nothing deployment-specific should be hardcoded
anywhere else in the codebase.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Project root + .env loading
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent

# Loads EdgeSOC/.env if present. Safe to call even if the file doesn't
# exist (dotenv just no-ops), so this works in dev and on the Jetson.
load_dotenv(PROJECT_ROOT / ".env")


def _env_str(key: str, default: str) -> str:
    return os.environ.get(key, default)


def _env_int(key: str, default: int) -> int:
    try:
        return int(os.environ.get(key, default))
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------------------
# Filesystem paths (all absolute, all derived from PROJECT_ROOT)
# ---------------------------------------------------------------------------

LOGS_DIR = PROJECT_ROOT / "logs"
LOG_FILE = LOGS_DIR / "website.log"

STATE_DIR = PROJECT_ROOT / "state"
CHECKPOINT_FILE = STATE_DIR / "checkpoint.json"
DETECTION_STATE_FILE = STATE_DIR / "detection_state.json"

ALERTS_DIR = PROJECT_ROOT / "alerts"

REPORTS_DIR = PROJECT_ROOT / "backend" / "reports" / "generated"

# Every directory that must exist before the app can run safely.
REQUIRED_DIRECTORIES = [
    LOGS_DIR,
    STATE_DIR,
    ALERTS_DIR,
    REPORTS_DIR,
]


def ensure_directories() -> None:
    """
    Create every required directory (and an empty website.log) if missing.

    Safe to call multiple times (idempotent) - intended to run once at
    application startup (see backend/main.py) so a fresh clone works
    without any manual setup step.
    """
    for directory in REQUIRED_DIRECTORIES:
        directory.mkdir(parents=True, exist_ok=True)

    if not LOG_FILE.exists():
        LOG_FILE.touch()


# ---------------------------------------------------------------------------
# Detection thresholds
# ---------------------------------------------------------------------------

BRUTE_FORCE_THRESHOLD = _env_int("BRUTE_FORCE_THRESHOLD", 3)

DDOS_THRESHOLD = _env_int("DDOS_THRESHOLD", 5)
# Only requests within this rolling time window (in seconds) count toward
# the DDoS threshold. Prevents a single old burst from permanently
# inflating the counter (see HANDOFF.md "Known Issue").
DDOS_TIME_WINDOW = _env_int("DDOS_TIME_WINDOW", 60)

# ---------------------------------------------------------------------------
# External services
# ---------------------------------------------------------------------------

OLLAMA_URL = _env_str("OLLAMA_URL", "http://localhost:11434/api/chat")
MODEL_NAME = _env_str("MODEL_NAME", "llama3.2:1b")

# Used by backend/routes/health.py to ping the frontend. Defaults to
# localhost since backend + frontend run on the same host (Jetson) -
# override via .env if they're ever split across machines.
FRONTEND_URL = _env_str("FRONTEND_URL", "http://localhost:3000")

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

# Comma-separated list in .env, e.g. ALLOWED_ORIGINS=http://192.168.1.50:3000
_raw_origins = _env_str("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
