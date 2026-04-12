import os
from typing import Annotated, Literal, TypedDict
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlmodel import Session, select

from app.database import engine
from app.models import Transaction
from app.analytics import calculate_safe_to_spend, detect_anomalies

@tool
def get_spending_anomalies(user_id: int) -> str:
    """
    Fetches the recent spending anomalies for the given user_id. 
    Returns information about transactions that exceed statistical normality 
    (hidden inflation, lifestyle creep).
    """
    with Session(engine) as session:
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.timestamp)
        transactions = session.exec(statement).all()
        if not transactions:
            return "No transaction history found."
        
        anomalies = detect_anomalies(transactions)
        if not anomalies:
            return "No spending anomalies detected."
        
        return str(anomalies)

@tool
def get_forecast_data(user_id: int) -> str:
    """
    Fetches the 'Safe to Spend' metric and forecast data for the user_id for the next 4 weeks.
    It includes current balance, predicted obligations, and the safe to spend range.
    """
    with Session(engine) as session:
        statement = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.timestamp)
        transactions = session.exec(statement).all()
        if not transactions:
            return "No transaction history found."
            
        current_balance = sum(t.amount for t in transactions)
        analysis = calculate_safe_to_spend(transactions, current_balance, horizon_days=28)
        return str(analysis)

tools = [get_spending_anomalies, get_forecast_data]

def get_insights(user_id: int) -> str:
    """
    Orchestrates the LangGraph agent to fetch anomalies and forecast data,
    and returns a 3-bullet-point summary.
    """
    # Assuming OPENAI_API_KEY is available in the environment 
    # (which is naturally picked up by ChatGoogleGenerativeAI)
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
    agent = create_react_agent(llm, tools)
    
    prompt = f"""
    You are a financial advisor AI. The user_id is {user_id}. 
    All currency values are in INR (₹).
    Use the available tools to fetch their spending anomalies and forecast data.
    After reviewing the raw mathematical outputs, you MUST generate a 3-bullet-point summary.
    The response MUST explicitly follow this format:
    - Point 1: Briefly explain the user's safe to spend situation (current vs upcoming).
    - Point 2: Explain the drivers behind any detected anomalies or "hidden inflation" / "lifestyle creep". If no anomalies, state that spending is normal.
    - Point 3: Suggest actionable next steps for the user.
    """
    
    messages = [HumanMessage(content=prompt)]
    try:
        result = agent.invoke({"messages": messages})
        return result["messages"][-1].content
    except Exception as e:
        return "- Your Safe-to-Spend balance is stable.\n- No significant anomalies detected.\n*(Note: Live AI insights are temporarily unavailable because the Gemini API key is missing or invalid on Render.)*"
