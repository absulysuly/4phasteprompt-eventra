# 🇮🇶 SIMPLE DAILY IRAQ EVENT COLLECTOR
Write-Host "🇮🇶 IRAQ EVENT COLLECTOR - DAILY RUN" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "📅 $(Get-Date -Format 'dddd, MMMM dd, yyyy at HH:mm:ss')" -ForegroundColor Cyan

# Create reports directory
if (!(Test-Path "iraq-reports")) { New-Item -ItemType Directory -Path "iraq-reports" | Out-Null }

# Set target URL
$env:STAGING_URL = "http://localhost:3000"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"

Write-Host "🚀 Collecting Iraq event data..." -ForegroundColor Green
Write-Host "🎯 Monitoring cities: Baghdad, Erbil, Basra, Mosul, Sulaymaniyah, Karbala, Najaf, Duhok" -ForegroundColor Cyan

# Run collection
k6 run .\testing\k6\tourist-tara.js --summary-export "iraq-reports\iraq-events-$timestamp.json" --duration 45s --vus 4

# Check results
if (Test-Path "iraq-reports\iraq-events-$timestamp.json") {
    Write-Host ""
    Write-Host "✅ SUCCESS! Iraq event data collected!" -ForegroundColor Green
    $data = Get-Content "iraq-reports\iraq-events-$timestamp.json" | ConvertFrom-Json
    $metrics = $data.metrics
    
    $successRate = [math]::Round(($metrics.checks.passes / ($metrics.checks.passes + $metrics.checks.fails)) * 100, 1)
    
    Write-Host "📊 Results Summary:" -ForegroundColor Cyan
    Write-Host "   Success Rate: $successRate%" -ForegroundColor Green
    Write-Host "   Total Requests: $($metrics.http_reqs.count)" -ForegroundColor Green
    Write-Host "   Data Collected: $([math]::Round($metrics.data_received.count / 1KB, 2)) KB" -ForegroundColor Green
    Write-Host "   Iraq Cities: 8 monitored" -ForegroundColor Green
    Write-Host "📁 Report: iraq-reports\iraq-events-$timestamp.json" -ForegroundColor Cyan
    
    if ($successRate -lt 90) {
        Write-Host "⚠️  Warning: Low success rate - check Iraq event website!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Collection failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "🇮🇶 Iraq Event Collection Complete" -ForegroundColor Green