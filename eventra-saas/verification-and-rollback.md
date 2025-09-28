# Verification & Rollback Commands

## Local Validation Commands

### Prerequisites
```bash
# Install required tools
brew install cosign syft trivy  # macOS
# OR
# Linux: see individual tool installation in cosign-keyless-setup.md
```

### 1. SBOM Generation (Local Testing)
```bash
# Generate SBOM for local Docker image
docker build -f Dockerfile.hardened -t test-image:latest .
syft test-image:latest -o json --file local-sbom.json

# View SBOM summary
syft test-image:latest -o table

# Convert SBOM to different formats
syft test-image:latest -o cyclonedx-json --file sbom-cyclonedx.json
syft test-image:latest -o spdx-json --file sbom-spdx.json
```

### 2. Vulnerability Scanning (Local Testing)
```bash
# Scan local image with Trivy
trivy image --severity HIGH,CRITICAL test-image:latest

# Generate SARIF report locally
trivy image --format sarif --output trivy-local.sarif test-image:latest

# Scan with exit codes (fail on findings)
trivy image --severity HIGH,CRITICAL --exit-code 1 test-image:latest

# Scan specific vulnerabilities
trivy image --vuln-type os,library test-image:latest

# Ignore unfixed vulnerabilities
trivy image --ignore-unfixed test-image:latest
```

### 3. Local Image Signing (Testing)
```bash
# Note: This requires local cosign setup with your own keys
# For keyless testing, you need GitHub Actions environment

# Generate test key pair (for local testing only)
cosign generate-key-pair

# Sign with local key (not keyless)
cosign sign --key cosign.key test-image:latest

# Verify with local key
cosign verify --key cosign.pub test-image:latest
```

## Cloud Run Service Management

### Check Current Deployment Status
```bash
# Set your variables
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export SERVICE_NAME="eventra-collector"

# Get current service status
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="yaml"

# List all revisions
gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --format="table(metadata.name,status.conditions[0].type,spec.containers[0].image)"

# Get current traffic allocation
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.traffic[].revisionName,status.traffic[].percent)"
```

### View Service Logs
```bash
# Real-time logs
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
    --project=$PROJECT_ID

# Recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" \
    --project=$PROJECT_ID \
    --limit=50 \
    --format="table(timestamp,severity,textPayload)"

# Error logs only  
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND severity>=ERROR" \
    --project=$PROJECT_ID \
    --limit=20
```

## Rollback Strategies

### 1. Immediate Full Rollback
```bash
# Get the previous revision name
PREVIOUS_REVISION=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --sort-by="~metadata.creationTimestamp" \
    --limit=2 \
    --format="value(metadata.name)" | tail -n1)

echo "Rolling back to: $PREVIOUS_REVISION"

# Route 100% traffic to previous revision
gcloud run services update-traffic $SERVICE_NAME \
    --region=$REGION \
    --to-revisions="$PREVIOUS_REVISION=100"

# Verify rollback
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.traffic[].revisionName,status.traffic[].percent)"
```

### 2. Gradual Rollback (Canary Style)
```bash
# Get current and previous revision names
CURRENT_REVISION=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --sort-by="~metadata.creationTimestamp" \
    --limit=1 \
    --format="value(metadata.name)")

PREVIOUS_REVISION=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --sort-by="~metadata.creationTimestamp" \
    --limit=2 \
    --format="value(metadata.name)" | tail -n1)

echo "Current: $CURRENT_REVISION"
echo "Previous: $PREVIOUS_REVISION"

# Gradual rollback - 10% to new, 90% to previous
gcloud run services update-traffic $SERVICE_NAME \
    --region=$REGION \
    --to-revisions="$CURRENT_REVISION=10,$PREVIOUS_REVISION=90"

# After monitoring, complete rollback if needed
gcloud run services update-traffic $SERVICE_NAME \
    --region=$REGION \
    --to-revisions="$PREVIOUS_REVISION=100"
```

### 3. Emergency Rollback Script
Create `rollback.sh`:
```bash
#!/bin/bash
set -euo pipefail

SERVICE_NAME="eventra-collector"
REGION="us-central1"
PROJECT_ID="your-project-id"

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "================================="

# Get previous revision
PREVIOUS_REVISION=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --sort-by="~metadata.creationTimestamp" \
    --limit=2 \
    --format="value(metadata.name)" | tail -n1)

if [[ -z "$PREVIOUS_REVISION" ]]; then
    echo "❌ No previous revision found!"
    exit 1
fi

echo "Rolling back to: $PREVIOUS_REVISION"

# Execute rollback
gcloud run services update-traffic $SERVICE_NAME \
    --region=$REGION \
    --to-revisions="$PREVIOUS_REVISION=100" \
    --quiet

# Verify
sleep 5
CURRENT_TRAFFIC=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.traffic[].revisionName,status.traffic[].percent)")

echo "✅ ROLLBACK COMPLETE"
echo "Current traffic: $CURRENT_TRAFFIC"

# Test rollback
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo "🧪 Testing rolled back service..."
if curl -f -s "${SERVICE_URL}/api/health" > /dev/null; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed - investigate immediately!"
fi
```

## Image Verification Commands

### Verify Deployed Image Signatures
```bash
# Get currently deployed image URI
DEPLOYED_IMAGE=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(spec.template.spec.template.spec.containers[0].image)")

echo "Deployed image: $DEPLOYED_IMAGE"

# Verify signature
cosign verify $DEPLOYED_IMAGE \
    --certificate-identity-regexp="https://github.com/your-org/your-repo" \
    --certificate-oidc-issuer="https://token.actions.githubusercontent.com"

# View signature details
cosign tree $DEPLOYED_IMAGE

# Download SBOM if attached
cosign download attestation $DEPLOYED_IMAGE --predicate-type=spdxjson
```

### Verify SBOM Attestations
```bash
# Verify SBOM attestation
cosign verify-attestation $DEPLOYED_IMAGE \
    --type spdxjson \
    --certificate-identity-regexp="https://github.com/your-org/your-repo" \
    --certificate-oidc-issuer="https://token.actions.githubusercontent.com"

# Extract and view SBOM
cosign verify-attestation $DEPLOYED_IMAGE \
    --type spdxjson \
    --certificate-identity-regexp="https://github.com/your-org/your-repo" \
    --certificate-oidc-issuer="https://token.actions.githubusercontent.com" | \
    jq -r '.payload' | base64 -d | jq '.predicate'
```

## Health Check & Monitoring

### Comprehensive Health Check Script
Create `health-check.sh`:
```bash
#!/bin/bash
set -euo pipefail

SERVICE_NAME="eventra-collector"
REGION="us-central1"
PROJECT_ID="your-project-id"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="value(status.url)")

echo "🔍 HEALTH CHECK: $SERVICE_URL"
echo "================================"

# Basic health check
echo "1. Testing health endpoint..."
if curl -f -s "${SERVICE_URL}/api/health" | jq -r '.status' | grep -q "ok"; then
    echo "   ✅ Health endpoint responding"
else
    echo "   ❌ Health endpoint failed"
    exit 1
fi

# Response time check
echo "2. Testing response time..."
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "${SERVICE_URL}/api/health")
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    echo "   ✅ Response time: ${RESPONSE_TIME}s"
else
    echo "   ⚠️  Slow response: ${RESPONSE_TIME}s"
fi

# Check for errors in logs
echo "3. Checking recent error logs..."
ERROR_COUNT=$(gcloud logging read \
    "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME AND severity>=ERROR" \
    --project=$PROJECT_ID \
    --format="value(timestamp)" \
    --limit=10 | wc -l)

if [[ $ERROR_COUNT -eq 0 ]]; then
    echo "   ✅ No recent errors"
else
    echo "   ⚠️  Found $ERROR_COUNT recent errors"
fi

echo "✅ Health check complete"
```

## Revision Management

### Delete Old Revisions (Cleanup)
```bash
# List revisions older than 7 days  
gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --filter="metadata.creationTimestamp.date('%Y-%m-%d', Z)<='$(date -d '7 days ago' '+%Y-%m-%d')'" \
    --format="value(metadata.name)"

# Delete specific revision (be careful!)
# gcloud run revisions delete REVISION_NAME --region=$REGION --quiet

# Keep only last 5 revisions (automated cleanup)
REVISIONS_TO_DELETE=$(gcloud run revisions list \
    --service=$SERVICE_NAME \
    --region=$REGION \
    --sort-by="~metadata.creationTimestamp" \
    --format="value(metadata.name)" | tail -n +6)

if [[ -n "$REVISIONS_TO_DELETE" ]]; then
    echo "Cleaning up old revisions: $REVISIONS_TO_DELETE"
    # Uncomment to actually delete:
    # echo "$REVISIONS_TO_DELETE" | xargs -n1 gcloud run revisions delete --region=$REGION --quiet
fi
```

## Performance Monitoring

### Quick Performance Check
```bash
# Check current resource usage
gcloud run services describe $SERVICE_NAME \
    --region=$REGION \
    --format="yaml(spec.template.spec.template.spec.containers[0].resources)"

# Check current instance count
gcloud monitoring metrics list --project=$PROJECT_ID --filter="displayName:'Instance count'"

# Get metrics (requires monitoring API)
gcloud logging metrics list --project=$PROJECT_ID
```

Make these scripts executable:
```bash
chmod +x rollback.sh health-check.sh
```

## Emergency Contact Checklist

When issues occur:
1. ✅ Run health check script
2. ✅ Check service logs  
3. ✅ Verify image signatures
4. ✅ Execute rollback if needed
5. ✅ Notify team via Slack/email
6. ✅ Document incident in runbook
7. ✅ Schedule post-mortem if critical