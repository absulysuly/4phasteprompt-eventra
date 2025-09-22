# Test Rollback Setup
# Verifies prerequisites and configuration before running actual rollback

Write-Host "🧪 Testing Rollback Script Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Check if scripts exist
Write-Host "`n1. Checking script files..." -ForegroundColor Yellow
$scripts = @("rollback.sh", "rollback.ps1", "ROLLBACK_README.md")
$missingScripts = @()

foreach ($script in $scripts) {
    if (Test-Path "scripts\$script") {
        Write-Host "   ✅ $script found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $script missing" -ForegroundColor Red
        $missingScripts += $script
    }
}

# Test 2: Check required tools
Write-Host "`n2. Checking required tools..." -ForegroundColor Yellow
$tools = @(
    @{name="git"; command="git --version"},
    @{name="pg_dump"; command="pg_dump --version"},
    @{name="pg_restore"; command="pg_restore --version"},
    @{name="aws"; command="aws --version"}
)

$missingTools = @()

foreach ($tool in $tools) {
    try {
        $result = Invoke-Expression $tool.command 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $($tool.name) available" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($tool.name) not working" -ForegroundColor Red
            $missingTools += $tool.name
        }
    } catch {
        if ($tool.name -eq "aws") {
            Write-Host "   ⚠️  $($tool.name) not found (optional for RDS)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ $($tool.name) not found" -ForegroundColor Red
            $missingTools += $tool.name
        }
    }
}

# Test 3: Check environment variables
Write-Host "`n3. Checking environment configuration..." -ForegroundColor Yellow
if ($env:DATABASE_URL) {
    Write-Host "   ✅ DATABASE_URL is set" -ForegroundColor Green
    # Don't display the actual URL for security
    $dbLength = $env:DATABASE_URL.Length
    Write-Host "      (Length: $dbLength characters)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ DATABASE_URL not set" -ForegroundColor Red
    Write-Host "      Set with: `$env:DATABASE_URL = 'postgresql://...'" -ForegroundColor Gray
}

# Test 4: Check git repository status
Write-Host "`n4. Checking git repository..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Git repository detected" -ForegroundColor Green
        
        # Check for uncommitted changes
        if ($gitStatus) {
            Write-Host "   ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
            Write-Host "      Consider committing before rollback" -ForegroundColor Gray
        } else {
            Write-Host "   ✅ Working directory clean" -ForegroundColor Green
        }
        
        # Check remote
        $remote = git remote get-url origin 2>$null
        if ($remote) {
            Write-Host "   ✅ Remote origin configured" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  No remote origin found" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "   ❌ Not in a git repository" -ForegroundColor Red
}

# Test 5: Check PowerShell execution policy
Write-Host "`n5. Checking PowerShell execution policy..." -ForegroundColor Yellow
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "   ⚠️  Execution policy is Restricted" -ForegroundColor Yellow
    Write-Host "      Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
} else {
    Write-Host "   ✅ Execution policy allows scripts ($executionPolicy)" -ForegroundColor Green
}

# Summary
Write-Host "`n📊 SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

if ($missingScripts.Count -eq 0 -and $missingTools.Count -le 1) {  # Allow aws to be missing
    Write-Host "✅ Setup looks good! Ready for rollback testing." -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Configure placeholders in rollback.ps1:" -ForegroundColor Gray
    Write-Host "   - DEPLOY_COMMIT" -ForegroundColor Gray
    Write-Host "   - PREVIOUS_RELEASE_COMMIT" -ForegroundColor Gray
    Write-Host "   - RDS settings for AWS" -ForegroundColor Gray
    Write-Host "   - Feature flag settings" -ForegroundColor Gray
    Write-Host "2. Test in staging environment first!" -ForegroundColor Gray
    Write-Host "3. Run: .\scripts\rollback.ps1" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Setup needs attention before rollback can be used." -ForegroundColor Yellow
    
    if ($missingScripts.Count -gt 0) {
        Write-Host "`nMissing scripts: $($missingScripts -join ', ')" -ForegroundColor Red
    }
    
    if ($missingTools.Count -gt 1 -or ($missingTools.Count -eq 1 -and $missingTools[0] -ne "aws")) {
        Write-Host "`nMissing tools: $($missingTools -join ', ')" -ForegroundColor Red
        Write-Host "Install PostgreSQL client tools and Git." -ForegroundColor Gray
    }
    
    if (-not $env:DATABASE_URL) {
        Write-Host "`nSet DATABASE_URL environment variable." -ForegroundColor Red
    }
}

Write-Host "`n📖 For detailed instructions, see: scripts\ROLLBACK_README.md" -ForegroundColor Cyan