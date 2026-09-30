@echo off
echo Starting ThreatLens AI Frontend...
cd /d "%~dp0\frontend"
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo Starting development server...
call npm run dev
pause
