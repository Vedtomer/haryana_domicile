@echo off
title CSP Jaankari - QR Print Agent
cd /d "%~dp0"
echo ========================================================
echo       CSP JAANKARI - QR CLOUD PRINT AGENT
echo ========================================================
echo Starting background printer listener...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0agent.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Agent stopped or encountered an error. Press any key to restart or exit.
    pause
)
