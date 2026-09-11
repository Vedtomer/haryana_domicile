# ==============================================================================
# CSP Jaankari - Cloud Smart Counter Print Service Agent
# Silent Background Worker (Runs hidden, auto-starts on Windows boot)
# ==============================================================================

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

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
    if (Test-Path $SumatraExe) { return $true }
    Write-Log "Downloading portable SumatraPDF for silent direct printing..."
    $sumatraUrls = @(
        "https://www.sumatrapdfreader.org/dl/SumatraPDF-3.5.2-64.exe",
        "https://github.com/sumatrapdfreader/sumatrapdf/releases/download/v3.5.2/SumatraPDF-3.5.2-64.exe"
    )
    foreach ($url in $sumatraUrls) {
        try {
            Invoke-WebRequest -Uri $url -OutFile $SumatraExe -TimeoutSec 30 -UseBasicParsing -ErrorAction Stop
            if (Test-Path $SumatraExe) {
                Write-Log "SumatraPDF downloaded successfully."
                return $true
            }
        } catch {
            Write-Log "SumatraPDF download attempt failed: $_"
        }
    }
    return (Test-Path $SumatraExe)
}

# Ensure printer tool exists in background
[void](Ensure-SumatraPDF)

function Get-PrintersList {
    try {
        $printers = Get-CimInstance Win32_Printer | Select-Object -ExpandProperty Name
        return ($printers -join ",")
    } catch {
        return "Default"
    }
}

function Print-DocumentSilently {
    param(
        [string]$FilePath,
        [int]$Copies = 1,
        [string]$ColorType = "bw"
    )

    try {
        if (Test-Path $SumatraExe) {
            # SumatraPDF silent printing arguments
            # -print-to-default prints directly to the Windows default printer without any GUI dialogs
            $printSettings = "$Copies" + "x"
            if ($ColorType -eq "bw") {
                $printSettings += ",monochrome"
            } else {
                $printSettings += ",color"
            }
            Write-Log "Printing via SumatraPDF: $FilePath (settings: $printSettings)"
            $p = Start-Process -FilePath $SumatraExe -ArgumentList "-print-to-default -print-settings `"$printSettings`" -silent `"$FilePath`"" -PassThru -WindowStyle Hidden
            $p.WaitForExit(60000) # Wait up to 60 seconds
            return $true
        } else {
            # Fallback to standard Windows print shell
            Write-Log "SumatraPDF not found, printing via default shell verb: $FilePath"
            for ($i = 0; $i -lt $Copies; $i++) {
                $p = Start-Process -FilePath $FilePath -Verb Print -PassThru -WindowStyle Hidden
                $p.WaitForExit(30000)
            }
            return $true
        }
    } catch {
        Write-Log "Printing error: $_"
        return $false
    }
}

$lastHeartbeat = [DateTime]::MinValue

# Continuous Background Polling Loop
while ($true) {
    try {
        # 1. Periodic Heartbeat & Status Reporting (every 15 seconds)
        if (([DateTime]::UtcNow - $lastHeartbeat).TotalSeconds -ge 15) {
            $printers = Get-PrintersList
            $hbPayload = @{
                token = $AgentToken
                printers = $printers
                hostname = $env:COMPUTERNAME
            } | ConvertTo-Json

            try {
                $hbResponse = Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/heartbeat" -Method Post -Body $hbPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
                $lastHeartbeat = [DateTime]::UtcNow
            } catch {
                Write-Log "Heartbeat failed: $_"
            }
        }

        # 2. Check for Pending Print Jobs
        $jobsUrl = "$ServerUrl/api/print-agent/jobs?token=$AgentToken"
        $jobsResponse = Invoke-RestMethod -Uri $jobsUrl -Method Get -TimeoutSec 10 -ErrorAction Stop

        if ($jobsResponse.success -and $jobsResponse.jobs -and $jobsResponse.jobs.Count -gt 0) {
            Write-Log "Found $($jobsResponse.jobs.Count) pending job(s)."

            foreach ($job in $jobsResponse.jobs) {
                Write-Log "Processing Job #$($job.job_code) - Filename: $($job.original_filename) ($($job.copies) copies, $($job.color_type))"
                
                # Acknowledge downloading
                try {
                    $ackPayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "printing"
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $ackPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                } catch {}

                # Download File
                $cleanName = [System.IO.Path]::GetFileName($job.original_filename)
                if ([string]::IsNullOrWhiteSpace($cleanName)) { $cleanName = "document.pdf" }
                $localFilePath = "$TempDir\$($job.job_code)_$cleanName"
                
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

                # Print Silently
                $copies = [int]$job.copies
                if ($copies -lt 1) { $copies = 1 }
                $colorType = "$($job.color_type)"

                $printSuccess = Print-DocumentSilently -FilePath $localFilePath -Copies $copies -ColorType $colorType

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
                    Write-Log "Job #$($job.job_code) failed during printing."
                    $failPayload = @{
                        token = $AgentToken
                        job_code = $job.job_code
                        status = "failed"
                        error = "Printer error or document could not be dispatched."
                    } | ConvertTo-Json
                    Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/update-status" -Method Post -Body $failPayload -ContentType "application/json" -TimeoutSec 10 -ErrorAction SilentlyContinue | Out-Null
                }

                # Clean up local file
                Start-Sleep -Seconds 3
                Remove-Item -Path $localFilePath -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        # Silent backoff on connection errors
        # Write-Log "Loop exception: $_"
    }

    Start-Sleep -Seconds 5
}
