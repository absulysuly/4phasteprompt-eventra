# 🚀 EVENTRA EVENT COLLECTOR - QUICK START
# This script starts the event collection process

param(
    [string]$Duration = "60s",
    [int]$VirtualUsers = 5,
    [string]$TargetURL = "http://localhost:3000"
)

Write-Host "🚀 STARTING EVENTRA EVENT COLLECTION..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "🎯 Target URL: $TargetURL" -ForegroundColor Cyan
Write-Host "⏱️  Duration: $Duration" -ForegroundColor Cyan
Write-Host "👥 Virtual Users: $VirtualUsers" -ForegroundColor Cyan
Write-Host "📁 Output File: live-collection.json" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Yellow

# Set environment variable
$env:STAGING_URL = $TargetURL

Write-Host "⚡ Starting k6 load test..." -ForegroundColor Green
Write-Host "💡 Open another terminal and run: .\monitor-events.ps1" -ForegroundColor Magenta
Write-Host ""

# Start k6 with live collection
& k6 run .\testing\k6\tourist-tara.js --summary-export live-collection.json --duration $Duration --vus $VirtualUsers

Write-Host ""
Write-Host "✅ Event collection completed!" -ForegroundColor Green
Write-Host "📊 Check live-collection.json for results" -ForegroundColor Cyan