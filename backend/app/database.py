import os
from pathlib import Path
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

# Local dev: try loading .env from backend dir, then project root
# Production (Render): env vars are already injected — load_dotenv is a no-op
_backend_env = Path(__file__).resolve().parent.parent / ".env"
_root_env    = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(_backend_env if _backend_env.exists() else _root_env)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL, echo=False)

def get_session():
    with Session(engine) as session:
        yield session
