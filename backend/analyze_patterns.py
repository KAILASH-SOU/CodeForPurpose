from sqlmodel import Session, select
from app.database import engine
from app.models import Transaction, User
from datetime import datetime, timezone, timedelta

def analyze_recurring():
    with Session(engine) as session:
        user = session.exec(select(User).filter(User.username == "student_dev_01")).first()
        if not user:
            print("User not found!")
            return
        
        # Get recurring transactions
        statement = select(Transaction).where(Transaction.user_id == user.id).where(Transaction.is_recurring == True)
        recurring = session.exec(statement).all()
        
        print(f"User: {user.username}")
        print(f"Found {len(recurring)} recurring transactions.")
        
        # Group by merchant/category to see patterns
        patterns = {}
        for t in recurring:
            key = (t.merchant_name, t.category)
            if key not in patterns:
                patterns[key] = []
            patterns[key].append(t)
            
        for key, txs in patterns.items():
            txs.sort(key=lambda x: x.timestamp)
            print(f"\nMerchant: {key[0]} ({key[1]})")
            print(f"Frequency: {len(txs)} times")
            if len(txs) > 1:
                interval = txs[-1].timestamp - txs[-2].timestamp
                print(f"Latest interval: {interval.days} days")
            print(f"Amount: {txs[-1].amount}")

if __name__ == "__main__":
    analyze_recurring()
