from sqlmodel import Session, select
from app.database import engine
from app.models import User, Transaction
from sqlalchemy import func

def test_query():
    with Session(engine) as session:
        user = session.exec(select(User).filter(User.username == "student_dev_01")).first()
        if not user:
            print("User not found!")
            return
        
        print(f"Testing for user: {user.username} (ID: {user.id})")
        
        statement = (
            select(func.date(Transaction.timestamp).label("day"), func.sum(func.abs(Transaction.amount)).label("total_spend"))
            .where(Transaction.user_id == user.id)
            .where(Transaction.category != "Income")
            .where(Transaction.amount < 0)
            .group_by(func.date(Transaction.timestamp))
            .order_by(func.date(Transaction.timestamp))
        )
        
        results = session.exec(statement).all()
        print(f"Found {len(results)} days of spending.")
        for row in results[:5]:
            print(f"Date: {row.day}, Spend: {row.total_spend}")

if __name__ == "__main__":
    test_query()
