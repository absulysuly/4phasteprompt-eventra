# Comprehensive test runner for Eventra SaaS Platform
# Runs unit tests, integration tests, and generates reports

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("unit", "integration", "e2e", "all")]
    [string]$TestType = "all",
    
    [Parameter(Mandatory=$false)]
    [switch]$Watch,
    
    [Parameter(Mandatory=$false)]
    [switch]$Coverage,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose,
    
    [Parameter(Mandatory=$false)]
    [string]$Pattern = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateSnapshots,
    
    [Parameter(Mandatory=$false)]
    [switch]$Silent,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "testing/results"
)

# Colors for output
$ErrorColor = "Red"
$WarningColor = "Yellow"
$SuccessColor = "Green"
$InfoColor = "Cyan"

if (!$Silent) {
    Write-Host "🧪 Eventra SaaS Test Suite Runner" -ForegroundColor $SuccessColor
    Write-Host "================================" -ForegroundColor $SuccessColor
}

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check if Node.js and npm are available
try {
    node --version | Out-Null
    npm --version | Out-Null
}
catch {
    Write-Error "Node.js and npm are required but not installed"
    exit 1
}

# Function to run Jest tests
function Run-JestTests {
    param(
        [string]$TestPattern,
        [string]$TestName
    )
    
    if (!$Silent) {
        Write-Host "`n🚀 Running $TestName..." -ForegroundColor $InfoColor
    }
    
    $jestArgs = @("--config", "testing/jest.config.js")
    
    # Add test pattern if specified
    if ($TestPattern) {
        $jestArgs += $TestPattern
    }
    
    # Add pattern filter if specified
    if ($Pattern) {
        $jestArgs += "--testNamePattern", $Pattern
    }
    
    # Coverage options
    if ($Coverage) {
        $jestArgs += "--coverage"
        $jestArgs += "--coverageReporters", "text", "html", "lcov", "json-summary"
    }
    
    # Watch mode
    if ($Watch) {
        $jestArgs += "--watch"
    }
    
    # Verbose output
    if ($Verbose -or $env:CI) {
        $jestArgs += "--verbose"
    }
    
    # Update snapshots
    if ($UpdateSnapshots) {
        $jestArgs += "--updateSnapshot"
    }
    
    # CI environment settings
    if ($env:CI) {
        $jestArgs += "--ci"
        $jestArgs += "--watchman=false"
        $jestArgs += "--maxWorkers=2"
    }
    
    try {
        if (!$Silent) {
            Write-Host "Running: npx jest $($jestArgs -join ' ')" -ForegroundColor Gray
        }
        
        & npx jest @jestArgs
        
        if ($LASTEXITCODE -eq 0) {
            if (!$Silent) {
                Write-Host "✅ $TestName completed successfully" -ForegroundColor $SuccessColor
            }
            return $true
        } else {
            if (!$Silent) {
                Write-Host "❌ $TestName failed" -ForegroundColor $ErrorColor
            }
            return $false
        }
    }
    catch {
        if (!$Silent) {
            Write-Host "❌ $TestName failed with error: $_" -ForegroundColor $ErrorColor
        }
        return $false
    }
}

# Function to run E2E tests with Playwright
function Run-E2ETests {
    if (!$Silent) {
        Write-Host "`n🎭 Running E2E tests..." -ForegroundColor $InfoColor
    }
    
    # Check if Playwright is available
    if (!(Test-Path "node_modules/@playwright/test")) {
        if (!$Silent) {
            Write-Host "⚠️  Playwright not found. Installing..." -ForegroundColor $WarningColor
        }
        try {
            & npm install @playwright/test
            & npx playwright install
        }
        catch {
            if (!$Silent) {
                Write-Host "❌ Failed to install Playwright" -ForegroundColor $ErrorColor
            }
            return $false
        }
    }
    
    $playwrightArgs = @("test")
    
    if ($Pattern) {
        $playwrightArgs += "--grep", $Pattern
    }
    
    if ($env:CI) {
        $playwrightArgs += "--reporter=github"
    }
    
    try {
        & npx playwright @playwrightArgs
        
        if ($LASTEXITCODE -eq 0) {
            if (!$Silent) {
                Write-Host "✅ E2E tests completed successfully" -ForegroundColor $SuccessColor
            }
            return $true
        } else {
            if (!$Silent) {
                Write-Host "❌ E2E tests failed" -ForegroundColor $ErrorColor
            }
            return $false
        }
    }
    catch {
        if (!$Silent) {
            Write-Host "❌ E2E tests failed with error: $_" -ForegroundColor $ErrorColor
        }
        return $false
    }
}

# Function to generate test report
function Generate-TestReport {
    param([array]$Results)
    
    if (!$Silent) {
        Write-Host "`n📊 Generating test report..." -ForegroundColor $InfoColor
    }
    
    $report = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        environment = @{
            node_version = (node --version)
            npm_version = (npm --version)
            os = $env:OS
            ci = $env:CI -eq "true"
        }
        results = $Results
        summary = @{
            total = $Results.Count
            passed = ($Results | Where-Object { $_.Success }).Count
            failed = ($Results | Where-Object { !$_.Success }).Count
        }
    }
    
    $reportFile = "$OutputDir/test-report.json"
    $report | ConvertTo-Json -Depth 4 | Out-File -FilePath $reportFile -Encoding UTF8
    
    if (!$Silent) {
        Write-Host "📄 Test report saved: $reportFile" -ForegroundColor $InfoColor
    }
}

# Main test execution
$testResults = @()
$overallSuccess = $true

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    if (!$Silent) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor $InfoColor
    }
    & npm ci
}

# Run tests based on type
switch ($TestType) {
    "unit" {
        $success = Run-JestTests -TestPattern "testing/unit" -TestName "Unit Tests"
        $testResults += @{ Type = "unit"; Success = $success }
        $overallSuccess = $overallSuccess -and $success
    }
    
    "integration" {
        $success = Run-JestTests -TestPattern "testing/integration" -TestName "Integration Tests"
        $testResults += @{ Type = "integration"; Success = $success }
        $overallSuccess = $overallSuccess -and $success
    }
    
    "e2e" {
        $success = Run-E2ETests
        $testResults += @{ Type = "e2e"; Success = $success }
        $overallSuccess = $overallSuccess -and $success
    }
    
    "all" {
        # Unit tests
        $unitSuccess = Run-JestTests -TestPattern "testing/unit" -TestName "Unit Tests"
        $testResults += @{ Type = "unit"; Success = $unitSuccess }
        $overallSuccess = $overallSuccess -and $unitSuccess
        
        # Integration tests
        $integrationSuccess = Run-JestTests -TestPattern "testing/integration" -TestName "Integration Tests"
        $testResults += @{ Type = "integration"; Success = $integrationSuccess }
        $overallSuccess = $overallSuccess -and $integrationSuccess
        
        # E2E tests (only if unit and integration pass)
        if ($unitSuccess -and $integrationSuccess) {
            $e2eSuccess = Run-E2ETests
            $testResults += @{ Type = "e2e"; Success = $e2eSuccess }
            $overallSuccess = $overallSuccess -and $e2eSuccess
        } else {
            if (!$Silent) {
                Write-Host "⚠️  Skipping E2E tests due to earlier failures" -ForegroundColor $WarningColor
            }
        }
    }
}

# Generate report
if (!$Watch) {
    Generate-TestReport -Results $testResults
}

# Summary
if (!$Silent) {
    Write-Host "`n📋 TEST SUMMARY" -ForegroundColor $SuccessColor
    Write-Host "===============" -ForegroundColor $SuccessColor
    
    foreach ($result in $testResults) {
        $status = if ($result.Success) { "✅ PASSED" } else { "❌ FAILED" }
        $color = if ($result.Success) { $SuccessColor } else { $ErrorColor }
        Write-Host "$($result.Type.ToUpper()) TESTS: $status" -ForegroundColor $color
    }
    
    if ($overallSuccess) {
        Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor $SuccessColor
    } else {
        Write-Host "`n💥 Some tests failed. Check the output above." -ForegroundColor $ErrorColor
    }
    
    # Coverage report location
    if ($Coverage -and (Test-Path "coverage/lcov-report/index.html")) {
        Write-Host "`n📊 Coverage report: coverage/lcov-report/index.html" -ForegroundColor $InfoColor
    }
}

# Exit with appropriate code
exit $(if ($overallSuccess) { 0 } else { 1 })

# Usage examples at the end for reference
<#
USAGE EXAMPLES:

# Run all tests
.\testing\run-tests.ps1

# Run only unit tests with coverage
.\testing\run-tests.ps1 -TestType unit -Coverage

# Run tests in watch mode
.\testing\run-tests.ps1 -TestType unit -Watch

# Run tests with pattern matching
.\testing\run-tests.ps1 -Pattern "EventCard"

# Run integration tests verbosely
.\testing\run-tests.ps1 -TestType integration -Verbose

# Update snapshots
.\testing\run-tests.ps1 -TestType unit -UpdateSnapshots

# CI mode (silent with reports)
.\testing\run-tests.ps1 -TestType all -Coverage -Silent
#>