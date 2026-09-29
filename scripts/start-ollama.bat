@echo off
:: Check if Ollama is already running on port 11434
netstat -an 2>nul | findstr /C:":11434 " >nul 2>&1
if %ERRORLEVEL% == 0 (
    echo [OLLAMA] Already running on port 11434, skipping start.
    exit /b 0
)
:: Not running, start it
set CUDA_VISIBLE_DEVICES=-1
echo [OLLAMA] Starting Ollama server...
ollama serve
