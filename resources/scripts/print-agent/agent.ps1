# ==============================================================================
# CSP Jaankari - Cloud Smart Counter Print Service Agent
# Silent Background Worker (Runs hidden, auto-starts on Windows boot)
# Features: Multi-printer detection, B&W vs Color smart routing, 100% silent
# ==============================================================================

try {
    # 3072 = TLS 1.2, 768 = TLS 1.1, 192 = TLS 1.0 (Compatible with all Windows 7/8/10/11 PowerShell versions)
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
} catch {
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = 3072
    } catch {}
}

$AppDir = "$env:LOCALAPPDATA\CSPPrintService"
if (!(Test-Path $AppDir)) {
    New-Item -ItemType Directory -Path $AppDir -Force | Out-Null
}

$LogFile = "$AppDir\agent.log"
$ConfigFile = "$AppDir\config.json"
$TempDir = "$AppDir\temp"
if (!(Test-Path $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $Message"
    try {
        if (Test-Path $LogFile) {
            $fileInfo = Get-Item $LogFile
            if ($fileInfo.Length -gt 3000000) {
                Rename-Item -Path $LogFile -NewName "$AppDir\agent_old.log" -Force -ErrorAction SilentlyContinue
            }
        }
        Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
    } catch {}
}

Write-Log "=== CSP Print Service Agent Started ==="

# Load Configuration
$ServerUrl = "__SERVER_URL__"
$AgentToken = "__AGENT_TOKEN__"
$script:BwPrinter = ""
$script:ColorPrinter = ""
$script:LastPrintError = ""

if (Test-Path $ConfigFile) {
    try {
        $json = Get-Content -Raw -Path $ConfigFile | ConvertFrom-Json
        if ($json.server_url) { $ServerUrl = $json.server_url }
        if ($json.agent_token) { $AgentToken = $json.agent_token }
    } catch {
        Write-Log "Failed to parse config.json: $_"
    }
}

Write-Log "Connecting to: $ServerUrl"

# SumatraPDF Portable for 100% silent background PDF/image printing
$SumatraExe = "$AppDir\SumatraPDF.exe"
function Ensure-SumatraPDF {
    # 1. Check if already installed and valid (>1MB)
    if (Test-Path $SumatraExe) {
        $existing = Get-Item $SumatraExe -ErrorAction SilentlyContinue
        if ($existing -and $existing.Length -gt 1000000) {
            return $true
        } else {
            Write-Log "Existing SumatraPDF.exe is corrupt ($($existing.Length) bytes). Removing..."
            Remove-Item -Path $SumatraExe -Force -ErrorAction SilentlyContinue
        }
    }

    # 2. Check if pre-bundled in installer directory ($PSScriptRoot)
    $bundled = "$PSScriptRoot\SumatraPDF.exe"
    if (Test-Path $bundled) {
        $bundledFile = Get-Item $bundled -ErrorAction SilentlyContinue
        if ($bundledFile -and $bundledFile.Length -gt 1000000) {
            Write-Log "Copying bundled SumatraPDF from $bundled to $SumatraExe..."
            Copy-Item -Path $bundled -Destination $SumatraExe -Force -ErrorAction SilentlyContinue
            if (Test-Path $SumatraExe) {
                Write-Log "Bundled SumatraPDF successfully copied."
                return $true
            }
        }
    }

    # 3. Direct Server Download (Our own verified CDN/endpoint)
    Write-Log "SumatraPDF not found locally. Downloading directly from server..."
    $serverEngineUrl = "$ServerUrl/api/print-agent/engine"
    try {
        Invoke-WebRequest -Uri $serverEngineUrl -OutFile $SumatraExe -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
        $sFile = Get-Item $SumatraExe -ErrorAction SilentlyContinue
        if ($sFile -and $sFile.Length -gt 1000000) {
            Write-Log "SumatraPDF downloaded directly from server successfully ($($sFile.Length) bytes)."
            return $true
        } else {
            Remove-Item -Path $SumatraExe -Force -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Log "Server engine download failed: $_. Trying external mirrors..."
    }

    # 4. Fallback: Download official release if server failed
    Write-Log "Downloading official package from mirrors..."
    $zipUrl = "https://files2.sumatrapdfreader.org/software/sumatrapdf/rel/3.6.1/SumatraPDF-3.6.1-64.zip"
    $zipDest = "$AppDir\sumatra_temp.zip"
    try {
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipDest -TimeoutSec 45 -UseBasicParsing -ErrorAction Stop
        if (Test-Path $zipDest) {
            Expand-Archive -Path $zipDest -DestinationPath $AppDir -Force
            Remove-Item -Path $zipDest -Force -ErrorAction SilentlyContinue
            if (Test-Path $SumatraExe) {
                Write-Log "SumatraPDF downloaded and extracted successfully."
                return $true
            }
        }
    } catch {
        Write-Log "ZIP download failed: $_. Trying standalone release URL..."
        $directExeUrl = "https://github.com/sumatrapdfreader/sumatrapdf/releases/download/v3.5.2/SumatraPDF-3.5.2-64.exe"
        try {
            Invoke-WebRequest -Uri $directExeUrl -OutFile $SumatraExe -TimeoutSec 45 -UseBasicParsing -ErrorAction Stop
            $dlFile = Get-Item $SumatraExe -ErrorAction SilentlyContinue
            if ($dlFile -and $dlFile.Length -gt 1000000) {
                Write-Log "Standalone SumatraPDF downloaded successfully."
                return $true
            } else {
                Remove-Item -Path $SumatraExe -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Log "Direct exe download failed: $_"
        }
    }

    return (Test-Path $SumatraExe)
}

# Ensure printer tool exists in background
[void](Ensure-SumatraPDF)

# Native Windows Image Printing Fallback (.NET)
Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue
function Print-ImageNative {
    param(
        [string]$ImagePath,
        [int]$Copies = 1,
        [string]$TargetPrinter = "",
        [bool]$Color = $false
    )
    try {
        Write-Log "Dispatching native image print: $ImagePath to '$TargetPrinter'"
        $doc = New-Object System.Drawing.Printing.PrintDocument
        if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
            $doc.PrinterSettings.PrinterName = $TargetPrinter
        }
        $doc.PrinterSettings.Copies = [short]$Copies
        $doc.PrinterSettings.DefaultPageSettings.Color = $Color

        $image = [System.Drawing.Image]::FromFile($ImagePath)
        $doc.add_PrintPage({
            param($sender, $e)
            $bounds = $e.MarginBounds
            $ratioX = $bounds.Width / $image.Width
            $ratioY = $bounds.Height / $image.Height
            $ratio = [Math]::Min($ratioX, $ratioY)
            $newW = [int]($image.Width * $ratio)
            $newH = [int]($image.Height * $ratio)
            $x = $bounds.Left + [int](($bounds.Width - $newW) / 2)
            $y = $bounds.Top + [int](($bounds.Height - $newH) / 2)
            $e.Graphics.DrawImage($image, $x, $y, $newW, $newH)
            $e.HasMorePages = $false
        })

        $doc.Print()
        $doc.Dispose()
        $image.Dispose()
        Write-Log "Native image print completed successfully."
        return $true
    } catch {
        Write-Log "Native image print failed: $_"
        $script:LastPrintError = "Native image print failed: $_"
        return $false
    }
}

function Get-DetailedPrinters {
    try {
        $printers = Get-CimInstance Win32_Printer | ForEach-Object {
            $isOffline = [bool]($_.WorkOffline -or ($_.PrinterStatus -eq 7) -or ($_.PrinterState -band 1024))
            $statusText = if ($isOffline) { "Offline" } elseif ($_.PrinterStatus -eq 4) { "Printing" } else { "Ready" }
            @{
                name = $_.Name
                is_default = [bool]$_.Default
                is_offline = $isOffline
                status = $statusText
                driver = $_.DriverName
            }
        }
        return @($printers)
    } catch {
        return @(@{ name = "Default"; is_default = $true; is_offline = $false; status = "Ready"; driver = "Generic" })
    }
}

function Set-ActivePrinter {
    param([string]$PrinterName)
    if ([string]::IsNullOrWhiteSpace($PrinterName)) { return }
    try {
        # 1. Disable Windows automatic default printer management (which overrides manual switching)
        Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Windows" -Name "LegacyDefaultPrinterMode" -Value 1 -Force -ErrorAction SilentlyContinue

        # 2. Native Win32 PrintUI Entry (direct system default printer switch)
        Start-Process -FilePath "rundll32.exe" -ArgumentList "printui.dll,PrintUIEntry /y /n `"$PrinterName`"" -NoNewWindow -Wait -ErrorAction SilentlyContinue

        # 3. CIM / WMI
        $wmiPrinter = Get-CimInstance Win32_Printer -Filter "Name = '$PrinterName'" -ErrorAction SilentlyContinue
        if ($wmiPrinter) {
            Invoke-CimMethod -InputObject $wmiPrinter -MethodName "SetDefaultPrinter" -ErrorAction SilentlyContinue | Out-Null
        }

        # 4. COM WScript.Network
        (New-Object -ComObject WScript.Network).SetDefaultPrinter($PrinterName)
        Write-Log "Switched Windows default printer to: '$PrinterName'"
    } catch {
        Write-Log "Note switching default printer: $_"
    }
}

function Print-DocumentSilently {
    param(
        [string]$FilePath,
        [int]$Copies = 1,
        [string]$ColorType = "bw",
        [string]$TargetPrinter = ""
    )

    $script:LastPrintError = ""
    $script:LastDispatchedPrinter = ""

    # 1. Inspect all physical local printers installed on Windows
    $allPrinters = Get-CimInstance Win32_Printer -ErrorAction SilentlyContinue

    # Find physical Epson/Color printer
    $localColorPrinter = ($allPrinters | Where-Object { $_.Name -match "Epson|Color|DeskJet|InkJet|Tank|Pixma|Photo|L31|L32|L80|L3150|L3250|L3110" } | Select-Object -First 1).Name

    # Find physical Canon/Laser/Monochrome printer
    $localBwPrinter = ($allPrinters | Where-Object { $_.Name -match "Canon|Laser|LBP|1020|M1005|Brother|Mono|MF3010|MF280|LaserJet" } | Select-Object -First 1).Name

    Write-Log "Hardware Check - Local Color: '$localColorPrinter', Local B&W: '$localBwPrinter'"

    # 2. Strict Smart Routing based on ColorType requested by customer
    if ($ColorType -eq "color") {
        # This is a COLOR print! Must physically go to Color/Epson printer
        if (![string]::IsNullOrWhiteSpace($localColorPrinter)) {
            $TargetPrinter = $localColorPrinter
            Write-Log "Color Routing: Selected local physical color printer '$TargetPrinter'"
        } elseif (![string]::IsNullOrWhiteSpace($script:ColorPrinter) -and ($script:ColorPrinter -notmatch "Canon|Laser|LBP|1020|M1005|Mono|MF3010|MF280")) {
            $TargetPrinter = $script:ColorPrinter
            Write-Log "Color Routing: Selected assigned color printer '$TargetPrinter'"
        } elseif (![string]::IsNullOrWhiteSpace($TargetPrinter) -and ($TargetPrinter -notmatch "Canon|Laser|LBP|1020|M1005|Mono|MF3010|MF280")) {
            Write-Log "Color Routing: Selected target color printer '$TargetPrinter'"
        } else {
            Write-Log "Warning: No dedicated color printer found, using default."
            $TargetPrinter = ""
        }
    } else {
        # This is a B&W print! Must physically go to B&W/Canon printer
        if (![string]::IsNullOrWhiteSpace($localBwPrinter)) {
            $TargetPrinter = $localBwPrinter
            Write-Log "B&W Routing: Selected local physical B&W printer '$TargetPrinter'"
        } elseif (![string]::IsNullOrWhiteSpace($script:BwPrinter) -and ($script:BwPrinter -notmatch "Epson|DeskJet|InkJet|Tank|Pixma")) {
            $TargetPrinter = $script:BwPrinter
            Write-Log "B&W Routing: Selected assigned B&W printer '$TargetPrinter'"
        } elseif (![string]::IsNullOrWhiteSpace($TargetPrinter) -and ($TargetPrinter -notmatch "Epson|DeskJet|InkJet|Tank|Pixma")) {
            Write-Log "B&W Routing: Selected target B&W printer '$TargetPrinter'"
        } else {
            Write-Log "Warning: No dedicated B&W printer found, using default."
            $TargetPrinter = ""
        }
    }

    # 3. Match Target Printer with installed printers (fuzzy case-insensitive match)
    if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
        $matched = $allPrinters | Where-Object { $_.Name -like "*$TargetPrinter*" -or $TargetPrinter -like "*$($_.Name)*" } | Select-Object -First 1
        if ($matched) {
            $TargetPrinter = $matched.Name
            Write-Log "Resolved exact target printer: '$TargetPrinter'"
        } else {
            Write-Log "Target printer '$TargetPrinter' not found in system! Available: $(($allPrinters.Name) -join ', ')."
        }
    }

    $script:LastDispatchedPrinter = $TargetPrinter
    $destName = if (![string]::IsNullOrWhiteSpace($TargetPrinter)) { $TargetPrinter } else { "Default Printer" }

    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $isImage = $ext -in @('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp')

    # 4. Print using SumatraPDF Portable
    try {
        $hasSumatra = (Test-Path $SumatraExe) -and ((Get-Item $SumatraExe).Length -gt 1000000)
        if ($hasSumatra) {
            $printSettings = "fit"
            if ($Copies -gt 1) {
                $printSettings = "${Copies}x,fit"
            }

            # Set Windows Default Printer to target printer for 100% reliable hardware dispatch
            if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
                Set-ActivePrinter -PrinterName $TargetPrinter
            }

            # Build argument array so PowerShell quotes spaces properly
            $sumatraArgs = if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
                @("-print-to", $TargetPrinter, "-print-settings", $printSettings, "-silent", $FilePath)
            } else {
                @("-print-to-default", "-print-settings", $printSettings, "-silent", $FilePath)
            }

            Write-Log "Printing via SumatraPDF to [$destName] with array args: $($sumatraArgs -join ' ')"
            $p = Start-Process -FilePath $SumatraExe -ArgumentList $sumatraArgs -PassThru -WindowStyle Hidden
            $finished = $p.WaitForExit(60000) # Wait up to 60 seconds
            if (!$finished) {
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
                throw "SumatraPDF timed out after 60 seconds."
            }

            if ($p.ExitCode -eq 0) {
                Write-Log "SumatraPDF completed successfully (exit code 0) on printer: $destName"
                return $true
            } else {
                Write-Log "SumatraPDF direct run exited with code: $($p.ExitCode). Trying via cmd.exe wrapper..."
                # Second attempt: invoke via cmd.exe /c to guarantee exact Win32 quotes
                $cmdToRun = if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
                    "`"`"$SumatraExe`" -print-to `"$TargetPrinter`" -print-settings `"$printSettings`" -silent `"$FilePath`"`""
                } else {
                    "`"`"$SumatraExe`" -print-to-default -print-settings `"$printSettings`" -silent `"$FilePath`"`""
                }
                $pCmd = Start-Process -FilePath "cmd.exe" -ArgumentList "/c $cmdToRun" -PassThru -WindowStyle Hidden
                $finishedCmd = $pCmd.WaitForExit(60000)
                if ($finishedCmd -and $pCmd.ExitCode -eq 0) {
                    Write-Log "SumatraPDF via cmd.exe completed successfully (exit code 0) on printer: $destName"
                    return $true
                }

                Write-Log "SumatraPDF cmd wrapper exited with code: $($pCmd.ExitCode)"

                # Fallback for Images using native .NET
                if ($isImage) {
                    Write-Log "SumatraPDF failed on image, attempting native .NET printing fallback..."
                    return Print-ImageNative -ImagePath $FilePath -Copies $Copies -TargetPrinter $TargetPrinter -Color ($ColorType -eq "color")
                }

                $script:LastPrintError = "SumatraPDF failed to print to $destName (exit code $($p.ExitCode))"
                return $false
            }
        }
    } catch {
        Write-Log "SumatraPDF print exception: $_"
        $script:LastPrintError = "$_"
    }

    # 5. Fallback for Images using native .NET
    if ($isImage) {
        Write-Log "Using native image printing for: $FilePath"
        return Print-ImageNative -ImagePath $FilePath -Copies $Copies -TargetPrinter $TargetPrinter -Color ($ColorType -eq "color")
    }

    $script:LastPrintError = "Printing failed: SumatraPDF engine not ready and document is not an image."
    return $false
}

function Check-SelfUpdate {
    try {
        $updateUrl = "$ServerUrl/api/print-agent/script?token=$AgentToken"
        $latestScript = Invoke-RestMethod -Uri $updateUrl -Method Get -TimeoutSec 10 -ErrorAction Stop
        if ($latestScript -is [string] -and $latestScript.Length -gt 2000 -and $latestScript.Contains("Print-DocumentSilently")) {
            $localScriptPath = "$AppDir\agent.ps1"
            if (Test-Path $localScriptPath) {
                $currentScript = Get-Content -Path $localScriptPath -Raw -Encoding UTF8
                $normCurrent = $currentScript.Replace("`r","").Trim()
                $normLatest = $latestScript.Replace("`r","").Trim()
                if ($normCurrent -ne $normLatest) {
                    Write-Log "=== AUTO-UPDATE: Newer agent.ps1 found on server. Installing update... ==="
                    [System.IO.File]::WriteAllText($localScriptPath, $latestScript, [System.Text.Encoding]::UTF8)
                    Write-Log "Update written successfully. Launching new background agent..."
                    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File `"$localScriptPath`""
                    Write-Log "Old agent process exiting now."
                    Exit
                }
            }
        }
    } catch {
        # Silently ignore update check errors
    }
}

$lastHeartbeat = [DateTime]::MinValue
$loopCount = 0

# Continuous Background Polling Loop
while ($true) {
    try {
        $loopCount++

        # Check for Self-Update every 6 iterations (~30 seconds)
        if ($loopCount % 6 -eq 1) {
            Check-SelfUpdate
        }

        # 1. Periodic Heartbeat & Status Reporting (every 15 seconds)
        if (([DateTime]::UtcNow - $lastHeartbeat).TotalSeconds -ge 15) {
            $printers = Get-DetailedPrinters
            $hbPayload = @{
                token = $AgentToken
                printers = $printers
                hostname = $env:COMPUTERNAME
            } | ConvertTo-Json -Depth 3

            try {
                $hbResponse = Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/heartbeat" -Method Post -Body $hbPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
                $lastHeartbeat = [DateTime]::UtcNow
                if ($hbResponse.bw_printer) { $script:BwPrinter = $hbResponse.bw_printer }
                if ($hbResponse.color_printer) { $script:ColorPrinter = $hbResponse.color_printer }
            } catch {
                Write-Log "Heartbeat failed: $_"
            }
        }

        # 2. Check for Pending Print Jobs
        $jobsUrl = "$ServerUrl/api/print-agent/jobs?token=$AgentToken"
        $jobsResponse = Invoke-RestMethod -Uri $jobsUrl -Method Get -TimeoutSec 10 -ErrorAction Stop

        if ($jobsResponse.bw_printer) { $script:BwPrinter = $jobsResponse.bw_printer }
        if ($jobsResponse.color_printer) { $script:ColorPrinter = $jobsResponse.color_printer }

        $jobsList = @()
        if ($jobsResponse.success -and $jobsResponse.jobs) {
            $jobsList = @($jobsResponse.jobs)
        }

        if ($jobsList.Count -gt 0) {
            Write-Log "Found $($jobsList.Count) pending job(s)."

            foreach ($job in $jobsList) {
                Write-Log "Processing Job #$($job.job_code) - Filename: $($job.original_filename) ($($job.copies) copies, $($job.color_type), target: $($job.target_printer))"
                
                # Acknowledge downloading / printing
                try {
                    $ackPayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "printing"
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $ackPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                } catch {}

                # Download File with safe ASCII path
                $cleanName = [System.IO.Path]::GetFileName($job.original_filename)
                $ext = [System.IO.Path]::GetExtension($cleanName)
                if ([string]::IsNullOrWhiteSpace($ext)) { $ext = ".pdf" }
                $localFilePath = "$TempDir\$($job.job_code)$ext"
                
                $downloadUrl = "$ServerUrl/api/print-agent/file/$($job.job_code)?token=$AgentToken"
                try {
                    Invoke-WebRequest -Uri $downloadUrl -OutFile $localFilePath -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
                    Write-Log "Downloaded file to $localFilePath"
                } catch {
                    Write-Log "File download failed: $_"
                    $failPayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "failed"
                        error = "Failed to download file from server: $_"
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $failPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                    continue
                }

                # Print Silently to Target Printer
                $copies = [int]$job.copies
                if ($copies -lt 1) { $copies = 1 }
                $colorType = "$($job.color_type)"
                $targetPrinter = "$($job.target_printer)"

                $printSuccess = Print-DocumentSilently -FilePath $localFilePath -Copies $copies -ColorType $colorType -TargetPrinter $targetPrinter

                if ($printSuccess) {
                    $dispatchedPrinter = if (![string]::IsNullOrWhiteSpace($script:LastDispatchedPrinter)) {
                        $script:LastDispatchedPrinter
                    } elseif (![string]::IsNullOrWhiteSpace($targetPrinter)) {
                        $targetPrinter
                    } else {
                        "Default Printer"
                    }
                    Write-Log "Job #$($job.job_code) printed successfully on [$dispatchedPrinter]."
                    $donePayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "completed"
                        printer_name = $dispatchedPrinter
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $donePayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                } else {
                    $errMsg = if (![string]::IsNullOrWhiteSpace($script:LastPrintError)) { $script:LastPrintError } else { "Printer error or document could not be dispatched." }
                    Write-Log "Job #$($job.job_code) failed during printing: $errMsg"
                    $failPayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "failed"
                        error = $errMsg
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $failPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                }

                # Clean up local file after a short delay
                Start-Sleep -Seconds 3
                Remove-Item -Path $localFilePath -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        Write-Log "Polling notice: $_"
    }

    Start-Sleep -Seconds 5
}
