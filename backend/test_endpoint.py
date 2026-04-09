from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_sma_endpoint():
    # We know user 1 exists from our previous test
    response = client.get("/analytics/sma/1?k=7")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"User: {data['username']}")
        print(f"SMA Data points: {len(data['sma_data'])}")
        if data['sma_data']:
            print(f"First point: {data['sma_data'][0]}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_sma_endpoint()
