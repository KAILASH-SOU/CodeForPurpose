from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    monthly_income: float
    target_savings_rate: float 
    peer_cohort: str 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    transactions: List["Transaction"] = Relationship(back_populates="user")

class Transaction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    amount: float 
    category: str = Field(index=True) 
    merchant_name: str
    is_recurring: bool = Field(default=False)
    timestamp: datetime = Field(index=True)
    
    user: Optional[User] = Relationship(back_populates="transactions")
