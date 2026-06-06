import re


def extract_iocs(evidence):

    ips = set()

    ip_pattern = r"\b(?:\d{1,3}\.){3}\d{1,3}\b"

    for line in evidence:

        matches = re.findall(
            ip_pattern,
            line
        )

        for match in matches:
            ips.add(match)

    return {
        "ips": list(ips)
    }


