import pytest
from datetime import datetime, timezone, timedelta
from app.analytics import calculate_investment_projection, calculate_overdraft_probability

def test_calculate_investment_projection():
    # Test case 1: 10 years at 7% return
    projections = calculate_investment_projection(
        current_balance=1000.0,
        monthly_income=5000.0,
        current_savings_rate=0.10, # $500 / mo
        new_savings_rate=0.20,     # $1000 / mo
        years=10,
        annual_return_rate=0.07
    )
    
    assert len(projections) == 11 # Year 0 to 10
    assert projections[0]["year"] == 0
    assert projections[0]["current_plan"] == 1000.0
    assert projections[0]["new_plan"] == 1000.0
    
    # Check that new plan grows strictly faster than current plan after year 0
    assert projections[-1]["new_plan"] > projections[-1]["current_plan"]
    
    # Check year 1 basic numbers
    # $500/mo * 12 = $6000 + $1000 base + interest
    assert projections[1]["current_plan"] > 7000.0
    # $1000/mo * 12 = $12000 + $1000 base + interest
    assert projections[1]["new_plan"] > 13000.0

class MockTransaction:
    def __init__(self, amount, timestamp, is_recurring=False, merchant_name=""):
        self.amount = amount
        self.timestamp = timestamp
        self.is_recurring = is_recurring
        self.merchant_name = merchant_name

def test_calculate_overdraft_probability_safe():
    # Large balance relative to spending
    today = datetime.now(timezone.utc)
    
    # Variable transactions: 10 days of $-10.0 spending
    txs = []
    for i in range(10):
        txs.append(MockTransaction(-10.0, today - timedelta(days=i)))
        
    # probability should be near 0
    prob = calculate_overdraft_probability(txs, current_balance=5000.0, days_until_income=10)
    assert prob == 0.0

def test_calculate_overdraft_probability_risky():
    # Small balance relative to spending
    today = datetime.now(timezone.utc)
    
    txs = []
    # Very volatile spending averaging $-100
    for i in range(10):
        txs.append(MockTransaction(float(-50 - (i * 10)), today - timedelta(days=i)))
        
    # User only has $50 left but needs to survive 10 days, probability should be very high
    prob = calculate_overdraft_probability(txs, current_balance=50.0, days_until_income=10)
    assert prob > 80.0

def test_calculate_overdraft_probability_guaranteed():
    # Starting negative
    today = datetime.now(timezone.utc)
    txs = [MockTransaction(-10.0, today)]
    
    prob = calculate_overdraft_probability(txs, current_balance=-5.0, days_until_income=5)
    assert prob == 100.0
