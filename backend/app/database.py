import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

# Load .env from project root
load_dotenv("../.env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session
