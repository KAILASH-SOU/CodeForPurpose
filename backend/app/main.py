from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from datetime import date
from typing import List, Dict
from sqlmodel import Session, select

from app.database import get_session
from app.models import Transaction, User
from app.analytics import calculate_sma, calculate_safe_to_spend
from app.agent import get_insights

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
def get_user_insights(user_id: int):
    """
    Triggered on login (or via daily cron). Runs the LangGraph agent to fetch anomalies,
    forecast data, and returns a human-readable 3-bullet-point summary.
    """
    try:
        summary = get_insights(user_id)
        return {
            "user_id": user_id,
            "insights_summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
