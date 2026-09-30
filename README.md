# ThreatLens AI

**AI-Powered Attack Surface & Vulnerability Monitoring System**

ThreatLens AI is a comprehensive cybersecurity platform designed to give organizations a centralized view of their digital attack surface and security weaknesses.

## Features

- **Attack Surface Discovery** - Maintain inventory of authorized assets
- **Web Security Assessment** - Non-destructive security checks
- **Dependency & SBOM Security** - Analyze software components for vulnerabilities
- **Vulnerability Management** - Centralized vulnerability database
- **Risk Engine** - Calculate explainable risk scores
- **AI Security Analyst** - Human-readable analysis of findings
- **Security Alerts** - Real-time notifications for critical findings
- **Security Dashboard** - Comprehensive monitoring interface
- **Evidence & Findings** - Detailed evidence for every finding
- **Security Reports** - Executive and technical reports

## Technology Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (charts)
- Axios (API calls)

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- JWT Authentication

### Database
- SQLite (default, PostgreSQL-ready)

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Default Credentials
- Username: `admin`
- Password: `admin123`

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
ThreatLens-AI/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Core configuration
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── scanners/     # Security scanners
│   │   └── main.py       # Application entry
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── services/     # API services
│       ├── hooks/        # Custom React hooks
│       └── types/        # TypeScript types
├── docker/
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

## Security Features

- Password hashing (bcrypt)
- JWT authentication
- Role-based access control
- Input validation
- API authorization
- Rate limiting
- Secure CORS configuration
- Secrets through environment variables
- Audit logging
- Safe scanner execution
- SSRF protection
- Scan target authorization controls

## License

MIT License - For educational purposes
