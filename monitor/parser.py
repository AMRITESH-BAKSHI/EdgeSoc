import re
from datetime import datetime


def extract_ip(line):
    """
    Extract IPv4 address from a log line.
    Returns None if no IP is found.
    """

    match = re.search(
        r"\b(?:\d{1,3}\.){3}\d{1,3}\b",
        line
    )

    return match.group() if match else None


def extract_timestamp(line):
    """
    Extract timestamp from:
    [2026-06-06 10:00:00]

    Returns datetime object or None.
    """

    match = re.search(
        r"\[(.*?)\]",
        line
    )

    if not match:
        return None

    try:
        return datetime.strptime(
            match.group(1),
            "%Y-%m-%d %H:%M:%S"
        )
    except ValueError:
        return None