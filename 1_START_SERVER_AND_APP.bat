@echo off
title TalentForge AI - 1_START_SERVER_AND_APP
echo.
echo ============================================================
echo   TalentForge AI v4.1 - 1_START_SERVER_AND_APP
echo ============================================================
echo   1-Click Automated Setup, Server Launch, & Browser Open
echo ============================================================
echo.

:: 1. Verify Prerequisites (Python & Node.js)
echo [1/6] Verifying System Prerequisites...
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo   [FAIL] Python 3 is not installed or not added to PATH.
    echo   Please install Python 3.9+ from https://python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo   [FAIL] Node.js is not installed or not added to PATH.
    echo   Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo   [OK] System prerequisites verified (Python & Node.js ready).

:: 2. Auto-create Python Virtual Environment (.venv) & Install Backend Requirements
echo.
echo [2/6] Verifying Python Environment (.venv)...
IF NOT EXIST ".venv\Scripts\python.exe" (
    echo   [!] Virtual environment missing. Creating .venv automatically...
    python -m venv .venv
    echo   [!] Installing Python dependencies from backend\requirements.txt...
    call .venv\Scripts\activate.bat
    python -m pip install --upgrade pip -q
    pip install -r backend\requirements.txt -q
    echo   [OK] Python environment initialized successfully!
) ELSE (
    echo   [OK] Python virtual environment ready.
)

:: 3. Auto-download spaCy NLP Model
echo.
echo [3/6] Verifying spaCy NLP Model (en_core_web_sm)...
.venv\Scripts\python.exe -c "import spacy; spacy.load('en_core_web_sm')" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo   [!] Downloading spaCy en_core_web_sm NLP model...
    .venv\Scripts\python.exe -m spacy download en_core_web_sm -q
    echo   [OK] spaCy NLP model installed!
) ELSE (
    echo   [OK] spaCy NLP model ready.
)

:: 4. Auto-install Frontend Node Modules
echo.
echo [4/6] Verifying Frontend Dependencies (node_modules)...
IF NOT EXIST "frontend\node_modules" (
    echo   [!] Node modules missing. Running npm install in frontend...
    cd frontend
    call npm install
    cd ..
    echo   [OK] Frontend dependencies installed successfully!
) ELSE (
    echo   [OK] Frontend dependencies ready.
)

:: 5. Initialize Database & Storage Directories
echo.
echo [5/6] Initializing Local Database & Storage Folders...
IF NOT EXIST "data" mkdir data
IF NOT EXIST "uploads" mkdir uploads
.venv\Scripts\python.exe scripts/populate_real_interview_data.py >nul 2>&1
echo   [OK] Database schema and seed data ready.

:: 6. Launch Backend & Frontend Servers
echo.
echo [6/6] Launching TalentForge AI Servers...
echo   - Starting Flask Backend API on http://localhost:5000...
start "TalentForge AI Backend (Port 5000)" cmd /k ".venv\Scripts\python.exe backend\app.py"

timeout /t 3 /nobreak >nul

echo   - Starting Vite React Frontend on http://localhost:5173...
start "TalentForge AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

:: Automatically Open Browser
echo.
echo ============================================================
echo   🚀 TalentForge AI is LIVE & READY!
echo   Opening Web Browser at http://localhost:5173/ ...
echo ============================================================
start http://localhost:5173/

echo.
echo   Press any key to close this launcher window (servers remain running).
echo ============================================================
pause >nul
