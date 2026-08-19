@echo off
title TalentForge AI - 3_RUN_DIAGNOSTIC_HEALTH_TESTS
cls
echo.
echo ============================================================
echo   TalentForge AI v4.1 - 3_RUN_DIAGNOSTIC_HEALTH_TESTS
echo ============================================================
echo   Automated Health Diagnostics & Test Suite Verification
echo ============================================================
echo.

IF NOT EXIST ".venv\Scripts\python.exe" (
    echo [!] Virtual environment missing. Running setup script first...
    call 2_SETUP_AND_REPAIR_ENVIRONMENT.bat
)

echo [1/2] Running Backend Pytest Verification Suite (109 Tests)...
.venv\Scripts\pytest tests/ -v

echo.
echo ============================================================
echo   Diagnostic verification complete!
echo ============================================================
pause
