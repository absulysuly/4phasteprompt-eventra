#!/usr/bin/env bash
set -euo pipefail

# === CONFIGURE THESE BEFORE RUNNING ===
PROD_REMOTE="origin"
PROD_BRANCH="main"
DEPLOY_COMMIT="<DEPLOY_COMMIT_SHA_TO_REVERT>"   # commit that introduced the bad release
PREVIOUS_RELEASE_COMMIT="<PREVIOUS_GOOD_COMMIT_SHA>" # alternative to revert
DATABASE_URL="${DATABASE_URL:-}"                # must be set in env or export before running
BACKUP_DUMP_FILE="pre-rollback-$(date +%Y%m%d%H%M).dump"  # local dump filename
RDS_SNAPSHOT_ID="<RDS_SNAPSHOT_ID>"             # if using AWS RDS snapshot restore
AWS_REGION="<AWS_REGION>"
RDS_RESTORE_INSTANCE_ID="<NEW_RDS_INSTANCE_ID>" # new instance name when restoring snapshot
FEATURE_FLAG_TOGGLE_URL="<FEATURE_FLAG_API_ENDPOINT>"   # optional: API to disable feature flag
FEATURE_FLAG_API_KEY="<FEATURE_FLAG_API_KEY>"

# === Safety checks ===
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set. Export it and re-run."
  exit 2
fi

echo "=== ROLLBACK SCRIPT (interactive) ==="
echo "This will (choose):"
echo "  1) Revert code (git) to previous release"
echo "  2) Restore DB from dump file or RDS snapshot"
echo "  3) Optionally disable feature flag"
echo
read -p "Continue? Type 'yes' to proceed: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborting."
  exit 0
fi

# === Step A: Code rollback (git) ===
echo
echo "STEP A: Reverting Git release"
echo "Option A1: git revert $DEPLOY_COMMIT (recommended if commit exists)"
echo "Option A2: force push known-good commit ($PREVIOUS_RELEASE_COMMIT) -> $PROD_BRANCH (dangerous)"
read -p "Choose A1 or A2 [A1]: " git_choice
git_choice=${git_choice:-A1}

if [ "$git_choice" = "A1" ]; then
  git fetch "$PROD_REMOTE"
  git checkout -b rollback-temp "$PROD_REMOTE/$PROD_BRANCH"
  git revert --no-edit "$DEPLOY_COMMIT"
  git push "$PROD_REMOTE" HEAD:"$PROD_BRANCH"
  echo "Revert commit pushed to $PROD_BRANCH."
else
  if [ -z "$PREVIOUS_RELEASE_COMMIT" ]; then
    echo "ERROR: PREVIOUS_GOOD_COMMIT_SHA not set. Cannot proceed with A2."
    exit 3
  fi
  git push --force "$PROD_REMOTE" "$PREVIOUS_RELEASE_COMMIT":"$PROD_BRANCH"
  echo "Force-pushed $PREVIOUS_RELEASE_COMMIT to $PROD_BRANCH."
fi

# === Step B: Database restore ===
echo
echo "STEP B: Database restore options:"
echo "  1) Restore from local dump file (pg_restore)"
echo "  2) Restore from AWS RDS snapshot (creates new instance)"
read -p "Choose 1 or 2 [1]: " db_choice
db_choice=${db_choice:-1}

if [ "$db_choice" = "1" ]; then
  echo "Creating a pre-rollback dump for safety..."
  pg_dump --format=custom --file="$BACKUP_DUMP_FILE" "$DATABASE_URL"
  echo "Saved current DB to $BACKUP_DUMP_FILE (you can keep this for debugging)."
  read -p "Provide path to the dump file to restore (or press Enter to restore the file we just created): " restore_file
  restore_file=${restore_file:-$BACKUP_DUMP_FILE}
  echo "Restoring from $restore_file ..."
  pg_restore --clean --no-acl --no-owner --dbname="$DATABASE_URL" "$restore_file"
  echo "DB restore complete."
else
  # RDS snapshot restore (requires aws CLI and permissions)
  if ! command -v aws >/dev/null 2>&1; then
    echo "ERROR: aws CLI not found. Install and configure it before proceeding."
    exit 4
  fi
  if [ -z "$RDS_SNAPSHOT_ID" ] || [ -z "$RDS_RESTORE_INSTANCE_ID" ] || [ -z "$AWS_REGION" ]; then
    echo "ERROR: Set RDS_SNAPSHOT_ID, RDS_RESTORE_INSTANCE_ID, and AWS_REGION before using RDS restore."
    exit 5
  fi
  echo "Restoring RDS snapshot $RDS_SNAPSHOT_ID to new instance $RDS_RESTORE_INSTANCE_ID ..."
  aws rds restore-db-instance-from-db-snapshot \
    --db-instance-identifier "$RDS_RESTORE_INSTANCE_ID" \
    --db-snapshot-identifier "$RDS_SNAPSHOT_ID" \
    --region "$AWS_REGION"
  echo "RDS restore started. Note: this creates a new DB instance. Update DATABASE_URL to point to the new endpoint when available."
  aws rds wait db-instance-available --db-instance-identifier "$RDS_RESTORE_INSTANCE_ID" --region "$AWS_REGION"
  NEW_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier "$RDS_RESTORE_INSTANCE_ID" --region "$AWS_REGION" --query "DBInstances[0].Endpoint.Address" --output text)
  echo "Restored instance endpoint: $NEW_ENDPOINT"
  echo "Update your PROD DATABASE_URL to use this endpoint, then restart app or redeploy."
fi

# === Step C: Disable feature flag (optional) ===
echo
read -p "Disable feature flag now? (y/N): " disable_flag
if [[ "$disable_flag" =~ ^[Yy]$ ]]; then
  if [ -z "$FEATURE_FLAG_TOGGLE_URL" ] || [ -z "$FEATURE_FLAG_API_KEY" ]; then
    echo "FEATURE_FLAG_TOGGLE_URL or FEATURE_FLAG_API_KEY not set. Skipping."
  else
    echo "Toggling feature flag off via API..."
    curl -s -X POST "$FEATURE_FLAG_TOGGLE_URL" \
      -H "Authorization: Bearer $FEATURE_FLAG_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"flagKey":"<FEATURE_FLAG_KEY>","enabled":false}' \
      || echo "Warning: feature-flag toggle may have failed."
    echo "Feature flag API call complete."
  fi
fi

# === Step D: Post-rollback verification ===
echo
echo "STEP D: Post-rollback verification"
read -p "Enter PROD health URL (e.g. https://prod.example.com/health) or press Enter to skip: " PROD_HEALTH
if [ -n "$PROD_HEALTH" ]; then
  echo "Checking health endpoint..."
  if curl -fsS "$PROD_HEALTH"; then
    echo "Health check OK."
  else
    echo "Health check failed. Inspect logs/Sentry immediately."
  fi
fi

echo
echo "Rollback run complete. NEXT STEPS:"
echo " - Monitor logs and error tracking (Sentry/Datadog)."
echo " - Communicate to stakeholders that rollback completed."
echo " - If RDS restore used a new instance, update PROD DATABASE_URL and redeploy only after validation."
echo " - Keep pre-rollback dump ($BACKUP_DUMP_FILE) until all is confirmed stable."