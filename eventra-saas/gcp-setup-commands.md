# GCP Setup Commands for Workload Identity Federation & Keyless Cosign

## Prerequisites
```bash
# Ensure you're logged in and have the necessary APIs enabled
gcloud auth login
gcloud config set project {{PROJECT_ID}}

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com \
    sts.googleapis.com
```

## Step 1: Create Artifact Registry Repository
```bash
# Create repository for container images
gcloud artifacts repositories create {{REPO_NAME}} \
    --repository-format=docker \
    --location={{REGION}} \
    --description="Eventra collector service container registry"
```

## Step 2: Create Service Account for Cloud Run
```bash
# Create service account for the Cloud Run service
gcloud iam service-accounts create collector-sa \
    --display-name="Eventra Collector Service Account" \
    --description="Service account for Eventra collector Cloud Run service"

# Grant minimal runtime permissions
gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:collector-sa@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:collector-sa@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:collector-sa@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:collector-sa@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/monitoring.metricWriter"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:collector-sa@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/trace.agent"
```

## Step 3: Create Deployment Service Account for CI/CD
```bash
# Create service account for GitHub Actions deployment
gcloud iam service-accounts create github-actions-deploy \
    --display-name="GitHub Actions Deploy Service Account" \
    --description="Service account for GitHub Actions CI/CD pipeline"

# Grant deployment permissions (minimal roles)
gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

# Additional permission for keyless cosign (Sigstore/Fulcio integration)
gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/cloudkms.signerVerifier"
```

## Step 4: Set up Workload Identity Federation
```bash
# Create Workload Identity Pool
gcloud iam workload-identity-pools create github-actions-pool \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --description="Workload Identity Pool for GitHub Actions"

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc github-actions-provider \
    --workload-identity-pool="github-actions-pool" \
    --location="global" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
    --attribute-condition="assertion.repository_owner=='{{GITHUB_ORG_OR_USER}}'"

# Get the full provider name (needed for GitHub secrets)
gcloud iam workload-identity-pools providers describe github-actions-provider \
    --workload-identity-pool="github-actions-pool" \
    --location="global" \
    --format="value(name)"

# This will output something like:
# projects/{{PROJECT_NUMBER}}/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
```

## Step 5: Allow GitHub Actions to impersonate the service account
```bash
# Allow the GitHub repository to impersonate the deployment service account
gcloud iam service-accounts add-iam-policy-binding \
    --role roles/iam.workloadIdentityUser \
    --member "principalSet://iam.googleapis.com/projects/{{PROJECT_NUMBER}}/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/{{GITHUB_ORG_OR_USER}}/{{REPO_NAME}}" \
    github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com
```

## Step 6: Create Cloud KMS Key for Enhanced Security (Optional but Recommended)
```bash
# Create KMS keyring and key for additional signing capabilities
gcloud kms keyrings create github-actions-keyring \
    --location={{REGION}}

gcloud kms keys create cosign-key \
    --keyring=github-actions-keyring \
    --location={{REGION}} \
    --purpose=asymmetric-signing \
    --default-algorithm=ec-sign-p256-sha256

# Grant the service account access to the KMS key
gcloud kms keys add-iam-policy-binding cosign-key \
    --keyring=github-actions-keyring \
    --location={{REGION}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/cloudkms.signerVerifier"
```

## Step 7: Verification Commands
```bash
# Test Workload Identity Federation setup
gcloud iam workload-identity-pools providers describe github-actions-provider \
    --workload-identity-pool="github-actions-pool" \
    --location="global"

# Verify service account permissions
gcloud projects get-iam-policy {{PROJECT_ID}} \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com"

# Check Artifact Registry repository
gcloud artifacts repositories list --location={{REGION}}
```

## Replace These Placeholders:
- `{{PROJECT_ID}}`: Your GCP project ID
- `{{PROJECT_NUMBER}}`: Your GCP project number (get with: `gcloud projects describe {{PROJECT_ID}} --format="value(projectNumber)"`)
- `{{REGION}}`: Your preferred region (e.g., us-central1)
- `{{REPO_NAME}}`: Name for your Artifact Registry repository (e.g., eventra-images)
- `{{GITHUB_ORG_OR_USER}}`: Your GitHub organization or username
- `{{REPO_NAME}}`: Your GitHub repository name (just the repo name, not the full path)

## Get Values for GitHub Secrets:
```bash
# Get project number for WORKLOAD_IDENTITY_PROVIDER secret
echo "Project Number: $(gcloud projects describe {{PROJECT_ID}} --format='value(projectNumber)')"

# Full provider name for WORKLOAD_IDENTITY_PROVIDER secret
echo "Workload Identity Provider: projects/$(gcloud projects describe {{PROJECT_ID}} --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider"

# Service account email for SERVICE_ACCOUNT_EMAIL secret
echo "Service Account Email: github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com"
```