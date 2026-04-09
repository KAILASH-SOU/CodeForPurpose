import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

def calculate_sma(daily_spend, k):
    """
    Calculates the Simple Moving Average (SMA) for a given series of daily spending.
    """
    sma = []
    current_sum = 0.0

    for i in range(len(daily_spend)):
        current_sum += daily_spend[i]

        if i >= k:
            current_sum -= daily_spend[i - k]

        if i >= k - 1:
            sma.append(current_sum / k)

    return sma

def calculate_safe_to_spend(
    transactions: List[Any], 
    current_balance: float, 
    horizon_days: int = 30
) -> Dict[str, Any]:
    """
    Forecasts upcoming obligations and calculates the Safe to Spend metric.
    
    :param transactions: List of transaction objects (SQLModel/SQLAlchemy).
    :param current_balance: User's absolute current balance.
    :param horizon_days: Forecast window.
    :return: Dictionary with projections and bounds.
    """
    if not transactions:
        return {
            "current_balance": current_balance,
            "safe_to_spend": current_balance,
            "forecast_recurring": 0.0,
            "forecast_variable": 0.0,
            "uncertainty": 0.0
        }

    # Latest date is our "today"
    today = max(t.timestamp for t in transactions)
    # Ensure today is timezone-aware if needed, but the data is consistent
    
    # 1. Identify Recurring Bills
    recurring_bills = {}
    for t in transactions:
        if t.is_recurring and t.amount < 0:
            key = (t.merchant_name, t.category)
            if key not in recurring_bills:
                recurring_bills[key] = []
            recurring_bills[key].append(t)
            
    upcoming_recurring_total = 0.0
    upcoming_recurring_items = []
    
    for (merchant, category), txs in recurring_bills.items():
        txs.sort(key=lambda x: x.timestamp)
        last_tx = txs[-1]
        
        # Estimate frequency (simple implementation for hackathon)
        # Defaulting to 30 days if no frequency found, else using last interval
        if len(txs) > 1:
            frequency_days = (txs[-1].timestamp - txs[-2].timestamp).days
        else:
            frequency_days = 30 # Default to monthly
            
        next_occurrence = last_tx.timestamp + timedelta(days=frequency_days)
        
        # Check if it falls within our window
        if today < next_occurrence <= today + timedelta(days=horizon_days):
            upcoming_recurring_total += abs(last_tx.amount)
            upcoming_recurring_items.append({
                "merchant": merchant,
                "amount": abs(last_tx.amount),
                "expected_date": str(next_occurrence.date())
            })

    # 2. Variable Spend Analysis
    variable_txs = [t for t in transactions if not t.is_recurring and t.amount < 0]
    
    daily_spend = {}
    for t in variable_txs:
        d = t.timestamp.date()
        daily_spend[d] = daily_spend.get(d, 0.0) + abs(t.amount)
        
    # Get all days to include zeroes
    all_dates = [t.timestamp.date() for t in variable_txs]
    if all_dates:
        start_date = min(all_dates)
        end_date = max(all_dates)
        num_days = (end_date - start_date).days + 1
        
        daily_list = []
        for i in range(num_days):
            d = start_date + timedelta(days=i)
            daily_list.append(daily_spend.get(d, 0.0))
            
        mean_daily = sum(daily_list) / num_days
        
        # Variance calculation
        variance = sum((x - mean_daily) ** 2 for x in daily_list) / num_days
        std_dev = math.sqrt(variance)
    else:
        mean_daily = 0.0
        std_dev = 0.0

    # 3. Projections for window
    forecasted_variable = mean_daily * horizon_days
    # Uncertainty using 95% Confidence Interval (1.96 * std_dev * sqrt(T))
    # sqrt(horizon_days) because variance scales with time T
    uncertainty = 1.96 * std_dev * math.sqrt(horizon_days)
    
    # 4. Safe to Spend
    # Formula: current_balance - (recurring in window + mean/median scenario variable)
    # We'll use the mean for the basic safe_to_spend as requested (not ultra-conservative)
    safe_to_spend = current_balance - (upcoming_recurring_total + forecasted_variable)
    
    # "Lower Bound" for Safe to Spend (worst case leftover)
    lower_bound_safe = safe_to_spend - uncertainty
    # "Upper Bound" for Safe to Spend (best case leftover)
    upper_bound_safe = safe_to_spend + uncertainty

    return {
        "today_reference": str(today.date()),
        "horizon_days": horizon_days,
        "current_balance": round(current_balance, 2),
        "upcoming_recurring": round(upcoming_recurring_total, 2),
        "upcoming_recurring_items": upcoming_recurring_items,
        "predicted_variable_spend": round(forecasted_variable, 2),
        "uncertainty_95": round(uncertainty, 2),
        "safe_to_spend": round(safe_to_spend, 2),
        "lower_bound_safe": round(lower_bound_safe, 2),
        "upper_bound_safe": round(upper_bound_safe, 2)
    }
