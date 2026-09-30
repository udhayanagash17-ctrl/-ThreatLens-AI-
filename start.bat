@echo off
echo ========================================
echo   ThreatLens AI - One-Click Start
echo ========================================
echo.

REM Start Backend
echo [1/2] Starting Backend...
start "ThreatLens Backend" cmd /k "cd /d %~dp0backend && if not exist venv python -m venv venv && call venv\Scripts\activate.bat && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend...
start "ThreatLens Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules call npm install && npm run dev"

echo.
echo ========================================
echo   ThreatLens AI is starting up!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo ========================================
echo.
pause
