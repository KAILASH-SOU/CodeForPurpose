import random
import os
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

def init_db():
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)

def seed_data(days=180):
    with Session(engine) as session:
        # Check if user already exists
        existing_user = session.query(User).filter(User.username == "student_dev_01").first()
        if existing_user:
            print("User already exists, skipping seeding.")
            return

        print("Seeding data...")
        test_user = User(
            username="student_dev_01",
            monthly_income=25000.0,
            target_savings_rate=0.20,
            peer_cohort="tier_1_engineering"
        )
        session.add(test_user)
        session.commit()
        session.refresh(test_user)

        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        transactions_to_add = []
        for day_offset in range(days):
            current_date = start_date + timedelta(days=day_offset)
            
            # Stipend
            if current_date.day == 1:
                transactions_to_add.append(Transaction(
                    user_id=test_user.id, amount=25000.0, category="Income", 
                    merchant_name="Stipend", is_recurring=True, timestamp=current_date
                ))
            
            # Mess Fee
            if current_date.day == 5:
                transactions_to_add.append(Transaction(
                    user_id=test_user.id, amount=-4500.0, category="Housing", 
                    merchant_name="Hostel Mess Fee", is_recurring=True, timestamp=current_date
                ))
            
            # Spotify
            if current_date.day == 10:
                transactions_to_add.append(Transaction(
                    user_id=test_user.id, amount=-199.0, category="Subscriptions", 
                    merchant_name="Spotify", is_recurring=True, timestamp=current_date
                ))

            # Daily snacks
            if random.random() < 0.6:
                snack_amount = round(random.uniform(-50.0, -300.0), 2)
                transactions_to_add.append(Transaction(
                    user_id=test_user.id, amount=snack_amount, category="Dining", 
                    merchant_name="Campus Canteen", is_recurring=False, timestamp=current_date
                ))

            # Occasional shopping spikes
            if random.random() < 0.05:
                spike_amount = round(random.uniform(-2000.0, -5000.0), 2)
                transactions_to_add.append(Transaction(
                    user_id=test_user.id, amount=spike_amount, category="Shopping", 
                    merchant_name="Amazon", is_recurring=False, timestamp=current_date
                ))

        session.add_all(transactions_to_add)
        session.commit()
        print(f"Database seeded successfully with {len(transactions_to_add)} transactions.")

if __name__ == "__main__":
    init_db()
    seed_data()
