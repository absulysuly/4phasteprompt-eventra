#requires -Version 5.1

<#
.SYNOPSIS
    Final audit and foundation snapshot creation for project repositories.

.DESCRIPTION
    This script performs a comprehensive audit and creates stable snapshots of your project's
    current "soul/foundation" state. It includes:
    - Running tests (npm/pytest if detected)
    - Checking for essential project files
    - Scanning for TODO/FIXME/WIP patterns
    - Creating baseline audit report
    - Creating backup artifacts (branch, tag, bundle, archive, GitHub release)
    - Integration with gs.ps1 checkpoint system

.PARAMETER FoundationName
    Base name for branch/tag/archive/bundle. Defaults to "foundation-v1".

.PARAMETER BackupMethods
    Array of backup methods to use. Options: branch, tag, bundle, archive, release
    Default: @("branch", "tag", "bundle", "archive")

.PARAMETER PushRemote
    Git remote name to push branches/tags to. Default: "origin"

.PARAMETER BaseBranch
    Branch to return to in rollback commands. Default: "main"

.PARAMETER DryRun
    If specified, only produces the report and preview snapshot commands (no changes made).

.PARAMETER Force
    If specified, skips confirmations and proceeds automatically.

.PARAMETER Essentials
    Array of essential files to check for presence. Default includes common project files.

.PARAMETER ReportFile
    Output file for the baseline report. Default: "baseline_report.md"

.PARAMETER SkipGs
    If specified, skips integration with gs.ps1 checkpoint system.

.EXAMPLE
    .\audit.ps1 -DryRun
    Performs a dry run audit without making any changes.

.EXAMPLE
    .\audit.ps1 -FoundationName "milestone-v2" -BackupMethods @("branch", "tag")
    Creates only branch and tag backups with custom foundation name.

.EXAMPLE
    .\audit.ps1 -Force
    Runs full audit and snapshot creation without confirmations.
#>

[CmdletBinding()]
param(
    [string]$FoundationName = "foundation-v1",
    
    [ValidateSet("branch", "tag", "bundle", "archive", "release")]
    [string[]]$BackupMethods = @("branch", "tag", "bundle", "archive"),
    
    [string]$PushRemote = "origin",
    [string]$BaseBranch = "main",
    
    [switch]$DryRun,
    [switch]$Force,
    [switch]$SkipGs,
    
    [string[]]$Essentials = @("README.md", "LICENSE", "CHANGELOG.md", "package.json", "pyproject.toml"),
    [string]$ReportFile = "baseline_report.md"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"  # Continue on non-critical errors

# Global variables
$script:TestsOk = $true
$script:Timestamp = Get-Date -Format "yyyyMMddTHHmmssZ" -AsUTC
$script:CurrentBranch = ""
$script:MissingFiles = @()
$script:TodoMatches = @()
$script:TodoMatchCount = 0

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Invoke-Action {
    param(
        [string]$Command,
        [string]$Description = $Command
    )
    
    if ($DryRun) {
        Write-Host "DRY ➜ $Description" -ForegroundColor Yellow
        return $true
    } else {
        try {
            Write-Verbose "Executing: $Command"
            $result = Invoke-Expression $Command
            return $?
        } catch {
            Write-Error "Failed to execute: $Description - $($_.Exception.Message)"
            return $false
        }
    }
}

function Test-GitRepository {
    try {
        $null = git rev-parse --is-inside-work-tree 2>$null
        return $?
    } catch {
        return $false
    }
}

function Get-CurrentBranch {
    try {
        return git rev-parse --abbrev-ref HEAD 2>$null
    } catch {
        return "unknown"
    }
}

function Test-ProjectTests {
    Write-Info "Running basic test check..."
    
    # Check for Node.js project with npm test
    if (Test-Path "package.json") {
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Info "Found package.json — checking npm test script"
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            
            if ($packageJson.scripts -and $packageJson.scripts.test) {
                if ($DryRun) {
                    Write-Warn "DRY_RUN: skipping npm test execution"
                } else {
                    try {
                        $testOutput = npm test --silent 2>&1
                        $testExitCode = $LASTEXITCODE
                        
                        if ($testExitCode -eq 0) {
                            Write-Success "npm test passed"
                        } else {
                            Write-Warn "npm test failed — marking tests as failing in report"
                            $script:TestsOk = $false
                        }
                    } catch {
                        Write-Warn "npm test encountered an error: $($_.Exception.Message)"
                        $script:TestsOk = $false
                    }
                }
            } else {
                Write-Info "No test script found in package.json, skipping npm test"
            }
        } else {
            Write-Info "npm not found, skipping npm test"
        }
    }
    # Check for Python project with pytest
    elseif ((Test-Path "pytest.ini") -or (Test-Path "pyproject.toml")) {
        if (Get-Command pytest -ErrorAction SilentlyContinue) {
            if ($DryRun) {
                Write-Warn "DRY_RUN: skipping pytest execution"
            } else {
                try {
                    $testOutput = pytest -q 2>&1
                    $testExitCode = $LASTEXITCODE
                    
                    if ($testExitCode -eq 0) {
                        Write-Success "pytest passed"
                    } else {
                        Write-Warn "pytest failed"
                        $script:TestsOk = $false
                    }
                } catch {
                    Write-Warn "pytest encountered an error: $($_.Exception.Message)"
                    $script:TestsOk = $false
                }
            }
        } else {
            Write-Info "pytest not found, skipping Python tests"
        }
    }
    else {
        Write-Info "No standard test runner detected, skipping automated tests."
    }
}

function Test-EssentialFiles {
    Write-Info "Checking essentials: $($Essentials -join ', ')"
    
    $script:MissingFiles = @()
    foreach ($file in $Essentials) {
        $trimmedFile = $file.Trim()
        if (-not (Test-Path $trimmedFile)) {
            $script:MissingFiles += $trimmedFile
        }
    }
    
    if ($script:MissingFiles.Count -gt 0) {
        Write-Warn "Missing essential files: $($script:MissingFiles -join ', ')"
    } else {
        Write-Success "All essential files present"
    }
}

function Search-TodoPatterns {
    Write-Info "Searching for TODO/FIXME/WIP and 'essentials' mentions..."
    
    try {
        $patterns = "TODO|FIXME|WIP|ESSENTIAL"
        $gitGrepOutput = git grep -n --no-color -E $patterns 2>$null
        
        if ($gitGrepOutput) {
            $script:TodoMatches = $gitGrepOutput -split "`n"
            $script:TodoMatchCount = $script:TodoMatches.Count
            
            Write-Host "-- sample matches (first 20) --" -ForegroundColor Gray
            $script:TodoMatches[0..([Math]::Min(19, $script:TodoMatches.Count - 1))] | ForEach-Object {
                Write-Host "  $_" -ForegroundColor Gray
            }
            Write-Info "Total matches: $script:TodoMatchCount"
        } else {
            Write-Success "No TODO/FIXME/WIP/ESSENTIAL mentions found in tracked files"
            $script:TodoMatchCount = 0
        }
    } catch {
        Write-Info "Git grep failed or no matches found"
        $script:TodoMatchCount = 0
    }
}

function New-BaselineReport {
    Write-Info "Writing report to $ReportFile"
    
    $lastCommit = git log -1 --oneline 2>$null
    $gitStatus = git status --porcelain 2>$null
    $hasChanges = $gitStatus.Length -gt 0
    
    # Build report content using string concatenation to avoid here-string issues
    $testRunner = if (Test-Path "package.json") { "npm" } elseif ((Test-Path "pytest.ini") -or (Test-Path "pyproject.toml")) { "pytest" } else { "none detected" }
    $testStatus = if ($script:TestsOk) { "OK" } else { "FAILED or SKIPPED" }
    
    $essentialsStatus = if ($script:MissingFiles.Count -gt 0) {
        "Missing: $($script:MissingFiles -join ', ')"
    } else {
        "All checked essential files present"
    }
    
    $todoStatus = if ($script:TodoMatchCount -gt 0) {
        "Found $script:TodoMatchCount matches (see search output above)"
    } else {
        "None found in tracked files"
    }
    
    $dryRunNote = if ($DryRun) { "`n- **DRY_RUN:** Preview only - no snapshots were created" } else { "" }
    
    $reportContent = @'
# Baseline Audit Report

**Timestamp:** {0}
**Current branch:** {1}
**Last commit:** {2}
**Has uncommitted changes:** {3}

## Tests
- **Test runner present:** {4}
- **Test status:** {5}

## Essential Files
- **Status:** {6}

## TODO/FIXME/WIP Patterns
- **Status:** {7}

## Planned Snapshot(s)
- **Methods:** {8}
- **Foundation name:** {9}{10}

## Rollback Quick Commands
```bash
# Soft reset (keep changes)
git reset --soft HEAD~1

# Switch back to base branch
git checkout {11}

# Delete foundation branch (if created)
git branch -D {9}

# Delete remote foundation branch (if pushed)
git push {12} --delete {9}

# Delete foundation tag (if created)
git tag -d {9}
git push {12} --delete {9}
```

## Restore Instructions
```bash
# From branch
git checkout {9}

# From tag
git checkout tags/{9}-{0} -b restore-{9}

# From bundle
git clone --branch {9} foundation-{9}-{0}.bundle restore-dir

# From archive
# Extract foundation-{9}-{0}.zip to desired location
```

---
*Report generated by audit.ps1 on {13}*
'@ -f $script:Timestamp, $script:CurrentBranch, $lastCommit, $hasChanges, $testRunner, $testStatus, $essentialsStatus, $todoStatus, ($BackupMethods -join ', '), $FoundationName, $dryRunNote, $BaseBranch, $PushRemote, (Get-Date)

    try {
        Set-Content -Path $ReportFile -Value $reportContent -Encoding UTF8
        Write-Success "Wrote $ReportFile"
    } catch {
        Write-Error "Failed to write report: $($_.Exception.Message)"
    }
}

function New-FoundationSnapshots {
    Write-Info "Creating foundation snapshots..."
    
    $sanitizedName = $FoundationName -replace '[^A-Za-z0-9._-]', '-'
    $bundleFile = "foundation-$sanitizedName-$script:Timestamp.bundle"
    $archiveFile = "foundation-$sanitizedName-$script:Timestamp.zip"
    $tagName = "$sanitizedName-$script:Timestamp"
    $branchName = $sanitizedName
    
    Write-Info "Planned snapshot actions:"
    foreach ($method in $BackupMethods) {
        switch ($method.ToLower()) {
            "branch" {
                Write-Host " - Create and push branch: git checkout -b $branchName; git push $PushRemote $branchName"
            }
            "tag" {
                Write-Host " - Create annotated tag: git tag -a $tagName -m 'Foundation snapshot $script:Timestamp'; git push $PushRemote $tagName"
            }
            "bundle" {
                Write-Host " - Create git bundle: git bundle create $bundleFile --all"
            }
            "archive" {
                Write-Host " - Create zip archive of HEAD: git archive -o $archiveFile HEAD"
            }
            "release" {
                Write-Host " - Create GitHub release (requires gh): gh release create $tagName $archiveFile --title `"$FoundationName`" --notes `"Foundation snapshot $script:Timestamp`""
            }
            default {
                Write-Warn " Unknown backup method: $method"
            }
        }
    }
    
    if ($DryRun) {
        Write-Warn "DRY_RUN: preview completed. No snapshots created. Inspect $ReportFile."
        return
    }
    
    # Confirm unless forced
    if (-not $Force) {
        $confirmation = Read-Host "Proceed to create the planned snapshots? (y/N)"
        if ($confirmation.ToLower() -ne 'y') {
            Write-Warn "Aborted by user."
            return
        }
    }
    
    # Create snapshots based on selected methods
    foreach ($method in $BackupMethods) {
        switch ($method.ToLower()) {
            "branch" {
                Write-Info "Creating foundation branch: $branchName"
                
                # Check if branch already exists
                $branchExists = git rev-parse --verify --quiet $branchName 2>$null
                if ($branchExists) {
                    Write-Info "Branch $branchName already exists locally; switching to it"
                    $success = Invoke-Action "git checkout $branchName"
                } else {
                    $success = Invoke-Action "git checkout -b $branchName"
                    if ($success) {
                        Write-Success "Created branch $branchName"
                    }
                }
                
                # Push to remote if successful
                if ($success) {
                    $remoteExists = git ls-remote --exit-code $PushRemote 2>$null
                    if ($remoteExists) {
                        $pushSuccess = Invoke-Action "git push --set-upstream $PushRemote $branchName"
                        if ($pushSuccess) {
                            Write-Success "Pushed branch $branchName to $PushRemote"
                        } else {
                            Write-Warn "Failed to push branch to remote"
                        }
                    } else {
                        Write-Warn "Remote $PushRemote not available; branch created locally only"
                    }
                }
            }
            
            "tag" {
                Write-Info "Creating foundation tag: $tagName"
                $success = Invoke-Action "git tag -a $tagName -m 'Foundation snapshot $script:Timestamp'"
                if ($success) {
                    Write-Success "Created tag $tagName"
                    
                    # Push tag to remote
                    $remoteExists = git ls-remote --exit-code $PushRemote 2>$null
                    if ($remoteExists) {
                        $pushSuccess = Invoke-Action "git push $PushRemote $tagName"
                        if ($pushSuccess) {
                            Write-Success "Pushed tag $tagName to $PushRemote"
                        } else {
                            Write-Warn "Failed to push tag to remote"
                        }
                    } else {
                        Write-Warn "Remote $PushRemote not available; tag created locally only"
                    }
                }
            }
            
            "bundle" {
                Write-Info "Creating git bundle: $bundleFile"
                $success = Invoke-Action "git bundle create $bundleFile --all"
                if ($success) {
                    Write-Success "Created bundle: $bundleFile"
                }
            }
            
            "archive" {
                Write-Info "Creating zip archive: $archiveFile"
                $success = Invoke-Action "git archive -o $archiveFile HEAD"
                if ($success) {
                    Write-Success "Created archive: $archiveFile"
                }
            }
            
            "release" {
                if (Get-Command gh -ErrorAction SilentlyContinue) {
                    Write-Info "Creating GitHub release: $tagName"
                    
                    # First create the tag if it doesn't exist
                    $tagExists = git rev-parse --verify --quiet "tags/$tagName" 2>$null
                    if (-not $tagExists) {
                        Invoke-Action "git tag -a $tagName -m 'Foundation snapshot $script:Timestamp'"
                        Invoke-Action "git push $PushRemote $tagName"
                    }
                    
                    # Create release with or without archive
                    if (Test-Path $archiveFile) {
                        $success = Invoke-Action "gh release create $tagName $archiveFile --title '$FoundationName' --notes 'Foundation snapshot $script:Timestamp'"
                    } else {
                        $success = Invoke-Action "gh release create $tagName --title '$FoundationName' --notes 'Foundation snapshot $script:Timestamp'"
                    }
                    
                    if ($success) {
                        Write-Success "Created GitHub release: $tagName"
                    }
                } else {
                    Write-Warn "gh CLI not found; cannot create GitHub release automatically"
                }
            }
        }
    }
}

function Invoke-GsCheckpoint {
    if ($SkipGs) {
        Write-Info "Skipping gs.ps1 integration (SkipGs specified)"
        return
    }
    
    # Check for gs.ps1 in current directory
    if (Test-Path "gs.ps1") {
        Write-Info "Running gs.ps1 checkpoint for snapshot"
        $checkpointMessage = "Foundation snapshot: $FoundationName ($script:Timestamp)"
        
        try {
            if (Get-Command pwsh -ErrorAction SilentlyContinue) {
                $success = Invoke-Action "pwsh -NoProfile -ExecutionPolicy Bypass -File gs.ps1 checkpoint '$checkpointMessage'"
            } else {
                $success = Invoke-Action "powershell -NoProfile -ExecutionPolicy Bypass -File gs.ps1 checkpoint '$checkpointMessage'"
            }
            
            if ($success) {
                Write-Success "gs.ps1 checkpoint completed"
            }
        } catch {
            Write-Warn "gs.ps1 checkpoint failed: $($_.Exception.Message)"
        }
    }
    # Check for git-session.ps1 (alternative name)
    elseif (Test-Path "git-session.ps1") {
        Write-Info "Running git-session.ps1 checkpoint for snapshot"
        $checkpointMessage = "Foundation snapshot: $FoundationName ($script:Timestamp)"
        
        try {
            $success = Invoke-Action "git-session.ps1 checkpoint '$checkpointMessage'"
            if ($success) {
                Write-Success "git-session.ps1 checkpoint completed"
            }
        } catch {
            Write-Warn "git-session.ps1 checkpoint failed: $($_.Exception.Message)"
        }
    }
    else {
        Write-Info "No gs helper found (gs.ps1 or git-session.ps1); snapshot created by git operations only"
    }
}

function Show-Summary {
    Write-Host ""
    Write-Success "Foundation audit and snapshot process complete!"
    Write-Host ""
    Write-Host "📊 Summary:" -ForegroundColor Cyan
    Write-Host " - Report: $ReportFile"
    
    if ("branch" -in $BackupMethods) {
        $branchPushed = if ($DryRun) { "preview" } else { "yes" }
        Write-Host " - Branch: $FoundationName (pushed: $branchPushed)"
    }
    if ("tag" -in $BackupMethods) {
        Write-Host " - Tag: $FoundationName-$script:Timestamp"
    }
    if ("bundle" -in $BackupMethods) {
        Write-Host " - Bundle file: foundation-$FoundationName-$script:Timestamp.bundle"
    }
    if ("archive" -in $BackupMethods) {
        Write-Host " - Archive file: foundation-$FoundationName-$script:Timestamp.zip"
    }
    
    Write-Host ""
    Write-Host "💡 Keep the report and archive/bundle files in secure storage (cloud storage, artifact repo, or release assets)." -ForegroundColor Magenta
}

# Main execution
try {
    Write-Host ""
    Write-Host "🚀 Foundation Audit & Snapshot Tool" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor DarkCyan
    Write-Host ""
    
    if ($DryRun) {
        Write-Warn "DRY_RUN mode: No snapshots or pushes will be executed. This run will only audit and show planned commands."
        Write-Host ""
    }
    
    # Ensure we're in a git repository
    if (-not (Test-GitRepository)) {
        Write-Error "Not in a git repository. cd to repo root and re-run."
        exit 2
    }
    
    $script:CurrentBranch = Get-CurrentBranch
    Write-Info "Repository branch: $script:CurrentBranch"
    Write-Info "Audit timestamp: $script:Timestamp"
    Write-Host ""
    
    # Run audit phases
    Test-ProjectTests
    Test-EssentialFiles  
    Search-TodoPatterns
    
    # Generate report
    New-BaselineReport
    
    # Create snapshots
    New-FoundationSnapshots
    
    # Integrate with gs system
    Invoke-GsCheckpoint
    
    # Show final summary
    Show-Summary
    
} catch {
    Write-Error "Fatal error during audit: $($_.Exception.Message)"
    Write-Error $_.ScriptStackTrace
    exit 1
}