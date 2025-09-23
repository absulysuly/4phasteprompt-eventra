# --- PowerShell Mass Replace Runner Script ---
# Edit variables below BEFORE running:

$OLD_IMPORT = "LanguaGeneration"                # exact text to replace (case-sensitive)
$NEW_IMPORT = "LanguageGeneration"              # replacement text  
$BRANCH_NAME = "fix/imports/langua-to-language" # feature branch to create/use
$FILE_EXTS = @("*.js", "*.ts")                 # array of file globs (empty = all tracked files)
$DRY_RUN = $true                                # $true = preview only; $false = apply changes
$AUTO_PUSH_COMMITS = $false                     # $true to auto-push commits
$AUTO_PUSH_TAGS = $false                        # $true to auto-push tags
$REMOTE = "origin"
$BASE_BRANCH = "main"  
$FORCE = $false                                 # $true to skip interactive confirmations

# Path to your PowerShell mass-replace script
$PS_SCRIPT = ".\mass-replace-final.ps1"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "MASS IMPORT REPLACEMENT RUNNER" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "OLD_IMPORT:      '$OLD_IMPORT'" -ForegroundColor White
Write-Host "NEW_IMPORT:      '$NEW_IMPORT'" -ForegroundColor White
Write-Host "BRANCH_NAME:     '$BRANCH_NAME'" -ForegroundColor White
Write-Host "FILE_EXTS:       $($FILE_EXTS -join ', ')" -ForegroundColor White
Write-Host "DRY_RUN:         $DRY_RUN" -ForegroundColor White
Write-Host "AUTO_PUSH_COMMITS: $AUTO_PUSH_COMMITS" -ForegroundColor White
Write-Host "AUTO_PUSH_TAGS:  $AUTO_PUSH_TAGS" -ForegroundColor White
Write-Host ""

try {
    # Check if PowerShell script exists
    if (-not (Test-Path $PS_SCRIPT)) {
        throw "PowerShell script not found at $PS_SCRIPT. Ensure mass-replace-final.ps1 is in the current directory."
    }

    Write-Host "[INFO] Running mass-replace via PowerShell..." -ForegroundColor Cyan
    
    # Build parameters for the PowerShell script
    $scriptParams = @{
        OLD_IMPORT = $OLD_IMPORT
        NEW_IMPORT = $NEW_IMPORT
        BRANCH_NAME = $BRANCH_NAME
        FILE_EXTS = $FILE_EXTS
        DryRun = $DRY_RUN
        AutoPushCommits = $AUTO_PUSH_COMMITS
        AutoPushTags = $AUTO_PUSH_TAGS
        Remote = $REMOTE
        BaseBranch = $BASE_BRANCH
        Force = $FORCE
    }
    
    Write-Host "[INFO] PowerShell call parameters:" -ForegroundColor Blue
    $scriptParams.GetEnumerator() | ForEach-Object { 
        Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
    }
    Write-Host ""

    # Run the PowerShell script
    & $PS_SCRIPT @scriptParams
    $PS_EXIT = $LASTEXITCODE

    if ($PS_EXIT -ne 0) {
        throw "PowerShell script failed (exit $PS_EXIT). Check output above and fix issues before checkpointing."
    }

    # If dry-run, done
    if ($DRY_RUN) {
        Write-Host "[SUCCESS] DRY RUN complete - no changes made. Inspect preview above." -ForegroundColor Green
        exit 0
    }

    # After successful non-dry run: attempt gs checkpoint
    Write-Host ""
    Write-Host "[INFO] Attempting to create checkpoint..." -ForegroundColor Cyan
    
    if (Test-Path ".\gs.ps1") {
        Write-Host "[INFO] Running gs.ps1 checkpoint" -ForegroundColor Blue
        $checkpointMsg = "Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
        try {
            .\gs.ps1 checkpoint $checkpointMsg
            Write-Host "[SUCCESS] gs.ps1 checkpoint completed." -ForegroundColor Green
        } catch {
            Write-Host "[WARN] gs.ps1 checkpoint failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        # No gs helper: create a lightweight tag checkpoint
        $TAG = "gs-checkpoint-$(Get-Date -Format 'yyyyMMddTHHmmssZ')"
        git tag -a $TAG -m "GS checkpoint: Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
        Write-Host "[SUCCESS] Created local tag: $TAG" -ForegroundColor Green
        
        if ($AUTO_PUSH_TAGS) {
            Write-Host "[INFO] Pushing tag $TAG to $REMOTE..." -ForegroundColor Blue
            try {
                git push $REMOTE $TAG
                Write-Host "[SUCCESS] Tag pushed successfully." -ForegroundColor Green
            } catch {
                Write-Host "[WARN] Tag push failed - check remote/credentials." -ForegroundColor Yellow
            }
        } else {
            Write-Host "[INFO] Auto-push tags disabled; tag created locally only." -ForegroundColor Blue
        }
    }

    # Final summary + rollback tips
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "OPERATION FINISHED" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host " - OLD_IMPORT: $OLD_IMPORT" -ForegroundColor White
    Write-Host " - NEW_IMPORT: $NEW_IMPORT" -ForegroundColor White
    Write-Host " - Branch: $BRANCH_NAME" -ForegroundColor White
    if ($TAG) { Write-Host " - Tag: $TAG" -ForegroundColor White }
    Write-Host ""
    
    Write-Host "ROLLBACK COMMANDS (copy/paste if needed):" -ForegroundColor Yellow
    Write-Host "  # Undo last commit but keep changes:" -ForegroundColor Gray
    Write-Host "  git reset --soft HEAD~1" -ForegroundColor White
    Write-Host ""
    Write-Host "  # Safe revert (if commit already pushed):" -ForegroundColor Gray
    Write-Host "  git revert <commit-hash> -m 'Revert mass import update'" -ForegroundColor White
    Write-Host ""
    Write-Host "  # Delete branch locally and remotely:" -ForegroundColor Gray
    Write-Host "  git checkout $BASE_BRANCH" -ForegroundColor White
    Write-Host "  git branch -D $BRANCH_NAME" -ForegroundColor White
    Write-Host "  git push $REMOTE --delete $BRANCH_NAME" -ForegroundColor White
    
    if ($TAG) {
        Write-Host ""
        Write-Host "  # Remove tag locally & remotely:" -ForegroundColor Gray
        Write-Host "  git tag -d $TAG" -ForegroundColor White
        Write-Host "  git push $REMOTE :refs/tags/$TAG" -ForegroundColor White
    }

} catch {
    Write-Host ""
    Write-Host "[ERROR] Script failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# --- End Script ---