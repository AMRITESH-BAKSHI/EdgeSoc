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
    Extract timestamp from log lines such as:

    [2026-08-08T09:29:53.607Z]

    Also supports the older format:

    [2026-06-06 10:00:00]

    Returns a datetime object or None.
    """

    match = re.search(
        r"\[([^\]]+)\]",
        line
    )

    if not match:
        return None

    timestamp = match.group(1)

    # Current website log format:
    # 2026-08-08T09:29:53.607Z
    try:
        return datetime.fromisoformat(
            timestamp.replace("Z", "+00:00")
        )
    except ValueError:
        pass

    # Older log format:
    # 2026-06-06 10:00:00
    try:
        return datetime.strptime(
            timestamp,
            "%Y-%m-%d %H:%M:%S"
        )
    except ValueError:
        return None


def extract_username(line):
    """
    Extract username from a log line.

    Example:
    username=randomperson.lucky@gmail.com

    Returns the username string or None.
    """

    match = re.search(
        r"\busername=(\S+)",
        line
    )

    return match.group(1) if match else None