# Start Ollama persistently (keeps running even after this script exits)
# Forces CPU-only mode to avoid GPU driver issues on GTX 1650

$env:CUDA_VISIBLE_DEVICES = "-1"

Write-Host "Starting Ollama server..."

# Check if already running
$port = netstat -ano | Select-String "11434" | Select-Object -First 1
if ($port) {
    Write-Host "Ollama already running on port 11434."
} else {
    # Use cmd /c start to fully detach from current shell
    $proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"set CUDA_VISIBLE_DEVICES=-1 && C:\Users\ravin\AppData\Local\Programs\Ollama\ollama.exe serve`"" -WindowStyle Hidden -PassThru
    Write-Host "Ollama started (PID: $($proc.Id))"
    Start-Sleep -Seconds 15
    $port = netstat -ano | Select-String "11434"
    if ($port) {
        Write-Host "Ollama is listening on 11434."
    } else {
        Write-Host "WARNING: Ollama may not be running. Check manually."
    }
}
