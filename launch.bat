@echo off
REM Alumni Career Tracker - Complete Project Launcher
REM Starts Backend (FastAPI), Frontend (React/Vite), and opens browser

color 0A
echo ================================================
echo  Alumni Career Tracker - Project Launcher
echo ================================================
echo.

REM Check if PostgreSQL is running
echo [1/4] Checking PostgreSQL...
netstat -ano | findstr :5433 >nul
if %errorlevel% equ 0 (
    echo ✓ PostgreSQL is running on port 5433
) else (
    echo ✗ WARNING: PostgreSQL not detected on port 5433
    echo   Please start PostgreSQL manually before continuing
    echo.
)

REM Start Backend Server
echo [2/4] Starting Backend Server (FastAPI on port 8000)...
start "Alumni Tracker - Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python -m uvicorn app.main:app --reload"

REM Start Frontend Server
echo [3/4] Starting Frontend Server (React/Vite on port 5173)...
start "Alumni Tracker - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM Wait for servers to start
echo [4/4] Waiting for servers to start (25 seconds)...
timeout /t 25 /nobreak

REM Open browser to frontend
echo.
echo Opening browser...
powershell -Command "Start-Process 'http://localhost:5173'"

echo.
echo ================================================
echo ✓ Project Launched Successfully!
echo ================================================
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Keep this window open while working on the project.
echo.
pause
