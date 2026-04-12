# NatWest SafeSpend 💜

> **NatWest Hackathon Prototype** — AI-powered personal finance analytics for students.

## Live Demo
| Service | URL |
|---------|-----|
| Frontend | Deployed on Vercel |
| Backend  | Deployed on Render |

## Demo Accounts
Login with any of these pre-seeded accounts (password: **qwerty**):

| Username | Profile |
|----------|---------|
| `student1` | Tier 1 · Engineering — High income, savings-focused |
| `student2` | Tier 2 · Arts — Mid income, variable spending |
| `student3` | Tier 1 · Science — Moderate income, balanced habits |

## Features
- 💰 **Safe to Spend** — Real-time balance forecast deducting upcoming recurring bills
- 📈 **Daily Spending Trend** — 7-day Simple Moving Average chart
- 🎲 **Overdraft Risk** — Monte Carlo simulation (1,000 runs) for overdraft probability
- 👥 **Peer Benchmarking** — Compare your spending against top 10% of your cohort
- 🤖 **SafeSpend AI Insights** — LangGraph agent generating personalised financial advice
- 💡 **What-If Simulator** — Projections for different savings rates

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React + Vite, deployed on Vercel |
| Backend | FastAPI + LangGraph, deployed on Render |
| Database | Neon Serverless PostgreSQL |
| AI | OpenAI GPT via LangGraph agent |

## Local Development

### Backend
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```
Set `DATABASE_URL` and `OPENAI_API_KEY` in a `.env` file in the backend directory.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_URL=http://localhost:8000` in `frontend/.env` for local dev.

## Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key for the AI agent |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of the deployed Render backend |