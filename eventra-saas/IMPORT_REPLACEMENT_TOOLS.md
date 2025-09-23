# Mass Import Replacement Tools

This directory contains several PowerShell scripts for safely performing mass import replacements across your codebase with git integration and checkpointing.

## Available Scripts

### 1. `mass-replace-final.ps1` (RECOMMENDED)
**Enhanced version with auto-push capabilities and full Windows PowerShell 5.1 compatibility**

#### Features:
- ✅ **Safe by default** - DRY_RUN mode prevents accidental changes
- ✅ **Advanced parameter handling** - Proper PowerShell parameter validation
- ✅ **Auto-push capabilities** - Optional automatic pushing of commits and tags
- ✅ **Binary file detection** - Skips binary files automatically
- ✅ **Enhanced preview** - Shows line numbers and context for matches
- ✅ **Comprehensive rollback** - Provides exact commands to undo all changes
- ✅ **Git session integration** - Works with `gs.ps1` helper
- ✅ **Test execution** - Runs npm tests before committing
- ✅ **Force mode** - Skip interactive confirmations for CI/automation

#### Basic Usage:
```powershell
# Preview changes only (SAFE)
.\mass-replace-final.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration" -DryRun

# Apply changes manually
.\mass-replace-final.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration"

# Apply changes with auto-push (non-interactive)
.\mass-replace-final.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration" -AutoPushCommits -AutoPushTags -Force
```

#### Advanced Usage:
```powershell
# Custom branch and file extensions
.\mass-replace-final.ps1 -OLD_IMPORT "old-import" -NEW_IMPORT "new-import" -BRANCH_NAME "feature/update-imports" -FILE_EXTS "*.jsx","*.tsx" -AutoPushCommits

# CI/automation mode (no prompts)
.\mass-replace-final.ps1 -OLD_IMPORT "oldText" -NEW_IMPORT "newText" -Force -AutoPushCommits -AutoPushTags
```

### 2. `replace-tool.ps1` 
**Basic version for simple use cases**

Simple, reliable script without advanced features:
```powershell
.\replace-tool.ps1 -OLD "OLD_TEXT" -NEW "NEW_TEXT" -DRY_RUN $true
```

### 3. `gs.ps1`
**Git Session Helper**

Provides session management and checkpointing:
```powershell
.\gs.ps1 start                           # Start new session
.\gs.ps1 checkpoint "description"        # Create checkpoint
.\gs.ps1 status                         # Show session status
```

## Safety Features

### Default Safety
- **DRY_RUN mode is default** - Always previews before making changes
- **Interactive confirmation** - Asks before applying changes (unless -Force)
- **Binary file detection** - Automatically skips binary files
- **Test execution** - Runs `npm test` before committing if available
- **Git validation** - Ensures you're in a valid git repository

### Rollback Options
Every script provides exact rollback commands:
```powershell
# Switch back to original branch
git checkout main

# Delete the feature branch
git branch -D fix/imports/mass-update

# Revert the commit (safe for pushed commits)
git revert abc1234

# Delete remote branch (if pushed)
git push origin --delete fix/imports/mass-update
```

## Workflow Integration

### With Git Session Helper (`gs.ps1`)
If `gs.ps1` is present, the scripts will:
1. Start a new session if none exists
2. Create checkpoint after successful commit
3. Integrate with your existing git session workflow

### Without Git Session Helper
The scripts will:
1. Create timestamped tags as checkpoints
2. Optionally push tags to remote (with -AutoPushTags)
3. Provide manual rollback commands

## File Extension Targeting

Default extensions: `*.js`, `*.ts`, `*.tsx`

Custom extensions:
```powershell
-FILE_EXTS "*.jsx","*.vue","*.ts"  # Specific extensions
-FILE_EXTS @()                     # All tracked files
```

## Automation & CI Integration

### CI-Friendly Mode:
```powershell
.\mass-replace-final.ps1 -OLD_IMPORT "old" -NEW_IMPORT "new" -Force -AutoPushCommits -AutoPushTags
```

### Parameters for Automation:
- `-Force` - Skip all interactive prompts
- `-AutoPushCommits` - Automatically push branch to remote
- `-AutoPushTags` - Automatically push tags to remote  
- `-Remote "origin"` - Specify remote name (default: "origin")
- `-BaseBranch "main"` - Specify base branch for reference (default: "main")

## Examples

### Simple Import Fix:
```powershell
# Preview
.\mass-replace-final.ps1 -OLD_IMPORT "import { Button }" -NEW_IMPORT "import Button" -DryRun

# Apply
.\mass-replace-final.ps1 -OLD_IMPORT "import { Button }" -NEW_IMPORT "import Button"
```

### Package Name Change:
```powershell
.\mass-replace-final.ps1 -OLD_IMPORT "@old/package" -NEW_IMPORT "@new/package" -BRANCH_NAME "fix/package-rename" -AutoPushCommits
```

### Typo Fix Across Codebase:
```powershell
.\mass-replace-final.ps1 -OLD_IMPORT "LanguaGeneration" -NEW_IMPORT "LanguageGeneration" -Force -AutoPushCommits
```

## Best Practices

1. **Always run with -DryRun first** to preview changes
2. **Use descriptive branch names** that explain the change
3. **Test the replacement** on a small subset first for complex changes
4. **Keep the old/new strings specific** to avoid unintended replacements
5. **Review the diff output** before confirming changes
6. **Use -Force only in CI/automation** contexts where you've tested the command

## Troubleshooting

### Common Issues:
- **"Not in a git repo"** - Ensure you're in the repository root directory
- **"No matches found"** - Verify the OLD_IMPORT string is exact (case-sensitive)
- **"Tests failed"** - Fix failing tests before the script will commit changes
- **"Push failed"** - Check network connectivity and git remote permissions

### Getting Help:
```powershell
Get-Help .\mass-replace-final.ps1 -Full
```

## Security Notes

- Scripts never modify files outside the git repository
- Binary files are automatically detected and skipped
- All operations are logged and reversible
- Remote operations (push) require explicit flags (-AutoPushCommits, -AutoPushTags)
- Credentials must be configured separately (git config, SSH keys, etc.)