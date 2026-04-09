from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_safe_to_spend_endpoint():
    # User 1 (student_dev_01) has transactions seeded for 180 days ending around "now"
    response = client.get("/analytics/safe-to-spend/1?weeks=4")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"User: {data['username']}")
        print(f"Today (Reference): {data['today_reference']}")
        print(f"Current Balance: {data['current_balance']}")
        print(f"Upcoming Recurring: {data['upcoming_recurring']}")
        print(f"Upcoming Items: {json.dumps(data['upcoming_recurring_items'], indent=2)}")
        print(f"Predicted Variable Spend (4 weeks): {data['predicted_variable_spend']}")
        print(f"Uncertainty (95% CI): {data['uncertainty_95']}")
        print(f"Safe to Spend: {data['safe_to_spend']}")
        print(f"Lower Bound (Worst case leftover): {data['lower_bound_safe']}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_safe_to_spend_endpoint()
