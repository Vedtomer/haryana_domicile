@echo off
title Uninstalling CSP Print Background Service...
color 0C

echo ================================================================
echo           UNINSTALL CSP PRINT BACKGROUND SERVICE
echo ================================================================
echo.

set "TARGET_DIR=%LOCALAPPDATA%\CSPPrintService"

echo Stopping running print service background process...
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*CSPPrintService\agent.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" >nul 2>&1

echo Removing auto-start from Windows startup registry...
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CSPPrintService" /f >nul 2>&1

echo.
echo CSP Print Background Service has been uninstalled.
echo Auto-start has been removed and background processes stopped.
echo.

powershell -NoProfile -Command "[System.Windows.Forms.MessageBox]::Show('CSP Print Background Service has been completely uninstalled and stopped.', 'CSP Jaankari Print Service', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)" >nul 2>&1

timeout /t 3 >nul
exit
