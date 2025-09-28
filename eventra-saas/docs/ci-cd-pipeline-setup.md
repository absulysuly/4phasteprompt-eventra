# 🚀 Eventra SaaS CI/CD Pipeline Setup Guide

## Overview

This guide explains how to set up the non-invasive Readiness & Release Inspection (RPI) pipeline for Eventra SaaS that enforces deployment readiness without modifying your foundation code.

## 📁 File Structure

After setup, your repository will have these new files:

```
.github/
├── workflows/
│   └── rpi-readiness.yml          # Main CI/CD workflow
├── scripts/
│   ├── foundation-guard.sh        # Foundation protection (primary)
│   ├── foundation-guard-gh.sh     # Foundation protection (GitHub CLI variant)
│   ├── i18n-check.mjs             # Translation key parity checker
│   └── smoke-test.sh              # Staging environment tests
└── pull_request_template.md       # PR checklist template

docs/
└── ci-cd-pipeline-setup.md        # This setup guide
```

## 🛠️ Installation Steps

### 1. Copy Files to Repository

Copy all the provided files to their respective locations in your repository:

```bash
# Create directories if they don't exist
mkdir -p .github/workflows .github/scripts docs

# Copy workflow file
# [Copy content from rpi-readiness.yml]

# Copy scripts (make executable)
# [Copy content from foundation-guard.sh]
chmod +x .github/scripts/foundation-guard.sh

# [Copy remaining files...]
```

### 2. Repository Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and Variables → Actions):

#### Required Secrets:
- `GITHUB_TOKEN` - Automatically available, no setup needed

#### Optional Secrets:
- `STAGING_URL` - URL of your staging environment (e.g., `https://staging.eventra-saas.vercel.app`)
- `SENTRY_DSN` - For error tracking integration
- `DB_READONLY_URL` - Read-only database connection for advanced health checks

### 3. Branch Protection Rules

Configure branch protection for your main branch (Settings → Branches):

#### Required Status Checks:
- ✅ `Deployment Readiness Inspection / readiness-inspection`
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (optional but recommended)
- ✅ Include administrators (recommended)

#### Additional Settings:
- ✅ Require pull request reviews before merging
- ✅ Dismiss stale PR reviews when new commits are pushed
- ✅ Require status checks to pass before merging

### 4. Repository Labels

Create the bypass label for foundation changes (Issues → Labels → New Label):

- **Name**: `FOUNDATION-CHANGE-APPROVED`
- **Description**: `Allows changes to protected foundation files after architecture review`
- **Color**: `#D73A49` (red)

### 5. Vercel Integration (if not already configured)

Ensure your Vercel project is connected to GitHub:
1. Connect your GitHub repository to Vercel
2. Enable automatic deployments for your main branch
3. Enable preview deployments for pull requests

## 🔧 Configuration Options

### Environment Variables in Workflow

You can customize the pipeline behavior by modifying these variables in the workflow file:

```yaml
env:
  BYPASS_LABEL: "FOUNDATION-CHANGE-APPROVED"  # Change bypass label name
  NODE_VERSION: "20"                          # Node.js version
  TIMEOUT_MINUTES: 15                         # Workflow timeout
```

### Protected File Patterns

To modify which files are protected, edit the `PROTECTED_PATTERNS` array in both foundation guard scripts:

```bash
PROTECTED_PATTERNS=(
  "types.ts"
  "i18n/"
  "config.ts"
  "src/"
  "eventra-saas/"
  # Add or remove patterns as needed
)
```

### i18n Configuration

The i18n checker looks for these files by default:
- `messages/en.json` (primary locale)
- `messages/ar.json` 
- `messages/ku.json`

To change the file locations, edit the `TRANSLATION_FILES` object in `i18n-check.mjs`.

## 🚦 How It Works

### Automated Checks

When a pull request is opened or updated, the pipeline runs these checks:

1. **Foundation Protection** - Prevents unauthorized changes to critical files
2. **Code Quality** - Linting and TypeScript compilation
3. **Database** - Prisma client generation
4. **Tests** - Unit test execution
5. **Build** - Production build verification
6. **i18n Parity** - Translation key consistency
7. **Smoke Tests** - Basic staging environment validation
8. **Security Analysis** - CodeQL security scanning

### Foundation Protection Workflow

1. **Normal Changes**: Pipeline allows merge if no protected files are modified
2. **Foundation Changes**: 
   - Pipeline blocks merge and shows clear remediation steps
   - Requires `FOUNDATION-CHANGE-APPROVED` label
   - Once label is added, pipeline allows merge with warnings

### Manual Override Process

For legitimate foundation changes:

1. **Get Approval**: Obtain review from architecture/security team
2. **Add Label**: Maintainer adds `FOUNDATION-CHANGE-APPROVED` label to PR
3. **Re-run**: Pipeline automatically detects label and allows merge
4. **Monitor**: Extra monitoring recommended after foundation changes

## 🔍 Troubleshooting

### Common Issues

#### Pipeline Fails with "Foundation Protection Violation"
```bash
# Solution: Either revert changes or add bypass label
gh pr edit <PR_NUMBER> --add-label "FOUNDATION-CHANGE-APPROVED"
```

#### i18n Check Fails
```bash
# Solution: Ensure all translation keys exist in all locale files
node .github/scripts/i18n-check.mjs  # Run locally to see missing keys
```

#### Build Fails
```bash
# Solution: Run checks locally first
cd eventra-saas
npm run lint
npm run type-check
npm run build
```

#### Smoke Tests Fail
- Verify `STAGING_URL` is correct and accessible
- Check staging environment health
- Review smoke test logs for specific failures

### Local Development

Run pipeline checks locally before pushing:

```bash
# Run in eventra-saas directory
npm run lint
npm run type-check
npm run db:generate
npm run build
npm test

# Check i18n parity
node .github/scripts/i18n-check.mjs

# Test foundation guard (in repository root)
.github/scripts/foundation-guard.sh
```

## 📊 Monitoring & Metrics

### GitHub Actions Insights

Monitor pipeline performance in GitHub:
- Actions → RPI - Readiness Checks
- View success rates, duration trends
- Identify frequently failing checks

### Recommended Monitoring

1. **Pipeline Success Rate** - Target: >95%
2. **Average Pipeline Duration** - Target: <10 minutes
3. **Foundation Violations** - Track and trend
4. **i18n Compliance** - Monitor translation completeness

## 🔒 Security Considerations

### Secrets Management
- Never commit secrets to the repository
- Use GitHub's encrypted secrets for sensitive data
- Regularly rotate API keys and tokens

### Foundation Protection
- Bypass label should only be used by trusted maintainers
- All foundation changes should undergo additional security review
- Consider requiring multiple approvals for foundation changes

### Branch Protection
- Enforce status checks on all branches
- Require up-to-date branches before merging
- Consider requiring signed commits for extra security

## 🚀 Best Practices

### Pull Request Workflow
1. Create feature branch from main
2. Make changes and test locally
3. Open PR and verify all checks pass
4. Get code review approval
5. Merge to main (triggers production deployment)

### Foundation Changes
1. Document the need for foundation changes
2. Get architecture/security team approval
3. Plan rollback strategy
4. Add bypass label only when approved
5. Monitor extra carefully after merge

### Maintenance
- Review and update protected patterns quarterly
- Keep dependencies up to date in workflow
- Monitor pipeline performance and optimize as needed
- Regular security audits of the pipeline itself

## 📞 Support & Questions

For questions about the RPI pipeline:
1. Check this documentation first
2. Review GitHub Actions logs for specific errors
3. Run checks locally to debug issues
4. Create an issue with the `ci-cd` label for pipeline problems

---

**🎉 Congratulations!** Your non-invasive CI/CD pipeline is now ready to protect your Eventra SaaS foundation while ensuring deployment readiness.