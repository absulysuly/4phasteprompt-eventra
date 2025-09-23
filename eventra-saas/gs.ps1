#!/usr/bin/env pwsh
param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"

$GS_DIR = ".gs"
if (!(Test-Path $GS_DIR)) {
    New-Item -ItemType Directory -Path $GS_DIR | Out-Null
}

function Show-Usage {
    Write-Host @"
Usage: .\gs.ps1 <command> [args...]

Commands:
  start                 # Begin new session
  checkpoint "message"  # Save progress (commit if changes, else tag)
  pause "message"       # Stash work and mark session paused
  resume                # Pop last gs-pause stash and resume
  status                # Show current session state, git status, last checkpoint
  clean                 # Cleanup local gs metadata
  help                  # Show this help
"@
}

function Get-Timestamp {
    return (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
}

function Write-State {
    param([string]$State)
    $State | Out-File -FilePath "$GS_DIR/state" -Encoding utf8
}

function Read-State {
    if (Test-Path "$GS_DIR/state") {
        return Get-Content "$GS_DIR/state" -Raw | ForEach-Object { $_.Trim() }
    }
    return "none"
}

switch ($Command) {
    "start" {
        $sessionId = Get-Timestamp
        try {
            $branch = git rev-parse --abbrev-ref HEAD 2>$null
        } catch {
            $branch = "no-git"
        }
        
        @(
            "session_id=$sessionId",
            "branch=$branch",
            "started_at=$(Get-Timestamp)"
        ) | Out-File -FilePath "$GS_DIR/session" -Encoding utf8
        
        Write-State "active"
        Write-Host "✅ GS session started: $sessionId (branch: $branch)" -ForegroundColor Green
    }
    
    "checkpoint" {
        $msg = if ($Args) { $Args -join " " } else { "GS checkpoint" }
        
        # Check if there are workspace changes
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            git add -A
            $stagedDiff = git diff --staged --quiet 2>$null
            if ($LASTEXITCODE -ne 0) {
                # There are staged changes, commit them
                git commit -m "GS CHECKPOINT: $msg"
                $last = git rev-parse --short HEAD
                $last | Out-File -FilePath "$GS_DIR/last_checkpoint" -Encoding utf8
                Write-Host "✅ Committed checkpoint: $last" -ForegroundColor Green
            } else {
                # Staged is empty, create tag instead
                Write-Host "ℹ️  Nothing to commit (staged empty) — creating tag instead." -ForegroundColor Blue
                $tag = "gs-checkpoint-$(Get-Timestamp)"
                git tag -a $tag -m "GS checkpoint: $msg"
                $tag | Out-File -FilePath "$GS_DIR/last_checkpoint" -Encoding utf8
                Write-Host "🔖 Created tag $tag" -ForegroundColor Yellow
            }
        } else {
            # No changes: create an annotated tag as a checkpoint
            $tag = "gs-checkpoint-$(Get-Timestamp)"
            git tag -a $tag -m "GS checkpoint: $msg"
            $tag | Out-File -FilePath "$GS_DIR/last_checkpoint" -Encoding utf8
            Write-Host "🔖 Created tag $tag (no working changes)" -ForegroundColor Yellow
        }
    }
    
    "pause" {
        $msg = if ($Args) { $Args -join " " } else { "paused" }
        $stashMsg = "gs-pause: $msg"
        
        try {
            git stash push -m $stashMsg
            Write-State "paused"
            Write-Host "⏸️  Session paused (stashed: `"$stashMsg`")" -ForegroundColor Yellow
        } catch {
            Write-Host "ℹ️  Nothing to stash" -ForegroundColor Blue
        }
    }
    
    "resume" {
        # Find the most recent stash with gs-pause prefix
        $stashList = git stash list 2>$null
        $pauseStash = $stashList | Where-Object { $_ -match 'gs-pause' } | Select-Object -First 1
        
        if (-not $pauseStash) {
            Write-Host "⚠️  No gs-pause stash found. Nothing to resume." -ForegroundColor Yellow
            exit 0
        }
        
        # Extract stash ref (e.g., stash@{0})
        $stashRef = ($pauseStash -split ':')[0]
        Write-Host "🔁 Popping stash $stashRef" -ForegroundColor Blue
        
        try {
            git stash pop $stashRef
            Write-State "active"
            Write-Host "▶️  Resumed session and applied stash." -ForegroundColor Green
        } catch {
            Write-Host "❗ Failed to pop stash $stashRef" -ForegroundColor Red
            exit 1
        }
    }
    
    "status" {
        Write-Host "=== GS session status ===" -ForegroundColor Cyan
        Write-Host "state: $(Read-State)"
        
        if (Test-Path "$GS_DIR/session") {
            Write-Host "session:"
            Get-Content "$GS_DIR/session" | ForEach-Object { Write-Host "  $_" }
        }
        
        if (Test-Path "$GS_DIR/last_checkpoint") {
            $checkpoint = Get-Content "$GS_DIR/last_checkpoint" -Raw | ForEach-Object { $_.Trim() }
            Write-Host "last_checkpoint: $checkpoint"
        } else {
            Write-Host "last_checkpoint: none"
        }
        
        Write-Host ""
        Write-Host "=== Git summary ===" -ForegroundColor Cyan
        try {
            git --no-pager status --short
        } catch {
            Write-Host "  (not a git repo)"
        }
        
        Write-Host ""
        Write-Host "=== Recent gs stashes ===" -ForegroundColor Cyan
        $stashList = git stash list 2>$null
        $gsStashes = $stashList | Where-Object { $_ -match 'gs-pause|gs-checkpoint' }
        if ($gsStashes) {
            $gsStashes | ForEach-Object { Write-Host "  $_" }
        } else {
            Write-Host "  (no gs stashes)"
        }
    }
    
    "clean" {
        $confirmation = Read-Host "Are you sure you want to remove local gs metadata ($GS_DIR)? [y/N]"
        if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
            Remove-Item -Recurse -Force $GS_DIR
            Write-Host "🧹 Removed $GS_DIR" -ForegroundColor Green
        } else {
            Write-Host "Aborted."
        }
    }
    
    default {
        Show-Usage
    }
}