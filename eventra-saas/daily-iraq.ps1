$env:STAGING_URL="http://localhost:3000"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
if (!(Test-Path "iraq-reports")) { mkdir "iraq-reports" }
Write-Host "🇮🇶 Collecting Iraq event data..." -ForegroundColor Green
k6 run .\testing\k6\tourist-tara.js --summary-export "iraq-reports\iraq-$timestamp.json" --duration 45s --vus 4
Write-Host "✅ Iraq event collection complete!" -ForegroundColor Green
