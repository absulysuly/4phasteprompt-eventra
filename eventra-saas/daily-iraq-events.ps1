# 🇮🇶 AUTOMATED IRAQ EVENT COLLECTOR
# This script runs daily to collect fresh Iraq event data

param(
    [string]$Time = (Get-Date -Format "yyyy-MM-dd_HH-mm"),
    [int]$Duration = 60,
    [int]$VUsers = 4
)

# Create daily reports directory
$ReportsDir = "iraq-event-reports"
if (!(Test-Path $ReportsDir)) {
    New-Item -ItemType Directory -Path $ReportsDir | Out-Null
}

Write-Host "🇮🇶 IRAQ EVENT COLLECTOR - DAILY AUTOMATED RUN" -ForegroundColor Green -BackgroundColor Black
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "📅 Date: $(Get-Date -Format 'dddd, MMMM dd, yyyy')" -ForegroundColor Cyan
Write-Host "⏰ Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host "📁 Report: $ReportsDir\iraq-events-$Time.json" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Yellow

# Check if development server is running
Write-Host "🔍 Checking if development server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method HEAD -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running on localhost:3000" -ForegroundColor Green
    $ServerRunning = $true
    $TargetURL = "http://localhost:3000"
} catch {
    Write-Host "⚠️  Local server not running, checking for production URL..." -ForegroundColor Yellow
    # You can add your production URL here if you have one
    $ProductionURL = $env:PRODUCTION_URL
    if ($ProductionURL) {
        Write-Host "🌐 Using production URL: $ProductionURL" -ForegroundColor Cyan
        $TargetURL = $ProductionURL
        $ServerRunning = $true
    } else {
        Write-Host "❌ No server available. Starting local server..." -ForegroundColor Red
        Write-Host "💡 Starting development server in background..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Minimized
        Write-Host "⏱️  Waiting 15 seconds for server to start..." -ForegroundColor Yellow
        Start-Sleep 15
        $TargetURL = "http://localhost:3000"
        $ServerRunning = $true
    }
}

if ($ServerRunning) {
    # Set environment variable
    $env:STAGING_URL = $TargetURL
    
    Write-Host "🚀 Starting Iraq event data collection..." -ForegroundColor Green
    Write-Host "🎯 Target: $TargetURL" -ForegroundColor Cyan
    Write-Host "⏱️  Duration: $Duration seconds" -ForegroundColor Cyan
    Write-Host "👥 Virtual Users: $VUsers" -ForegroundColor Cyan
    Write-Host ""
    
    # Run k6 collection
    $OutputFile = "$ReportsDir\iraq-events-$Time.json"
    & k6 run .\testing\k6\tourist-tara.js --summary-export $OutputFile --duration "${Duration}s" --vus $VUsers
    
    if (Test-Path $OutputFile) {
        # Analyze results
        Write-Host ""
        Write-Host "📊 IRAQ EVENT COLLECTION COMPLETED!" -ForegroundColor Green -BackgroundColor Black
        Write-Host "====================================" -ForegroundColor Yellow
        
        $data = Get-Content $OutputFile | ConvertFrom-Json
        $metrics = $data.metrics
        
        $successRate = if ($metrics.checks.passes + $metrics.checks.fails -gt 0) { 
            [math]::Round(($metrics.checks.passes / ($metrics.checks.passes + $metrics.checks.fails)) * 100, 1)
        } else { 0 }
        
        Write-Host "✅ SUCCESS RATE: $successRate%" -ForegroundColor $(if($successRate -gt 90) {'Green'} else {'Red'})
        Write-Host "📊 TOTAL REQUESTS: $($metrics.http_reqs.count)" -ForegroundColor Green
        Write-Host "📡 DATA COLLECTED: $([math]::Round($metrics.data_received.count / 1KB, 2)) KB" -ForegroundColor Magenta
        Write-Host "⏱️  AVG RESPONSE: $([math]::Round([double]($metrics.http_req_duration.avg -replace 's') * 1000, 0))ms" -ForegroundColor Cyan
        Write-Host "🇮🇶 IRAQ CITIES MONITORED: Baghdad, Erbil, Basra, Mosul, Sulaymaniyah, Karbala, Najaf, Duhok" -ForegroundColor Green
        
        # Create summary report
        $summary = @{
            Date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            SuccessRate = "$successRate%"
            TotalRequests = $metrics.http_reqs.count
            DataCollected = "$([math]::Round($metrics.data_received.count / 1KB, 2)) KB"
            AvgResponseTime = "$([math]::Round([double]($metrics.http_req_duration.avg -replace 's') * 1000, 0))ms"
            IraqCitiesCovered = 8
            Status = if($successRate -gt 90) {"Healthy"} else {"Needs Attention"}
        }
        
        $summary | ConvertTo-Json | Out-File "$ReportsDir\daily-summary-$Time.json"
        
        Write-Host "📁 Report saved: $OutputFile" -ForegroundColor Cyan
        Write-Host "📋 Summary saved: $ReportsDir\daily-summary-$Time.json" -ForegroundColor Cyan
        
        # Check for issues
        if ($successRate -lt 90) {
            Write-Host "⚠️  WARNING: Success rate below 90% - Iraq events may have issues!" -ForegroundColor Red
        }
        
        if ([double]($metrics.http_req_duration.avg -replace 's') -gt 3) {
            Write-Host "⚠️  WARNING: Slow response times - Iraqi users may experience delays!" -ForegroundColor Red
        }
        
        Write-Host "====================================" -ForegroundColor Yellow
        Write-Host "✅ Iraq Event Collection Complete! Next run scheduled for tomorrow." -ForegroundColor Green
        
    } else {
        Write-Host "❌ Collection failed - no output file generated" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Cannot run collection - no server available" -ForegroundColor Red
}

Write-Host ""
Write-Host "🇮🇶 Daily Iraq Event Monitoring Complete" -ForegroundColor Green
Write-Host "Next automated run: $(Get-Date (Get-Date).AddDays(1) -Format 'dddd, MMMM dd, yyyy at HH:mm')" -ForegroundColor Cyan