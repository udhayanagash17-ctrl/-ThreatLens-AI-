# ThreatLens AI

AI-Powered Attack Surface & Vulnerability Monitoring System

ThreatLens AI is a full-stack security monitoring platform that combines traditional vulnerability scanning with AI-driven analysis to help you discover, assess, and track security threats across your infrastructure.

## Features

- **Dashboard** — Real-time overview of assets, vulnerabilities, alerts, and risk scores
- **Asset Management** — Track and manage your IT assets (servers, domains, IPs)
- **Vulnerability Scanning** — Scan assets for known vulnerabilities (CVEs)
- **SBOM Analysis** — Software Bill of Materials scanning to identify risky dependencies
- **AI-Powered Analysis** — Get AI-generated insights and remediation recommendations
- **Alert System** — Configurable alerts for critical vulnerabilities and anomalies
- **Reports** — Generate and export security reports
- **Authentication** — JWT-based auth with role-based access (admin/user)

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Backend   | Python, FastAPI, SQLAlchemy, SQLite         |
| Frontend  | React, TypeScript, Vite, Tailwind CSS       |
| Auth      | JWT (JSON Web Tokens), bcrypt               |
| AI        | OpenAI API (optional)                       |
| Docker    | Docker Compose (backend + frontend + nginx) |

## Project Structure

```
ThreatLens-AI/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/          # API route handlers
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── scanners/     # Vulnerability & SBOM scanners
│   │   └── services/     # Business logic & AI service
│   ├── tests/            # Unit tests
│   └── requirements.txt  # Python dependencies
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API client functions
│   │   └── types/        # TypeScript types
│   └── package.json      # Node dependencies
├── docker/               # Dockerfiles & nginx config
├── docker-compose.yml    # Multi-container orchestration
├── .env.example          # Environment variable template
└── README.md             # This file
```

## Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: One-Click Start (Easiest)

Just double-click **`start.bat`** — it automatically:
- Creates a Python virtual environment
- Installs backend dependencies
- Installs frontend dependencies
- Starts both backend and frontend

Then open `http://localhost:5173` in your browser.

### Option 2: Docker

```bash
docker-compose up --build
```

Access the app at `http://localhost:5173`

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp ../.env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

## Default Credentials

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |

> **Important:** Change the default password in production!

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable     | Description                          | Default                    |
|--------------|--------------------------------------|----------------------------|
| SECRET_KEY   | JWT signing key                      | (change in production!)    |
| DATABASE_URL | Database connection string           | `sqlite:///./threatlens.db`|
| AI_ENABLED   | Enable/disable AI features           | `true`                     |
| AI_API_KEY   | OpenAI API key                       | —                          |
| AI_MODEL     | OpenAI model to use                  | `gpt-3.5-turbo`            |
| DEBUG        | Debug mode                           | `true`                     |

## API Documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Usage

1. **Sign Up** — Create your own account, or login with default admin credentials
2. **Add Assets** — Register your servers, domains, or IPs
3. **Run Scans** — Trigger vulnerability or SBOM scans on your assets
4. **View Dashboard** — Monitor risk scores, alerts, and trends
5. **AI Analysis** — Get AI-powered remediation advice on vulnerabilities
6. **Generate Reports** — Export security reports for stakeholders

## License

MIT License
