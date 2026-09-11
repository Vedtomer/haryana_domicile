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

function Print-DocumentSilently {
    param(
        [string]$FilePath,
        [int]$Copies = 1,
        [string]$ColorType = "bw",
        [string]$TargetPrinter = ""
    )

    $script:LastPrintError = ""

    # 1. Determine target printer if not specified by server
    if ([string]::IsNullOrWhiteSpace($TargetPrinter)) {
        if ($ColorType -eq "color" -and !([string]::IsNullOrWhiteSpace($script:ColorPrinter))) {
            $TargetPrinter = $script:ColorPrinter
        } elseif ($ColorType -eq "bw" -and !([string]::IsNullOrWhiteSpace($script:BwPrinter))) {
            $TargetPrinter = $script:BwPrinter
        }
    }

    $allPrinters = Get-CimInstance Win32_Printer -ErrorAction SilentlyContinue

    # 2. Heuristic auto-route: If still empty, route Color to Epson/Inkjet and B&W to Canon/Laser
    if ([string]::IsNullOrWhiteSpace($TargetPrinter)) {
        if ($ColorType -eq "color") {
            $colorMatch = $allPrinters | Where-Object { $_.Name -match "Epson|Color|DeskJet|InkJet|Tank|Pixma|Photo|L31|L32|L80" } | Select-Object -First 1
            if ($colorMatch) {
                $TargetPrinter = $colorMatch.Name
                Write-Log "Auto-routed Color job to detected color printer: '$TargetPrinter'"
            }
        } else {
            $bwMatch = $allPrinters | Where-Object { $_.Name -match "Canon|Laser|LBP|1020|M1005|Brother|Mono" } | Select-Object -First 1
            if ($bwMatch) {
                $TargetPrinter = $bwMatch.Name
                Write-Log "Auto-routed B&W job to detected B&W printer: '$TargetPrinter'"
            }
        }
    }

    # 3. Match Target Printer with installed printers (fuzzy case-insensitive match)
    if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
        $matched = $allPrinters | Where-Object { $_.Name -like "*$TargetPrinter*" -or $TargetPrinter -like "*$($_.Name)*" } | Select-Object -First 1
        if ($matched) {
            $TargetPrinter = $matched.Name
            Write-Log "Resolved target printer: '$TargetPrinter'"
        } else {
            Write-Log "Target printer '$TargetPrinter' not found in system! Available: $(($allPrinters.Name) -join ', '). Falling back to default printer."
            $TargetPrinter = ""
        }
    }

    $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $isImage = $ext -in @('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp')

    # 3. Print using SumatraPDF Portable
    try {
        $hasSumatra = (Test-Path $SumatraExe) -and ((Get-Item $SumatraExe).Length -gt 1000000)
        if ($hasSumatra) {
            $printSettings = "fit"
            if ($Copies -gt 1) {
                $printSettings = "${Copies}x,fit"
            }

            # Build argument array for Start-Process to avoid quote-stripping issues
            $argsList = @()
            if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
                $argsList += "-print-to"
                $argsList += $TargetPrinter
            } else {
                $argsList += "-print-to-default"
            }
            $argsList += "-print-settings"
            $argsList += $printSettings
            $argsList += "-silent"
            $argsList += $FilePath

            $destName = if (![string]::IsNullOrWhiteSpace($TargetPrinter)) { $TargetPrinter } else { "Default Printer" }
            Write-Log "Printing via SumatraPDF to [$destName]: $FilePath ($printSettings)"

            $p = Start-Process -FilePath $SumatraExe -ArgumentList $argsList -PassThru -WindowStyle Hidden
            $finished = $p.WaitForExit(60000) # Wait up to 60 seconds
            if (!$finished) {
                Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
                throw "SumatraPDF timed out after 60 seconds."
            }

            if ($p.ExitCode -eq 0) {
                Write-Log "SumatraPDF completed successfully (exit code 0)."
                return $true
            } else {
                Write-Log "SumatraPDF exited with code: $($p.ExitCode)"
                # If specific printer failed, retry with Default Printer
                if (![string]::IsNullOrWhiteSpace($TargetPrinter)) {
                    Write-Log "Target printer '$TargetPrinter' failed. Retrying with Default Printer..."
                    $defArgs = @("-print-to-default", "-print-settings", $printSettings, "-silent", $FilePath)
                    $pDef = Start-Process -FilePath $SumatraExe -ArgumentList $defArgs -PassThru -WindowStyle Hidden
                    $finishedDef = $pDef.WaitForExit(60000)
                    if ($finishedDef -and $pDef.ExitCode -eq 0) {
                        Write-Log "Fallback print to default printer completed successfully!"
                        return $true
                    }
                }
                if ($isImage) {
                    Write-Log "SumatraPDF failed on image, attempting native .NET printing fallback..."
                    return Print-ImageNative -ImagePath $FilePath -Copies $Copies -TargetPrinter $TargetPrinter -Color ($ColorType -eq "color")
                }
                $script:LastPrintError = "SumatraPDF exit code $($p.ExitCode)"
                return $false
            }
        }
    } catch {
        Write-Log "SumatraPDF print exception: $_"
        $script:LastPrintError = "$_"
    }

    # 4. Fallback for Images using native .NET
    if ($isImage) {
        Write-Log "Using native image printing for: $FilePath"
        return Print-ImageNative -ImagePath $FilePath -Copies $Copies -TargetPrinter $TargetPrinter -Color ($ColorType -eq "color")
    }

    # 5. Ultimate Fallback to Windows Shell Verb Print
    try {
        Write-Log "Fallback: Printing via default Windows shell verb: $FilePath"
        for ($i = 0; $i -lt $Copies; $i++) {
            $p = Start-Process -FilePath $FilePath -Verb Print -PassThru -WindowStyle Hidden
            $p.WaitForExit(30000)
        }
        return $true
    } catch {
        Write-Log "Shell print error: $_"
        $script:LastPrintError = "Shell print error: $_"
        return $false
    }
}

$lastHeartbeat = [DateTime]::MinValue

# Continuous Background Polling Loop
while ($true) {
    try {
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

                # Report Completion or Failure
                if ($printSuccess) {
                    Write-Log "Job #$($job.job_code) printed successfully."
                    $donePayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "completed"
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
