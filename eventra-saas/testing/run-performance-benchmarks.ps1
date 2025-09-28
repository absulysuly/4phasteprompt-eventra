# Performance Benchmarking Suite for Eventra SaaS Platform
# Runs Lighthouse, user simulations, and generates comprehensive performance reports

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("lighthouse", "k6", "all")]
    [string]$BenchmarkType = "all",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("mobile", "desktop", "slow3g", "all")]
    [string]$Device = "all",
    
    [Parameter(Mandatory=$false)]
    [int]$Duration = 5, # minutes for K6 tests
    
    [Parameter(Mandatory=$false)]
    [int]$VirtualUsers = 10,
    
    [Parameter(Mandatory=$false)]
    [switch]$GenerateReport,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "testing/results/performance",
    
    [Parameter(Mandatory=$false)]
    [switch]$OpenReport,
    
    [Parameter(Mandatory=$false)]
    [switch]$Compare, # Compare with previous results
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Colors for output
$SuccessColor = "Green"
$ErrorColor = "Red"
$WarningColor = "Yellow"
$InfoColor = "Cyan"
$HeaderColor = "Magenta"

Write-Host "⚡ Eventra Performance Benchmarking Suite" -ForegroundColor $HeaderColor
Write-Host "=========================================" -ForegroundColor $HeaderColor
Write-Host "Target URL: $BaseUrl" -ForegroundColor $InfoColor
Write-Host "Benchmark Type: $BenchmarkType" -ForegroundColor $InfoColor
Write-Host "Device(s): $Device" -ForegroundColor $InfoColor

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check prerequisites
function Test-Prerequisites {
    Write-Host "`n🔍 Checking prerequisites..." -ForegroundColor $InfoColor
    
    $issues = @()
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor $SuccessColor
    }
    catch {
        $issues += "Node.js is not installed or not in PATH"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "✅ npm: v$npmVersion" -ForegroundColor $SuccessColor
    }
    catch {
        $issues += "npm is not available"
    }
    
    # Check if site is accessible
    try {
        $response = Invoke-WebRequest -Uri $BaseUrl -Method HEAD -TimeoutSec 10 -UseBasicParsing
        Write-Host "✅ Site accessible: HTTP $($response.StatusCode)" -ForegroundColor $SuccessColor
    }
    catch {
        $issues += "Site not accessible at $BaseUrl"
    }
    
    if ($issues.Count -gt 0) {
        Write-Host "❌ Prerequisites check failed:" -ForegroundColor $ErrorColor
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor $ErrorColor
        }
        exit 1
    }
    
    Write-Host "✅ All prerequisites met" -ForegroundColor $SuccessColor
}

# Install required npm packages if needed
function Install-Dependencies {
    Write-Host "`n📦 Installing performance testing dependencies..." -ForegroundColor $InfoColor
    
    $packages = @(
        "lighthouse",
        "chrome-launcher",
        "k6"
    )
    
    foreach ($package in $packages) {
        try {
            npm list $package --depth=0 2>$null | Out-Null
            Write-Host "✅ $package already installed" -ForegroundColor $SuccessColor
        }
        catch {
            Write-Host "📥 Installing $package..." -ForegroundColor $InfoColor
            npm install $package --save-dev
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ Failed to install $package" -ForegroundColor $ErrorColor
                return $false
            }
        }
    }
    
    return $true
}

# Run Lighthouse benchmarks
function Run-LighthouseBenchmarks {
    param([string]$Devices)
    
    Write-Host "`n🚀 Running Lighthouse Performance Benchmarks" -ForegroundColor $HeaderColor
    
    $deviceList = if ($Devices -eq "all") { "mobile,desktop,slow3g" } else { $Devices }
    
    try {
        node testing/performance/lighthouse-benchmark.js $BaseUrl $deviceList
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Lighthouse benchmarks completed successfully" -ForegroundColor $SuccessColor
            return $true
        } else {
            Write-Host "❌ Lighthouse benchmarks failed" -ForegroundColor $ErrorColor
            return $false
        }
    }
    catch {
        Write-Host "❌ Error running Lighthouse benchmarks: $_" -ForegroundColor $ErrorColor
        return $false
    }
}

# Run K6 performance simulations
function Run-K6Simulations {
    Write-Host "`n🎭 Running K6 User Performance Simulations" -ForegroundColor $HeaderColor
    
    # Check if K6 is available
    try {
        k6 version | Out-Null
    }
    catch {
        Write-Host "❌ K6 not found. Please install from https://k6.io/docs/getting-started/installation/" -ForegroundColor $ErrorColor
        return $false
    }
    
    $env:BASE_URL = $BaseUrl
    $env:RAMP_VUS = $VirtualUsers
    $env:DURATION = "$($Duration)m"
    
    $k6Results = @()
    
    # Run different user persona simulations
    $simulations = @(
        @{ Name = "Tourist Browsing"; File = "testing/simulations/tourist-tara.js" },
        @{ Name = "Local User Activity"; File = "testing/simulations/local-leyla.js" }
    )
    
    foreach ($sim in $simulations) {
        if (Test-Path $sim.File) {
            Write-Host "🧪 Running $($sim.Name) simulation..." -ForegroundColor $InfoColor
            
            $outputFile = "$OutputDir/k6-$($sim.Name.ToLower() -replace ' ', '-').json"
            
            try {
                k6 run --out json=$outputFile $sim.File
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ $($sim.Name) completed" -ForegroundColor $SuccessColor
                    $k6Results += @{ Name = $sim.Name; Success = $true; OutputFile = $outputFile }
                } else {
                    Write-Host "  ❌ $($sim.Name) failed" -ForegroundColor $ErrorColor
                    $k6Results += @{ Name = $sim.Name; Success = $false }
                }
            }
            catch {
                Write-Host "  ❌ Error running $($sim.Name): $_" -ForegroundColor $ErrorColor
                $k6Results += @{ Name = $sim.Name; Success = $false; Error = $_.ToString() }
            }
        } else {
            Write-Host "⚠️  Simulation file not found: $($sim.File)" -ForegroundColor $WarningColor
        }
    }
    
    # Summary
    $successful = ($k6Results | Where-Object { $_.Success }).Count
    $total = $k6Results.Count
    
    Write-Host "`n📊 K6 Simulations Summary: $successful/$total successful" -ForegroundColor $InfoColor
    
    return $successful -gt 0
}

# Generate comprehensive report
function Generate-ComprehensiveReport {
    Write-Host "`n📊 Generating comprehensive performance report..." -ForegroundColor $InfoColor
    
    $reportData = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        baseUrl = $BaseUrl
        benchmarkType = $BenchmarkType
        device = $Device
        duration = $Duration
        virtualUsers = $VirtualUsers
    }
    
    # Collect Lighthouse results
    $lighthouseSummaryPath = "$OutputDir/lighthouse-summary.json"
    if (Test-Path $lighthouseSummaryPath) {
        $reportData.lighthouse = Get-Content $lighthouseSummaryPath | ConvertFrom-Json
        Write-Host "✅ Lighthouse results included" -ForegroundColor $SuccessColor
    }
    
    # Collect K6 results
    $k6Files = Get-ChildItem "$OutputDir/k6-*.json" -ErrorAction SilentlyContinue
    if ($k6Files) {
        $reportData.k6 = @()
        foreach ($file in $k6Files) {
            try {
                $k6Data = Get-Content $file.FullName | ConvertFrom-Json
                $reportData.k6 += @{
                    simulation = $file.BaseName
                    data = $k6Data
                }
            }
            catch {
                Write-Host "⚠️  Could not parse K6 results from $($file.Name)" -ForegroundColor $WarningColor
            }
        }
        Write-Host "✅ K6 simulation results included" -ForegroundColor $SuccessColor
    }
    
    # Generate HTML report
    $htmlReport = Generate-HTMLReport -ReportData $reportData
    $htmlPath = "$OutputDir/performance-report.html"
    $htmlReport | Out-File -FilePath $htmlPath -Encoding UTF8
    
    # Save JSON report
    $jsonPath = "$OutputDir/comprehensive-report.json"
    $reportData | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8
    
    Write-Host "📄 Comprehensive report saved:" -ForegroundColor $InfoColor
    Write-Host "  HTML: $htmlPath" -ForegroundColor $InfoColor
    Write-Host "  JSON: $jsonPath" -ForegroundColor $InfoColor
    
    return $htmlPath
}

# Generate HTML report
function Generate-HTMLReport {
    param($ReportData)
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eventra Performance Report - $($ReportData.timestamp)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2d3748; border-bottom: 3px solid #4299e1; padding-bottom: 10px; }
        h2 { color: #4a5568; margin-top: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border-radius: 6px; min-width: 120px; text-align: center; }
        .metric-good { background: #c6f6d5; color: #22543d; }
        .metric-warning { background: #fef5e7; color: #744210; }
        .metric-bad { background: #fed7d7; color: #822727; }
        .metric-value { font-size: 24px; font-weight: bold; }
        .metric-label { font-size: 12px; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f7fafc; font-weight: 600; }
        .status-pass { color: #38a169; }
        .status-fail { color: #e53e3e; }
        .summary { background: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Eventra Performance Benchmark Report</h1>
        
        <div class="summary">
            <strong>Report Generated:</strong> $($ReportData.timestamp)<br>
            <strong>Target URL:</strong> $($ReportData.baseUrl)<br>
            <strong>Benchmark Type:</strong> $($ReportData.benchmarkType)<br>
            <strong>Test Duration:</strong> $($ReportData.duration) minutes
        </div>
"@
    
    # Add Lighthouse results if available
    if ($ReportData.lighthouse) {
        $lighthouse = $ReportData.lighthouse
        
        $html += @"
        <h2>📱 Lighthouse Performance Results</h2>
        <div>
"@
        
        # Add device summaries
        if ($lighthouse.deviceSummary) {
            foreach ($device in $lighthouse.deviceSummary.PSObject.Properties) {
                $deviceData = $device.Value
                $perfClass = if ($deviceData.avgPerformance -ge 85) { "metric-good" } elseif ($deviceData.avgPerformance -ge 70) { "metric-warning" } else { "metric-bad" }
                
                $html += @"
            <div class="metric $perfClass">
                <div class="metric-value">$($deviceData.avgPerformance)</div>
                <div class="metric-label">$($device.Name) Performance</div>
            </div>
"@
            }
        }
        
        $html += "</div>"
        
        # Add detailed results table
        $html += @"
        <h3>Detailed Results</h3>
        <table>
            <thead>
                <tr>
                    <th>Page</th>
                    <th>Device</th>
                    <th>Performance</th>
                    <th>FCP (ms)</th>
                    <th>LCP (ms)</th>
                    <th>CLS</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
"@
        
        foreach ($result in $lighthouse.results) {
            if (-not $result.error) {
                $statusClass = if ($result.passed) { "status-pass" } else { "status-fail" }
                $status = if ($result.passed) { "✅ Pass" } else { "❌ Fail" }
                
                $html += @"
                <tr>
                    <td>$($result.page)</td>
                    <td>$($result.device)</td>
                    <td>$($result.scores.performance)</td>
                    <td>$($result.metrics.fcp)</td>
                    <td>$($result.metrics.lcp)</td>
                    <td>$($result.metrics.cls)</td>
                    <td class="$statusClass">$status</td>
                </tr>
"@
            }
        }
        
        $html += "</tbody></table>"
    }
    
    # Add K6 results if available
    if ($ReportData.k6) {
        $html += @"
        <h2>🎭 K6 Load Test Results</h2>
        <p>User simulation tests completed with $($ReportData.virtualUsers) virtual users over $($ReportData.duration) minutes.</p>
"@
    }
    
    $html += @"
        
        <div class="summary">
            <h3>📋 Summary</h3>
            <p>This report provides comprehensive performance metrics for the Eventra SaaS platform. 
            Regular benchmarking helps ensure optimal user experience across all devices and connection types.</p>
            
            <h4>Next Steps:</h4>
            <ul>
                <li>Review any failed tests and address performance issues</li>
                <li>Monitor Core Web Vitals trends over time</li>
                <li>Optimize pages with poor performance scores</li>
                <li>Test again after making performance improvements</li>
            </ul>
        </div>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px;">
            Generated by Eventra Performance Benchmarking Suite
        </footer>
    </div>
</body>
</html>
"@
    
    return $html
}

# Compare with previous results
function Compare-Results {
    if (-not $Compare) {
        return
    }
    
    Write-Host "`n🔄 Comparing with previous results..." -ForegroundColor $InfoColor
    
    $currentSummary = "$OutputDir/lighthouse-summary.json"
    $previousSummary = "$OutputDir/lighthouse-summary-previous.json"
    
    if ((Test-Path $currentSummary) -and (Test-Path $previousSummary)) {
        $current = Get-Content $currentSummary | ConvertFrom-Json
        $previous = Get-Content $previousSummary | ConvertFrom-Json
        
        Write-Host "📊 Performance Comparison:" -ForegroundColor $HeaderColor
        
        foreach ($device in @("mobile", "desktop")) {
            if ($current.deviceSummary.$device -and $previous.deviceSummary.$device) {
                $currentPerf = $current.deviceSummary.$device.avgPerformance
                $previousPerf = $previous.deviceSummary.$device.avgPerformance
                $diff = $currentPerf - $previousPerf
                
                $arrow = if ($diff -gt 0) { "⬆️" } elseif ($diff -lt 0) { "⬇️" } else { "➡️" }
                $color = if ($diff -gt 0) { $SuccessColor } elseif ($diff -lt 0) { $ErrorColor } else { $InfoColor }
                
                Write-Host "  $device Performance: $currentPerf ($arrow$diff)" -ForegroundColor $color
            }
        }
    }
    
    # Backup current results for next comparison
    if (Test-Path $currentSummary) {
        Copy-Item $currentSummary $previousSummary -Force
    }
}

# Main execution
Test-Prerequisites

if (-not (Install-Dependencies)) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor $ErrorColor
    exit 1
}

$results = @{}

# Run benchmarks based on type
switch ($BenchmarkType) {
    "lighthouse" {
        $results.lighthouse = Run-LighthouseBenchmarks -Devices $Device
    }
    "k6" {
        $results.k6 = Run-K6Simulations
    }
    "all" {
        $results.lighthouse = Run-LighthouseBenchmarks -Devices $Device
        $results.k6 = Run-K6Simulations
    }
}

# Generate comprehensive report
if ($GenerateReport) {
    $htmlReport = Generate-ComprehensiveReport
    
    if ($OpenReport -and $htmlReport) {
        Write-Host "`n🌐 Opening performance report..." -ForegroundColor $InfoColor
        Start-Process $htmlReport
    }
}

# Compare results if requested
Compare-Results

# Summary
Write-Host "`n🎉 PERFORMANCE BENCHMARKING COMPLETE" -ForegroundColor $HeaderColor
Write-Host "====================================" -ForegroundColor $HeaderColor

$overallSuccess = $true
foreach ($result in $results.GetEnumerator()) {
    $status = if ($result.Value) { "✅ PASSED" } else { "❌ FAILED" }
    $color = if ($result.Value) { $SuccessColor } else { $ErrorColor }
    Write-Host "$($result.Key.ToUpper()) BENCHMARKS: $status" -ForegroundColor $color
    
    if (-not $result.Value) {
        $overallSuccess = $false
    }
}

Write-Host "`n📊 Results saved to: $OutputDir" -ForegroundColor $InfoColor

# Usage examples
Write-Host "`n💡 USAGE EXAMPLES:" -ForegroundColor $WarningColor
Write-Host "# Full benchmark suite against staging" -ForegroundColor "Gray"
Write-Host ".\testing\run-performance-benchmarks.ps1 -BaseUrl 'https://staging.yourdomain.com' -GenerateReport -OpenReport" -ForegroundColor "Gray"
Write-Host "" -ForegroundColor "Gray"
Write-Host "# Mobile-only Lighthouse test with comparison" -ForegroundColor "Gray"
Write-Host ".\testing\run-performance-benchmarks.ps1 -BenchmarkType lighthouse -Device mobile -Compare" -ForegroundColor "Gray"
Write-Host "" -ForegroundColor "Gray"
Write-Host "# K6 load test with 50 users for 10 minutes" -ForegroundColor "Gray"
Write-Host ".\testing\run-performance-benchmarks.ps1 -BenchmarkType k6 -VirtualUsers 50 -Duration 10" -ForegroundColor "Gray"

exit $(if ($overallSuccess) { 0 } else { 1 })