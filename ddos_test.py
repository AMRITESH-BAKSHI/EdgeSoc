import requests

URL = "http://localhost:3000/api/search"

for i in range(50):

    requests.post(
        URL,
        json={
            "query": "test"
        }
    )

print("Attack Complete")