@echo off
title CSP Print Service - Status Checker
color 0B

echo ================================================================
echo           CSP PRINT SERVICE - SYSTEM STATUS CHECK
echo ================================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CSPPrintService"
set "LOG_FILE=%TARGET_DIR%\agent.log"

powershell -NoProfile -Command "$proc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*CSPPrintService\agent.ps1*' }; if ($proc) { Write-Host 'Status: RUNNING (PID: ' $proc.ProcessId ') - Background service is Active and Ready!' -ForegroundColor Green } else { Write-Host 'Status: STOPPED - Service is not currently running.' -ForegroundColor Red }"

echo.
if exist "%LOG_FILE%" (
    echo --- Last 10 lines of Agent Log: ---
    powershell -NoProfile -Command "Get-Content -Tail 10 '%LOG_FILE%'"
) else (
    echo No log file found yet.
)

echo.
echo ================================================================
echo Press any key to close this window...
pause >nul
