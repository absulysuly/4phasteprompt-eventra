# Cosign Keyless Configuration & Usage Guide

## Overview
Keyless cosign leverages OIDC identity tokens to sign container images without managing long-lived private keys. This approach uses Sigstore's public infrastructure (Fulcio CA and Rekor transparency log) to create and verify signatures.

## How Keyless Signing Works
1. GitHub Actions generates an OIDC token with repository claims
2. Cosign presents this token to Fulcio (Certificate Authority)
3. Fulcio issues a short-lived certificate tied to the GitHub identity
4. Cosign signs the image and records the signature in Rekor (transparency log)
5. Verification can be done by anyone with the public log data

## CI/CD Commands (Already in Workflow)

### Signing Command
```bash
# Sign image with keyless cosign (OIDC-based)
cosign sign --yes ${{ env.IMAGE_URI }}
```

### Verification Command
```bash
# Verify signature with identity constraints
cosign verify ${{ env.IMAGE_URI }} \
  --certificate-identity-regexp="https://github.com/${{ github.repository }}" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

## Local Verification Commands

### Install Cosign Locally
```bash
# macOS
brew install cosign

# Linux
curl -O -L "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
sudo mv cosign-linux-amd64 /usr/local/bin/cosign
sudo chmod +x /usr/local/bin/cosign

# Windows (using scoop)
scoop install cosign
```

### Verify Signed Images Locally
```bash
# Replace with your actual image URI
IMAGE_URI="us-central1-docker.pkg.dev/your-project/your-repo/eventra-collector:sha"

# Verify the signature (public verification - no authentication needed)
cosign verify ${IMAGE_URI} \
  --certificate-identity-regexp="https://github.com/your-org/your-repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"

# More detailed verification output
cosign verify ${IMAGE_URI} \
  --certificate-identity-regexp="https://github.com/your-org/your-repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --output=json | jq .
```

### View Signature Details
```bash
# View certificate details from Rekor
cosign tree ${IMAGE_URI}

# Download and inspect the signature
cosign download signature ${IMAGE_URI}

# View attestation (if SBOM is attached)
cosign download attestation ${IMAGE_URI}
```

## Additional IAM Permissions Required

### Already Configured in Setup Commands
The following permissions are already included in the `gcp-setup-commands.md`:

```bash
# KMS permissions for enhanced security (optional but recommended)
gcloud projects add-iam-policy-binding {{PROJECT_ID}} \
    --member="serviceAccount:github-actions-deploy@{{PROJECT_ID}}.iam.gserviceaccount.com" \
    --role="roles/cloudkms.signerVerifier"
```

### No Additional Permissions Needed
Keyless cosign with Sigstore's public infrastructure **does not require** additional GCP permissions beyond what's already configured. The signing process uses:
- Public Fulcio CA (sigstore.dev)
- Public Rekor transparency log
- OIDC tokens from GitHub Actions

## Enhanced Security: SBOM Attestations (Optional)

### Attach SBOM as Attestation
Add this to your workflow after SBOM generation:

```yaml
- name: Attest SBOM to image
  run: |
    cosign attest --yes --predicate sbom.json --type spdxjson ${{ env.IMAGE_URI }}
    echo "✅ SBOM attestation attached"
```

### Verify SBOM Attestation Locally
```bash
# Download and verify SBOM attestation
cosign verify-attestation ${IMAGE_URI} \
  --certificate-identity-regexp="https://github.com/your-org/your-repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --type spdxjson

# Extract SBOM data
cosign verify-attestation ${IMAGE_URI} \
  --certificate-identity-regexp="https://github.com/your-org/your-repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --type spdxjson \
  --output-file extracted-sbom.json
```

## Policy Enforcement with Cosign

### Create Policy File (`cosign-policy.yaml`)
```yaml
apiVersion: v1alpha1
kind: ClusterImagePolicy
metadata:
  name: eventra-policy
spec:
  images:
  - glob: "us-central1-docker.pkg.dev/your-project/your-repo/*"
  authorities:
  - keyless:
      url: https://fulcio.sigstore.dev
      identities:
      - issuer: https://token.actions.githubusercontent.com
        subject: https://github.com/your-org/your-repo/.github/workflows/deploy-cloudrun-oidc.yml@refs/heads/main
  - ctlog:
      url: https://rekor.sigstore.dev
```

### Verify Against Policy
```bash
# Verify image meets policy requirements
cosign verify --policy cosign-policy.yaml ${IMAGE_URI}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Signature Not Found
```bash
Error: no matching signatures: no matching signatures were found for the provided public keys
```
**Solution**: Ensure the image was actually signed and you're using the exact same image URI.

#### 2. Certificate Identity Mismatch
```bash
Error: none of the expected identities matched
```
**Solution**: Check that the certificate identity regexp matches your repository path exactly.

#### 3. OIDC Token Issues
```bash
Error: fetching ambient OIDC credentials
```
**Solution**: Ensure the workflow has `id-token: write` permission and uses the correct Workload Identity setup.

### Debug Commands
```bash
# Check if image has signatures
cosign tree ${IMAGE_URI}

# View raw signature data
cosign download signature ${IMAGE_URI} | jq .

# Check Rekor log entry
rekor-cli search --artifact-hash $(cosign triangulate ${IMAGE_URI} | xargs docker inspect --format='{{.Id}}')
```

## Security Best Practices

### 1. Use Strict Identity Verification
Always use specific certificate identity patterns:
```bash
# Good - specific to workflow
--certificate-identity-regexp="https://github.com/your-org/your-repo/.github/workflows/deploy-cloudrun-oidc.yml@refs/heads/main"

# Less secure - too broad
--certificate-identity-regexp="https://github.com/your-org/.*"
```

### 2. Pin to Specific Workflow
For maximum security, pin verification to the exact workflow file:
```bash
cosign verify ${IMAGE_URI} \
  --certificate-identity="https://github.com/your-org/your-repo/.github/workflows/deploy-cloudrun-oidc.yml@refs/heads/main" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```

### 3. Use Transparency Log Verification
Always verify against the Rekor transparency log:
```bash
# This is automatic with cosign verify, but you can be explicit
cosign verify ${IMAGE_URI} \
  --certificate-identity-regexp="https://github.com/your-org/your-repo" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  --rekor-url="https://rekor.sigstore.dev"
```

## Migration from Key-based Signing

### Remove Old Secrets (if migrating)
If you were previously using key-based cosign:
1. **DO NOT** delete secrets immediately - test keyless first
2. Once confirmed working, remove these secrets:
   - `COSIGN_PRIVATE_KEY`
   - `COSIGN_PUBLIC_KEY` 
   - `COSIGN_PASSWORD`

### Gradual Migration Approach
```bash
# Support both during migration (add to workflow)
- name: Sign with keyless cosign
  run: cosign sign --yes ${{ env.IMAGE_URI }}

# Keep old verification for backward compatibility temporarily
- name: Verify keyless signature
  run: |
    cosign verify ${{ env.IMAGE_URI }} \
      --certificate-identity-regexp="https://github.com/${{ github.repository }}" \
      --certificate-oidc-issuer="https://token.actions.githubusercontent.com"
```