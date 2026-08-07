"""
Manual DDoS simulation script.

Run this on the same machine as the frontend (it hits the frontend's own
/api/search route, which logs REQUEST entries to website.log for the
detector to pick up). Not part of the app runtime - safe to leave
pointed at localhost, but overridable via TARGET_URL if you ever need
to run it from a different machine.
"""

import os
import requests

TARGET_URL = os.environ.get("TARGET_URL", "http://localhost:3000/api/search")

for i in range(50):

    requests.post(
        TARGET_URL,
        json={
            "query": "test"
        }
    )

print("Attack Complete")
