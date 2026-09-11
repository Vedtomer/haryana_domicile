<#
=============================================================================
  CSP JAANKARI - QR CLOUD PRINT AGENT (Windows Desktop Daemon)
=============================================================================
  Connects your local Windows printer with your online Shop Counter QR Code.
  Auto-detects printers, receives jobs, and prints silently.
=============================================================================
#>

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

# Configuration (Pre-configured when downloaded from your dashboard)
$ServerUrl   = "https://cspjaankari.in"
$AgentSecret = "__AGENT_SECRET__"
$PollInterval = 3 # seconds

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TempDir   = Join-Path $env:TEMP "CSPPrintAgent"
$JobsDir   = Join-Path $TempDir "jobs"
$SumatraExe = Join-Path $ScriptDir "SumatraPDF.exe"

if (-not (Test-Path $JobsDir)) {
    New-Item -ItemType Directory -Path $JobsDir -Force | Out-Null
}

function Write-CspHeader {
    Clear-Host
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "       CSP JAANKARI - QR CLOUD PRINT AGENT v1.0                 " -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "================================================================" -ForegroundColor Cyan
    Write-Host "Server:  $ServerUrl" -ForegroundColor Gray
    Write-Host "Folder:  $ScriptDir" -ForegroundColor Gray
    Write-Host "================================================================" -ForegroundColor Cyan
}

function Ensure-SumatraPdf {
    if (Test-Path $SumatraExe) { return $true }
    
    Write-Host "[*] Downloading silent PDF print engine (SumatraPDF)..." -ForegroundColor Yellow
    try {
        $zipUrl = "https://www.sumatrapdfreader.org/dl/rel/3.5.2/SumatraPDF-3.5.2-64.zip"
        $tempZip = Join-Path $TempDir "sumatra.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing -TimeoutSec 30
        Expand-Archive -Path $tempZip -DestinationPath $TempDir -Force
        $extractedExe = Get-ChildItem -Path $TempDir -Filter "SumatraPDF*.exe" -Recurse | Select-Object -First 1
        if ($extractedExe) {
            Copy-Item -Path $extractedExe.FullName -Destination $SumatraExe -Force
            Remove-Item -Path $tempZip -Force -ErrorAction SilentlyContinue
            Write-Host "[+] Silent PDF print engine installed successfully!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "[-] Note: Could not auto-download SumatraPDF. Native Windows PrintTo will be used." -ForegroundColor DarkYellow
    }
    return $false
}

function Get-InstalledPrinters {
    try {
        $printers = Get-CimInstance Win32_Printer | Select-Object Name, Default, PrinterStatus, PortName
        return @($printers | ForEach-Object {
            @{
                name    = $_.Name
                default = [bool]$_.Default
                status  = $_.PrinterStatus
            }
        })
    } catch {
        return @()
    }
}

function Send-Heartbeat {
    param([array]$printers)
    try {
        $body = @{
            agent_secret = $AgentSecret
            printers     = $printers
            hostname     = $env:COMPUTERNAME
        } | ConvertTo-Json -Compress

        $res = Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/heartbeat" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
        return $res
    } catch {
        return $null
    }
}

function Print-Document {
    param(
        [string]$filePath,
        [string]$printerName,
        [int]$copies = 1,
        [string]$colorMode = 'bw',
        [string]$duplex = 'simplex',
        [string]$pageRange = 'all'
    )

    if (-not (Test-Path $filePath)) {
        throw "File not found: $filePath"
    }

    if ([string]::IsNullOrWhiteSpace($printerName)) {
        # Fallback to default Windows printer
        $defaultPrinter = (Get-CimInstance Win32_Printer | Where-Object { $_.Default } | Select-Object -First 1).Name
        $printerName = $defaultPrinter
    }

    Write-Host "[>] Printing to: $printerName (Copies: $copies, Color: $colorMode, Duplex: $duplex)" -ForegroundColor Cyan

    # Method 1: SumatraPDF (Fastest, 100% Silent, dialog-free)
    if (Test-Path $SumatraExe) {
        $settings = @()
        if ($copies -gt 1) { $settings += "${copies}x" }
        if ($duplex -eq 'duplex_long') { $settings += "duplex=long" }
        elseif ($duplex -eq 'duplex_short') { $settings += "duplex=short" }
        else { $settings += "duplex=simplex" }
        if ($colorMode -eq 'color') { $settings += "color" } else { $settings += "monochrome" }
        if ($pageRange -and $pageRange -ne 'all') { $settings += $pageRange }

        $settingsStr = $settings -join ','
        $args = "-print-to `"$printerName`""
        if ($settingsStr) { $args += " -print-settings `"$settingsStr`"" }
        $args += " `"$filePath`""

        $p = Start-Process -FilePath $SumatraExe -ArgumentList $args -WindowStyle Hidden -PassThru -Wait
        if ($p.ExitCode -eq 0) {
            return $true
        }
    }

    # Method 2: Native Windows PrintTo fallback
    for ($i = 1; $i -le $copies; $i++) {
        $p = Start-Process -FilePath $filePath -Verb PrintTo -ArgumentList "`"$printerName`"" -WindowStyle Hidden -PassThru
        Start-Sleep -Milliseconds 1500
    }
    return $true
}

# --- MAIN LOOP ---
Write-CspHeader
Ensure-SumatraPdf | Out-Null

Write-Host "`n[*] Detecting installed Windows printers..." -ForegroundColor Yellow
$printers = Get-InstalledPrinters
foreach ($p in $printers) {
    $def = if ($p.default) { " (DEFAULT)" } else { "" }
    Write-Host "    - $($p.name)$def" -ForegroundColor Gray
}

Write-Host "`n[*] Connecting to CSP Jaankari Cloud..." -ForegroundColor Yellow
$heartbeat = Send-Heartbeat -printers $printers

if ($heartbeat -and $heartbeat.success) {
    Write-Host "[+] CONNECTED: $($heartbeat.shop.shop_name) ($($heartbeat.shop.shop_code))" -ForegroundColor Green
    Write-Host "[+] Target Printer: $($heartbeat.shop.target_printer)" -ForegroundColor Green
    Write-Host "[+] Listening for incoming customer print jobs..." -ForegroundColor White
} else {
    Write-Host "[-] Connection error. Check server URL or Agent Secret." -ForegroundColor Red
}

$lastHeartbeatTime = [DateTime]::MinValue

while ($true) {
    try {
        # Send heartbeat every 20 seconds
        if (([DateTime]::Now - $lastHeartbeatTime).TotalSeconds -ge 20) {
            $hb = Send-Heartbeat -printers (Get-InstalledPrinters)
            $lastHeartbeatTime = [DateTime]::Now
            if ($hb -and $hb.success) {
                # Target printer might have been updated from dashboard
                $targetPrinter = $hb.shop.target_printer
            }
        }

        # Check for pending jobs
        $pollUrl = "$ServerUrl/api/print-agent/pending-jobs?secret=$AgentSecret"
        $pendingJobs = Invoke-RestMethod -Uri $pollUrl -Method Get -TimeoutSec 10

        if ($pendingJobs -and $pendingJobs.jobs -and $pendingJobs.jobs.Count -gt 0) {
            foreach ($job in $pendingJobs.jobs) {
                Write-Host "`n[!] NEW PRINT JOB: #$($job.job_code) from $($job.customer_name)" -ForegroundColor Yellow
                Write-Host "    File: $($job.file_name) ($($job.total_pages) pages, $($job.copies) copies)" -ForegroundColor Gray

                # Report downloading
                Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/status/$($job.id)" -Method Post -Body (@{ agent_secret = $AgentSecret; status = 'downloading' } | ConvertTo-Json) -ContentType "application/json" | Out-Null

                $localFile = Join-Path $JobsDir "$($job.job_code)_$($job.file_name)"
                Write-Host "    Downloading: $($job.download_url)" -ForegroundColor DarkGray
                Invoke-WebRequest -Uri $job.download_url -OutFile $localFile -UseBasicParsing -TimeoutSec 60

                # Report printing
                Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/status/$($job.id)" -Method Post -Body (@{ agent_secret = $AgentSecret; status = 'printing' } | ConvertTo-Json) -ContentType "application/json" | Out-Null

                # Print
                $target = if ($job.color_mode -eq 'color' -and $job.color_printer_name) { $job.color_printer_name } else { $job.printer_name }
                Print-Document -filePath $localFile -printerName $target -copies $job.copies -colorMode $job.color_mode -duplex $job.duplex -pageRange $job.page_range

                # Report printed
                Invoke-RestMethod -Uri "$ServerUrl/api/print-agent/status/$($job.id)" -Method Post -Body (@{ agent_secret = $AgentSecret; status = 'printed' } | ConvertTo-Json) -ContentType "application/json" | Out-Null

                Write-Host "[✓] JOB #$($job.job_code) PRINTED SUCCESSFULLY!" -ForegroundColor Green

                # Clean up local file after print
                Start-Sleep -Seconds 3
                Remove-Item -Path $localFile -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        Write-Host "[-] Loop error: $($_.Exception.Message)" -ForegroundColor DarkRed
    }

    Start-Sleep -Seconds $PollInterval
}
