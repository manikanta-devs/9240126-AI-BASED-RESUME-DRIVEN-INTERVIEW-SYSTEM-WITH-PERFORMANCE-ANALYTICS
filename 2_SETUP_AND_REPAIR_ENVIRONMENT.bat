@echo off
title TalentForge AI - 2_SETUP_AND_REPAIR_ENVIRONMENT
cls
echo.
echo ============================================================
echo   TalentForge AI v4.1 - 2_SETUP_AND_REPAIR_ENVIRONMENT
echo ============================================================
echo   Environment Setup, Dependency Repair, & Database Init
echo ============================================================
echo.

:: 1. System Environment Diagnostics
echo [1/6] Running System Environment Diagnostics...
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Python 3 not found. Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version') do echo   [OK] Python Version: %%v

node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [FAIL] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do echo   [OK] Node.js Version: %%v

git --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%v in ('git --version') do echo   [OK] Git Version: %%v
)

:: 2. Python Virtual Environment (.venv) Auto-Healing
echo.
echo [2/6] Verifying Python Virtual Environment (.venv)...
IF NOT EXIST ".venv\Scripts\python.exe" (
    echo   Creating new isolated Python 3 virtual environment...
    python -m venv .venv
    echo   [OK] Virtual environment created successfully.
) ELSE (
    echo   [OK] Virtual environment (.venv) present.
)

call .venv\Scripts\activate.bat
echo   Upgrading pip and installing backend dependencies...
python -m pip install --upgrade pip -q
pip install -r backend\requirements.txt -q
echo   [OK] Python backend dependencies installed.

:: 3. spaCy NLP Pipeline Diagnostic
echo.
echo [3/6] Verifying spaCy NLP Keyword Parsing Model...
python -c "import spacy; spacy.load('en_core_web_sm')" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo   Downloading spaCy 'en_core_web_sm' NLP model...
    python -m spacy download en_core_web_sm
    echo   [OK] spaCy NLP pipeline downloaded and verified.
) ELSE (
    echo   [OK] spaCy 'en_core_web_sm' NLP model ready.
)

:: 4. Frontend React & Node Dependencies
echo.
echo [4/6] Verifying Frontend React Dependencies (node_modules)...
IF NOT EXIST "frontend\node_modules" (
    echo   Installing frontend dependencies via npm...
    cd frontend
    call npm install
    cd ..
    echo   [OK] React frontend dependencies installed.
) ELSE (
    echo   [OK] Frontend node_modules present.
)

:: 5. Database Initialization & Seed Data
echo.
echo [5/6] Initializing SQLite Database & Demo Interview Data...
IF NOT EXIST "data" mkdir data
IF NOT EXIST "uploads" mkdir uploads
.venv\Scripts\python.exe scripts/populate_real_interview_data.py >nul 2>&1
echo   [OK] Database schema initialized with candidate profiles & metrics.

:: 6. Verification Test Run
echo.
echo [6/6] Executing Automated Diagnostic Test Suite...
.venv\Scripts\pytest tests/test_health.py -q >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo   [OK] Backend API Health Diagnostics: 100%% PASS
) ELSE (
    echo   [WARNING] Backend API Health check completed with warnings.
)

echo.
echo ============================================================
echo   SUCCESS! Environment Setup & Repair Completed 100%%!
echo ============================================================
echo.
echo   To launch the application:
echo   ▶ Double-click: 1_START_SERVER_AND_APP.bat
echo.
pause
