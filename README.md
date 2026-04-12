<div align="center">
  <img src="docs/screenshots/landing.png" alt="NatWest SafeSpend Landing Page" width="100%" />

  # NatWest SafeSpend
  
  **NatWest Hackathon Prototype** — AI-powered personal finance analytics designed for students and young professionals to eliminate financial ambiguity and accidental overdrafts.
  
  [![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](#)
  [![Backend](https://img.shields.io/badge/Backend-Render-black?logo=render)](#)
  [![Database](https://img.shields.io/badge/Database-Neon-blue?logo=postgresql)](#)
  [![Built with React](https://img.shields.io/badge/React-19-blue?logo=react)](#)
  [![Built with FastAPI](https://img.shields.io/badge/FastAPI-Python-green?logo=fastapi)](#)

  [**Live Demo**](https://code-for-purpose-uf74.vercel.app/) • [**Getting Started**](#local-development)
  
</div>

---

##  Live Demo
| Service | URL |
|---------|-----|
| **Frontend** | [https://code-for-purpose-uf74.vercel.app/](https://code-for-purpose-uf74.vercel.app/) |
| **Backend**  | Deployed on Render |

<div align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard Screenshot" width="100%" />
  <sub><em>The main SafeSpend Dashboard — Safe to Spend balance, upcoming bills, and daily spending trend.</em></sub>
</div>

---

##  Demo Accounts
Experience the platform using our pre-seeded cohort data. Login with any of these accounts (password for all is: **`qwerty`**):

| Username | Profile |
|----------|---------|
| `student1` | Tier 1 · Engineering — High income, savings-focused |
| `student2` | Tier 2 · Arts — Mid income, variable spending |
| `student3` | Tier 1 · Science — Moderate income, balanced habits |

---

##  Features & Functionality

<div align="center">
  <table>
    <tr>
      <td><img src="docs/screenshots/spending-trend.png" alt="Spending Trend & Overdraft Risk" width="100%" /></td>
      <td><img src="docs/screenshots/peer-benchmarking.png" alt="Peer Benchmarking & AI Reality Check" width="100%" /></td>
    </tr>
    <tr>
      <td><sub><em>Daily Spending Trend (7-day SMA) and Monte Carlo Overdraft Risk Simulation</em></sub></td>
      <td><sub><em>Peer Benchmarking radar chart and AI-powered Reality Check</em></sub></td>
    </tr>
  </table>
</div>

- **Safe to Spend** — A real-time balance forecast that aggressively deducts upcoming recurring bills to give you your *actual* spending limit.
-  **Daily Spending Trend** — Real-time 7-day Simple Moving Average chart mapped against spending behavior.
-  **Deterministic Overdraft Risk** — Fast Monte Carlo simulation engine. Runs 1,000 distinct financial pathways to forecast chronological overdraft probabilities (e.g., "18% risk of ₹0 balance").
-  **Peer Benchmarking** — Anonymized radar charting that contrasts a user's expense optimization against top 10% performers in their income/study cohort.
-  **SafeSpend AI Insights** — A personalized LangGraph agent that transforms raw numeric data into actionable, empathetic financial advice using LLMs.
-  **Interactive What-If Simulator** — A dynamic slider to forecast how altering your weekend spending habit influences your 5-year or 10-year wealth trajectory.

---

## Tech Stack

| Layer | Technology |
|-------|------|
| **Frontend** | React 19 + Vite, deployed globally on Vercel |
| **Backend** | Python 3.11, FastAPI + LangGraph, deployed on Render |
| **Database** | Neon (Serverless PostgreSQL) |
| **AI / NLP** | OpenAI GPT integration orchestrated via LangChain/LangGraph |

<div align="center">
  <img src="docs/screenshots/signup.png" alt="Signup Page with Demo Accounts" width="60%" />
  <br/>
  <sub><em>Signup page with pre-seeded demo account quick-access cards</em></sub>
</div>

---

##  Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and `npm`
- [uv](https://github.com/astral-sh/uv) (recommended for Python dependency management)
- A Neon Serverless Postgres Database URL
- An OpenAI API Key

### Backend Setup
```bash
cd backend
# Install dependencies using uv
uv sync
# Start the FastAPI server locally
uv run uvicorn app.main:app --reload
```
> **Environment Configuration**: Set `DATABASE_URL` and `OPENAI_API_KEY` in a `.env` file within the `backend` directory.

### Frontend Setup
```bash
cd frontend
# Install Node dependencies
npm install
# Start the Vite development server
npm run dev
```
> **Environment Configuration**: Set `VITE_API_URL=http://localhost:8000` in a `.env` file within the `frontend` directory for local backend connectivity.

---

##  Environment Variables Guide

### Backend (Render / Local)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Application's Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | OpenAI API key utilized by LangGraph to generate insights |

### Frontend (Vercel / Local)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | The URL of the connected Backend API. Should be pointed to your deployed Render URL in production environments. |