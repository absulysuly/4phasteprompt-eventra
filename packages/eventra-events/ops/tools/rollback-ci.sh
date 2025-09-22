#!/usr/bin/env bash
set -euo pipefail

# Usage Examples:
# Dry run: ./rollback-ci.sh --deploy-commit abc123 --db-method dump --dry-run
# Revert commit: ./rollback-ci.sh --deploy-commit abc123 --db-method dump --restore-file /backups/good.dump
# Force push: ./rollback-ci.sh --previous-commit def456 --git-remote origin --force
# RDS restore: ./rollback-ci.sh --deploy-commit abc123 --db-method rds --aws-snapshot-id snap-123 --rds-instance-id restored-001 --aws-region us-east-1

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --deploy-commit <sha>         Commit SHA to revert (required for code revert)
  --previous-commit <sha>       Known-good commit to force-push instead of revert (mutually exclusive)
  --git-remote <remote>         Git remote (default: origin)
  --git-branch <branch>         Prod branch (default: main)

  --db-method <dump|rds>        DB restore method (default: dump)
  --restore-file <path>         Dump file to restore (for dump method)
  --aws-snapshot-id <id>        RDS snapshot id (for rds method)
  --rds-instance-id <id>        New RDS instance id to create (for rds method)
  --aws-region <region>         AWS region (required for rds method)

  --feature-api-url <url>       Feature flag toggle API endpoint (optional)
  --feature-api-key <key>       API key for feature flag API (optional)
  --feature-flag-key <key>      Flag key to disable (optional)

  --prod-health-url <url>       Prod health endpoint to validate after rollback (optional)

  --dry-run                     Do not perform destructive actions; print steps only
  --force                       Skip confirmation prompt (use carefully)
  -h, --help                    Show this message

Environment:
  DATABASE_URL must be set for dump restore method.
EOF
  exit 1
}

# Defaults
GIT_REMOTE="origin"
GIT_BRANCH="main"
DB_METHOD="dump"
DRY_RUN=false
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --deploy-commit) DEPLOY_COMMIT="$2"; shift 2;;
    --previous-commit) PREVIOUS_COMMIT="$2"; shift 2;;
    --git-remote) GIT_REMOTE="$2"; shift 2;;
    --git-branch) GIT_BRANCH="$2"; shift 2;;
    --db-method) DB_METHOD="$2"; shift 2;;
    --restore-file) RESTORE_FILE="$2"; shift 2;;
    --aws-snapshot-id) RDS_SNAPSHOT_ID="$2"; shift 2;;
    --rds-instance-id) RDS_RESTORE_INSTANCE_ID="$2"; shift 2;;
    --aws-region) AWS_REGION="$2"; shift 2;;
    --feature-api-url) FEATURE_FLAG_TOGGLE_URL="$2"; shift 2;;
    --feature-api-key) FEATURE_FLAG_API_KEY="$2"; shift 2;;
    --feature-flag-key) FEATURE_FLAG_KEY="$2"; shift 2;;
    --prod-health-url) PROD_HEALTH="$2"; shift 2;;
    --dry-run) DRY_RUN=true; shift;;
    --force) FORCE=true; shift;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1"; usage;;
  esac
done

# Safety validation
if [ "${DB_METHOD:-}" = "dump" ] && [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL must be set for dump restore method." >&2
  exit 2
fi

if [ "${DB_METHOD:-}" = "rds" ]; then
  if [ -z "${RDS_SNAPSHOT_ID:-}" ] || [ -z "${RDS_RESTORE_INSTANCE_ID:-}" ] || [ -z "${AWS_REGION:-}" ]; then
    echo "ERROR: For rds method set --aws-snapshot-id, --rds-instance-id and --aws-region." >&2
    exit 3
  fi
fi

if [ -z "${DEPLOY_COMMIT:-}" ] && [ -z "${PREVIOUS_COMMIT:-}" ]; then
  echo "ERROR: Provide --deploy-commit or --previous-commit to revert or force-push." >&2
  exit 4
fi

if [ -n "${DEPLOY_COMMIT:-}" ] && [ -n "${PREVIOUS_COMMIT:-}" ]; then
  echo "ERROR: Use either --deploy-commit (revert) or --previous-commit (force), not both." >&2
  exit 5
fi

echo "=== ROLLBACK-CI SCRIPT ==="
echo "Mode: ${DRY_RUN:+DRY-RUN }${FORCE:+ FORCED }"

if [ "$DRY_RUN" = false ] && [ "$FORCE" = false ]; then
  read -p "Confirm proceed with rollback actions? Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborting."
    exit 0
  fi
fi

# Helper to run or echo commands
run() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] $*"
  else
    echo "[RUN] $*"
    eval "$@"
  fi
}

# Step A: Code rollback
if [ -n "${DEPLOY_COMMIT:-}" ]; then
  echo "STEP A: Reverting commit $DEPLOY_COMMIT on $GIT_REMOTE/$GIT_BRANCH"
  run "git fetch $GIT_REMOTE"
  run "git checkout -b rollback-temp $GIT_REMOTE/$GIT_BRANCH"
  run "git revert --no-edit $DEPLOY_COMMIT"
  run "git push $GIT_REMOTE HEAD:$GIT_BRANCH"
else
  echo "STEP A: Force-push previous commit $PREVIOUS_COMMIT to $GIT_REMOTE/$GIT_BRANCH"
  run "git push --force $GIT_REMOTE $PREVIOUS_COMMIT:$GIT_BRANCH"
fi

# Step B: Database restore
if [ "$DB_METHOD" = "dump" ]; then
  BACKUP_FILE="pre-rollback-$(date +%Y%m%d%H%M).dump"
  echo "STEP B: Creating pre-rollback dump to $BACKUP_FILE"
  run "pg_dump --format=custom --file=\"$BACKUP_FILE\" \"$DATABASE_URL\""
  RESTORE_FILE="${RESTORE_FILE:-$BACKUP_FILE}"
  echo "Restoring DB from $RESTORE_FILE"
  run "pg_restore --clean --no-acl --no-owner --dbname=\"$DATABASE_URL\" \"$RESTORE_FILE\""
else
  echo "STEP B: Restoring RDS snapshot $RDS_SNAPSHOT_ID to $RDS_RESTORE_INSTANCE_ID in $AWS_REGION"
  run "aws rds restore-db-instance-from-db-snapshot --db-instance-identifier \"$RDS_RESTORE_INSTANCE_ID\" --db-snapshot-identifier \"$RDS_SNAPSHOT_ID\" --region \"$AWS_REGION\""
  run "aws rds wait db-instance-available --db-instance-identifier \"$RDS_RESTORE_INSTANCE_ID\" --region \"$AWS_REGION\""
  if [ "$DRY_RUN" = false ]; then
    NEW_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "$RDS_RESTORE_INSTANCE_ID" --region "$AWS_REGION" --query "DBInstances[0].Endpoint.Address" --output text)
    echo "New RDS endpoint: $NEW_ENDPOINT"
    echo "IMPORTANT: Update DATABASE_URL to use $NEW_ENDPOINT before redeploying."
  fi
fi

# Step C: Feature flag toggle (optional)
if [ -n "${FEATURE_FLAG_TOGGLE_URL:-}" ] && [ -n "${FEATURE_FLAG_KEY:-}" ] && [ -n "${FEATURE_FLAG_API_KEY:-}" ]; then
  echo "STEP C: Disabling feature flag $FEATURE_FLAG_KEY"
  run "curl -s -X POST \"$FEATURE_FLAG_TOGGLE_URL\" -H \"Authorization: Bearer $FEATURE_FLAG_API_KEY\" -H \"Content-Type: application/json\" -d '{\"flagKey\":\"$FEATURE_FLAG_KEY\",\"enabled\":false}' || true"
else
  echo "STEP C: Feature flag toggle skipped (missing parameters)."
fi

# Step D: Post-rollback health check
if [ -n "${PROD_HEALTH:-}" ]; then
  echo "STEP D: Checking PROD health at $PROD_HEALTH"
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY-RUN] curl -fsS \"$PROD_HEALTH\""
  else
    if curl -fsS "$PROD_HEALTH"; then
      echo "Health check OK."
    else
      echo "Health check FAILED. Inspect logs/Sentry."
      exit 6
    fi
  fi
else
  echo "STEP D: No health endpoint provided; skip health check."
fi

echo "Rollback script completed. Monitor logs, Sentry, and inform stakeholders."