@echo off
title IP-SAKTI Sahayak
chcp 65001 >nul

:: ANSI colors
set "G=[92m"
set "Y=[93m"
set "C=[96m"
set "R=[91m"
set "W=[97m"
set "B=[90m"
set "RESET=[0m"
set "BOLD=[1m"

cls
echo.
echo  %C%%BOLD%  ╔══════════════════════════════════╗%RESET%
echo  %C%%BOLD%  ║     IP-SAKTI Sahayak  Startup    ║%RESET%
echo  %C%%BOLD%  ╚══════════════════════════════════╝%RESET%
echo.

:: Kill old instances silently
echo  %B%  Cleaning up old processes...%RESET%
taskkill /F /IM ollama.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

:: Start Ollama
echo  %Y%  [1/3]%RESET% Starting Ollama...
set CUDA_VISIBLE_DEVICES=-1
start "Ollama Server" /min "C:\Users\ravin\AppData\Local\Programs\Ollama\ollama.exe" serve

set /a attempts=0
:wait_ollama
set /a attempts+=1
timeout /t 3 /nobreak >nul
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel%==0 (
    echo  %G%  [✓]%RESET% Ollama ready
    goto ollama_ready
)
if %attempts% lss 15 goto wait_ollama
echo  %R%  [!]%RESET% Ollama not responding — continuing anyway
:ollama_ready

:: Start Backend
echo  %Y%  [2/3]%RESET% Starting Backend...
cd /d "%~dp0backend"
start "IP-SAKTI Backend" /min cmd /c ".\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 >nul 2>&1"

set /a attempts=0
:wait_backend
set /a attempts+=1
timeout /t 3 /nobreak >nul
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel%==0 (
    echo  %G%  [✓]%RESET% Backend ready
    goto backend_ready
)
if %attempts% lss 15 goto wait_backend
echo  %R%  [!]%RESET% Backend not responding — continuing anyway
:backend_ready

:: Start Frontend
echo  %Y%  [3/3]%RESET% Starting Frontend...
cd /d "%~dp0frontend"
start "IP-SAKTI Frontend" /min cmd /c "npm run dev >nul 2>&1"
timeout /t 4 /nobreak >nul
echo  %G%  [✓]%RESET% Frontend started

echo.
echo  %C%%BOLD%  ╔══════════════════════════════════╗%RESET%
echo  %C%%BOLD%  ║        All Services Ready!       ║%RESET%
echo  %C%  ║%RESET%                                  %C%║%RESET%
echo  %C%  ║%RESET%  %W%Frontend :%RESET%  http://localhost:5173  %C%║%RESET%
echo  %C%  ║%RESET%  %W%Backend  :%RESET%  http://localhost:8000  %C%║%RESET%
echo  %C%  ║%RESET%  %W%Ollama   :%RESET%  http://localhost:11434 %C%║%RESET%
echo  %C%%BOLD%  ╚══════════════════════════════════╝%RESET%
echo.
echo  %B%  Run stop_all.bat to stop all services.%RESET%
echo.
pause >nul
