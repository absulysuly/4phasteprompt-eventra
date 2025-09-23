# Mass Import Replacement Tool (Windows PowerShell 5.1 Compatible)
# Safe-by-default with auto-push capabilities

param(
  [Parameter(Mandatory=$true)]
  [string]$OLD_IMPORT,
  
  [Parameter(Mandatory=$true)]
  [string]$NEW_IMPORT,
  
  [string]$BRANCH_NAME = "fix/imports/mass-update",
  [string[]]$FILE_EXTS = @("*.js", "*.ts", "*.tsx"),
  [switch]$DryRun,
  [switch]$AutoPushCommits,
  [switch]$AutoPushTags,
  [string]$Remote = "origin",
  [string]$BaseBranch = "main",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Write-Info { param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Succ { param($m) Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }

# Banner
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "MASS IMPORT REPLACEMENT TOOL - ENHANCED VERSION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "OLD_IMPORT:      '$OLD_IMPORT'" -ForegroundColor White
Write-Host "NEW_IMPORT:      '$NEW_IMPORT'" -ForegroundColor White
Write-Host "BRANCH_NAME:     '$BRANCH_NAME'" -ForegroundColor White
Write-Host "FILE_EXTS:       $($FILE_EXTS -join ', ')" -ForegroundColor White
Write-Host "DryRun:          $DryRun" -ForegroundColor White
Write-Host "AutoPushCommits: $AutoPushCommits" -ForegroundColor White
Write-Host "AutoPushTags:    $AutoPushTags" -ForegroundColor White
Write-Host ""

try {
  Write-Info "Starting mass import replacement..."
  
  # Validate git
  $gitCmd = Get-Command git -ErrorAction SilentlyContinue
  if (-not $gitCmd) {
    throw "git not found in PATH. Install git and retry."
  }

  # Ensure in git repo
  $isRepo = & git rev-parse --is-inside-work-tree 2>$null
  if ($LASTEXITCODE -ne 0 -or $isRepo -ne 'true') {
    throw "Not inside a git repo. cd to repo root and retry."
  }

  # Gather current branch
  $currentBranch = (& git rev-parse --abbrev-ref HEAD).Trim()
  Write-Info "Current branch: $currentBranch"

  # Build file list via git ls-files
  $files = @()
  if ($FILE_EXTS -and $FILE_EXTS.Count -gt 0) {
    foreach ($ext in $FILE_EXTS) {
      $extFiles = & git ls-files -- "$ext"
      if ($extFiles) {
        $files += $extFiles
      }
    }
    $files = $files | Sort-Object | Get-Unique
  } else {
    $files = & git ls-files
  }
  
  if (-not $files -or $files.Count -eq 0) {
    Write-Warn "No tracked files matched the given FILE_EXTS. Exiting."
    exit 0
  }

  Write-Info "Found $($files.Count) tracked files to search"

  # Find matches
  Write-Info "Searching for occurrences of: '$OLD_IMPORT'"
  $matches = @()
  
  foreach ($f in $files) {
    if (-not (Test-Path $f)) { continue }
    
    try {
      # Simple binary detection - skip if file contains null bytes
      $rawBytes = [System.IO.File]::ReadAllBytes($f)
      if ($rawBytes -contains 0) { continue }
      
      $text = Get-Content -Path $f -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
      if ($text -and $text.Contains($OLD_IMPORT)) {
        $lines = $text -split "`r?`n"
        $matchingLines = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
          if ($lines[$i].Contains($OLD_IMPORT)) {
            $matchingLines += [PSCustomObject]@{
              LineNumber = $i + 1
              Content = $lines[$i]
            }
          }
        }
        if ($matchingLines.Count -gt 0) {
          $matches += [PSCustomObject]@{ 
            File = $f
            MatchCount = $matchingLines.Count
            Lines = $matchingLines
          }
        }
      }
    }
    catch {
      Write-Warn "Skipping $f (could not process): $($_.Exception.Message)"
    }
  }

  if (-not $matches -or $matches.Count -eq 0) {
    Write-Succ "No occurrences of '$OLD_IMPORT' found in targeted files."
    exit 0
  }

  Write-Host ""
  Write-Host "Found occurrences in $($matches.Count) file(s):" -ForegroundColor Cyan
  foreach ($match in $matches) {
    Write-Host " - $($match.File) ($($match.MatchCount) matches)" -ForegroundColor White
  }
  Write-Host ""

  # Show preview (first few files)
  Write-Info "Preview of matches (first 3 files):"
  $previewCount = 0
  foreach ($match in $matches) {
    if ($previewCount -ge 3) { break }
    Write-Host "---- $($match.File) ----" -ForegroundColor Magenta
    $linesToShow = $match.Lines | Select-Object -First 3
    foreach ($line in $linesToShow) {
      Write-Host "  Line $($line.LineNumber): $($line.Content)" -ForegroundColor White
    }
    if ($match.Lines.Count -gt 3) {
      Write-Host "  ... and $($match.Lines.Count - 3) more matches" -ForegroundColor Gray
    }
    Write-Host ""
    $previewCount++
  }

  $totalMatches = ($matches | ForEach-Object { $_.MatchCount } | Measure-Object -Sum).Sum
  Write-Succ "SUMMARY: $totalMatches total matches in $($matches.Count) files"

  if ($DryRun) {
    Write-Host ""
    Write-Succ "DRY RUN: No changes will be made."
    Write-Info "To apply changes, run with -DryRun:`$false"
    Write-Host ""
    Write-Host "Next command:" -ForegroundColor Green
    $nextCmd = ".\mass-replace-final.ps1 -OLD_IMPORT '$OLD_IMPORT' -NEW_IMPORT '$NEW_IMPORT' -BRANCH_NAME '$BRANCH_NAME'"
    if ($FILE_EXTS.Count -gt 0) {
      $nextCmd += " -FILE_EXTS '$($FILE_EXTS -join "','")'"
    }
    if ($AutoPushCommits) { $nextCmd += " -AutoPushCommits" }
    if ($AutoPushTags) { $nextCmd += " -AutoPushTags" }
    if ($Force) { $nextCmd += " -Force" }
    Write-Host "  $nextCmd" -ForegroundColor Cyan
    exit 0
  }

  # Confirm unless forced
  if (-not $Force) {
    $totalFiles = $matches.Count
    $response = Read-Host "Proceed to replace '$OLD_IMPORT' with '$NEW_IMPORT' in $totalFiles files and create branch '$BRANCH_NAME'? (y/N)"
    if ($response.ToLower() -ne 'y') { 
      Write-Warn "Aborted by user."
      exit 0 
    }
  }

  # Create/switch to branch
  Write-Info "Managing branch: $BRANCH_NAME"
  $branchExists = & git branch --list $BRANCH_NAME
  if (-not $branchExists) {
    & git checkout -b $BRANCH_NAME
    if ($LASTEXITCODE -ne 0) { throw "Failed to create branch $BRANCH_NAME" }
    Write-Succ "Created and switched to branch: $BRANCH_NAME"
  } else {
    & git checkout $BRANCH_NAME
    if ($LASTEXITCODE -ne 0) { throw "Failed to switch to branch $BRANCH_NAME" }
    Write-Info "Switched to existing branch: $BRANCH_NAME"
  }

  # Perform replacements
  Write-Info "Performing replacements..."
  $changedFiles = @()
  
  foreach ($match in $matches) {
    $file = $match.File
    try {
      $originalContent = Get-Content -Path $file -Raw -Encoding UTF8
      $newContent = $originalContent.Replace($OLD_IMPORT, $NEW_IMPORT)
      
      if ($originalContent -ne $newContent) {
        # Write file with UTF8 encoding (no BOM)
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($file, $newContent, $utf8NoBom)
        $changedFiles += $file
        Write-Succ "Modified: $file"
      }
    }
    catch {
      Write-Warn "Failed to process $file : $($_.Exception.Message)"
    }
  }

  if ($changedFiles.Count -eq 0) {
    Write-Warn "No files were actually changed. Nothing to commit."
    exit 0
  }

  Write-Host ""
  Write-Info "Files modified: $($changedFiles.Count)"
  foreach ($file in $changedFiles) {
    Write-Host "  - $file" -ForegroundColor White
  }

  # Show diff summary
  Write-Host ""
  Write-Info "Git diff summary:"
  & git --no-pager diff --name-status
  Write-Host ""
  & git --no-pager diff --stat

  # Run tests if available
  if (Test-Path "package.json") {
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmCmd) {
      $packageJson = Get-Content "package.json" | ConvertFrom-Json
      $testScript = $packageJson.scripts.test
      if ($testScript -and $testScript -ne 'echo "No tests specified" && exit 0') {
        Write-Info "Running npm test..."
        & npm test
        if ($LASTEXITCODE -ne 0) {
          Write-Err "npm test failed. Aborting commit."
          Write-Info "Fix tests manually or run with -Force to bypass test requirement."
          exit 1
        } else {
          Write-Succ "Tests passed."
        }
      }
    }
  }

  # Stage and commit changes
  Write-Info "Staging and committing changes..."
  & git add -A
  
  $commitMsg = "fix(imports): mass update $OLD_IMPORT -> $NEW_IMPORT"
  & git commit -m $commitMsg
  if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
  
  $commitHash = (& git rev-parse --short HEAD).Trim()
  Write-Succ "Committed: $commitHash"

  # Auto-push commits if requested
  if ($AutoPushCommits) {
    Write-Info "Auto-pushing branch to $Remote..."
    & git push --set-upstream $Remote $BRANCH_NAME
    if ($LASTEXITCODE -eq 0) {
      Write-Succ "Branch pushed to $Remote successfully."
    } else {
      Write-Warn "Failed to push branch. Check network/permissions."
    }
  }

  # Git session integration
  $tagName = $null
  if (Test-Path "gs.ps1") {
    Write-Info "Using gs.ps1 for checkpointing..."
    $gsMsg = "Mass update imports: $OLD_IMPORT -> $NEW_IMPORT"
    & powershell -NoProfile -ExecutionPolicy Bypass -File "gs.ps1" checkpoint $gsMsg
  } else {
    # Create our own checkpoint tag
    $tagName = "gs-checkpoint-$(Get-Date -Format 'yyyyMMddTHHmmssZ')"
    & git tag -a $tagName -m "GS checkpoint: Mass update imports $OLD_IMPORT -> $NEW_IMPORT"
    Write-Succ "Created checkpoint tag: $tagName"
    
    if ($AutoPushTags) {
      Write-Info "Auto-pushing tags to $Remote..."
      & git push $Remote $tagName
      if ($LASTEXITCODE -eq 0) {
        Write-Succ "Tag pushed to $Remote successfully."
      } else {
        Write-Warn "Failed to push tag. Check network/permissions."
      }
    }
  }

  # Final summary
  Write-Host ""
  Write-Host "============================================================" -ForegroundColor Green
  Write-Host "OPERATION COMPLETE" -ForegroundColor Green
  Write-Host "============================================================" -ForegroundColor Green
  Write-Host "Files changed:    $($changedFiles.Count)" -ForegroundColor White
  Write-Host "Branch:           $BRANCH_NAME" -ForegroundColor White  
  Write-Host "Commit:           $commitHash" -ForegroundColor White
  if ($AutoPushCommits) { Write-Host "Branch pushed:    $Remote/$BRANCH_NAME" -ForegroundColor White }
  if ($tagName -and $AutoPushTags) { Write-Host "Tag pushed:       $tagName" -ForegroundColor White }
  Write-Host ""

  # Rollback commands
  Write-Host "ROLLBACK COMMANDS:" -ForegroundColor Yellow
  Write-Host "# Switch back to original branch:" -ForegroundColor Gray
  Write-Host "  git checkout $currentBranch" -ForegroundColor White
  Write-Host "# Delete the feature branch:" -ForegroundColor Gray
  Write-Host "  git branch -D $BRANCH_NAME" -ForegroundColor White
  Write-Host "# Revert the commit (if pushed):" -ForegroundColor Gray
  Write-Host "  git revert $commitHash" -ForegroundColor White
  if ($AutoPushCommits) {
    Write-Host "# Delete remote branch:" -ForegroundColor Gray
    Write-Host "  git push $Remote --delete $BRANCH_NAME" -ForegroundColor White
  }
  if ($tagName -and $AutoPushTags) {
    Write-Host "# Delete remote tag:" -ForegroundColor Gray
    Write-Host "  git push $Remote --delete $tagName" -ForegroundColor White
  }

}
catch {
  Write-Err "Script failed: $($_.Exception.Message)"
  Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
  exit 1
}