# NorthBridge


**An AI consulting firm, simulated.** North Bridge takes a business problem in plain English and runs it through a simulated consulting engagement — problem framing, specialist analysis, internal debate, human review, and a final polished deliverable — powered by a multi-agent LangGraph pipeline backed by real statistical/ML models, not just LLM guesswork.

> Submit a business problem → the system frames it, routes it to the right specialist agents, runs real forecasting/segmentation/driver-analysis models on your data, has the agents challenge each other's assumptions, lets you weigh in as the client, and produces a final recommendation — the way an actual consulting team would.

---

## Table of Contents

- [Why North Bridge](#why-north-bridge)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [The ML Layer](#the-ml-layer)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Database Migrations](#database-migrations)
- [Usage](#usage)
- [Demo](#demo)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why North Bridge

Most "AI consultant" projects are a single LLM call wearing a persona prompt. North Bridge is built to actually mirror how a consulting engagement runs:

- **Multiple specialist agents** analyze a problem from different angles (market, financial, operations, customer, risk) — not one model doing everything.
- **Agents challenge each other.** A devil's-advocate agent attacks the weakest assumptions in each specialist's analysis, and specialists revise in response — a real cyclical debate, not a single pass.
- **A partner-review layer** forces convergence on one clear recommendation, the way a case team's engagement lead does before anything reaches a client.
- **Human-in-the-loop review** lets you push back on the recommendation mid-flow; the graph re-enters the debate with your feedback instead of starting over.
- **Real ML, not decoration.** Forecasts, segments, and driver analyses come from actual trained models. The LLM's job is to *narrate* statistical output, not invent numbers.
- **Domain-agnostic.** The system classifies the type of business problem it's given and dynamically decides which specialists and which analytical tools are relevant — it isn't hardcoded to one industry or case type.

## How It Works

1. **Submit a case.** You describe a business problem (growth, retention, cost reduction, pricing, market entry, risk, etc.) and optionally upload tabular data (sales, customers, costs — whatever you have).
2. **Problem framing & classification.** The system extracts the actual decision to be made and classifies the problem type. This classification drives every downstream routing decision.
3. **Data profiling.** If data is uploaded, it's profiled (column types, whether it's time-series or cross-sectional, likely outcome variables) to decide which analytical tools even apply.
4. **Dynamic specialist fan-out.** Based on the classification, the graph activates only the relevant specialist agents (e.g., a churn case activates the customer and financial analysts; a market-entry case activates the market and financial analysts). Risk and financial analysis run on nearly every case.
5. **Specialists call real ML tools.** Each specialist decides whether it needs forecasting, segmentation, or driver analysis, and calls the relevant model. The agent then explains the output in plain language.
6. **Challenge & revise loop.** A devil's-advocate agent critiques each analysis. Specialists defend or revise. This repeats until the analysis converges or a round cap is hit.
7. **Human review.** The pipeline pauses for your feedback before finalizing. Pushback re-enters the challenge loop with your input as new context, rather than discarding prior work.
8. **Partner synthesis & deliverable.** A partner agent resolves any remaining disagreement and forces a single, clear recommendation, structured the way real consulting decks are (Situation → Complication → Question → Answer).

## Architecture

North Bridge is orchestrated as a LangGraph state graph. The two design decisions that matter most:

- **Conditional fan-out, not a fixed pipeline.** Which specialist agents run is decided at runtime by a conditional edge reading the problem classification out of graph state — using LangGraph's `Send` API — rather than always executing the same fixed set of nodes.
- **A genuine cyclical subgraph for debate.** The challenge-and-revise step isn't a single pass; it's a loop with its own exit condition (convergence, or a maximum number of rounds), which is where most simpler agent pipelines fall short.

**Core graph nodes:**

| Node | Responsibility |
|---|---|
| Problem Framing & Classification | Defines the actual question to solve; classifies problem type |
| Data Handling | Profiles any uploaded data; determines which ML tools apply |
| Specialist Analysts (dynamic) | Market, Financial, Operations, Customer, Risk — activated conditionally |
| Devil's Advocate | Critiques assumptions and weak claims across all active analyses |
| Challenge & Revise Loop | Specialists respond to critique; loops until convergence or round cap |
| Human Review | `interrupt()` pause for client feedback; re-enters the loop if pushback occurs |
| Partner Synthesis | Resolves disagreement, forces one clear recommendation |
| Deliverable Generation | Produces the final structured report/output |

State is persisted through the run (including challenge history and human feedback) so the human-in-the-loop step can resume the graph rather than restart it.

## The ML Layer

Instead of one hardcoded model, North Bridge exposes a small toolkit of general-purpose statistical methods that any specialist agent can invoke depending on the data and question in front of it:

- **Forecasting — Prophet.** Time-series projection over any time-indexed numeric data the client provides (revenue, users, costs, demand, etc.).
- **Segmentation — K-Means.** Clustering over tabular customer/product data to answer questions like "who are our best customers" or "which products are underperforming," regardless of domain.
- **Driver analysis — Linear Regression.** Identifies which factors most influence a chosen outcome variable (churn, revenue, cost, defect rate — whatever is numeric and relevant), with the agent narrating the coefficients/output in plain English.

Agents decide *which* tool is relevant per case rather than a tool being wired to one fixed scenario — that decision is itself part of the specialist agent's reasoning, driven by the data profile from the Data Handling node.

## Tech Stack

**Frontend**
- Next.js
- Clerk (authentication)

**Backend**
- FastAPI
- LangGraph (multi-agent orchestration, state graph, human-in-the-loop via `interrupt()`)
- ChatGroq (LLM inference powering the agents)
- Hugging Face (model/API access)

**Data & ML**
- PostgreSQL (hosted on Neon)
- Alembic (database migrations)
- Prophet (forecasting)
- K-Means (segmentation)
- Linear Regression (driver analysis)

## Project Structure

```
north-bridge/
├── frontend/                  # Next.js app
│   ├── app/
│   ├── components/
│   └── ...
├── backend/                    # FastAPI app
│   ├── app/
│   │   ├── api/                # Route handlers
│   │   ├── graph/               # LangGraph state graph, nodes, edges
│   │   │   ├── nodes/
│   │   │   ├── state.py
│   │   │   └── graph.py
│   │   ├── ml/                  # ML toolkit (Prophet, K-Means, regression)
│   │   ├── models/              # DB models
│   │   └── core/                # Config, auth, dependencies
│   ├── alembic/                 # Migration scripts
│   └── main.py
├── .env.example
└── README.md
```

*(Adjust this section to match your actual folder layout if it differs.)*

## Getting Started

### Prerequisites

- Node.js (for the Next.js frontend)
- Python 3.11+ (for the FastAPI backend)
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application (for auth keys)
- A [Groq](https://groq.com) API key for LLM inference (ChatGroq)
- A [Hugging Face](https://huggingface.co) API token

### Installation

```bash
git clone https://github.com/<your-username>/north-bridge.git
cd north-bridge

# Backend
cd backend
python -m venv venv
source venv/bin/activate    # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file in `backend/` and `frontend/` based on `.env.example`:

**Backend**
```
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require
CLERK_SECRET_KEY=
GROQ_API_KEY=
HUGGINGFACEHUB_API_TOKEN=
```

**Frontend**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Running Locally

**Backend**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`, calling the API at `http://localhost:8000`.

## Database Migrations

Migrations are managed with Alembic against the Neon Postgres instance:

```bash
cd backend
alembic revision --autogenerate -m "description of change"
alembic upgrade head
```

## Usage

1. Sign in via Clerk.
2. Submit a business problem as a client brief (e.g., *"Our SaaS churn rate is 8%, how do we fix it?"*).
3. Optionally upload a CSV of relevant data (sales, customers, costs).
4. Watch the graph classify the problem, activate the relevant specialists, run the appropriate ML models, and debate the findings.
5. Review the draft recommendation and provide feedback if needed — the system will revise before finalizing.
6. Receive the final structured recommendation/report.

## Demo

*Video walkthrough coming soon.*

## Roadmap

- [ ] Expand specialist agent coverage (e.g., dedicated pricing and supply-chain analysts)
- [ ] Scoped RAG per client for grounding analysis in uploaded documents
- [ ] Auto-generated slide deck (`.pptx`) export of the final deliverable
- [ ] Additional ML tools (anomaly/outlier detection via Isolation Forest, SHAP-based feature importance)
- [ ] Multi-round engagement history / case comparison dashboard

## License

Add your preferred license here (e.g., MIT).
