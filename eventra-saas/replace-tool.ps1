# Mass Import Replacement Tool
param(
    [Parameter(Mandatory=$true)]
    [string]$OLD,
    
    [Parameter(Mandatory=$true)]  
    [string]$NEW,
    
    [Parameter(Mandatory=$false)]
    [string]$BRANCH = "fix/imports/mass-update",
    
    [Parameter(Mandatory=$false)]
    [string]$EXTS = "*.js,*.ts,*.tsx",
    
    [Parameter(Mandatory=$false)]
    [bool]$DRY_RUN = $true
)

$ErrorActionPreference = "Stop"

function Write-Banner {
    param([string]$Text)
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan  
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

try {
    Write-Banner "MASS IMPORT REPLACEMENT TOOL"
    Write-Host "OLD:      '$OLD'" -ForegroundColor White
    Write-Host "NEW:      '$NEW'" -ForegroundColor White
    Write-Host "BRANCH:   '$BRANCH'" -ForegroundColor White
    Write-Host "EXTS:     '$EXTS'" -ForegroundColor White
    Write-Host "DRY_RUN:  $DRY_RUN" -ForegroundColor White
    Write-Host ""
    
    # Validate git repo
    Write-Host "[*] Validating git repository..." -ForegroundColor Yellow
    $gitCheck = git rev-parse --is-inside-work-tree 2>$null
    if ($gitCheck -ne "true") {
        throw "Not in a git repository"
    }
    Write-Host "[OK] Valid git repository" -ForegroundColor Green
    
    # Find files
    Write-Host "[*] Finding target files..." -ForegroundColor Yellow
    $allFiles = @()
    
    if ($EXTS) {
        $extensions = $EXTS -split ","
        foreach ($ext in $extensions) {
            $ext = $ext.Trim()
            $files = git ls-files $ext 2>$null
            if ($files) {
                if ($files -is [array]) {
                    $allFiles += $files
                } else {
                    $allFiles += @($files)
                }
            }
        }
    } else {
        $allFiles = git ls-files
    }
    
    if ($allFiles.Count -eq 0) {
        Write-Host "[ERROR] No files found" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[INFO] Found $($allFiles.Count) files" -ForegroundColor Blue
    
    # Find matches
    Write-Host "[*] Searching for matches..." -ForegroundColor Yellow
    $matchingFiles = @()
    
    foreach ($file in $allFiles) {
        try {
            $result = git grep -l --fixed-strings "$OLD" -- "$file" 2>$null
            if ($result) {
                $matchingFiles += $file
            }
        } catch {
            # Skip files with errors
        }
    }
    
    if ($matchingFiles.Count -eq 0) {
        Write-Host "[INFO] No matches found for '$OLD'" -ForegroundColor Blue
        exit 0
    }
    
    Write-Host "[FOUND] Matches in $($matchingFiles.Count) files" -ForegroundColor Green
    
    # Show preview
    Write-Banner "PREVIEW"
    Write-Host "Pattern: '$OLD' -> '$NEW'" -ForegroundColor Yellow
    Write-Host ""
    
    $totalMatches = 0
    foreach ($file in $matchingFiles) {
        try {
            $matches = git grep -n --fixed-strings "$OLD" -- "$file" 2>$null
            if ($matches) {
                Write-Host "FILE: $file" -ForegroundColor Cyan
                if ($matches -is [array]) {
                    $totalMatches += $matches.Count
                    $matches | Select-Object -First 3 | ForEach-Object {
                        Write-Host "    $_" -ForegroundColor White
                    }
                    if ($matches.Count -gt 3) {
                        Write-Host "    ... and $($matches.Count - 3) more" -ForegroundColor Gray
                    }
                } else {
                    $totalMatches += 1
                    Write-Host "    $matches" -ForegroundColor White
                }
                Write-Host ""
            }
        } catch {
            # Skip files with errors
        }
    }
    
    Write-Host "SUMMARY: $totalMatches matches in $($matchingFiles.Count) files" -ForegroundColor Green
    
    if ($DRY_RUN) {
        Write-Host ""
        Write-Host "[DRY RUN] No changes made" -ForegroundColor Yellow
        Write-Host "To apply changes, run with -DRY_RUN `$false" -ForegroundColor Yellow
        exit 0
    }
    
    # Non-dry-run execution from here
    $originalBranch = git rev-parse --abbrev-ref HEAD
    
    # Create/switch to branch
    Write-Host "[*] Managing branch: $BRANCH" -ForegroundColor Yellow
    $branchExists = $null
    try {
        $branchExists = git rev-parse --verify $BRANCH 2>$null
    } catch {
        # Branch doesn't exist
    }
    
    if ($branchExists) {
        Write-Host "[BRANCH] Switching to existing branch: $BRANCH" -ForegroundColor Blue
        git checkout $BRANCH
    } else {
        Write-Host "[BRANCH] Creating new branch: $BRANCH" -ForegroundColor Blue
        git checkout -b $BRANCH
    }
    
    # Perform replacements
    Write-Host "[*] Performing replacements..." -ForegroundColor Yellow
    $filesChanged = 0
    
    foreach ($file in $matchingFiles) {
        try {
            $content = Get-Content -Path $file -Raw -Encoding UTF8
            $newContent = $content.Replace($OLD, $NEW)
            if ($content -ne $newContent) {
                Set-Content -Path $file -Value $newContent -Encoding UTF8 -NoNewline
                $filesChanged++
                Write-Host "[OK] $file" -ForegroundColor Green
            }
        } catch {
            Write-Host "[WARN] Failed: $file" -ForegroundColor Yellow
        }
    }
    
    Write-Host "[RESULT] Modified $filesChanged files" -ForegroundColor Green
    
    # Show changes
    Write-Host "[*] Changes made:" -ForegroundColor Yellow
    $changedFiles = git diff --name-only
    if ($changedFiles) {
        $changedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        Write-Host ""
        git --no-pager diff --stat
    } else {
        Write-Host "[INFO] No git changes detected" -ForegroundColor Blue
        exit 0
    }
    
    # Test if available
    if (Test-Path "package.json") {
        $pkg = Get-Content "package.json" | ConvertFrom-Json
        $testScript = $pkg.scripts.test
        if ($testScript -and $testScript -ne 'echo "No tests specified" && exit 0') {
            Write-Host "[*] Running tests..." -ForegroundColor Yellow
            try {
                npm test
                Write-Host "[OK] Tests passed" -ForegroundColor Green
            } catch {
                Write-Host "[ERROR] Tests failed - aborting commit" -ForegroundColor Red
                exit 1
            }
        }
    }
    
    # Git session integration
    if (Test-Path "gs.ps1") {
        Write-Host "[*] Using git session helper..." -ForegroundColor Yellow
        if (!(Test-Path ".gs/state")) {
            .\gs.ps1 start
        }
    }
    
    # Commit changes
    Write-Host "[*] Committing changes..." -ForegroundColor Yellow
    $commitMsg = "fix(imports): mass update '$OLD' to '$NEW'"
    
    git add -A
    $staged = git diff --staged --name-only
    if ($staged) {
        git commit -m $commitMsg
        $commitHash = git rev-parse --short HEAD
        Write-Host "[COMMIT] $commitHash" -ForegroundColor Green
        
        # Checkpoint with gs
        if (Test-Path "gs.ps1") {
            $gsMsg = "Mass update imports"
            .\gs.ps1 checkpoint $gsMsg
        }
        
        # Push branch
        Write-Host ""
        Write-Host "Push to origin? (y/n) [y]: " -NoNewline -ForegroundColor Yellow
        $pushResponse = Read-Host
        if (!$pushResponse -or $pushResponse -eq "y") {
            git push --set-upstream origin HEAD
            Write-Host "[OK] Pushed to origin" -ForegroundColor Green
        }
        
        # Summary
        Write-Banner "EXECUTION COMPLETE"
        Write-Host "Files changed: $filesChanged" -ForegroundColor White
        Write-Host "Branch: $BRANCH" -ForegroundColor White
        Write-Host "Commit: $commitHash" -ForegroundColor White
        Write-Host ""
        Write-Host "ROLLBACK COMMANDS:" -ForegroundColor Red
        Write-Host "  git checkout $originalBranch" -ForegroundColor Gray
        Write-Host "  git branch -D $BRANCH" -ForegroundColor Gray
        Write-Host "  git revert $commitHash" -ForegroundColor Gray
        
    } else {
        Write-Host "[INFO] Nothing to commit" -ForegroundColor Blue
    }
    
} catch {
    Write-Host "[ERROR] $_" -ForegroundColor Red
    exit 1
}