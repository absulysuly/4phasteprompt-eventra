# GitHub Repository Configuration & Secrets

## Required Repository Secrets

Navigate to `Settings > Secrets and variables > Actions > Repository secrets` and add these secrets:

### Core GCP Configuration
```bash
GCP_PROJECT
# Value: your-gcp-project-id
# Description: Your Google Cloud Project ID

GCP_REGION  
# Value: us-central1
# Description: GCP region for Cloud Run deployment

ARTIFACT_REGISTRY_LOCATION
# Value: us-central1
# Description: Location of your Artifact Registry (usually same as GCP_REGION)

REPO
# Value: eventra-images
# Description: Name of your Artifact Registry repository
```

### Workload Identity Federation
```bash
WORKLOAD_IDENTITY_PROVIDER
# Value: projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
# Description: Full path to your Workload Identity Provider (get from GCP setup commands)

SERVICE_ACCOUNT_EMAIL
# Value: github-actions-deploy@your-project-id.iam.gserviceaccount.com
# Description: Email of the service account for GitHub Actions
```

### Optional Secrets (if needed)
```bash
SMOKE_API_KEY
# Value: your-api-key-for-testing
# Description: API key for smoke test authentication (if your API requires it)

DATABASE_URL
# Value: your-database-connection-string
# Description: Database connection for runtime (consider using Secret Manager instead)
```

## Get Secret Values from GCP

Run these commands to get the exact values for your secrets:

```bash
# Set your project ID first
export PROJECT_ID="your-actual-project-id"

# Get project number
echo "Project Number: $(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')"

# Get Workload Identity Provider path
echo "WORKLOAD_IDENTITY_PROVIDER: projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"

# Get service account email
echo "SERVICE_ACCOUNT_EMAIL: github-actions-deploy@$PROJECT_ID.iam.gserviceaccount.com"

# Get your current region setting
echo "GCP_REGION: $(gcloud config get-value compute/region)"
```

## Environment Protection Rules

### Create Production Environment
1. Go to `Settings > Environments`
2. Click "New environment" 
3. Name: `production`
4. Configure protection rules:

```yaml
Protection Rules:
✅ Required reviewers: 1-2 people
✅ Wait timer: 0 minutes (or 5 for extra caution)
✅ Deployment branches: Selected branches only
   - main
✅ Prevent self-review: true
```

### Environment Variables (Optional)
Set these in the `production` environment if you want environment-specific values:
```bash
NODE_ENV=production
LOG_LEVEL=info
HEALTH_CHECK_PATH=/api/health
```

## Branch Protection Rules

Go to `Settings > Branches` and add protection for the `main` branch:

```yaml
Branch Protection Rules for 'main':
✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale PR approvals when new commits are pushed
  ✅ Require review from code owners (if you have CODEOWNERS file)
  ✅ Restrict pushes that create new files

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Required status checks:
  - Build, Scan & Deploy / deploy (production)

✅ Require conversation resolution before merging

✅ Require signed commits (recommended)

✅ Require linear history (recommended)

✅ Do not allow bypassing the above settings
  ✅ Restrict pushes that create new files
  
Admin Settings:
❌ Allow force pushes (keep disabled)
❌ Allow deletions (keep disabled)
```

## Workflow Permissions

The workflow is already configured with minimal permissions, but verify these settings:

Go to `Settings > Actions > General`:

```yaml
Workflow permissions:
○ Read repository contents and packages permissions (recommended)
● Restricted permissions (already configured in workflow YAML)

Actions permissions:
● Allow all actions and reusable workflows
○ Allow actions created by GitHub
○ Allow specified actions and reusable workflows

Fork pull request workflows:
○ Run workflows from fork pull requests (disable for security)
● Send write tokens to workflows from fork pull requests (disable)
```

## Repository-level Security Settings

### Code Security and Analysis
Go to `Settings > Security & analysis`:

```yaml
Security features:
✅ Dependency graph
✅ Dependabot alerts  
✅ Dependabot security updates
✅ Dependabot version updates (create dependabot.yml)
✅ Code scanning (GitHub CodeQL)
✅ Secret scanning
✅ Push protection for secrets

Advanced security:
✅ Secret scanning push protection
```

### Create Dependabot Configuration
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 5
    reviewers:
      - "your-username"
    assignees:
      - "your-username"
    commit-message:
      prefix: "chore"
      prefix-development: "chore"
      include: "scope"

  - package-ecosystem: "github-actions"
    directory: "/.github/workflows"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 3
```

## Remove Old Secrets (Migration)

If migrating from key-based cosign, **SAFELY** remove these old secrets:

### Before Removal - Verification Steps:
1. ✅ New keyless workflow runs successfully
2. ✅ Image signatures verify correctly  
3. ✅ Smoke tests pass
4. ✅ Rollback tested and working

### Safe Removal Process:
```bash
# Old cosign secrets that are no longer needed:
COSIGN_PRIVATE_KEY     # ❌ DELETE after keyless verification works
COSIGN_PUBLIC_KEY      # ❌ DELETE after keyless verification works  
COSIGN_PASSWORD        # ❌ DELETE after keyless verification works

# Old GCP secrets that are replaced by Workload Identity:
GCP_SA_KEY             # ❌ DELETE after OIDC authentication works
GOOGLE_CREDENTIALS     # ❌ DELETE after OIDC authentication works
```

### Migration Steps:
1. **Keep both** old and new secrets initially
2. Deploy with new keyless approach first
3. Test thoroughly in staging
4. Once confident, remove old secrets
5. **Document the change** in your team's runbook

## CODEOWNERS File (Recommended)

Create `.github/CODEOWNERS`:
```bash
# Global owners
* @your-username

# Workflow and CI/CD files require additional review
/.github/workflows/ @devops-team @your-username
/Dockerfile* @devops-team @your-username
/gcp-setup-commands.md @devops-team
/cosign-keyless-setup.md @devops-team

# Security-sensitive files
/.github/dependabot.yml @security-team @your-username
/trivy.yml @security-team
```

## Notification Setup (Optional)

### Slack Integration
Set up GitHub + Slack integration for deployment notifications:
1. Install GitHub app in Slack workspace
2. Configure notifications for:
   - Deployment success/failure
   - Security alerts
   - PR reviews needed

### Email Notifications
Configure email notifications in `Settings > Notifications` for:
- Security alerts
- Workflow failures
- Dependabot alerts

## Repository Topics and Description

Update repository metadata:
```yaml
Description: "Eventra SaaS Platform - Secure Cloud Run deployment with keyless cosign"

Topics:
- nextjs
- typescript  
- cloud-run
- cosign
- sigstore
- gcp
- oidc
- security
- sbom
- container-security
- eventra
- ci-cd
```

## Required Repository Files

Ensure these files exist in your repository:
```bash
✅ .github/workflows/deploy-cloudrun-oidc.yml
✅ .github/scripts/smoke-test.sh (already exists)
✅ .github/dependabot.yml
✅ .github/CODEOWNERS
✅ Dockerfile.hardened (you need to create this)
✅ README.md (with deployment instructions)
✅ gcp-setup-commands.md (created)
✅ cosign-keyless-setup.md (created)
```

## Quick Setup Checklist

Copy and check off each item:
- [ ] All repository secrets added with correct values
- [ ] Production environment created with protection rules
- [ ] Branch protection enabled for main branch  
- [ ] Required status checks configured
- [ ] Dependabot configuration added
- [ ] CODEOWNERS file created
- [ ] Security features enabled
- [ ] Old secrets removed (after testing)
- [ ] Team members added as reviewers
- [ ] Documentation updated with new process