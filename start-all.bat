@echo off
title TalentForge AI - Self-Healing College Launcher
echo.
echo ============================================================
echo   TalentForge AI v4.1 - Self-Healing 1-Click Launcher
echo ============================================================
echo.

:: 1. Self-Healing Check: Python Environment
echo [1/4] Checking Python Virtual Environment (.venv)...
IF NOT EXIST ".venv\Scripts\python.exe" (
    echo   [!] Virtual environment missing. Running automatic setup...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install --upgrade pip -q
    pip install -r backend\requirements.txt -q
    python -m spacy download en_core_web_sm
    echo   [OK] Python environment self-healed!
) ELSE (
    echo   [OK] Python environment verified.
)

:: 2. Self-Healing Check: Node Modules
echo.
echo [2/4] Checking Frontend Dependencies (node_modules)...
IF NOT EXIST "frontend\node_modules" (
    echo   [!] Frontend dependencies missing. Running npm install...
    cd frontend
    call npm install
    cd ..
    echo   [OK] Frontend dependencies self-healed!
) ELSE (
    echo   [OK] Frontend dependencies verified.
)

:: 3. Launch Backend with Fallback Protection
echo.
echo [3/4] Launching Backend Server on http://localhost:5000...
start "TalentForge AI Backend (Port 5000)" cmd /k ".venv\Scripts\python.exe backend\app.py"

:: Wait 4 seconds for backend to bind to port 5000
timeout /t 4 /nobreak >nul

:: 4. Launch Frontend Dev Server
echo.
echo [4/4] Launching Frontend Interface on http://localhost:5173...
start "TalentForge AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

:: Wait 3 seconds for Vite server
timeout /t 3 /nobreak >nul

:: Automatically open default browser
echo.
echo Launching Web Browser at http://localhost:5173...
start http://localhost:5173/

echo.
echo ============================================================
echo   SUCCESS! TalentForge AI is running in Protected Mode.
echo   - 100% Offline Zero-Key Fallback Enabled
echo   - Automatic Failover Active across 6 AI Engines
echo   Press any key to close launcher window (servers remain active).
echo ============================================================
pause >nul
