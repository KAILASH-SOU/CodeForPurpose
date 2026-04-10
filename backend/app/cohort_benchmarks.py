"""
Mock "Top 10% Cohort" benchmark dataset.
Each cohort represents the financial habits of the top 10% performers 
in that peer group, used for peer-anchored scenario forecasting.
"""

COHORT_BENCHMARKS = {
    "tier_1_engineering": {
        "cohort_name": "Top 10% — Tier 1 Engineering Students",
        "monthly_income": 25000.0,
        "savings_rate": 0.42,                # 42% savings rate
        "avg_daily_variable_spend": 180.0,   # ₹180/day on discretionary
        "fixed_monthly_expenses": 5000.0,    # Mess + subscriptions
        "investment_rate": 0.15,             # 15% invested in equity/SIPs
        "dining_spend_share": 0.12,          # 12% of income on dining
        "emergency_fund_months": 3.5,        # 3.5 months buffer
        "top_habits": [
            "Automated SIP investing on the 2nd of every month",
            "Weekly spending reviews every Sunday",
            "No-spend Wednesdays to break impulse habits",
            "Using UPI cashback cards for all purchases"
        ]
    },
    "tier_2_arts": {
        "cohort_name": "Top 10% — Tier 2 Arts Students",
        "monthly_income": 12000.0,
        "savings_rate": 0.30,
        "avg_daily_variable_spend": 80.0,
        "fixed_monthly_expenses": 3500.0,
        "investment_rate": 0.08,
        "dining_spend_share": 0.18,
        "emergency_fund_months": 2.0,
        "top_habits": [
            "Cooking at home 5+ days a week",
            "Tracking every expense in a notes app",
            "Splitting all group outings 50/50",
            "Selling unused items monthly for extra income"
        ]
    },
    "tier_1_science": {
        "cohort_name": "Top 10% — Tier 1 Science Students",
        "monthly_income": 18000.0,
        "savings_rate": 0.38,
        "avg_daily_variable_spend": 130.0,
        "fixed_monthly_expenses": 4800.0,
        "investment_rate": 0.12,
        "dining_spend_share": 0.14,
        "emergency_fund_months": 3.0,
        "top_habits": [
            "Monthly budget allocation before spending anything",
            "Reviewing subscription services every quarter",
            "Using institutional library resources instead of buying books",
            "Carpooling and using student transit passes"
        ]
    },
    "general": {
        "cohort_name": "Top 10% — General Student Cohort",
        "monthly_income": 20000.0,
        "savings_rate": 0.35,
        "avg_daily_variable_spend": 150.0,
        "fixed_monthly_expenses": 4500.0,
        "investment_rate": 0.10,
        "dining_spend_share": 0.15,
        "emergency_fund_months": 2.5,
        "top_habits": [
            "Setting spending alerts on their bank app",
            "Buying in bulk for staples to reduce per-unit cost",
            "Avoiding EMI for any purchase under ₹10,000",
            "Reviewing financial goals monthly"
        ]
    }
}

def get_cohort(peer_cohort: str) -> dict:
    """Returns the benchmark data for the given cohort, defaulting to 'general'."""
    return COHORT_BENCHMARKS.get(peer_cohort, COHORT_BENCHMARKS["general"])
