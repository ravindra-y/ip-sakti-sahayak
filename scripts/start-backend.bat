@echo off
:: Check if backend is already running on port 8000
netstat -an 2>nul | findstr /C:":8000 " >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [BACK] Port 8000 is already in use. Killing existing process...
    powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
    timeout /t 1 /nobreak >nul
)
echo [BACK] Starting backend server...
venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --log-level warning
