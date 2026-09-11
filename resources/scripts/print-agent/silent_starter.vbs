' CSP Jaankari Print Service - Zero-Window Silent Launcher
' Runs the PowerShell background agent with completely hidden window (0)
On Error Resume Next

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

strAppDir = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\CSPPrintService"
strScriptPath = strAppDir & "\agent.ps1"

If Not fso.FileExists(strScriptPath) Then
    ' Try current folder as fallback
    strScriptPath = fso.GetParentFolderName(WScript.ScriptFullName) & "\agent.ps1"
End If

If fso.FileExists(strScriptPath) Then
    strCommand = "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File """ & strScriptPath & """"
    WshShell.Run strCommand, 0, False
End If
