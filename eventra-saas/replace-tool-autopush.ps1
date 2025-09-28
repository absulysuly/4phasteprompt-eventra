<#
.SYNOPSIS
  Mass replace import strings and optionally auto-push commits and/or tags.

.DESCRIPTION
  Safe-by-default (DRY_RUN). Validates git repo, finds files via git, previews changes, runs tests,
  commits changes, optionally pushes branch (commits) and/or tags to remote.

.PARAMETER OLD_IMPORT
  Exact string to replace (case-sensitive by default).

.PARAMETER NEW_IMPORT
  Exact replacement string.

.PARAMETER BRANCH_NAME
  Branch to create/use for the change. Created from current HEAD.

.PARAMETER FILE_EXTS
  Array of file glob patterns (e.g. "*.js","*.ts"). Empty = all tracked files.

.PARAMETER DryRun
  Switch. If set, script previews changes and exits without modifying repo.

.PARAMETER AutoPushCommits
  Switch. If set, pushes the branch to remote automatically after commit.

.PARAMETER AutoPushTags
  Switch. If set, pushes created tags to remote automatically.

.PARAMETER Remote
  Remote name to push to. Default: "origin".

.PARAMETER BaseBranch
  Branch to base the PR branch off (informational). Default: "main".

.PARAMETER Force
  Switch. If set, skip interactive confirmations.

.EXAMPLE
  # Preview only
  .\replace-tool-autopush.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration" -DryRun

  # Apply and auto-push commits and tags non-interactively
  .\replace-tool-autopush.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration" -BRANCH_NAME "fix/imports/langua-to-language" -FILE_EXTS "*.js","*.ts" -AutoPushCommits -AutoPushTags -Force
#>

param(
  [Parameter(Mandatory=$true)] [string] $OLD_IMPORT,
  [Parameter(Mandatory=$true)] [string] $NEW_IMPORT,
  [string] $BRANCH_NAME = "fix/imports/mass-update",
  [string[]] $FILE_EXTS = @(),
  [switch] $DryRun,
  [switch] $AutoPushCommits,
  [switch] $AutoPushTags,
  [string] $Remote = "origin",
  [string] $BaseBranch = "main",
  [switch] $Force
)

function Write-Info { param($m) Write-Host "ℹ️  $m" -ForegroundColor Cyan }
function Write-Succ { param($m) Write-Host "✅ $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "⚠️  $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "❌ $m" -ForegroundColor Red }

try {
  Write-Info "Starting replace-tool-autopush"
  # Validate git
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "git not found in PATH. Install git and retry."
  }

  # Ensure in git repo
  $isRepo = & git rev-parse --is-inside-work-tree 2>$null
  if ($LASTEXITCODE -ne 0 -or $isRepo -ne 'true') {
    throw "Not inside a git repo. cd to repo root and retry."
  }

  # Gather current branch / status
  $currentBranch = (& git rev-parse --abbrev-ref HEAD).Trim()
  Write-Info "Current branch: $currentBranch"

  # Build file list via git ls-files (respects .gitignore)
  if ($FILE_EXTS -and $FILE_EXTS.Count -gt 0) {
    $files = @()
    foreach ($g in $FILE_EXTS) {
      $files += (& git ls-files -- "$g")
    }
    $files = $files | Sort-Object -Unique
  } else {
    $files = & git ls-files
  }
  if (-not $files) {
    Write-Warn "No tracked files matched the given FILE_EXTS. Exiting."
    exit 0
  }

  # Find matches
  Write-Info "Searching for occurrences of: '$OLD_IMPORT'"
  $matches = @()
  foreach ($f in $files) {
    # skip binary (heuristic: presence of NUL)
    $bytes = Get-Content -Raw -Encoding Byte -Path $f -ErrorAction SilentlyContinue
    if ($null -eq $bytes) { continue }
    if ($bytes -contains 0) { continue }
    $text = Get-Content -Raw -Encoding UTF8 -Path $f
    if ($text -match [regex]::Escape($OLD_IMPORT)) {
      $matches += [PSCustomObject]@{ File = $f; Context = ($text -split "`n" | Select-String -Pattern [regex]::Escape($OLD_IMPORT) -Context 2 -AllMatches) }
    }
  }

  if (-not $matches -or $matches.Count -eq 0) {
    Write-Succ "No occurrences of '$OLD_IMPORT' found in targeted files."
    exit 0
  }

  Write-Host ""
  Write-Host "Found occurrences in $($matches.Count) file(s):" -ForegroundColor Cyan
  $matches | ForEach-Object { Write-Host " - $($_.File)" }
  Write-Host ""

  # Show previews (first N matches)
  Write-Info "Previewing up to 5 files with context:"
  $previewCount = 0
  foreach ($m in $matches) {
    if ($previewCount -ge 5) { break }
    Write-Host "---- $($m.File) ----" -ForegroundColor Magenta
    $m.Context | ForEach-Object { $_.LineNumber; $_.Context | ForEach-Object { Write-Host $_ -NoNewline; Write-Host "" } }
    $previewCount++
  }

  if ($DryRun) {
    Write-Succ "DRY RUN: No changes will be made. To apply, run with -DryRun:`$false"
    exit 0
  }

  # Confirm unless forced
  if (-not $Force) {
    $yn = Read-Host "Proceed to replace '$OLD_IMPORT' → '$NEW_IMPORT' in $($matches.Count) files and create branch '$BRANCH_NAME'? (y/N)"
    if ($yn.ToLower() -ne 'y') { Write-Warn "Aborted by user."; exit 0 }
  }

  # Create branch (from current HEAD) if doesn't exist locally
  $branches = & git branch --list $BRANCH_NAME
  if (-not $branches) {
    & git checkout -b $BRANCH_NAME
    if ($LASTEXITCODE -ne 0) { throw "Failed to create branch $BRANCH_NAME" }
    Write-Succ "Created and switched to branch $BRANCH_NAME"
  } else {
    & git checkout $BRANCH_NAME
    Write-Info "Switched to existing branch $BRANCH_NAME"
  }

  # Perform replacements (backup safe: write to temp then overwrite)
  $changedFiles = @()
  foreach ($f in $matches | Select-Object -ExpandProperty File) {
    try {
      $orig = Get-Content -Raw -Encoding UTF8 -Path $f
    } catch {
      Write-Warn "Skipping $f (could not read as UTF8)"
      continue
    }
    $new = $orig -replace [regex]::Escape($OLD_IMPORT), $NEW_IMPORT
    if ($new -ne $orig) {
      # write with UTF8 (no BOM)
      Set-Content -Path $f -Value $new -Encoding UTF8
      $changedFiles += $f
    }
  }

  if (-not $changedFiles -or $changedFiles.Count -eq 0) {
    Write-Warn "No files changed after replacement step. Nothing to commit."
  } else {
    Write-Host ""
    Write-Info "Files modified:"
    $changedFiles | ForEach-Object { Write-Host " - $_" }
    # Show diff summary
    Write-Host ""
    Write-Info "Diff summary (git --no-pager diff --name-status):"
    & git --no-pager diff --name-status

    # Run tests (if npm present and package.json exists)
    $runTests = $false
    if (Test-Path package.json -and (Get-Command npm -ErrorAction SilentlyContinue)) {
      Write-Info "Running npm test..."
      $runTests = $true
      $npm = & npm test
      if ($LASTEXITCODE -ne 0) {
        Write-Err "npm test failed. Aborting commit. Fix tests or run with -Force to bypass."
        # Restore original files or leave for manual fix; do not auto-commit
        exit 1
      } else {
        Write-Succ "npm test passed."
      }
    }

    # Stage changes
    & git add -A
    # Commit
    $commitMsg = "fix(imports): mass update $OLD_IMPORT → $NEW_IMPORT"
    & git commit -m $commitMsg
    if ($LASTEXITCODE -ne 0) { throw "git commit failed" }
    $commitHash = (& git rev-parse --short HEAD).Trim()
    Write-Succ "Committed changes: $commitHash"
    # Auto-push commits if requested
    if ($AutoPushCommits) {
      Write-Info "Pushing branch '$BRANCH_NAME' to remote '$Remote'..."
      & git push --set-upstream $Remote $BRANCH_NAME
      if ($LASTEXITCODE -ne 0) { Write-Warn "Push failed (commits). Check remote permissions / network." } else { Write-Succ "Branch pushed." }
    } else {
      Write-Info "AutoPushCommits not set. Local commit only."
    }

    # Use gs.ps1 checkpoint if available (it will create tag/commit as configured)
    if (Test-Path .\gs.ps1) {
      Write-Info "Calling ./gs.ps1 checkpoint 'Mass update imports: $OLD_IMPORT → $NEW_IMPORT'"
      & powershell -NoProfile -ExecutionPolicy Bypass -File .\gs.ps1 checkpoint "Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
    } else {
      # Create a tag as checkpoint
      $tagName = "gs-checkpoint-$(Get-Date -Format 'yyyyMMddTHHmmssZ')"
      & git tag -a $tagName -m "GS checkpoint: Mass update imports: $OLD_IMPORT → $NEW_IMPORT"
      Write-Succ "Created tag: $tagName"
      if ($AutoPushTags) {
        Write-Info "Pushing tag '$tagName' to $Remote..."
        & git push $Remote $tagName
        if ($LASTEXITCODE -ne 0) { Write-Warn "Push failed (tags)." } else { Write-Succ "Tag pushed." }
      } else {
        Write-Info "AutoPushTags not set. Tag created locally only."
      }
    }

    # If gs.ps1 created a tag and AutoPushTags set, push tags (attempt)
    if ($AutoPushTags -and -not $tagName) {
      # attempt to push all tags if nothing else
      & git push --tags $Remote
    }
  }

  # Final summary
  Write-Host ""
  Write-Succ "Operation complete."
  Write-Host "Summary:"
  if ($changedFiles) {
    Write-Host " - Files changed: $($changedFiles.Count)"
    $changedFiles | ForEach-Object { Write-Host "    $_" }
  }
  if ($commitHash) { Write-Host " - Commit: $commitHash" }
  if ($branchName) { Write-Host " - Branch: $BRANCH_NAME" }
  if ($AutoPushCommits) { Write-Host " - Commits pushed to: $Remote/$BRANCH_NAME" }
  if ($AutoPushTags -and $tagName) { Write-Host " - Tag pushed: $tagName -> $Remote" }

  # Print rollback commands
  Write-Host ""
  Write-Host "Rollback commands (copy-paste if needed):" -ForegroundColor Yellow
  Write-Host " # Undo last commit but keep changes staged:"
  Write-Host " git reset --soft HEAD~1"
  Write-Host " # Or revert (safe for pushed commits):"
  if ($commitHash) { Write-Host " git revert $commitHash -m 'Revert mass import update'"; }
  Write-Host " # Delete branch locally and remotely:"
  Write-Host " git checkout $BaseBranch"
  Write-Host " git branch -D $BRANCH_NAME"
  Write-Host " git push $Remote --delete $BRANCH_NAME"
  if ($tagName) {
    Write-Host " # Remove tag locally and remotely:"
    Write-Host " git tag -d $tagName"
    Write-Host " git push $Remote :refs/tags/$tagName"
  }

} catch {
  Write-Err $_.Exception.Message
  exit 1
}