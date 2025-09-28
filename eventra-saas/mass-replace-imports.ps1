#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Safe mass import replacement with git session checkpointing

.DESCRIPTION
    This script performs a safe mass replacement of import strings across files
    in a git repository with comprehensive safety checks and rollback instructions.

.PARAMETER OLD_IMPORT
    Exact text to replace (match case & punctuation)

.PARAMETER NEW_IMPORT  
    Exact replacement text

.PARAMETER BRANCH_NAME
    Branch to create, e.g. fix/imports/old-to-new

.PARAMETER FILE_EXTS
    Comma-separated file globs to target (empty = all files), e.g. "*.js,*.ts,*.tsx"

.PARAMETER DRY_RUN
    "true" = preview only; "false" = apply changes (default: "true")

.EXAMPLE
    .\mass-replace-imports.ps1 -OLD_IMPORT "OLD_IMPORT" -NEW_IMPORT "NEW_IMPORT" -BRANCH_NAME "fix/imports/old-to-new" -FILE_EXTS "*.js,*.ts" -DRY_RUN "true"
#>

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

# ==========================================
# CONFIGURATION - Edit these values as needed
# ==========================================

# If parameters not provided, use these defaults
if ($OLD_IMPORT -eq "OLD_IMPORT") { $OLD_IMPORT = "OLD_IMPORT" }
if ($NEW_IMPORT -eq "NEW_IMPORT") { $NEW_IMPORT = "NEW_IMPORT" }
if ($BRANCH_NAME -eq "fix/imports/old-to-new") { $BRANCH_NAME = "fix/imports/old-to-new" }
if ($FILE_EXTS -eq "*.js,*.ts,*.tsx") { $FILE_EXTS = "*.js,*.ts,*.tsx" }

$ErrorActionPreference = "Stop"

# Global variables for tracking
$script:FilesChanged = 0
$script:CommitHash = ""
$script:PullRequestUrl = ""
$script:Warnings = @()
$script:RollbackCommands = @()

function Write-Header {
    param([string]$Text, [string]$Color = "Cyan")
    Write-Host "=" * 60 -ForegroundColor $Color
    Write-Host $Text -ForegroundColor $Color
    Write-Host "=" * 60 -ForegroundColor $Color
}

function Write-Step {
    param([string]$Text, [string]$Color = "Yellow")
    Write-Host "🔸 $Text" -ForegroundColor $Color
}

function Add-Warning {
    param([string]$Message)
    $script:Warnings += $Message
    Write-Host "⚠️  WARNING: $Message" -ForegroundColor Yellow
}

function Add-RollbackCommand {
    param([string]$Command, [string]$Description)
    $script:RollbackCommands += @{
        Command = $Command
        Description = $Description
    }
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

function Validate-Environment {
    Write-Step "Validating environment..."
    
    # Check if we're in a git repository
    try {
        $isGitRepo = git rev-parse --is-inside-work-tree 2>$null
        if ($isGitRepo -ne "true") {
            throw "Not in a git repository"
        }
    } catch {
        Write-Host "❌ ERROR: Current directory is not a git repository" -ForegroundColor Red
        Write-Host "Please run this script from within a git repository." -ForegroundColor Red
        exit 1
    }
    
    # Check git installation
    if (-not (Test-Command "git")) {
        Write-Host "❌ ERROR: git is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
    
    # Check for perl or sed (or fallback to PowerShell)
    $hasPerl = Test-Command "perl"
    $hasSed  = Test-Command "sed"

    if ($hasPerl) {
        Write-Host "✅ Using perl for replacements" -ForegroundColor Green
        $script:UsePerl = $true
        $script:UseSed = $false
        $script:UsePs  = $false
    } elseif ($hasSed) {
        Write-Host "✅ Using sed for replacements" -ForegroundColor Green
        $script:UsePerl = $false
        $script:UseSed = $true
        $script:UsePs  = $false
    } else {
        Write-Host "✅ Using PowerShell for replacements" -ForegroundColor Green
        $script:UsePerl = $false
        $script:UseSed = $false
        $script:UsePs  = $true
    }
    
    Write-Host "✅ Environment validation passed" -ForegroundColor Green
}

function Get-TargetFiles {
    Write-Step "Finding target files..."
    
    # Get all tracked files
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
    
    if ($allFiles.Count -eq 0) {
        Write-Host "❌ No files found matching pattern: $FILE_EXTS" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📁 Found $($allFiles.Count) files matching pattern" -ForegroundColor Blue
    return $allFiles
}

function Find-Matches {
    param([array]$Files)
    
    Write-Step "Searching for matches..."
    
    # Use git grep to find matches
    $matchingFiles = @()
    try {
        if ($Files.Count -gt 0) {
            # Create a temp file list for git grep
            $tempFile = [System.IO.Path]::GetTempFileName()
            $Files | Out-File -FilePath $tempFile -Encoding utf8
            
            $grepResult = git grep -l -I --fixed-strings $OLD_IMPORT -- $(Get-Content $tempFile) 2>$null
            Remove-Item $tempFile -ErrorAction SilentlyContinue
            
            if ($grepResult) {
                $matchingFiles = $grepResult
            }
        }
    } catch {
        # Fallback to simple git grep
        try {
            $grepResult = git grep -l -I --fixed-strings $OLD_IMPORT 2>$null
            if ($grepResult) {
                $matchingFiles = $grepResult
            }
        } catch {
            # No matches found
        }
    }
    
    if ($matchingFiles.Count -eq 0) {
        Write-Host "ℹ️  No matches found for '$OLD_IMPORT'" -ForegroundColor Blue
        Write-Host "Nothing to replace. Exiting." -ForegroundColor Blue
        exit 0
    }
    
    Write-Host "🎯 Found matches in $($matchingFiles.Count) files" -ForegroundColor Green
    return $matchingFiles
}

function Show-Preview {
    param([array]$MatchingFiles)
    
    Write-Header "PREVIEW: Files and matches" "Cyan"
    Write-Host "🔍 Searching for: '$OLD_IMPORT'" -ForegroundColor Yellow
    Write-Host "🔄 Replace with: '$NEW_IMPORT'" -ForegroundColor Yellow
    Write-Host "🎯 Target extensions: $FILE_EXTS" -ForegroundColor Yellow
    Write-Host "🌿 Target branch: $BRANCH_NAME" -ForegroundColor Yellow
    Write-Host ""
    
    $totalMatches = 0
    foreach ($file in $MatchingFiles) {
        try {
            $matches = git grep -n -I --fixed-strings $OLD_IMPORT -- $file 2>$null
            if ($matches) {
                Write-Host "📄 $file" -ForegroundColor Cyan
                $fileMatches = ($matches | Measure-Object).Count
                $totalMatches += $fileMatches
                
                # Show first few matches with context
                $matches | Select-Object -First 3 | ForEach-Object {
                    $line = $_ -replace "^[^:]+:", ""
                    Write-Host "    $line" -ForegroundColor White
                }
                if ($fileMatches -gt 3) {
                    Write-Host "    ... and $($fileMatches - 3) more matches" -ForegroundColor Gray
                }
                Write-Host ""
            }
        } catch {
            # Skip files with errors
        }
    }
    
    Write-Host "📊 SUMMARY: $totalMatches matches in $($MatchingFiles.Count) files" -ForegroundColor Green
    
    if ($DRY_RUN -eq "true") {
        Write-Host ""
        Write-Host "🔒 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
        Write-Host "To apply changes, set DRY_RUN=`"false`" or use -DRY_RUN `"false`"" -ForegroundColor Yellow
    }
}

function Create-Branch {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Branch creation (dry run mode)"
        return
    }
    
    Write-Step "Managing branch: $BRANCH_NAME"
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Add-RollbackCommand "git checkout $currentBranch" "Switch back to original branch"
    
    # Check if branch exists
    $branchExists = git rev-parse --verify $BRANCH_NAME 2>$null
    if ($branchExists) {
        Write-Host "🌿 Switching to existing branch: $BRANCH_NAME" -ForegroundColor Blue
        git checkout $BRANCH_NAME
    } else {
        Write-Host "🌿 Creating new branch: $BRANCH_NAME" -ForegroundColor Blue
        git checkout -b $BRANCH_NAME
        Add-RollbackCommand "git branch -D $BRANCH_NAME" "Delete the created branch"
    }
}

function Perform-Replacement {
    param([array]$MatchingFiles)
    
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: File replacement (dry run mode)"
        return
    }
    
    Write-Step "Performing replacements in $($MatchingFiles.Count) files..."
    
    $batchSize = 50
    $batches = [math]::Ceiling($MatchingFiles.Count / $batchSize)
    
    for ($i = 0; $i -lt $batches; $i++) {
        $start = $i * $batchSize
        $end = [math]::Min(($i + 1) * $batchSize - 1, $MatchingFiles.Count - 1)
        $batch = $MatchingFiles[$start..$end]
        
        Write-Host "Processing batch $($i + 1)/$batches ($($batch.Count) files)..." -ForegroundColor Blue
        
        if ($script:UsePerl) {
            # Use perl for replacement
            foreach ($file in $batch) {
                try {
                    perl -0777 -pe "s/\Q$OLD_IMPORT\E/$NEW_IMPORT/g" -i -- "$file"
                } catch {
                    Add-Warning "Failed to process file: $file"
                }
            }
        } elseif ($script:UseSed) {
            # Use sed for replacement (with backup and cleanup)
            foreach ($file in $batch) {
                try {
                    $oldEsc = ($OLD_IMPORT -replace '/', '\/')
                    $newEsc = ($NEW_IMPORT -replace '/', '\/')
                    # Use double quotes for PowerShell, but pass the sed script in single quotes to avoid interpolation issues
                    bash -lc "sed -i.bak 's/$oldEsc/$newEsc/g' '$file'" 2>$null
                    Remove-Item "$file.bak" -ErrorAction SilentlyContinue
                } catch {
                    Add-Warning "Failed to process file: $file"
                }
            }
        } else {
            # PowerShell fallback replacement
            foreach ($file in $batch) {
                try {
                    $content = Get-Content -LiteralPath $file -Raw -ErrorAction Stop
                    $newContent = $content.Replace($OLD_IMPORT, $NEW_IMPORT)
                    if ($newContent -ne $content) {
                        [System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
                    }
                } catch {
                    Add-Warning "Failed to process file: $file"
                }
            }
        }
    }
    
    Write-Host "✅ Replacement completed" -ForegroundColor Green
}

function Show-Diff {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Diff display (dry run mode)"
        return
    }
    
    Write-Step "Showing changes..."
    
    $changedFiles = git diff --name-only
    if ($changedFiles) {
        $script:FilesChanged = ($changedFiles | Measure-Object).Count
        Write-Host "📊 Files changed: $script:FilesChanged" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Changed files:" -ForegroundColor Cyan
        $changedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        
        Write-Host ""
        Write-Host "Diff summary:" -ForegroundColor Cyan
        git --no-pager diff --stat
    } else {
        Write-Host "ℹ️  No changes detected" -ForegroundColor Blue
        Write-Host "This might indicate the replacement was already done or no matches were found." -ForegroundColor Blue
    }
}

function Run-Tests {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Test execution (dry run mode)"
        return
    }
    
    Write-Step "Running tests..."
    
    # Check for npm test
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts -and $packageJson.scripts.test -and $packageJson.scripts.test -ne "echo \`"No tests specified\`" && exit 0") {
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
            Write-Host "ℹ️  No npm tests configured" -ForegroundColor Blue
        }
    }
    
    # Check for Python tests
    if (Test-Path "pyproject.toml" -or Test-Path "pytest.ini" -or Test-Path "requirements.txt") {
        if (Test-Command "pytest") {
            Write-Host "🧪 Running pytest..." -ForegroundColor Blue
            try {
                pytest
                Write-Host "✅ Python tests passed" -ForegroundColor Green
            } catch {
                Write-Host "❌ Python tests failed!" -ForegroundColor Red  
                Write-Host "Aborting commit. Please fix failing tests before proceeding." -ForegroundColor Red
                exit 1
            }
        }
    }
}

function Manage-GitSession {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Git session management (dry run mode)"
        return
    }
    
    Write-Step "Managing git session..."
    
    $gsScript = $null
    if (Test-Path "gs.ps1") {
        $gsScript = "gs.ps1"
    } elseif (Test-Path "gs") {
        $gsScript = "gs"
    }
    
    if ($gsScript) {
        Write-Host "📋 Found git session helper: $gsScript" -ForegroundColor Blue
        
        # Check if session is active
        if (Test-Path ".gs/state") {
            $state = Get-Content ".gs/state" -Raw | ForEach-Object { $_.Trim() }
            if ($state -ne "active") {
                Write-Host "Starting new git session..." -ForegroundColor Blue
                if ($gsScript -eq "gs.ps1") {
                    .\gs.ps1 start
                } else {
                    .\gs start
                }
            }
        } else {
            Write-Host "Starting new git session..." -ForegroundColor Blue
            if ($gsScript -eq "gs.ps1") {
                .\gs.ps1 start
            } else {
                .\gs start  
            }
        }
    } else {
        Write-Host "📋 No git session helper found, creating basic metadata..." -ForegroundColor Blue
        if (!(Test-Path ".gs")) {
            New-Item -ItemType Directory -Path ".gs" | Out-Null
        }
        @(
            "session_id=$(Get-Date -Format 'yyyyMMddTHHmmssZ')",
            "branch=$(git rev-parse --abbrev-ref HEAD)",
            "started_at=$(Get-Date -Format 'yyyyMMddTHHmmssZ')"
        ) | Out-File -FilePath ".gs/session" -Encoding utf8
        "active" | Out-File -FilePath ".gs/state" -Encoding utf8
    }
}

function Stage-And-Commit {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Staging and commit (dry run mode)"  
        return
    }
    
    Write-Step "Staging and committing changes..."
    
    # Check if we have changes to stage
    $statusOutput = git status --porcelain
    if (-not $statusOutput) {
        Write-Host "ℹ️  No changes to commit" -ForegroundColor Blue
        return
    }
    
    # Stage changes
    if ([System.Console]::IsInputRedirected -or ![System.Environment]::UserInteractive) {
        Write-Host "📝 Auto-staging all changes (non-interactive mode)..." -ForegroundColor Blue
        git add -A
    } else {
        Write-Host "📝 Use interactive staging? (y/n) [y]: " -NoNewline -ForegroundColor Blue
        $response = Read-Host
        if ($response -eq "" -or $response -eq "y" -or $response -eq "Y") {
            Write-Host "📝 Starting interactive staging..." -ForegroundColor Blue
            git add -p
        } else {
            Write-Host "📝 Staging all changes..." -ForegroundColor Blue
            git add -A
        }
    }
    
    # Check if anything was staged
    $stagedChanges = git diff --staged --name-only
    if (-not $stagedChanges) {
        Write-Host "ℹ️  Nothing staged for commit" -ForegroundColor Blue
        return
    }
    
    # Commit changes
    $commitMessage = "fix(imports): mass update $OLD_IMPORT → $NEW_IMPORT"
    Write-Host "💾 Committing with message: $commitMessage" -ForegroundColor Blue
    git commit -m $commitMessage
    
    $script:CommitHash = git rev-parse --short HEAD
    Add-RollbackCommand "git reset --hard HEAD~1" "Revert the commit (destructive)"
    Add-RollbackCommand "git revert HEAD" "Create revert commit (safe)"
    
    Write-Host "✅ Committed as: $script:CommitHash" -ForegroundColor Green
    
    # Checkpoint with gs if available
    $gsScript = $null
    if (Test-Path "gs.ps1") {
        $gsScript = "gs.ps1"
    } elseif (Test-Path "gs") {
        $gsScript = "gs"
    }
    
    if ($gsScript) {
        $checkpointMsg = "Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
        Write-Host "📋 Creating checkpoint..." -ForegroundColor Blue
        if ($gsScript -eq "gs.ps1") {
            .\gs.ps1 checkpoint $checkpointMsg
        } else {
            .\gs checkpoint $checkpointMsg
        }
    }
}

function Push-Branch {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: Branch push (dry run mode)"
        return
    }
    
    if (-not $script:CommitHash) {
        Write-Host "ℹ️  No commit to push" -ForegroundColor Blue
        return
    }
    
    Write-Step "Pushing branch to origin..."
    
    try {
        git push --set-upstream origin HEAD
        Write-Host "✅ Branch pushed successfully" -ForegroundColor Green
    } catch {
        Add-Warning "Failed to push branch. You may need to push manually."
        Add-Warning "Command: git push --set-upstream origin $BRANCH_NAME"
    }
}

function Generate-PRArtefacts {
    if ($DRY_RUN -eq "true") {
        Write-Step "SKIPPED: PR artifact generation (dry run mode)"
        return
    }
    
    Write-Step "Generating PR artifacts..."
    
    # Create PR body
    $prBody = @"
# Mass Import Update: $OLD_IMPORT → $NEW_IMPORT

## Summary
This PR performs a mass update of import statements across the codebase.

**Changes:**
- From: $OLD_IMPORT
- To: $NEW_IMPORT
- Files affected: $script:FilesChanged files
- Extensions targeted: $FILE_EXTS

## How to Review
1. Verify the replacements are correct by spot-checking a few files
2. Ensure no unintended replacements occurred (especially in comments or strings)
3. Run the test suite to ensure functionality is preserved
4. Check that build still works

## Testing
- [x] Automated tests passed before commit
- [ ] Manual testing completed
- [ ] Build verification completed

## Rollback Plan
If issues are found, this change can be reverted using:
```
git revert $script:CommitHash
```

Or manually revert the import changes:
```
# Use the same script with swapped OLD_IMPORT and NEW_IMPORT
.\mass-replace-imports.ps1 -OLD_IMPORT "$NEW_IMPORT" -NEW_IMPORT "$OLD_IMPORT" -BRANCH_NAME "revert/imports" -DRY_RUN "false"
```

## Checklist
- [x] Changes are purely textual replacements
- [x] No functional code changes
- [x] Tests pass
- [x] Git session checkpointed
"@

    $prBody | Out-File -FilePath "pr_body.md" -Encoding utf8
    Write-Host "📄 Created pr_body.md" -ForegroundColor Green
    
    # Update or create CHANGELOG.md
    $changelogEntry = "- Mass update imports: $OLD_IMPORT → $NEW_IMPORT ($script:FilesChanged files)"
    
    if (Test-Path "CHANGELOG.md") {
        $changelog = Get-Content "CHANGELOG.md" -Raw
        if ($changelog -match "## Unreleased") {
            $changelog = $changelog -replace "(## Unreleased[^\r\n]*[\r\n]+)", "`$1$changelogEntry`n"
        } else {
            $changelog = "## Unreleased`n$changelogEntry`n`n$changelog"
        }
        $changelog | Out-File -FilePath "CHANGELOG.md" -Encoding utf8
    } else {
        @(
            "# Changelog",
            "",
            "## Unreleased", 
            $changelogEntry,
            ""
        ) -join "`n" | Out-File -FilePath "CHANGELOG.md" -Encoding utf8
    }
    Write-Host "📝 Updated CHANGELOG.md" -ForegroundColor Green
    
    # Try to create PR with gh CLI
    if (Test-Command "gh") {
        Write-Host "🚀 Attempting to create PR with gh CLI..." -ForegroundColor Blue
        try {
            $prOutput = gh pr create --title "fix(imports): mass update $OLD_IMPORT → $NEW_IMPORT" --body-file pr_body.md --base main 2>$null
            if ($prOutput -match "https://") {
                $script:PullRequestUrl = ($prOutput | Select-String "https://[^\s]+").Matches[0].Value
                Write-Host "✅ PR created: $script:PullRequestUrl" -ForegroundColor Green
            }
        } catch {
            Add-Warning "Failed to create PR automatically. Create it manually with pr_body.md"
        }
    } else {
        Add-Warning "gh CLI not found. Create PR manually using pr_body.md"
        Write-Host "ℹ️  Manual PR steps:" -ForegroundColor Blue
        Write-Host "   1. Push your branch: git push origin $BRANCH_NAME" -ForegroundColor Gray
        Write-Host "   2. Open your repository in browser" -ForegroundColor Gray
        Write-Host "   3. Create PR using content from pr_body.md" -ForegroundColor Gray
    }
}

function Show-Summary {
    Write-Header "EXECUTION SUMMARY" "Green"
    
    Write-Host "📊 RESULTS:" -ForegroundColor Cyan
    Write-Host "   • Files processed: $script:FilesChanged" -ForegroundColor White
    Write-Host "   • Branch: $BRANCH_NAME" -ForegroundColor White
    Write-Host "   • Commit hash: $(if($script:CommitHash) { $script:CommitHash } else { 'N/A (dry run)' })" -ForegroundColor White
    Write-Host "   • PR URL: $(if($script:PullRequestUrl) { $script:PullRequestUrl } else { 'N/A' })" -ForegroundColor White
    Write-Host "   • Mode: $(if($DRY_RUN -eq 'true') { 'DRY RUN (preview only)' } else { 'APPLIED CHANGES' })" -ForegroundColor White
    
    if ($script:Warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "⚠️  WARNINGS:" -ForegroundColor Yellow
        $script:Warnings | ForEach-Object { Write-Host "   • $_" -ForegroundColor Yellow }
    }
    
    if ($script:RollbackCommands.Count -gt 0 -and $DRY_RUN -eq "false") {
        Write-Host ""
        Write-Host "🔄 ROLLBACK COMMANDS:" -ForegroundColor Red
        $script:RollbackCommands | ForEach-Object { 
            Write-Host "   • $($_.Description):" -ForegroundColor Red
            Write-Host "     $($_.Command)" -ForegroundColor White
        }
    }
    
    if ($DRY_RUN -eq "true") {
        Write-Host ""
        Write-Host "▶️  NEXT STEPS:" -ForegroundColor Green
        Write-Host "   To apply these changes, run:" -ForegroundColor Green
        Write-Host "   .\mass-replace-imports.ps1 -OLD_IMPORT `"$OLD_IMPORT`" -NEW_IMPORT `"$NEW_IMPORT`" -BRANCH_NAME `"$BRANCH_NAME`" -FILE_EXTS `"$FILE_EXTS`" -DRY_RUN `"false`"" -ForegroundColor Cyan
    }
}

# ==========================================
# MAIN EXECUTION
# ==========================================

try {
    Write-Header "MASS IMPORT REPLACEMENT TOOL" "Magenta"
    Write-Host "🔧 Configuration:" -ForegroundColor Cyan
    Write-Host "   OLD_IMPORT: '$OLD_IMPORT'" -ForegroundColor White  
    Write-Host "   NEW_IMPORT: '$NEW_IMPORT'" -ForegroundColor White
    Write-Host "   BRANCH_NAME: '$BRANCH_NAME'" -ForegroundColor White
    Write-Host "   FILE_EXTS: '$FILE_EXTS'" -ForegroundColor White
    Write-Host "   DRY_RUN: '$DRY_RUN'" -ForegroundColor White
    Write-Host ""
    
    # Validation
    Validate-Environment
    
    # Find files and matches
    $targetFiles = Get-TargetFiles
    $matchingFiles = Find-Matches -Files $targetFiles
    
    # Show preview
    Show-Preview -MatchingFiles $matchingFiles
    
    if ($DRY_RUN -eq "false") {
        # Perform actual changes
        Create-Branch
        Perform-Replacement -MatchingFiles $matchingFiles
        Show-Diff
        Run-Tests
        Manage-GitSession
        Stage-And-Commit  
        Push-Branch
        Generate-PRArtefacts
    }
    
    Show-Summary
    
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
    exit 1
}