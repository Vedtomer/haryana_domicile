@echo off
title CSP Print Service - Live Console Mode
color 0E

echo ================================================================
echo           CSP PRINT SERVICE - LIVE DEBUG RUNNER
echo ================================================================
echo.
echo Running print agent in visible console window to watch live printing...
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CSPPrintService"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\temp" mkdir "%TARGET_DIR%\temp"

:: Kill any existing background instance to avoid duplicate processing
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*CSPPrintService\agent.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1

:: Copy latest files to target dir
copy /y "%~dp0agent.ps1" "%TARGET_DIR%\" >nul
if exist "%~dp0config.json" copy /y "%~dp0config.json" "%TARGET_DIR%\" >nul
if exist "%~dp0SumatraPDF.exe" copy /y "%~dp0SumatraPDF.exe" "%TARGET_DIR%\" >nul

echo Starting Agent... (Press Ctrl+C to stop anytime)
echo.
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%TARGET_DIR%\agent.ps1"

pause
