import random
import os
import bcrypt
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, SQLModel, create_engine
from dotenv import load_dotenv
from app.models import User, Transaction

# Load .env from project root
load_dotenv("../.env")

neon_url = os.getenv("DATABASE_URL")
if not neon_url:
    raise ValueError("DATABASE_URL not found in .env file")

engine = create_engine(neon_url, echo=False)

def hash_password(pwd: str) -> str:
    return bcrypt.hashpw(pwd[:72].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def init_db():
    print("Initializing database...")
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

def seed_data(days=180):
    with Session(engine) as session:
        print("Seeding diverse user data...")
        users_data = [
            # Safe Spender (Flushed with cash)
            User(username="student_dev_01", hashed_password=hash_password("password123"), monthly_income=25000.0, target_savings_rate=0.20, peer_cohort="tier_1_engineering"),
            # Paycheck to Paycheck (High overdraft risk)
            User(username="student_dev_02", hashed_password=hash_password("password123"), monthly_income=12000.0, target_savings_rate=0.05, peer_cohort="tier_2_arts"),
            # Average Spender (Moderate risk)
            User(username="student_dev_03", hashed_password=hash_password("password123"), monthly_income=18000.0, target_savings_rate=0.10, peer_cohort="tier_1_science")
        ]
        session.add_all(users_data)
        session.commit()
        
        for u in users_data:
            session.refresh(u)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        transactions_to_add = []
        
        for user in users_data:
            base_income = user.monthly_income
            mess_fee = base_income * 0.25
            
            for day_offset in range(days):
                current_date = start_date + timedelta(days=day_offset)
                
                if current_date.day == 1:
                    transactions_to_add.append(Transaction(
                        user_id=user.id, amount=base_income, category="Income", 
                        merchant_name="Stipend", is_recurring=True, timestamp=current_date
                    ))
                
                if current_date.day == 5:
                    transactions_to_add.append(Transaction(
                        user_id=user.id, amount=-mess_fee, category="Housing", 
                        merchant_name="Hostel Mess Fee", is_recurring=True, timestamp=current_date
                    ))
                
                if current_date.day == 10:
                    transactions_to_add.append(Transaction(
                        user_id=user.id, amount=-199.0, category="Subscriptions", 
                        merchant_name="Spotify", is_recurring=True, timestamp=current_date
                    ))

                if random.random() < 0.6:
                    max_snack_spend = (base_income * 0.05) if user.username == "student_dev_02" else (base_income * 0.012)
                    snack_amount = round(random.uniform(-50.0, -max_snack_spend), 2)
                    transactions_to_add.append(Transaction(
                        user_id=user.id, amount=snack_amount, category="Dining", 
                        merchant_name="Campus Canteen", is_recurring=False, timestamp=current_date
                    ))

                if random.random() < (0.1 if user.username == "student_dev_02" else 0.05):
                    max_spike = -base_income * 0.4 if user.username == "student_dev_02" else -base_income * 0.2
                    spike_amount = round(random.uniform(max_spike/2, max_spike), 2)
                    transactions_to_add.append(Transaction(
                        user_id=user.id, amount=spike_amount, category="Shopping", 
                        merchant_name="Amazon", is_recurring=False, timestamp=current_date
                    ))
                    
        # Artificial balance reduction for student 2 to guarantee overdraft risk
        today = datetime.now(timezone.utc)
        transactions_to_add.append(Transaction(
            user_id=users_data[1].id, amount=-sum(t.amount for t in transactions_to_add if t.user_id == users_data[1].id) + 400.0, 
            category="Emergency", merchant_name="Tuition Downpayment", is_recurring=False, timestamp=today
        ))

        session.add_all(transactions_to_add)
        session.commit()
        print(f"Database seeded successfully with {len(transactions_to_add)} transactions.")
        print("Demo credentials:")
        print("  student_dev_01 / password123  (Safe spender)")
        print("  student_dev_02 / password123  (High risk)")
        print("  student_dev_03 / password123  (Average)")

if __name__ == "__main__":
    init_db()
    seed_data()
