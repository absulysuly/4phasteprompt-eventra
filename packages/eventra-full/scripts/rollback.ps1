# PowerShell Rollback Script for Windows
# Interactive rollback with safety checks - TEST IN STAGING FIRST!

param(
    [switch]$Force,  # Skip confirmations (use with caution)
    [string]$ConfigFile = ""  # Optional config file path
)

# === CONFIGURE THESE BEFORE RUNNING ===
$PROD_REMOTE = "origin"
$PROD_BRANCH = "main"
$DEPLOY_COMMIT = "<DEPLOY_COMMIT_SHA_TO_REVERT>"   # commit that introduced the bad release
$PREVIOUS_RELEASE_COMMIT = "<PREVIOUS_GOOD_COMMIT_SHA>" # alternative to revert
$DATABASE_URL = $env:DATABASE_URL                # must be set in env
$BACKUP_DUMP_FILE = "pre-rollback-$(Get-Date -Format 'yyyyMMddHHmm').dump"
$RDS_SNAPSHOT_ID = "<RDS_SNAPSHOT_ID>"           # if using AWS RDS snapshot restore
$AWS_REGION = "<AWS_REGION>"
$RDS_RESTORE_INSTANCE_ID = "<NEW_RDS_INSTANCE_ID>" # new instance name when restoring snapshot
$FEATURE_FLAG_TOGGLE_URL = "<FEATURE_FLAG_API_ENDPOINT>"   # optional: API to disable feature flag
$FEATURE_FLAG_API_KEY = "<FEATURE_FLAG_API_KEY>"
$FEATURE_FLAG_KEY = "<FEATURE_FLAG_KEY>"         # the actual flag key to toggle

# === Safety checks ===
if (-not $DATABASE_URL) {
    Write-Host "ERROR: DATABASE_URL environment variable is not set." -ForegroundColor Red
    Write-Host "Set it with: `$env:DATABASE_URL = 'postgresql://...'" -ForegroundColor Yellow
    exit 2
}

# Check required tools
$missingTools = @()
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { $missingTools += "git" }
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) { $missingTools += "pg_dump/pg_restore" }

if ($missingTools.Count -gt 0) {
    Write-Host "ERROR: Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "Install PostgreSQL client tools and Git before proceeding." -ForegroundColor Yellow
    exit 3
}

Write-Host "=== ROLLBACK SCRIPT (PowerShell) ===" -ForegroundColor Cyan
Write-Host "⚠️  CAUTION: This will perform destructive operations!" -ForegroundColor Yellow
Write-Host ""
Write-Host "This script will:" -ForegroundColor White
Write-Host "  1) Revert code (git) to previous release" -ForegroundColor Gray
Write-Host "  2) Restore DB from dump file or RDS snapshot" -ForegroundColor Gray
Write-Host "  3) Optionally disable feature flag" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "  • Test in staging environment first" -ForegroundColor Gray
Write-Host "  • RDS snapshot creates NEW instance - update connection strings" -ForegroundColor Gray
Write-Host "  • Backup created automatically before restore" -ForegroundColor Gray
Write-Host "  • Prisma migrations not reversible - DB restore recommended" -ForegroundColor Gray
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "Continue? Type 'yes' to proceed"
    if ($confirm -ne "yes") {
        Write-Host "Aborting rollback." -ForegroundColor Yellow
        exit 0
    }
}

# === Step A: Code rollback (git) ===
Write-Host ""
Write-Host "STEP A: Git Release Rollback" -ForegroundColor Green
Write-Host "Option A1: git revert $DEPLOY_COMMIT (recommended if commit exists)" -ForegroundColor Gray
Write-Host "Option A2: force push known-good commit ($PREVIOUS_RELEASE_COMMIT) -> $PROD_BRANCH (DANGEROUS)" -ForegroundColor Gray

if (-not $Force) {
    $git_choice = Read-Host "Choose A1 or A2 [A1]"
}
if (-not $git_choice) { $git_choice = "A1" }

try {
    if ($git_choice -eq "A1") {
        Write-Host "Fetching latest from $PROD_REMOTE..." -ForegroundColor Yellow
        git fetch $PROD_REMOTE
        
        Write-Host "Creating rollback branch..." -ForegroundColor Yellow
        git checkout -b "rollback-temp" "$PROD_REMOTE/$PROD_BRANCH"
        
        Write-Host "Reverting commit $DEPLOY_COMMIT..." -ForegroundColor Yellow
        git revert --no-edit $DEPLOY_COMMIT
        
        Write-Host "Pushing revert to $PROD_BRANCH..." -ForegroundColor Yellow
        git push $PROD_REMOTE "HEAD:$PROD_BRANCH"
        
        Write-Host "✅ Revert commit pushed to $PROD_BRANCH" -ForegroundColor Green
    } else {
        if (-not $PREVIOUS_RELEASE_COMMIT -or $PREVIOUS_RELEASE_COMMIT -eq "<PREVIOUS_GOOD_COMMIT_SHA>") {
            Write-Host "ERROR: PREVIOUS_RELEASE_COMMIT not configured. Cannot proceed with A2." -ForegroundColor Red
            exit 4
        }
        
        Write-Host "⚠️  DANGER: Force pushing $PREVIOUS_RELEASE_COMMIT to $PROD_BRANCH" -ForegroundColor Red
        if (-not $Force) {
            $forceConfirm = Read-Host "This is DANGEROUS. Type 'FORCE' to proceed"
            if ($forceConfirm -ne "FORCE") {
                Write-Host "Aborting force push." -ForegroundColor Yellow
                exit 0
            }
        }
        
        git push --force $PROD_REMOTE "${PREVIOUS_RELEASE_COMMIT}:$PROD_BRANCH"
        Write-Host "✅ Force-pushed $PREVIOUS_RELEASE_COMMIT to $PROD_BRANCH" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Git rollback failed: $_" -ForegroundColor Red
    exit 5
}

# === Step B: Database restore ===
Write-Host ""
Write-Host "STEP B: Database Restore Options" -ForegroundColor Green
Write-Host "  1) Restore from local dump file (pg_restore)" -ForegroundColor Gray
Write-Host "  2) Restore from AWS RDS snapshot (creates new instance)" -ForegroundColor Gray

if (-not $Force) {
    $db_choice = Read-Host "Choose 1 or 2 [1]"
}
if (-not $db_choice) { $db_choice = "1" }

try {
    if ($db_choice -eq "1") {
        Write-Host "Creating pre-rollback safety dump..." -ForegroundColor Yellow
        pg_dump --format=custom --file=$BACKUP_DUMP_FILE $DATABASE_URL
        Write-Host "✅ Current DB saved to $BACKUP_DUMP_FILE" -ForegroundColor Green
        
        if (-not $Force) {
            $restore_file = Read-Host "Path to dump file to restore (or press Enter to use current dump)"
        }
        if (-not $restore_file) { $restore_file = $BACKUP_DUMP_FILE }
        
        if (-not (Test-Path $restore_file)) {
            Write-Host "❌ Restore file not found: $restore_file" -ForegroundColor Red
            exit 6
        }
        
        Write-Host "Restoring from $restore_file..." -ForegroundColor Yellow
        pg_restore --clean --no-acl --no-owner --dbname=$DATABASE_URL $restore_file
        Write-Host "✅ Database restore complete" -ForegroundColor Green
        
    } else {
        # RDS snapshot restore
        if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
            Write-Host "❌ AWS CLI not found. Install and configure it first." -ForegroundColor Red
            exit 7
        }
        
        if ($RDS_SNAPSHOT_ID -eq "<RDS_SNAPSHOT_ID>" -or $RDS_RESTORE_INSTANCE_ID -eq "<NEW_RDS_INSTANCE_ID>" -or $AWS_REGION -eq "<AWS_REGION>") {
            Write-Host "❌ RDS variables not configured. Set RDS_SNAPSHOT_ID, RDS_RESTORE_INSTANCE_ID, and AWS_REGION." -ForegroundColor Red
            exit 8
        }
        
        Write-Host "🚀 Starting RDS snapshot restore..." -ForegroundColor Yellow
        Write-Host "Snapshot: $RDS_SNAPSHOT_ID -> New Instance: $RDS_RESTORE_INSTANCE_ID" -ForegroundColor Gray
        
        aws rds restore-db-instance-from-db-snapshot `
            --db-instance-identifier $RDS_RESTORE_INSTANCE_ID `
            --db-snapshot-identifier $RDS_SNAPSHOT_ID `
            --region $AWS_REGION
        
        Write-Host "⏳ Waiting for RDS instance to become available..." -ForegroundColor Yellow
        aws rds wait db-instance-available --db-instance-identifier $RDS_RESTORE_INSTANCE_ID --region $AWS_REGION
        
        $NEW_ENDPOINT = aws rds describe-db-instances --db-instance-identifier $RDS_RESTORE_INSTANCE_ID --region $AWS_REGION --query "DBInstances[0].Endpoint.Address" --output text
        Write-Host "✅ RDS restore complete!" -ForegroundColor Green
        Write-Host "🔗 New endpoint: $NEW_ENDPOINT" -ForegroundColor Cyan
        Write-Host "⚠️  IMPORTANT: Update DATABASE_URL to use new endpoint and redeploy!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Database restore failed: $_" -ForegroundColor Red
    exit 9
}

# === Step C: Feature flag toggle (optional) ===
Write-Host ""
if (-not $Force) {
    $disable_flag = Read-Host "Disable feature flag now? (y/N)"
}

if ($disable_flag -match "^[Yy]") {
    if ($FEATURE_FLAG_TOGGLE_URL -eq "<FEATURE_FLAG_API_ENDPOINT>" -or $FEATURE_FLAG_API_KEY -eq "<FEATURE_FLAG_API_KEY>") {
        Write-Host "⚠️  Feature flag API not configured. Skipping." -ForegroundColor Yellow
    } else {
        try {
            Write-Host "🏴 Disabling feature flag via API..." -ForegroundColor Yellow
            
            $headers = @{
                "Authorization" = "Bearer $FEATURE_FLAG_API_KEY"
                "Content-Type" = "application/json"
            }
            
            $body = @{
                "flagKey" = $FEATURE_FLAG_KEY
                "enabled" = $false
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $FEATURE_FLAG_TOGGLE_URL -Method POST -Headers $headers -Body $body
            Write-Host "✅ Feature flag disabled" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Feature flag toggle may have failed: $_" -ForegroundColor Yellow
        }
    }
}

# === Step D: Post-rollback verification ===
Write-Host ""
Write-Host "STEP D: Post-rollback Verification" -ForegroundColor Green

if (-not $Force) {
    $PROD_HEALTH = Read-Host "Enter PROD health URL (e.g. https://prod.example.com/health) or press Enter to skip"
}

if ($PROD_HEALTH) {
    Write-Host "🏥 Checking health endpoint..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $PROD_HEALTH -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Health check OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Health check returned status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Health check failed: $_" -ForegroundColor Red
        Write-Host "🔍 Check logs and error tracking (Sentry) immediately!" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 ROLLBACK COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  • Monitor logs and error tracking (Sentry/Datadog)" -ForegroundColor Gray
Write-Host "  • Communicate rollback completion to stakeholders" -ForegroundColor Gray
Write-Host "  • If RDS restore was used, update DATABASE_URL and redeploy" -ForegroundColor Gray
Write-Host "  • Keep pre-rollback dump ($BACKUP_DUMP_FILE) until stability confirmed" -ForegroundColor Gray
Write-Host "  • Review what caused the rollback and update processes" -ForegroundColor Gray