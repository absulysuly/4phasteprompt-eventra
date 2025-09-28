# ============================================================
# Mass Import Replacement Tool (Windows PowerShell Version)
# ============================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$OLD_IMPORT = "OLD_IMPORT",
    
    [Parameter(Mandatory=$false)]
    [string]$NEW_IMPORT = "NEW_IMPORT", 
    
    [Parameter(Mandatory=$false)]
    [string]$BRANCH_NAME = "fix/imports/old-to-new",
    
    [Parameter(Mandatory=$false)]
    [string]$FILE_EXTS = "*.js,*.ts,*.tsx",
    
    [Parameter(Mandatory=$false)]
    [string]$DRY_RUN = "true"
)

$ErrorActionPreference = "Stop"
$filesChanged = 0
$commitHash = ""

function Write-Header {
    param([string]$Text)
    Write-Host ("=" * 60) -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Text)
    Write-Host "🔸 $Text" -ForegroundColor Yellow
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Main Script
try {
    Write-Header "MASS IMPORT REPLACEMENT TOOL"
    Write-Host "Configuration:" -ForegroundColor Cyan
    Write-Host "  OLD_IMPORT: '$OLD_IMPORT'" -ForegroundColor White  
    Write-Host "  NEW_IMPORT: '$NEW_IMPORT'" -ForegroundColor White
    Write-Host "  BRANCH_NAME: '$BRANCH_NAME'" -ForegroundColor White
    Write-Host "  FILE_EXTS: '$FILE_EXTS'" -ForegroundColor White
    Write-Host "  DRY_RUN: '$DRY_RUN'" -ForegroundColor White
    Write-Host ""
    
    # Validate environment
    Write-Step "Validating environment..."
    try {
        $isGitRepo = git rev-parse --is-inside-work-tree 2>$null
        if ($isGitRepo -ne "true") {
            throw "Not in a git repository"
        }
        Write-Host "✅ Valid git repository" -ForegroundColor Green
    } catch {
        Write-Host "❌ Current directory is not a git repository" -ForegroundColor Red
        exit 1
    }
    
    # Find target files
    Write-Step "Finding target files..."
    $allFiles = @()
    if ($FILE_EXTS -and $FILE_EXTS -ne "") {
        $extensions = $FILE_EXTS -split ","
        foreach ($ext in $extensions) {
            $ext = $ext.Trim()
            try {
                $files = git ls-files $ext 2>$null
                if ($files) {
                    $allFiles += $files
                }
            } catch {
                # Ignore errors for invalid patterns
            }
        }
    } else {
        $allFiles = git ls-files
    }
    
    if (-not $allFiles -or $allFiles.Count -eq 0) {
        Write-Host "❌ No files found matching pattern: $FILE_EXTS" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📁 Found $($allFiles.Count) files matching pattern" -ForegroundColor Blue
    
    # Find matches
    Write-Step "Searching for matches..."
    $matchingFiles = @()
    $tempFile = [System.IO.Path]::GetTempFileName()
    
    try {
        # Write file list to temp file
        if ($allFiles -is [array]) {
            $allFiles | Out-File -FilePath $tempFile -Encoding utf8
        } else {
            $allFiles | Out-File -FilePath $tempFile -Encoding utf8
        }
        
        # Use git grep to find matches
        $grepResult = git grep -l -I --fixed-strings "$OLD_IMPORT" -- (Get-Content $tempFile) 2>$null
        if ($grepResult) {
            if ($grepResult -is [array]) {
                $matchingFiles = $grepResult
            } else {
                $matchingFiles = @($grepResult)
            }
        }
    } catch {
        Write-Host "⚠️ Warning: Advanced grep failed, trying simpler approach..." -ForegroundColor Yellow
        try {
            $grepResult = git grep -l -I --fixed-strings "$OLD_IMPORT" 2>$null
            if ($grepResult) {
                if ($grepResult -is [array]) {
                    $matchingFiles = $grepResult
                } else {
                    $matchingFiles = @($grepResult)
                }
            }
        } catch {
            # No matches found
        }
    } finally {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
    
    if (-not $matchingFiles -or $matchingFiles.Count -eq 0) {
        Write-Host "ℹ️ No matches found for '$OLD_IMPORT'" -ForegroundColor Blue
        Write-Host "Nothing to replace. Exiting." -ForegroundColor Blue
        exit 0
    }
    
    Write-Host "🎯 Found matches in $($matchingFiles.Count) files" -ForegroundColor Green
    
    # Show preview
    Write-Header "PREVIEW: Files and matches"
    Write-Host "🔍 Searching for: '$OLD_IMPORT'" -ForegroundColor Yellow
    Write-Host "🔄 Replace with: '$NEW_IMPORT'" -ForegroundColor Yellow
    Write-Host "🎯 Target extensions: $FILE_EXTS" -ForegroundColor Yellow
    Write-Host "🌿 Target branch: $BRANCH_NAME" -ForegroundColor Yellow
    Write-Host ""
    
    $totalMatches = 0
    foreach ($file in $matchingFiles) {
        try {
            $matches = git grep -n -I --fixed-strings "$OLD_IMPORT" -- "$file" 2>$null
            if ($matches) {
                Write-Host "📄 $file" -ForegroundColor Cyan
                if ($matches -is [array]) {
                    $fileMatches = $matches.Count
                } else {
                    $fileMatches = 1
                }
                $totalMatches += $fileMatches
                
                # Show first few matches with context
                if ($matches -is [array]) {
                    $matches | Select-Object -First 3 | ForEach-Object {
                        $line = $_ -replace "^[^:]+:", ""
                        Write-Host "    $line" -ForegroundColor White
                    }
                    if ($fileMatches -gt 3) {
                        Write-Host "    ... and $($fileMatches - 3) more matches" -ForegroundColor Gray
                    }
                } else {
                    $line = $matches -replace "^[^:]+:", ""
                    Write-Host "    $line" -ForegroundColor White
                }
                Write-Host ""
            }
        } catch {
            # Skip files with errors
        }
    }
    
    Write-Host "📊 SUMMARY: $totalMatches matches in $($matchingFiles.Count) files" -ForegroundColor Green
    
    if ($DRY_RUN -eq "true") {
        Write-Host ""
        Write-Host "🔒 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
        Write-Host "To apply changes, run this script with -DRY_RUN false" -ForegroundColor Yellow
        exit 0
    }
    
    # Branch handling
    Write-Step "Creating branch: $BRANCH_NAME"
    $currentBranch = git rev-parse --abbrev-ref HEAD
    
    # Check if branch exists
    $branchExists = $null
    try {
        $branchExists = git rev-parse --verify $BRANCH_NAME 2>$null
    } catch {
        # Branch doesn't exist
    }
    
    if ($branchExists) {
        Write-Host "🌿 Switching to existing branch: $BRANCH_NAME" -ForegroundColor Blue
        git checkout $BRANCH_NAME
    } else {
        Write-Host "🌿 Creating new branch: $BRANCH_NAME" -ForegroundColor Blue
        git checkout -b $BRANCH_NAME
    }
    
    # Perform replacements
    Write-Step "Performing replacements in $($matchingFiles.Count) files..."
    
    foreach ($file in $matchingFiles) {
        try {
            $content = Get-Content -Path $file -Raw
            $newContent = $content.Replace($OLD_IMPORT, $NEW_IMPORT)
            if ($content -ne $newContent) {
                [System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
                $filesChanged++
            }
        } catch {
            Write-Host "⚠️ Failed to process file: $file" -ForegroundColor Yellow
        }
    }
    
    # Show diff
    Write-Step "Showing changes..."
    $changedFiles = git diff --name-only
    if ($changedFiles) {
        Write-Host "📊 Files changed: $filesChanged" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Changed files:" -ForegroundColor Cyan
        $changedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        Write-Host ""
        Write-Host "Diff summary:" -ForegroundColor Cyan
        git --no-pager diff --stat
    } else {
        Write-Host "ℹ️ No changes detected" -ForegroundColor Blue
        Write-Host "This might indicate the replacement was already done or no matches were found." -ForegroundColor Blue
        exit 0
    }
    
    # Check for tests
    Write-Step "Checking for tests..."
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts -and $packageJson.scripts.test -and 
            $packageJson.scripts.test -ne "echo `"No tests specified`" && exit 0") {
            Write-Host "🧪 Running npm test..." -ForegroundColor Blue
            try {
                npm test
                Write-Host "✅ Tests passed" -ForegroundColor Green
            } catch {
                Write-Host "❌ Tests failed!" -ForegroundColor Red
                Write-Host "Aborting commit. Please fix failing tests before proceeding." -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "ℹ️ No npm tests configured" -ForegroundColor Blue
        }
    }
    
    # Handle GS session if available
    Write-Step "Checking for git session helper..."
    if (Test-Path "gs.ps1") {
        Write-Host "📋 Found git session helper: gs.ps1" -ForegroundColor Blue
        if (Test-Path ".gs/state") {
            $state = Get-Content ".gs/state" -Raw
            if ($state -ne "active") {
                Write-Host "Starting git session..." -ForegroundColor Blue
                .\gs.ps1 start
            }
        } else {
            Write-Host "Starting git session..." -ForegroundColor Blue
            .\gs.ps1 start
        }
    }
    
    # Commit changes
    Write-Step "Committing changes..."
    $commitMessage = "fix(imports): mass update $OLD_IMPORT → $NEW_IMPORT"
    
    Write-Host "Use interactive staging? (y/n) [y]: " -NoNewline
    $response = Read-Host
    if ($response -eq "" -or $response -eq "y" -or $response -eq "Y") {
        Write-Host "📝 Starting interactive staging..." -ForegroundColor Blue
        git add -p
    } else {
        Write-Host "📝 Staging all changes..." -ForegroundColor Blue
        git add -A
    }
    
    $stagedChanges = git diff --staged --name-only
    if (-not $stagedChanges) {
        Write-Host "ℹ️ Nothing staged for commit" -ForegroundColor Blue
        exit 0
    }
    
    Write-Host "💾 Committing with message: $commitMessage" -ForegroundColor Blue
    git commit -m $commitMessage
    $commitHash = git rev-parse --short HEAD
    Write-Host "✅ Committed as: $commitHash" -ForegroundColor Green
    
    # Checkpoint with gs if available
    if (Test-Path "gs.ps1") {
        $checkpointMsg = "Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
        Write-Host "📋 Creating checkpoint..." -ForegroundColor Blue
        .\gs.ps1 checkpoint $checkpointMsg
    }
    
    # Push changes
    Write-Step "Pushing branch to origin..."
    Write-Host "Push changes to origin? (y/n) [y]: " -NoNewline
    $response = Read-Host
    if ($response -eq "" -or $response -eq "y" -or $response -eq "Y") {
        git push --set-upstream origin HEAD
        Write-Host "✅ Branch pushed successfully" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Skipping push. You can push later with:" -ForegroundColor Blue
        Write-Host "  git push --set-upstream origin $BRANCH_NAME" -ForegroundColor Gray
    }
    
    # Final summary
    Write-Header "EXECUTION SUMMARY"
    Write-Host "📊 RESULTS:" -ForegroundColor Cyan
    Write-Host "  • Files processed: $filesChanged" -ForegroundColor White
    Write-Host "  • Branch: $BRANCH_NAME" -ForegroundColor White
    Write-Host "  • Commit hash: $commitHash" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 ROLLBACK COMMANDS:" -ForegroundColor Red
    Write-Host "  • Switch back to original branch:" -ForegroundColor Red
    Write-Host "    git checkout $currentBranch" -ForegroundColor White
    Write-Host "  • Delete the created branch:" -ForegroundColor Red
    Write-Host "    git branch -D $BRANCH_NAME" -ForegroundColor White
    Write-Host "  • Revert the changes (safe):" -ForegroundColor Red
    Write-Host "    git revert $commitHash" -ForegroundColor White
    Write-Host "  • Run the script again with reversed parameters:" -ForegroundColor Red
    Write-Host "    .\mass-replace-simple.ps1 -OLD_IMPORT '$NEW_IMPORT' -NEW_IMPORT '$OLD_IMPORT' -BRANCH_NAME 'revert/imports' -DRY_RUN 'false'" -ForegroundColor White
    
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}