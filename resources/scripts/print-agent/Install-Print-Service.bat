@echo off
title Installing CSP Print Background Service...
color 0A

echo ================================================================
echo       CSP JAANKARI - CLOUD SMART COUNTER PRINT SERVICE
echo                   1-CLICK SILENT INSTALLER
echo ================================================================
echo.
echo Installing background print service...
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CSPPrintService"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\temp" mkdir "%TARGET_DIR%\temp"

:: Kill any existing running instance of powershell running agent.ps1
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*CSPPrintService\agent.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1

:: Copy service files to local appdata
copy /y "%~dp0agent.ps1" "%TARGET_DIR%\" >nul
copy /y "%~dp0silent_starter.vbs" "%TARGET_DIR%\" >nul
if exist "%~dp0config.json" copy /y "%~dp0config.json" "%TARGET_DIR%\" >nul
copy /y "%~dp0Check-Status.bat" "%TARGET_DIR%\" >nul 2>&1
copy /y "%~dp0Uninstall-Service.bat" "%TARGET_DIR%\" >nul 2>&1
if exist "%~dp0SumatraPDF.exe" copy /y "%~dp0SumatraPDF.exe" "%TARGET_DIR%\" >nul

:: Add to Windows Startup Registry (Auto-starts silently on computer restart)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CSPPrintService" /t REG_SZ /d "wscript.exe \"%TARGET_DIR%\silent_starter.vbs\"" /f >nul

:: Launch the service immediately in silent background mode
start "" powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File "%TARGET_DIR%\agent.ps1"

echo.
echo ================================================================
echo   SUCCESS! CSP Print Service is installed and running!
echo ================================================================
echo.
echo - The service is RUNNING SILENTLY in the background.
echo - You DO NOT need to keep any black window open!
echo - It will AUTO-START automatically every time your PC turns on.
echo.

timeout /t 2 >nul
powershell -NoProfile -Command "$proc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*CSPPrintService\agent.ps1*' }; if ($proc) { Write-Host 'STATUS: ONLINE (PID: ' $proc.ProcessId ') - Background Print Service is Active!' -ForegroundColor Green } else { Write-Host 'Warning: Service initializing...' -ForegroundColor Yellow; if (Test-Path '%TARGET_DIR%\agent.log') { Get-Content -Tail 10 '%TARGET_DIR%\agent.log' } }"

:: Show a native Windows popup confirmation
powershell -NoProfile -Command "[System.Windows.Forms.MessageBox]::Show('CSP Print Service is installed successfully and running silently in the background! You do not need to keep any window open.', 'CSP Jaankari Print Service', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)" >nul 2>&1

timeout /t 4 >nul
exit
