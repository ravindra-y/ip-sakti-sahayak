@echo off
title IP-SAKTI Sahayak - Startup
color 0A

echo ============================================
echo   IP-SAKTI Sahayak - Starting All Services
echo ============================================
echo.

:: Kill existing instances
echo [1/4] Cleaning up old processes...
taskkill /F /IM ollama.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Ollama (detached, CPU-safe mode)
echo [2/4] Starting Ollama (qwen3:1.7b)...
set CUDA_VISIBLE_DEVICES=-1
start "Ollama Server" /min "C:\Users\ravin\AppData\Local\Programs\Ollama\ollama.exe" serve

:: Wait for Ollama to be ready
echo     Waiting for Ollama to start...
set /a attempts=0
:wait_ollama
set /a attempts+=1
timeout /t 3 /nobreak >nul
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo     Ollama is ready!
    goto ollama_ready
)
if %attempts% lss 15 goto wait_ollama
echo     WARNING: Ollama may not be responding. Continuing anyway...
:ollama_ready

echo.
echo [3/4] Starting Backend (FastAPI on port 8000)...
cd /d "%~dp0backend"
start "IP-SAKTI Backend" /min cmd /c ".\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 2>&1 | tee ..\backend.log"

:: Wait for backend
echo     Waiting for backend to start...
set /a attempts=0
:wait_backend
set /a attempts+=1
timeout /t 3 /nobreak >nul
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel%==0 (
    echo     Backend is ready!
    goto backend_ready
)
if %attempts% lss 15 goto wait_backend
echo     WARNING: Backend may not be responding. Continuing anyway...
:backend_ready

echo.
echo [4/4] Starting Frontend (React on port 5173)...
cd /d "%~dp0frontend"
start "IP-SAKTI Frontend" /min cmd /c "npm run dev"

echo.
echo ============================================
echo   All services started!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   Ollama:    http://localhost:11434
echo ============================================
echo.
echo   Close this window to keep services running.
echo   To stop all services, run stop_all.bat
echo.
pause
