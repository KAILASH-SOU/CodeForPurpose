import math
import random
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

def detect_anomalies(
    transactions: List[Any], 
    window_days: int = 30, 
    z_score_threshold: float = 2.0
) -> List[Dict[str, Any]]:
    """
    Detects anomalous spending patterns (Hidden Inflation & Lifestyle Creep) 
    by checking recent transactions against statistical bounds: y_hat +/- Z * sigma.
    """
    if not transactions:
        return []

    today = max(t.timestamp for t in transactions)
    window_start = today - timedelta(days=window_days)
    
    # 1. Separate transactions into historical vs recent
    recent_txs = [t for t in transactions if t.timestamp > window_start and t.amount < 0]
    historical_txs = [t for t in transactions if t.timestamp <= window_start and t.amount < 0]
    
    if not historical_txs or not recent_txs:
        return []

    # 2. Compute mean and variance per category
    category_stats = {}
    historical_by_cat = {}
    
    for t in historical_txs:
        historical_by_cat.setdefault(t.category, []).append(abs(t.amount))
        
    for cat, amounts in historical_by_cat.items():
        if len(amounts) < 3: # Need minimum data points for std dev
            continue
            
        mean_val = sum(amounts) / len(amounts)
        variance = sum((x - mean_val) ** 2 for x in amounts) / len(amounts)
        std_dev = math.sqrt(variance)
        
        category_stats[cat] = {
            "mean": mean_val,
            "std_dev": std_dev
        }

    # 3. Detect anomalies in recent transactions
    anomalies = []
    for t in recent_txs:
        cat = t.category
        if cat in category_stats:
            stats = category_stats[cat]
            expected = stats["mean"]
            sigma = stats["std_dev"]
            
            # y_hat + Z * sigma
            if sigma > 0:
                z_score = (abs(t.amount) - expected) / sigma
                if z_score > z_score_threshold:
                    anomalies.append({
                        "transaction_id": t.id,
                        "merchant_name": t.merchant_name,
                        "category": cat,
                        "amount": abs(t.amount),
                        "expected_amount": round(expected, 2),
                        "z_score": round(z_score, 2),
                        "date": str(t.timestamp.date()),
                        "reason": f"Amount is unusually high compared to historical average of {round(expected, 2)} (Z-Score: {round(z_score, 2)})"
                    })
                    
    # Sort by z-score descending to show worst offenders first
    anomalies.sort(key=lambda x: x["z_score"], reverse=True)
    return anomalies

def calculate_investment_projection(
    current_balance: float, 
    monthly_income: float, 
    current_savings_rate: float, 
    new_savings_rate: float, 
    years: int = 10,
    annual_return_rate: float = 0.07
) -> List[Dict[str, Any]]:
    """
    Projects the wealth accumulation over 'years' for two different savings paths.
    """
    monthly_return_rate = annual_return_rate / 12
    
    current_savings_monthly = monthly_income * current_savings_rate
    new_savings_monthly = monthly_income * new_savings_rate
    
    projection = []
    
    current_plan_balance = current_balance
    new_plan_balance = current_balance
    
    # Starting point (Year 0)
    projection.append({
        "year": 0,
        "current_plan": round(current_plan_balance, 2),
        "new_plan": round(new_plan_balance, 2)
    })
    
    for year in range(1, years + 1):
        for _ in range(12):
            # Compound interest + monthly contribution
            current_plan_balance = (current_plan_balance * (1 + monthly_return_rate)) + current_savings_monthly
            new_plan_balance = (new_plan_balance * (1 + monthly_return_rate)) + new_savings_monthly
            
        projection.append({
            "year": year,
            "current_plan": round(current_plan_balance, 2),
            "new_plan": round(new_plan_balance, 2)
        })
        
    return projection

def calculate_overdraft_probability(
    transactions: List[Any],
    current_balance: float,
    days_until_income: int,
    user_id: int = 0,
    iterations: int = 1000
) -> float:
    """
    Runs a Monte Carlo simulation (1000 iterations) using historical spend variance
    to calculate the probability of the balance hitting zero before the next income event.
    """
    if not transactions or days_until_income <= 0:
        return 0.0

    today = max(t.timestamp for t in transactions)
    
    # 1. Deduct strict upcoming recurring bills in this window
    upcoming_recurring_total = 0.0
    recurring_txs = [t for t in transactions if t.is_recurring and t.amount < 0]
    
    # Very naive scheduling for the hackathon MVP
    merchant_dates = {}
    for t in recurring_txs:
        merchant_dates.setdefault(t.merchant_name, []).append(t)
        
    for merchant, txs in merchant_dates.items():
        txs.sort(key=lambda x: x.timestamp)
        last_tx = txs[-1]
        # Assume roughly monthly
        next_date = last_tx.timestamp + timedelta(days=30)
        if today < next_date <= today + timedelta(days=days_until_income):
            upcoming_recurring_total += abs(last_tx.amount)

    # 2. Variable Spend Stats
    variable_txs = [t for t in transactions if not t.is_recurring and t.amount < 0]
    daily_spend = {}
    for t in variable_txs:
        d = t.timestamp.date()
        daily_spend[d] = daily_spend.get(d, 0.0) + abs(t.amount)
        
    all_dates = [t.timestamp.date() for t in variable_txs]
    if all_dates:
        start_date = min(all_dates)
        end_date = max(all_dates)
        num_days = (end_date - start_date).days + 1
        daily_list = [daily_spend.get(start_date + timedelta(days=i), 0.0) for i in range(num_days)]
        
        mean_daily = sum(daily_list) / num_days
        variance = sum((x - mean_daily) ** 2 for x in daily_list) / num_days
        std_dev = math.sqrt(variance)
    else:
        mean_daily = 0.0
        std_dev = 0.0

    # 3. Fast Monte Carlo Simulation
    effective_balance = current_balance - upcoming_recurring_total
    
    if effective_balance <= 0:
        return 100.0 # Guaranteed overdraft
        
    if std_dev == 0 and mean_daily * days_until_income < effective_balance:
        return 0.0

    # Seed with deterministic value so same user+data always gives same score.
    # Seed changes naturally when balance or days_until_income change.
    seed_value = int(user_id * 1000 + abs(round(current_balance)) + days_until_income)
    rng = random.Random(seed_value)

    overdraft_count = 0
    for _ in range(iterations):
        sim_balance = effective_balance
        for _ in range(days_until_income):
            sim_spend = max(0.0, rng.gauss(mean_daily, std_dev))
            sim_balance -= sim_spend
            if sim_balance < 0:
                overdraft_count += 1
                break
                
    probability = (overdraft_count / iterations) * 100.0
    return round(probability, 1)
