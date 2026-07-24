@echo off
title TalentForge AI - College PC Deployment Launcher
echo.
echo ============================================================
echo   TalentForge AI v4.1 - 1-Click College PC Launcher
echo ============================================================
echo.

:: 1. Launch Backend Server in background window
echo [1/2] Launching Flask Backend API on http://localhost:5000...
start "TalentForge AI Backend (Port 5000)" cmd /k ".venv\Scripts\python.exe backend\app.py"

:: 2. Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

:: 3. Launch Frontend Dev Server in background window
echo [2/2] Launching React Frontend on http://localhost:5173...
start "TalentForge AI Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

:: 4. Open default web browser automatically
timeout /t 3 /nobreak >nul
echo.
echo Opening browser at http://localhost:5173...
start http://localhost:5173/

echo.
echo ============================================================
echo   SUCCESS! TalentForge AI is running.
echo   Press any key to close this launcher window (servers remain active).
echo ============================================================
pause >nul
