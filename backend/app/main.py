from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from datetime import date, datetime, timezone, timedelta
from typing import List, Dict
from sqlmodel import Session, select
from pydantic import BaseModel
import bcrypt

from app.database import get_session
from app.models import Transaction, User
from app.analytics import calculate_sma, calculate_safe_to_spend, calculate_investment_projection, calculate_overdraft_probability
from app.agent import get_insights
from app.cohort_benchmarks import get_cohort
from openai import OpenAI
class SignupRequest(BaseModel):
    username: str
    password: str
    monthly_income: float = 25000.0
    target_savings_rate: float = 0.20
    peer_cohort: str = "general"

class LoginRequest(BaseModel):
    username: str
    password: str

app = FastAPI(title="NatWest AI Hackathon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the NatWest AI Analytics API"}

@app.post("/auth/signup")
def signup(req: SignupRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == req.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = bcrypt.hashpw(req.password[:72].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(
        username=req.username,
        hashed_password=hashed,
        monthly_income=req.monthly_income,
        target_savings_rate=req.target_savings_rate,
        peer_cohort=req.peer_cohort
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"user_id": user.id, "username": user.username}

@app.post("/auth/login")
def login(req: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == req.username)).first()
    if not user or not user.hashed_password or not bcrypt.checkpw(req.password[:72].encode('utf-8'), user.hashed_password.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"user_id": user.id, "username": user.username}

@app.get("/analytics/sma/{user_id}")
def get_user_sma(
    user_id: int, 
    k: int = Query(7, description="The window size (number of days) for SMA"),
    session: Session = Depends(get_session)
):
    # ... existing implementation ...
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    statement = (
        select(func.date(Transaction.timestamp).label("day"), func.sum(func.abs(Transaction.amount)).label("total_spend"))
        .where(Transaction.user_id == user_id)
        .where(Transaction.category != "Income")
        .where(Transaction.amount < 0)
        .group_by(func.date(Transaction.timestamp))
        .order_by(func.date(Transaction.timestamp))
    )
    
    results = session.exec(statement).all()
    
    if not results:
        return {"user_id": user_id, "sma": [], "dates": [], "message": "No transaction data found"}

    daily_spends = [float(row.total_spend) for row in results]
    dates = [str(row.day) for row in results]

    sma_values = calculate_sma(daily_spends, k)
    sma_dates = dates[k-1:]

    return {
        "user_id": user_id,
        "username": user.username,
        "window_size": k,
        "sma_data": [
            {"date": d, "value": round(v, 2)} for d, v in zip(sma_dates, sma_values)
        ]
    }

@app.get("/analytics/safe-to-spend/{user_id}")
def get_safe_to_spend(
    user_id: int,
    weeks: int = Query(4, ge=1, le=4, description="Forecast horizon in weeks"),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch all transactions to calculate balance and patterns
    statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.timestamp)
    transactions = session.exec(statement).all()
    
    if not transactions:
        return {"user_id": user_id, "safe_to_spend": 0.0, "message": "No transaction history"}

    current_balance = sum(t.amount for t in transactions)
    horizon_days = weeks * 7
    
    analysis = calculate_safe_to_spend(transactions, current_balance, horizon_days)
    
    return {
        "user_id": user_id,
        "username": user.username,
        **analysis
    }

@app.get("/agent/insights/{user_id}")
def get_user_insights(user_id: int, session: Session = Depends(get_session)):
    """
    Triggered on login (or via daily cron). Runs the LangGraph agent to fetch anomalies,
    forecast data, and returns a human-readable 3-bullet-point summary.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    try:
        summary = get_insights(user_id)
        return {
            "user_id": user_id,
            "insights_summary": summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessagePayload(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

@app.post("/agent/chat/{user_id}")
def chat_with_assistant(user_id: int, req: ChatMessagePayload, session: Session = Depends(get_session)):
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch overdraft risk internally for context
        od_risk = get_overdraft_risk(user_id, session)
        risk_pct = od_risk.get("probability_percentage", 0.0)
        
        # Build prompt
        client = OpenAI()
        system_prompt = f"""
        You are 'SafeSpend AI', a friendly and empathetic financial assistant for the user {user.username}.
        Your goal is to help them understand their finances, specifically their overdraft risk and insights.
        Currently, their calculated probability of overdrafting before their next income is {risk_pct}%.
        Answer their question concisely and practically. Do not use overly formal banking language.
        Always keep responses under exactly 4-5 sentences as it is meant for a compact chat widget.
        
        CRITICAL RULE: You are STRICTLY a financial assistant. If the user asks about ANYTHING outside of 
        personal finance, spending habits, banking, or the dashboard features (such as writing code, 
        general knowledge, unrelated trivia, etc.), you MUST politely decline to answer, stating that you 
        are specifically tuned to assist with their NatWest SafeSpend profile and financial wellbeing.
        """
        
        messages = [{"role": "system", "content": system_prompt}]
        for h in req.history:
            messages.append({"role": h["role"], "content": h["content"]})
            
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            messages=messages,
            temperature=0.7,
            max_tokens=250
        )
        
        reply = response.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/what-if/{user_id}")
def get_what_if_analysis(
    user_id: int, 
    new_rate: int = Query(20, description="The hypothetical new savings rate (e.g. 20 for 20%)"),
    session: Session = Depends(get_session)
):
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Determine actual current balance from existing transactions
        statement = select(func.sum(Transaction.amount)).where(Transaction.user_id == user_id)
        current_balance = session.exec(statement).one_or_none() or 0.0
        
        # Calculate rates
        current_rate_decimal = user.target_savings_rate
        new_rate_decimal = new_rate / 100.0
        
        projections = calculate_investment_projection(
            current_balance=float(current_balance),
            monthly_income=user.monthly_income,
            current_savings_rate=current_rate_decimal,
            new_savings_rate=new_rate_decimal,
            years=10, 
            annual_return_rate=0.07 # 7% average returns
        )

        return {
            "user_id": user_id,
            "current_rate": current_rate_decimal * 100,
            "new_rate": new_rate,
            "projections": projections
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/overdraft-risk/{user_id}")
def get_overdraft_risk(user_id: int, session: Session = Depends(get_session)):
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.timestamp)
        transactions = session.exec(statement).all()
        
        if not transactions:
            return {"probability_percentage": 0.0}
        
        # Use current month's balance snapshot, not total historical cumulative
        # This gives realistic mid-month risk assessment
        today_dt = datetime.now(timezone.utc)
        # Use naive datetime for DB comparison (Postgres/SQLModel returns naive datetimes)
        today_naive = today_dt.replace(tzinfo=None)
        month_start_naive = today_naive.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        current_month_txs = [t for t in transactions if t.timestamp >= month_start_naive]
        
        # If current month has transactions, use those; otherwise fall back to last 35 days
        if current_month_txs:
            current_balance = sum(t.amount for t in current_month_txs)
        else:
            # Fallback: last 35 days of transactions
            cutoff_naive = today_naive - timedelta(days=35)
            recent_txs = [t for t in transactions if t.timestamp >= cutoff_naive]
            current_balance = sum(t.amount for t in recent_txs) if recent_txs else sum(t.amount for t in transactions)
        
        today = today_dt.date()
        
        # Calculate days until next 1st of the month (stipend day)
        if today.month == 12:
            next_income_date = date(today.year + 1, 1, 1)
        else:
            next_income_date = date(today.year, today.month + 1, 1)
            
        days_until_income = (next_income_date - today).days
        
        prob = calculate_overdraft_probability(transactions, current_balance, days_until_income, user_id=user_id)
        
        return {
            "user_id": user_id,
            "days_until_income": days_until_income,
            "probability_percentage": prob
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/reality-check/{user_id}")
def get_reality_check(user_id: int, session: Session = Depends(get_session)):
    """
    Peer-Anchored Scenario Forecasting:
    Compares the user's financial profile against a mock Top 10% cohort baseline.
    Routes both datasets to OpenAI to generate a 'Reality Check' insight.
    """
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Fetch user's transactions for computing current stats
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.timestamp)
        transactions = session.exec(statement).all()

        if not transactions:
            raise HTTPException(status_code=400, detail="No transaction history to benchmark against.")

        # ── User's actual stats ──────────────────────────────────────────────
        # Use current month transactions for a fair comparison
        today_naive = datetime.now(timezone.utc).replace(tzinfo=None)
        month_start = today_naive.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        current_month_txs = [t for t in transactions if t.timestamp >= month_start]
        txs_for_stats = current_month_txs if current_month_txs else transactions[-60:]

        monthly_income = user.monthly_income
        total_spend_month = sum(-t.amount for t in txs_for_stats if t.amount < 0)
        savings_amount = monthly_income - total_spend_month
        user_savings_rate = max(0, savings_amount / monthly_income) if monthly_income > 0 else 0

        variable_txs = [t for t in txs_for_stats if not t.is_recurring and t.amount < 0]
        avg_daily_variable = (sum(-t.amount for t in variable_txs) / max(len(set(t.timestamp.date() for t in variable_txs)), 1)) if variable_txs else 0

        dining_spend = sum(-t.amount for t in txs_for_stats if t.category == "Dining")
        dining_share = dining_spend / monthly_income if monthly_income > 0 else 0

        # ── Top 10% cohort benchmark ─────────────────────────────────────────
        cohort = get_cohort(user.peer_cohort)

        # ── Build comparison payload ─────────────────────────────────────────
        user_profile = {
            "savings_rate_pct": round(user_savings_rate * 100, 1),
            "avg_daily_variable_spend": round(avg_daily_variable, 0),
            "dining_share_pct": round(dining_share * 100, 1),
            "target_savings_rate_pct": round(user.target_savings_rate * 100, 1),
        }

        cohort_profile = {
            "savings_rate_pct": round(cohort["savings_rate"] * 100, 1),
            "avg_daily_variable_spend": cohort["avg_daily_variable_spend"],
            "dining_share_pct": round(cohort["dining_spend_share"] * 100, 1),
            "top_habits": cohort["top_habits"],
            "emergency_fund_months": cohort["emergency_fund_months"],
        }

        # ── Gemini Reality Check ─────────────────────────────────────────────
        prompt = f"""
        You are a sharp, empathetic financial coach for students in India.
        You are given two financial profiles:

        USER's Current Profile (this month's data for {user.username}):
        - Savings Rate: {user_profile['savings_rate_pct']}%
        - Average Daily Variable Spend: ₹{user_profile['avg_daily_variable_spend']}
        - Dining as % of income: {user_profile['dining_share_pct']}%
        - Target Savings Rate (their aspiration): {user_profile['target_savings_rate_pct']}%

        TOP 10% COHORT Benchmark ({cohort['cohort_name']}):
        - Savings Rate: {cohort_profile['savings_rate_pct']}%
        - Average Daily Variable Spend: ₹{cohort_profile['avg_daily_variable_spend']}
        - Dining as % of income: {cohort_profile['dining_share_pct']}%
        - Emergency Fund Buffer: {cohort_profile['emergency_fund_months']} months
        - Key habits they practice: {', '.join(cohort_profile['top_habits'])}

        Generate a 'Reality Check' insight. Be honest but encouraging, not harsh.
        Format EXACTLY as 3 bullets:
        - Bullet 1: Where the user stands vs their top-10% peers (use specific numbers from above).
        - Bullet 2: The single biggest gap and what's driving it.
        - Bullet 3: One concrete, specific action this student can take THIS WEEK to close the gap.
        """

        try:
            client = OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=400
            )
            reality_check_text = response.choices[0].message.content
        except Exception as e:
            reality_check_text = f"API DEBUG INFO: {type(e).__name__} - {str(e)}\n\n*(Note: Live AI insights are temporarily unavailable because the OpenAI API key is missing or invalid on Render.)*"

        return {
            "user_id": user_id,
            "username": user.username,
            "cohort_name": cohort["cohort_name"],
            "user_profile": user_profile,
            "cohort_profile": cohort_profile,
            "reality_check": reality_check_text
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/transactions/{user_id}")
def get_user_transactions(
    user_id: int, 
    limit: int = Query(20, description="Max transactions to return"),
    session: Session = Depends(get_session)
):
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        statement = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.desc())
            .limit(limit)
        )
        transactions = session.exec(statement).all()
        
        return {
            "user_id": user_id,
            "transactions": [
                {
                    "id": t.id,
                    "amount": t.amount,
                    "category": t.category,
                    "merchant_name": t.merchant_name,
                    "is_recurring": t.is_recurring,
                    "timestamp": t.timestamp.isoformat()
                }
                for t in transactions
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
