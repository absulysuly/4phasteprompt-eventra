# Run User Simulations for Eventra SaaS Platform
# This script runs K6 load tests simulating different user personas
# Prerequisites: Install K6 from https://k6.io/docs/getting-started/installation/

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [int]$VirtualUsers = 10,
    
    [Parameter(Mandatory=$false)]
    [string]$Duration = "5m",
    
    [Parameter(Mandatory=$false)]
    [string]$Scenario = "all", # all, tourist, local, planner, business
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "testing/results"
)

Write-Host "🚀 Starting Eventra User Simulations" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Virtual Users: $VirtualUsers" -ForegroundColor Yellow
Write-Host "Duration: $Duration" -ForegroundColor Yellow

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check if K6 is installed
try {
    k6 version | Out-Null
}
catch {
    Write-Error "K6 is not installed. Please install from https://k6.io/docs/getting-started/installation/"
    exit 1
}

# Function to run a K6 test
function Run-K6Test {
    param(
        [string]$TestFile,
        [string]$TestName,
        [string]$ReportFile
    )
    
    Write-Host "`n🎭 Running $TestName simulation..." -ForegroundColor Cyan
    
    $env:BASE_URL = $BaseUrl
    $env:RAMP_VUS = $VirtualUsers
    $env:DURATION = $Duration
    
    $k6Args = @("run", $TestFile)
    
    if ($GenerateReport) {
        $k6Args += "--out", "json=$ReportFile"
    }
    
    try {
        & k6 @k6Args
        Write-Host "✅ $TestName simulation completed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ $TestName simulation failed: $_" -ForegroundColor Red
        return $false
    }
}

# Test configurations
$tests = @(
    @{
        Name = "Tourist Tara"
        File = "testing/simulations/tourist-tara.js"
        ReportFile = "$OutputDir/tourist-results.json"
        Description = "Mobile tourists discovering weekend events"
    },
    @{
        Name = "Local Leyla"
        File = "testing/simulations/local-leyla.js"
        ReportFile = "$OutputDir/local-results.json"
        Description = "Local families browsing with Arabic RTL interface"
    }
)

# Add more personas when available
if (Test-Path "testing/simulations/planner-peshraw.js") {
    $tests += @{
        Name = "Planner Peshraw"
        File = "testing/simulations/planner-peshraw.js"
        ReportFile = "$OutputDir/planner-results.json"
        Description = "Event planners searching venues and availability"
    }
}

if (Test-Path "testing/simulations/business-bilal.js") {
    $tests += @{
        Name = "Business Bilal"
        File = "testing/simulations/business-bilal.js"
        ReportFile = "$OutputDir/business-results.json"
        Description = "Corporate bookings with invoice requirements"
    }
}

# Run selected scenarios
$results = @()

foreach ($test in $tests) {
    if ($Scenario -eq "all" -or $test.Name.ToLower().Contains($Scenario.ToLower())) {
        Write-Host "`n📋 $($test.Description)" -ForegroundColor Blue
        
        $success = Run-K6Test -TestFile $test.File -TestName $test.Name -ReportFile $test.ReportFile
        
        $results += @{
            Name = $test.Name
            Success = $success
            ReportFile = if ($GenerateReport) { $test.ReportFile } else { $null }
        }
    }
}

# Summary
Write-Host "`n📊 SIMULATION SUMMARY" -ForegroundColor Green
Write-Host "====================" -ForegroundColor Green

foreach ($result in $results) {
    $status = if ($result.Success) { "✅ PASSED" } else { "❌ FAILED" }
    Write-Host "$($result.Name): $status" -ForegroundColor $(if ($result.Success) { "Green" } else { "Red" })
}

# Generate consolidated report if requested
if ($GenerateReport) {
    Write-Host "`n📈 Generating consolidated report..." -ForegroundColor Yellow
    
    $summaryReport = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        baseUrl = $BaseUrl
        virtualUsers = $VirtualUsers
        duration = $Duration
        results = $results
    }
    
    $summaryFile = "$OutputDir/simulation-summary.json"
    $summaryReport | ConvertTo-Json -Depth 3 | Out-File -FilePath $summaryFile -Encoding UTF8
    
    Write-Host "📁 Reports saved to: $OutputDir" -ForegroundColor Green
    Write-Host "📄 Summary report: $summaryFile" -ForegroundColor Green
    
    # Open results folder if on Windows
    if ([System.Environment]::OSVersion.Platform -eq "Win32NT") {
        Start-Process explorer.exe -ArgumentList $OutputDir
    }
}

Write-Host "`n🎉 User simulations completed!" -ForegroundColor Green

# Usage examples
Write-Host "`n💡 USAGE EXAMPLES:" -ForegroundColor Yellow
Write-Host "# Run all personas against staging" -ForegroundColor Gray
Write-Host ".\testing\run-user-simulations.ps1 -BaseUrl 'https://staging.yourdomain.com' -GenerateReport" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray
Write-Host "# Run only tourist simulation with 20 users for 10 minutes" -ForegroundColor Gray
Write-Host ".\testing\run-user-simulations.ps1 -Scenario tourist -VirtualUsers 20 -Duration '10m'" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray
Write-Host "# Run local user simulation against production" -ForegroundColor Gray
Write-Host ".\testing\run-user-simulations.ps1 -BaseUrl 'https://eventra.com' -Scenario local -VirtualUsers 5" -ForegroundColor Gray