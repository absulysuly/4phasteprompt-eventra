#!/bin/bash
set -euo pipefail

# Foundation Protection Guard
# Prevents accidental modifications to critical foundation files
# without explicit approval via PR labels

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

echo "🛡️  Foundation Protection Guard - Starting validation"
echo "Bypass label: ${BYPASS_LABEL}"

# Function to check if file matches protected patterns
is_protected_file() {
  local file="$1"
  for pattern in "${PROTECTED_PATTERNS[@]}"; do
    # Use shell pattern matching for simple wildcards
    case "$file" in
      $pattern*) return 0 ;;  # File is protected
    esac
  done
  return 1  # File is not protected
}

# Function to get changed files from GitHub event
get_changed_files_from_event() {
  if [[ -f "$GITHUB_EVENT_PATH" ]]; then
    echo "📋 Parsing changed files from GitHub event..."
    # Extract files from PR event payload
    jq -r '.pull_request.changed_files[]?.filename // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true
  fi
}

# Function to get changed files via git diff
get_changed_files_from_git() {
  echo "📋 Falling back to git diff to detect changed files..."
  local base_branch="origin/${GITHUB_BASE_REF:-main}"
  
  # Ensure we have the base branch
  git fetch origin "${GITHUB_BASE_REF:-main}" --depth=50 || {
    echo "⚠️  Failed to fetch base branch, using shallow comparison"
    base_branch="HEAD~1"
  }
  
  # Get list of changed files
  git diff --name-only "$base_branch"...HEAD || {
    echo "❌ Failed to determine changed files via git diff"
    return 1
  }
}

# Function to check if PR has bypass label
has_bypass_label() {
  if [[ -f "$GITHUB_EVENT_PATH" ]]; then
    # Check labels in PR event
    local labels
    labels=$(jq -r '.pull_request.labels[]?.name // empty' "$GITHUB_EVENT_PATH" 2>/dev/null || true)
    echo "$labels" | grep -q "^${BYPASS_LABEL}$" && return 0
  fi
  
  # Fallback: no bypass label detected
  return 1
}

# Main validation logic
main() {
  # Skip validation if not in a PR context
  if [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
    echo "ℹ️  Not a pull request - skipping foundation protection"
    exit 0
  fi

  # Get changed files
  changed_files=$(get_changed_files_from_event)
  if [[ -z "$changed_files" ]]; then
    changed_files=$(get_changed_files_from_git)
  fi

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

  # Check for bypass label
  if has_bypass_label; then
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
  echo "      b. Add the '${BYPASS_LABEL}' label to this PR"
  echo "      c. Re-run the workflow"
  echo "   3. If changes are accidental:"
  echo "      a. Revert the changes to protected files"
  echo "      b. Push the fixes to update this PR"
  echo ""
  echo "🛡️  Protected patterns:"
  printf "   - %s\n" "${PROTECTED_PATTERNS[@]}"
  echo ""
  echo "For more information, see: .github/pull_request_template.md"

  exit 1
}

main "$@"