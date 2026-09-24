@echo off
title IP-SAKTI Sahayak - Stopping All Services
color 0C

echo Stopping all IP-SAKTI Sahayak services...
echo.

taskkill /F /IM ollama.exe /T >nul 2>&1
echo [OK] Ollama stopped.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /F /PID %%a >nul 2>&1
echo [OK] Backend stopped.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do taskkill /F /PID %%a >nul 2>&1
echo [OK] Frontend stopped.

echo.
echo All services stopped.
pause
