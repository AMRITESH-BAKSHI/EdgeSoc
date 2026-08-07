from config import BRUTE_FORCE_THRESHOLD, DDOS_THRESHOLD, DDOS_TIME_WINDOW

# SQL injection signatures are project-specific detection logic (not
# deployment config), so they stay here rather than in config.py.
SQL_PATTERNS = [
    "' OR 1=1",
    "UNION SELECT",
    "DROP TABLE"
]

# Re-exported from config.py so existing `from monitor.rules import
# BRUTE_FORCE_THRESHOLD, DDOS_THRESHOLD` call sites keep working without
# every threshold being duplicated in two places.
__all__ = [
    "SQL_PATTERNS",
    "BRUTE_FORCE_THRESHOLD",
    "DDOS_THRESHOLD",
    "DDOS_TIME_WINDOW",
]
