[CmdletBinding()]
param(
  [string]$BaseUrl = "http://localhost:3000",
  [int]$IntervalSeconds = 10
)

Write-Host "Eventra Monitor - polling $BaseUrl every $IntervalSeconds seconds. Press Ctrl+C to stop." -ForegroundColor Cyan

while ($true) {
  try {
    $health = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/health" -Method GET -TimeoutSec 10
    $events = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/events?type=public" -Method GET -TimeoutSec 10

    $dbStatus = $health.checks.database.status
    $envDb = $health.checks.env.databaseUrlSet
    $envSecret = $health.checks.env.nextAuthSecretSet

    $count = 0
    if ($events -is [System.Array]) { $count = $events.Length }

    $timestamp = (Get-Date).ToString('s')
    Write-Host ("[{0}] health=ok db={1} env(db={2},secret={3}) public_events={4}" -f $timestamp, $dbStatus, $envDb, $envSecret, $count)
  }
  catch {
    $timestamp = (Get-Date).ToString('s')
    Write-Host ("[{0}] ERROR: {1}" -f $timestamp, $_.Exception.Message) -ForegroundColor Red
  }

  Start-Sleep -Seconds $IntervalSeconds
}
