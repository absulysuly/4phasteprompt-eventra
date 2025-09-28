# Unified Git Session Management Script
# Usage: .\git-session.ps1 [command] [message]
# Commands: start, checkpoint, pause, resume, status, clean

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "checkpoint", "pause", "resume", "status", "clean", "help")]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Message = ""
)

function Write-SessionHeader {
    param([string]$Title)
    Write-Host "`n🔧 $Title" -ForegroundColor Cyan
    Write-Host ("=" * 50) -ForegroundColor DarkCyan
}

function Write-Status {
    param([string]$Text, [string]$Color = "Green")
    Write-Host "✅ $Text" -ForegroundColor $Color
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Get-GitStatus {
    $status = git status --porcelain 2>$null
    $branch = git branch --show-current 2>$null
    $lastCommit = git log -1 --oneline 2>$null
    
    return @{
        HasChanges = $status.Length -gt 0
        Branch = $branch
        LastCommit = $lastCommit
        Files = $status
    }
}

function Start-Session {
    Write-SessionHeader "Starting New Session"
    
    $gitStatus = Get-GitStatus
    Write-Host "📍 Current Branch: $($gitStatus.Branch)" -ForegroundColor Blue
    Write-Host "📝 Last Commit: $($gitStatus.LastCommit)" -ForegroundColor Blue
    
    if ($gitStatus.HasChanges) {
        Write-Warning "Uncommitted changes detected:"
        $gitStatus.Files | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Host "`n💡 Consider using 'checkpoint' or 'pause' to save current work" -ForegroundColor Magenta
    } else {
        Write-Status "Working directory clean - ready to start!"
    }
    
    # Create session start marker
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "SESSION START: $timestamp" | Out-File -FilePath ".session-log" -Append -Encoding UTF8
    
    Write-Host "`n🎯 Session Tips:" -ForegroundColor Magenta
    Write-Host "• Use 'checkpoint \"description\"' every 30-60 minutes"
    Write-Host "• Use 'pause \"current task\"' when stopping work"
    Write-Host "• Use 'status' to check current state anytime"
}

function Save-Checkpoint {
    param([string]$Description)
    
    Write-SessionHeader "Creating Checkpoint"
    
    $gitStatus = Get-GitStatus
    
    if (-not $gitStatus.HasChanges) {
        Write-Warning "No changes to checkpoint"
        return
    }
    
    if (-not $Description) {
        $Description = Read-Host "Enter checkpoint description"
    }
    
    # Add all changes
    git add . 2>$null
    Write-Status "Staged all changes"
    
    # Create commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMessage = "CHECKPOINT [$timestamp]: $Description"
    
    git commit -m $commitMessage 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Checkpoint created: $Description"
        
        # Log the checkpoint
        "$timestamp - CHECKPOINT: $Description" | Out-File -FilePath ".session-log" -Append -Encoding UTF8
        
        # Push to remote if exists
        $remote = git remote 2>$null
        if ($remote) {
            Write-Host "🚀 Pushing to remote..." -ForegroundColor Blue
            git push 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Status "Pushed to remote successfully"
            } else {
                Write-Warning "Failed to push to remote (check connection)"
            }
        }
    } else {
        Write-Error "Failed to create checkpoint"
    }
}

function Pause-Session {
    param([string]$CurrentTask)
    
    Write-SessionHeader "Pausing Session"
    
    if (-not $CurrentTask) {
        $CurrentTask = Read-Host "What are you currently working on?"
    }
    
    $gitStatus = Get-GitStatus
    
    if ($gitStatus.HasChanges) {
        # Stash changes with descriptive message
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $stashMessage = "WIP [$timestamp]: $CurrentTask"
        
        git stash push -m $stashMessage 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Work stashed: $CurrentTask"
        } else {
            Write-Error "Failed to stash changes"
            return
        }
    }
    
    # Create pause marker with context
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    @"
SESSION PAUSE: $timestamp
CURRENT TASK: $CurrentTask
BRANCH: $($gitStatus.Branch)
LAST COMMIT: $($gitStatus.LastCommit)
---
"@ | Out-File -FilePath ".session-log" -Append -Encoding UTF8
    
    Write-Status "Session paused successfully"
    Write-Host "📝 Task saved: $CurrentTask" -ForegroundColor Blue
    Write-Host "💡 Use 'resume' to continue this work later" -ForegroundColor Magenta
}

function Resume-Session {
    Write-SessionHeader "Resuming Session"
    
    # Show recent session history
    if (Test-Path ".session-log") {
        Write-Host "📖 Recent Session History:" -ForegroundColor Blue
        $logContent = Get-Content ".session-log" -Tail 10
        $logContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    
    # Check for stashed work
    $stashList = git stash list 2>$null
    if ($stashList) {
        Write-Host "`n💼 Available Stashed Work:" -ForegroundColor Blue
        $stashList | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        
        $restore = Read-Host "`nRestore most recent stash? (y/N)"
        if ($restore -eq 'y' -or $restore -eq 'Y') {
            git stash pop 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Status "Restored stashed changes"
            } else {
                Write-Error "Failed to restore stash"
            }
        }
    }
    
    $gitStatus = Get-GitStatus
    Write-Host "`n📍 Current State:" -ForegroundColor Blue
    Write-Host "  Branch: $($gitStatus.Branch)" -ForegroundColor Gray
    Write-Host "  Last Commit: $($gitStatus.LastCommit)" -ForegroundColor Gray
    
    if ($gitStatus.HasChanges) {
        Write-Host "  Uncommitted Changes: Yes" -ForegroundColor Yellow
    } else {
        Write-Host "  Uncommitted Changes: None" -ForegroundColor Green
    }
    
    # Log session resume
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "SESSION RESUME: $timestamp" | Out-File -FilePath ".session-log" -Append -Encoding UTF8
}

function Show-Status {
    Write-SessionHeader "Current Session Status"
    
    $gitStatus = Get-GitStatus
    
    Write-Host "📍 Repository Info:" -ForegroundColor Blue
    Write-Host "  Branch: $($gitStatus.Branch)" -ForegroundColor Gray
    Write-Host "  Last Commit: $($gitStatus.LastCommit)" -ForegroundColor Gray
    
    if ($gitStatus.HasChanges) {
        Write-Host "`n📝 Uncommitted Changes:" -ForegroundColor Yellow
        $gitStatus.Files | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    } else {
        Write-Host "`n✅ Working directory clean" -ForegroundColor Green
    }
    
    # Show stashes
    $stashList = git stash list 2>$null
    if ($stashList) {
        Write-Host "`n💼 Stashed Work:" -ForegroundColor Blue
        $stashList | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    
    # Show recent activity
    if (Test-Path ".session-log") {
        Write-Host "`n📖 Recent Activity:" -ForegroundColor Blue
        $logContent = Get-Content ".session-log" -Tail 5
        $logContent | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
}

function Clean-Session {
    Write-SessionHeader "Cleaning Session Data"
    
    # Clean up session log (keep last 50 entries)
    if (Test-Path ".session-log") {
        $allLogs = Get-Content ".session-log"
        if ($allLogs.Count -gt 50) {
            $allLogs | Select-Object -Last 50 | Out-File -FilePath ".session-log" -Encoding UTF8
            Write-Status "Cleaned session log (kept last 50 entries)"
        }
    }
    
    # Show stash cleanup options
    $stashList = git stash list 2>$null
    if ($stashList) {
        Write-Host "`n💼 Current Stashes:" -ForegroundColor Blue
        $stashList | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        
        $clean = Read-Host "`nClean old stashes? (y/N)"
        if ($clean -eq 'y' -or $clean -eq 'Y') {
            # Keep only last 5 stashes
            $stashCount = ($stashList | Measure-Object).Count
            if ($stashCount -gt 5) {
                for ($i = 5; $i -lt $stashCount; $i++) {
                    git stash drop "stash@{$i}" 2>$null
                }
                Write-Status "Cleaned old stashes (kept last 5)"
            }
        }
    }
    
    Write-Status "Session cleanup complete"
}

function Show-Help {
    Write-SessionHeader "Git Session Management Help"
    
    @"
Commands:
  start                 - Begin a new work session
  checkpoint [msg]      - Save current progress with timestamp
  pause [task]         - Pause work and stash changes
  resume               - Resume previous session and restore work
  status               - Show current repository and session state
  clean                - Clean up old session data and stashes
  help                 - Show this help message

Examples:
  .\git-session.ps1 start
  .\git-session.ps1 checkpoint "Fixed language provider conflicts"
  .\git-session.ps1 pause "Working on i18n setup"
  .\git-session.ps1 resume
  .\git-session.ps1 status

Tips:
• Use 'checkpoint' every 30-60 minutes during active development
• Use 'pause' when switching contexts or ending work sessions  
• Use 'resume' to pick up where you left off
• Session data is stored in .session-log file
"@ | Write-Host -ForegroundColor Gray
}

# Main execution
switch ($Command) {
    "start" { Start-Session }
    "checkpoint" { Save-Checkpoint -Description $Message }
    "pause" { Pause-Session -CurrentTask $Message }
    "resume" { Resume-Session }
    "status" { Show-Status }
    "clean" { Clean-Session }
    "help" { Show-Help }
}