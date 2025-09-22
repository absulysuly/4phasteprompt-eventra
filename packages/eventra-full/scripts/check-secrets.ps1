# Secrets Security Checklist
# Run this script to verify your secrets management setup

Write-Host "🔐 Secrets Security Checklist for Eventra SaaS" -ForegroundColor Cyan
Write-Host "=" * 50

# Check if .env files are ignored
Write-Host "`n1. Checking .gitignore configuration..." -ForegroundColor Yellow

$gitignoreContent = Get-Content -Path ".gitignore" -ErrorAction SilentlyContinue
$requiredIgnores = @('.env', '.env.local', '.env.*.local', '.env.production')
$missingIgnores = @()

foreach ($ignore in $requiredIgnores) {
    if (-not ($gitignoreContent -contains $ignore)) {
        $missingIgnores += $ignore
    }
}

if ($missingIgnores.Count -eq 0) {
    Write-Host "   ✅ All .env patterns are properly ignored" -ForegroundColor Green
} else {
    Write-Host "   ❌ Missing .gitignore entries: $($missingIgnores -join ', ')" -ForegroundColor Red
}

# Check for actual .env files
Write-Host "`n2. Checking for .env files..." -ForegroundColor Yellow
$envFiles = Get-ChildItem -Path "." -Filter ".env*" -File | Where-Object { $_.Name -ne ".env.example" }

if ($envFiles.Count -eq 0) {
    Write-Host "   ✅ No .env files found (good - use environment variables or CI/CD secrets)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Found .env files: $($envFiles.Name -join ', ')" -ForegroundColor Yellow
    Write-Host "      Make sure these are not committed to git!" -ForegroundColor Yellow
}

# Check git status for staged secrets
Write-Host "`n3. Checking git status for potential secrets..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
$envInStaging = $gitStatus | Where-Object { $_ -match "\.env" -and -not ($_ -match "\.env\.example") }

if ($envInStaging) {
    Write-Host "   ❌ WARNING: .env files are staged for commit!" -ForegroundColor Red
    Write-Host "      Run: git reset HEAD .env*" -ForegroundColor Red
} else {
    Write-Host "   ✅ No .env files in git staging area" -ForegroundColor Green
}

# Check for required environment variables
Write-Host "`n4. Checking environment configuration..." -ForegroundColor Yellow
$requiredVars = @('DATABASE_URL', 'NEXTAUTH_SECRET', 'JWT_SECRET')
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not (Get-ChildItem Env:$var -ErrorAction SilentlyContinue)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -eq 0) {
    Write-Host "   ✅ All required environment variables are set" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Missing environment variables: $($missingVars -join ', ')" -ForegroundColor Yellow
    Write-Host "      Set these in your CI/CD environment or local .env.local file" -ForegroundColor Yellow
}

Write-Host "`n🔐 Security Recommendations:" -ForegroundColor Cyan
Write-Host "   • Use GitHub Secrets for CI/CD pipelines"
Write-Host "   • Use Azure Key Vault, AWS Secrets Manager, or similar for production"
Write-Host "   • Rotate secrets regularly"
Write-Host "   • Never share secrets in chat/email"
Write-Host "   • Use .env.local for local development (already ignored)"

Write-Host "`n✅ Security check complete!" -ForegroundColor Green