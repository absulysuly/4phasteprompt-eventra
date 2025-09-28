# AUTOMATED SESSION STATE CAPTURE
# Run this script at the end of each session to generate a complete context prompt
# Usage: .\capture-session.ps1

Write-Host "🔄 Capturing Session State..." -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor DarkCyan

# Capture current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Capture Git state
Write-Host "📊 Gathering Git information..." -ForegroundColor Blue
$gitStatus = git status --porcelain 2>$null
$currentBranch = git branch --show-current 2>$null
$recentCommits = git log --oneline -5 2>$null
$stashList = git stash list 2>$null
$gitStatusLong = git status 2>$null

# Capture file state
Write-Host "📁 Scanning file changes..." -ForegroundColor Blue
$modifiedFiles = git diff --name-only HEAD~5..HEAD 2>$null
$unstagedFiles = git diff --name-only 2>$null
$stagedFiles = git diff --cached --name-only 2>$null

# Capture package.json info
$packageInfo = ""
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" | ConvertFrom-Json
    $dependencies = $packageContent.dependencies.PSObject.Properties | ForEach-Object { "$($_.Name): $($_.Value)" }
    $packageInfo = $dependencies -join "`n"
}

# Capture recent file modifications
$recentlyModified = Get-ChildItem -Recurse -File | 
    Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-2) -and $_.Extension -match '\.(ts|tsx|js|jsx|json|md)$' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 10 |
    ForEach-Object { "$($_.Name) ($($_.LastWriteTime.ToString('HH:mm')))" }

# Interactive prompts for context
Write-Host "`n🎯 Please provide session context:" -ForegroundColor Yellow
$currentTask = Read-Host "Current Task (what are you working on?)"
$recentProgress = Read-Host "Recent Progress (what did you accomplish?)"
$nextSteps = Read-Host "Next Steps (what needs to be done next?)"
$issues = Read-Host "Issues/Blockers (any problems encountered?)"
$criticalNotes = Read-Host "CRITICAL reminders (anything crucial to remember?)"
$pickupPoint = Read-Host "Exact pickup point (where should next session continue?)"

# Build the unified prompt
$unifiedPrompt = @"
# 🔄 SESSION CONTINUATION REQUEST

**Context**: I'm not signed in to Warp, so I need to preserve all session state manually. Please help me continue from where I left off.

## 📍 **Current Project State**
- **Project**: Eventra SaaS Application  
- **Directory**: ``C:\Users\HB LAPTOP STORE\4phasteprompt-eventra\eventra-saas``
- **Platform**: Windows 11, PowerShell 5.1.26100.6584
- **Last Session**: $timestamp

## 🎯 **Active Work Items**
**Current Task**: $currentTask

**Recent Progress**:
$recentProgress

**Next Steps**:
$nextSteps

**Blockers/Issues**:
$issues

## 📊 **Repository State**
``````powershell
# Git Status Snapshot
$($gitStatusLong -join "`n")

# Current Branch
$currentBranch

# Recent Commits (last 5)
$($recentCommits -join "`n")

# Stashed Work
$($stashList -join "`n")

# Uncommitted Changes
Unstaged: $($unstagedFiles -join ", ")
Staged: $($stagedFiles -join ", ")
``````

## 🏗️ **Architecture Context**
**Tech Stack**: 
- Next.js 13+ (App Router)
- React with TypeScript
- Tailwind CSS  
- i18next for internationalization

**Key Files Modified** (last 2 hours):
$($recentlyModified -join "`n")

**Dependencies**:
$packageInfo

## 📋 **Action Items for Next Session**
1. Continue with: $pickupPoint
2. Check build status: ``npm run build``
3. Test current changes
4. Review modified files
5. Address any blockers: $issues

## 🎯 **Immediate Goals**
**Short-term (this session)**:
$nextSteps

## ⚡ **QUICK START TEMPLATE**

``````powershell
# Quick session start commands
cd "C:\Users\HB LAPTOP STORE\4phasteprompt-eventra\eventra-saas"
git status
git log --oneline -5
git stash list
npm run dev
``````

---

**🔥 CRITICAL**: $criticalNotes

**🎯 RESUME FROM**: $pickupPoint

---

*Session preserved at: $timestamp*
*Next session: Continue with "$pickupPoint"*

**INSTRUCTION FOR WARP**: Please help me restore this complete development context and continue from where I left off. Set up the environment and guide me through resuming the work on "$currentTask".
"@

# Save to file
$outputFile = "session-context-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"
$unifiedPrompt | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "`n✅ Session context captured!" -ForegroundColor Green
Write-Host "📄 Saved to: $outputFile" -ForegroundColor Green

Write-Host "`n📋 COPY THIS ENTIRE CONTENT TO WARP:" -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor DarkCyan
Write-Host $unifiedPrompt -ForegroundColor White
Write-Host ("=" * 50) -ForegroundColor DarkCyan

Write-Host "`n💡 Instructions:" -ForegroundColor Cyan
Write-Host "1. Copy everything above (between the = lines)" -ForegroundColor White
Write-Host "2. Paste it into Warp AI at the start of your next session" -ForegroundColor White
Write-Host "3. Warp will restore your complete context and help you continue" -ForegroundColor White

Write-Host "`n🎯 Your pickup point: $pickupPoint" -ForegroundColor Magenta