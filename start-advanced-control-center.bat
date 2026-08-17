@echo off
title TalentForge AI - Advanced Command Control Center (v4.1)
setlocal enabledelayedexpansion

:MENU
cls
echo.
echo ============================================================
echo   TalentForge AI v4.1 - Advanced Command Control Center
echo ============================================================
echo.
echo   [1] 🚀 Start Full-Stack Dev System (Flask + React + Auto-Browser)
echo   [2] ⚡ Run Pytest & Vitest Unit Test Suites (109 + 38 Tests)
echo   [3] 📸 Generate High-Res Documentation Screenshots (Chapter 6 & 9)
echo   [4] 📦 Export College Pen-Drive Pack (TalentForge_AI_College_Pack.zip)
echo   [5] 🧹 Deep Clean Build Caches & Temp Files
echo   [6] 🌐 View Deployment Setup Guide (Vercel, Render & Free Domains)
echo   [0] ❌ Exit Control Center
echo.
echo ============================================================
set /p CHOICE="Select Option [0-6]: "

if "%CHOICE%"=="1" goto LAUNCH_DEV
if "%CHOICE%"=="2" goto RUN_TESTS
if "%CHOICE%"=="3" goto CAPTURE_SCREENSHOTS
if "%CHOICE%"=="4" goto EXPORT_ZIP
if "%CHOICE%"=="5" goto DEEP_CLEAN
if "%CHOICE%"=="6" goto VIEW_DEPLOY_GUIDE
if "%CHOICE%"=="0" goto EXIT_APP
goto MENU

:LAUNCH_DEV
cls
echo ============================================================
echo   Launching TalentForge AI Development System...
echo ============================================================
echo.
echo [1/3] Verifying environment...
IF NOT EXIST ".venv\Scripts\python.exe" (
    echo Virtual environment missing. Running automatic setup...
    call setup.bat
)
echo [2/3] Starting Flask Backend (Port 5000)...
start "TalentForge AI Backend (Port 5000)" cmd /k ".venv\Scripts\python.exe backend\app.py"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite React Frontend (Port 5173)...
start "TalentForge AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Opening Application at http://localhost:5173...
start http://localhost:5173/
goto MENU

:RUN_TESTS
cls
echo ============================================================
echo   Executing Full System Unit Test Suites...
echo ============================================================
echo.
echo ------------------------------------------------------------
echo 1. Running Pytest Backend Tests...
echo ------------------------------------------------------------
.venv\Scripts\pytest
echo.
echo ------------------------------------------------------------
echo 2. Running Vitest Frontend Component Tests...
echo ------------------------------------------------------------
cd frontend
call npm test
cd ..
echo.
pause
goto MENU

:CAPTURE_SCREENSHOTS
cls
echo ============================================================
echo   Generating Chapter 6 & Chapter 9 High-Res Screenshots...
echo ============================================================
echo.
echo Starting temporary servers for Playwright...
start /b .venv\Scripts\python.exe backend\app.py >nul 2>&1
timeout /t 3 /nobreak >nul
cd frontend
start /b npm run dev >nul 2>&1
timeout /t 3 /nobreak >nul
echo Running Playwright Screenshot Generator...
call npx playwright test e2e/generate_chapter6_chapter9_screenshots.spec.js
cd ..
taskkill /FI "WINDOWTITLE eq TalentForge*" /F >nul 2>&1
echo.
echo Screenshots saved in frontend/docs/test-reports/screenshots/!
pause
goto MENU

:EXPORT_ZIP
cls
echo ============================================================
echo   Packaging College Pen-Drive Deployment Pack...
echo ============================================================
echo.
.venv\Scripts\python.exe export-lightweight-zip.py
echo.
pause
goto MENU

:DEEP_CLEAN
cls
echo ============================================================
echo   Executing Deep Lightweight Cache Purge...
echo ============================================================
echo.
.venv\Scripts\python.exe scripts/deep_clean_lightweight.py
echo.
pause
goto MENU

:VIEW_DEPLOY_GUIDE
cls
echo ============================================================
echo   TalentForge AI Cloud & Free Domain Deployment Guide
echo ============================================================
echo.
echo   1. Backend Cloud Deploy:  https://render.com (via render.yaml)
echo   2. Frontend Cloud Deploy: https://vercel.com (via frontend/vercel.json)
echo   3. Free Custom Domains:   https://nic.dpdns.org (via DigitalPlat FreeDomain)
echo.
echo   Detailed documentation guide opened at: docs/FREE_DOMAIN_SETUP.md
echo.
start notepad docs/FREE_DOMAIN_SETUP.md
pause
goto MENU

:EXIT_APP
echo.
echo Thank you for using TalentForge AI Control Center!
exit /b 0
