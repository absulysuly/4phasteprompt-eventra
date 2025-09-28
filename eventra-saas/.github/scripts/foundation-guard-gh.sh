#!/bin/bash
set -euo pipefail

# Foundation Protection Guard - GitHub CLI Variant
# NOTE: This version requires the 'cli/gh-action@v2' action to be added to the workflow
# Alternative implementation using GitHub CLI for more reliable PR data access

BYPASS_LABEL="${BYPASS_LABEL:-FOUNDATION-CHANGE-APPROVED}"

# Protected file patterns (relative to repo root)
PROTECTED_PATTERNS=(
  "types.ts"
  "i18n/"
  "config.ts"
  "src/"
  "eventra-saas/"
  "PHASE1_FOUNDATION_PROMPT.md"
  "COMPLETE_6_PHASE_SYSTEM.md"
  "DEPLOYMENT.md"
  "prisma/schema.prisma"
  "prisma/migrations/"
  "middleware.ts"
  "next.config.*"
  "auth.ts"
  "ratelimit.ts"
)

echo "🛡️  Foundation Protection Guard (GitHub CLI) - Starting validation"
echo "Bypass label: ${BYPASS_LABEL}"

# Function to check if file matches protected patterns
is_protected_file() {
  local file="$1"
  for pattern in "${PROTECTED_PATTERNS[@]}"; do
    case "$file" in
      $pattern*) return 0 ;;
    esac
  done
  return 1
}

# Main validation using GitHub CLI
main() {
  # Skip validation if not in a PR context
  if [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
    echo "ℹ️  Not a pull request - skipping foundation protection"
    exit 0
  fi

  # Get PR number from event
  local pr_number
  pr_number=$(jq -r '.pull_request.number' "$GITHUB_EVENT_PATH" 2>/dev/null || echo "")
  
  if [[ -z "$pr_number" ]]; then
    echo "❌ Could not determine PR number from event"
    exit 1
  fi

  echo "📋 Analyzing PR #${pr_number}..."

  # Get changed files using GitHub CLI
  echo "📁 Fetching changed files..."
  local changed_files
  changed_files=$(gh pr view "$pr_number" --json files --jq '.files[].path' 2>/dev/null || {
    echo "❌ Failed to fetch PR files via GitHub CLI"
    exit 1
  })

  if [[ -z "$changed_files" ]]; then
    echo "⚠️  No changed files detected - allowing merge"
    exit 0
  fi

  echo "📁 Changed files detected:"
  echo "$changed_files" | sed 's/^/  - /'

  # Check for protected file changes
  protected_files=()
  while IFS= read -r file; do
    if [[ -n "$file" ]] && is_protected_file "$file"; then
      protected_files+=("$file")
    fi
  done <<< "$changed_files"

  # If no protected files changed, allow merge
  if [[ ${#protected_files[@]} -eq 0 ]]; then
    echo "✅ No protected foundation files modified - validation passed"
    exit 0
  fi

  echo ""
  echo "🚫 PROTECTED FOUNDATION FILES DETECTED:"
  printf "   - %s\n" "${protected_files[@]}"
  echo ""

  # Check for bypass label using GitHub CLI
  echo "🏷️  Checking for bypass label..."
  local labels
  labels=$(gh pr view "$pr_number" --json labels --jq '.labels[].name' 2>/dev/null || {
    echo "❌ Failed to fetch PR labels via GitHub CLI"
    exit 1
  })

  if echo "$labels" | grep -q "^${BYPASS_LABEL}$"; then
    echo "✅ Bypass label '${BYPASS_LABEL}' found - allowing protected file changes"
    echo "⚠️  Please ensure these changes have been reviewed by architecture/security teams"
    exit 0
  fi

  # Block the merge
  echo "❌ FOUNDATION PROTECTION VIOLATION"
  echo ""
  echo "🔧 REMEDIATION STEPS:"
  echo "   1. Review the changed files listed above"
  echo "   2. If changes are intentional and approved:"
  echo "      a. Obtain approval from architecture/security teams"
  echo "      b. Add the '${BYPASS_LABEL}' label to PR #${pr_number}"
  echo "      c. Re-run the workflow"
  echo "   3. If changes are accidental:"
  echo "      a. Revert the changes to protected files"
  echo "      b. Push the fixes to update this PR"
  echo ""
  echo "💡 GitHub CLI command to add bypass label:"
  echo "   gh pr edit ${pr_number} --add-label '${BYPASS_LABEL}'"
  echo ""
  echo "🛡️  Protected patterns:"
  printf "   - %s\n" "${PROTECTED_PATTERNS[@]}"
  echo ""
  echo "For more information, see: .github/pull_request_template.md"

  exit 1
}

main "$@"