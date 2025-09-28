# 🚀 EVENTRA EVENT COLLECTOR - LIVE MONITORING DASHBOARD
# Run this script to see real-time event collection progress

param(
    [string]$LogFile = "live-collection.json",
    [int]$RefreshSeconds = 2
)

Write-Host "🚀 STARTING EVENT COLLECTOR MONITORING..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow
Write-Host "📁 Monitoring file: $LogFile" -ForegroundColor Cyan
Write-Host "⏱️  Refresh rate: $RefreshSeconds seconds" -ForegroundColor Cyan
Write-Host "💡 Press Ctrl+C to stop monitoring" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Yellow
Start-Sleep 3

$startTime = Get-Date

while ($true) {
    Clear-Host
    
    # Header
    Write-Host "🔥 EVENTRA EVENT COLLECTOR - LIVE DASHBOARD 🔥" -ForegroundColor Red -BackgroundColor White
    Write-Host "=================================================" -ForegroundColor Yellow
    Write-Host "⏰ Runtime: $((Get-Date) - $startTime)" -ForegroundColor Green
    Write-Host "🔄 Last Update: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Yellow
    
    # Check if log file exists
    if (Test-Path $LogFile) {
        try {
            $data = Get-Content $LogFile -Raw | ConvertFrom-Json
            $metrics = $data.metrics
            
            # Main Stats
            Write-Host "📊 COLLECTION STATISTICS:" -ForegroundColor Cyan
            Write-Host "  ✅ Total Requests: $($metrics.http_reqs.count)" -ForegroundColor Green
            Write-Host "  📈 Request Rate: $($metrics.http_reqs.rate)/sec" -ForegroundColor Green
            Write-Host "  ✔️  Checks Passed: $($metrics.checks.passes)" -ForegroundColor Green
            Write-Host "  ❌ Checks Failed: $($metrics.checks.fails)" -ForegroundColor Red
            $successRate = if($metrics.checks.passes + $metrics.checks.fails -gt 0) { [math]::Round(($metrics.checks.passes / ($metrics.checks.passes + $metrics.checks.fails)) * 100, 2) } else { 0 }
            $successColor = if($metrics.checks.passes -gt $metrics.checks.fails) { 'Green' } else { 'Red' }
            Write-Host "  🎯 Success Rate: $successRate%" -ForegroundColor $successColor
            Write-Host ""
            
            # Performance Stats
            Write-Host "⚡ PERFORMANCE METRICS:" -ForegroundColor Yellow
            if ($metrics.http_req_duration) {
                Write-Host "  ⏱️  Avg Response: $($metrics.http_req_duration.avg)ms" -ForegroundColor Cyan
                Write-Host "  🚀 Min Response: $($metrics.http_req_duration.min)ms" -ForegroundColor Cyan
                Write-Host "  🐌 Max Response: $($metrics.http_req_duration.max)ms" -ForegroundColor Cyan
                Write-Host "  📊 95th Percentile: $($metrics.http_req_duration.p95)ms" -ForegroundColor Cyan
            }
            Write-Host ""
            
            # Data Transfer
            Write-Host "📡 DATA TRANSFER:" -ForegroundColor Magenta
            Write-Host "  📥 Data Received: $($metrics.data_received.count) bytes ($($metrics.data_received.rate) B/s)" -ForegroundColor Magenta
            Write-Host "  📤 Data Sent: $($metrics.data_sent.count) bytes ($($metrics.data_sent.rate) B/s)" -ForegroundColor Magenta
            Write-Host ""
            
            # Virtual Users & Load
            Write-Host "👥 LOAD TESTING:" -ForegroundColor Blue
            Write-Host "  🏃 Current VUs: $($metrics.vus.value)" -ForegroundColor Blue
            Write-Host "  👥 Max VUs: $($metrics.vus_max.value)" -ForegroundColor Blue
            Write-Host "  🔄 Iterations: $($metrics.iterations.count)" -ForegroundColor Blue
            Write-Host "  📈 Iteration Rate: $($metrics.iterations.rate)/sec" -ForegroundColor Blue
            Write-Host ""
            
            # Status Indicators
            Write-Host "🚦 API ENDPOINTS STATUS:" -ForegroundColor White
            if ($metrics.'homepage status 200') {
                $homeSuccess = $metrics.'homepage status 200'.passes
                $homeTotal = $metrics.'homepage status 200'.passes + $metrics.'homepage status 200'.fails
                $homeRate = if($homeTotal -gt 0) { [math]::Round(($homeSuccess/$homeTotal)*100,1) } else { 0 }
                $homeColor = if($homeSuccess -gt $homeTotal/2) { 'Green' } else { 'Red' }
                Write-Host "  🏠 Homepage: $homeSuccess/$homeTotal ($homeRate%)" -ForegroundColor $homeColor
            }
            
            if ($metrics.'events or fallback status 200') {
                $eventsSuccess = $metrics.'events or fallback status 200'.passes
                $eventsTotal = $metrics.'events or fallback status 200'.passes + $metrics.'events or fallback status 200'.fails
                $eventsRate = if($eventsTotal -gt 0) { [math]::Round(($eventsSuccess/$eventsTotal)*100,1) } else { 0 }
                $eventsColor = if($eventsSuccess -gt $eventsTotal/2) { 'Green' } else { 'Red' }
                Write-Host "  📅 Events API: $eventsSuccess/$eventsTotal ($eventsRate%)" -ForegroundColor $eventsColor
            }
            
            # Progress Bar
            Write-Host ""
            Write-Host "🔥 COLLECTION PROGRESS:" -ForegroundColor Red
            $progressChar = "█"
            $totalBars = 30
            $completedBars = [math]::Min([math]::Floor(($metrics.iterations.count / 10) % $totalBars), $totalBars)
            $progressBar = ($progressChar * $completedBars) + ("░" * ($totalBars - $completedBars))
            Write-Host "  [$progressBar] Collecting..." -ForegroundColor Green
            
        }
        catch {
            Write-Host "⚠️  Error reading log file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "📁 Waiting for log file: $LogFile" -ForegroundColor Yellow
        Write-Host "💡 Make sure k6 is running with --summary-export $LogFile" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "=================================================" -ForegroundColor Yellow
    Write-Host "💡 Monitoring $LogFile every $RefreshSeconds seconds..." -ForegroundColor Gray
    
    Start-Sleep $RefreshSeconds
}