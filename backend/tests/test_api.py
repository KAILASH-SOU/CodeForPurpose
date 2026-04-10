import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_overdraft_risk_api_user_not_found():
    response = client.get("/analytics/overdraft-risk/99999")
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_what_if_api_user_not_found():
    response = client.get("/analytics/what-if/99999?new_rate=25")
    assert response.status_code == 404
    assert "User not found" in response.json()["detail"]

def test_get_agent_insights_user_not_found():
    response = client.get("/agent/insights/99999")
    assert response.status_code == 404
    
def test_analytics_sma_user_not_found():
    response = client.get("/analytics/sma/99999")
    assert response.status_code == 404
