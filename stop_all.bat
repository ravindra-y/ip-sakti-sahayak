@echo off
title IP-SAKTI Sahayak - Stop
chcp 65001 >nul

:: ANSI colors
set "G=[92m"
set "R=[91m"
set "C=[96m"
set "W=[97m"
set "B=[90m"
set "RESET=[0m"
set "BOLD=[1m"

cls
echo.
echo  %R%%BOLD%  ╔══════════════════════════════════╗%RESET%
echo  %R%%BOLD%  ║    IP-SAKTI Sahayak  Stopping    ║%RESET%
echo  %R%%BOLD%  ╚══════════════════════════════════╝%RESET%
echo.

taskkill /F /IM ollama.exe /T >nul 2>&1
echo  %G%  [✓]%RESET% Ollama stopped

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000"') do taskkill /F /PID %%a >nul 2>&1
echo  %G%  [✓]%RESET% Backend stopped

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do taskkill /F /PID %%a >nul 2>&1
echo  %G%  [✓]%RESET% Frontend stopped

echo.
echo  %C%  All services stopped.%RESET%
echo.
timeout /t 2 /nobreak >nul
