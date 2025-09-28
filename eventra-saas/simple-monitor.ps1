# Simple Event Collection Monitor
param([string]$LogFile = "live-collection.json")

Write-Host "🚀 EVENT COLLECTION MONITOR STARTED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

$startTime = Get-Date

while ($true) {
    Clear-Host
    Write-Host "🔥 EVENTRA EVENT COLLECTOR DASHBOARD 🔥" -ForegroundColor Red
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host "Runtime: $((Get-Date) - $startTime)" -ForegroundColor Green
    Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Yellow
    
    if (Test-Path $LogFile) {
        try {
            $data = Get-Content $LogFile -Raw | ConvertFrom-Json
            $metrics = $data.metrics
            
            Write-Host "📊 STATISTICS:" -ForegroundColor Cyan
            Write-Host "Total Requests: $($metrics.http_reqs.count)" -ForegroundColor Green
            Write-Host "Request Rate: $($metrics.http_reqs.rate)/sec" -ForegroundColor Green
            Write-Host "Checks Passed: $($metrics.checks.passes)" -ForegroundColor Green
            Write-Host "Checks Failed: $($metrics.checks.fails)" -ForegroundColor Red
            
            if ($metrics.http_req_duration) {
                Write-Host "" 
                Write-Host "⚡ PERFORMANCE:" -ForegroundColor Yellow
                Write-Host "Avg Response: $($metrics.http_req_duration.avg)ms" -ForegroundColor Cyan
                Write-Host "Min Response: $($metrics.http_req_duration.min)ms" -ForegroundColor Cyan
                Write-Host "Max Response: $($metrics.http_req_duration.max)ms" -ForegroundColor Cyan
            }
            
            Write-Host ""
            Write-Host "📡 DATA TRANSFER:" -ForegroundColor Magenta
            Write-Host "Data Received: $($metrics.data_received.count) bytes" -ForegroundColor Magenta
            Write-Host "Data Sent: $($metrics.data_sent.count) bytes" -ForegroundColor Magenta
            
            Write-Host ""
            Write-Host "👥 LOAD:" -ForegroundColor Blue
            Write-Host "Virtual Users: $($metrics.vus.value)" -ForegroundColor Blue
            Write-Host "Iterations: $($metrics.iterations.count)" -ForegroundColor Blue
        }
        catch {
            Write-Host "Error reading file: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "📁 Waiting for: $LogFile" -ForegroundColor Yellow
        Write-Host "💡 Start k6 with --summary-export $LogFile" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "=======================================" -ForegroundColor Yellow
    Write-Host "Refreshing every 3 seconds... (Ctrl+C to stop)" -ForegroundColor Gray
    
    Start-Sleep 3
}