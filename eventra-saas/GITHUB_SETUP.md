# 🚀 GitHub Actions Setup Guide

This guide will help you set up automated CI/CD pipelines for IraqGuide using GitHub Actions.

## 📋 Prerequisites

1. GitHub repository with your code
2. Vercel account (or alternative deployment platform)
3. Production database access

## 🔐 Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, then add these secrets:

### Vercel Deployment Secrets
```bash
VERCEL_TOKEN          # Your Vercel API token
VERCEL_ORG_ID         # Your Vercel organization ID  
VERCEL_PROJECT_ID     # Your Vercel project ID
PRODUCTION_URL        # Your production URL (e.g., https://iraqguide.com)
```

### Database Secrets
```bash
DATABASE_URL          # Production database connection string
NEXTAUTH_SECRET       # Secret key for NextAuth.js authentication
```

### Optional Secrets (for enhanced features)
```bash
# For Netlify alternative deployment
NETLIFY_AUTH_TOKEN    # Netlify personal access token
NETLIFY_SITE_ID       # Netlify site ID

# For security scanning
SNYK_TOKEN           # Snyk API token for security scans

# For Google OAuth (if using)
GOOGLE_CLIENT_ID     # Google OAuth client ID
GOOGLE_CLIENT_SECRET # Google OAuth client secret
```

## 🔧 Getting Vercel Secrets

### 1. Get Vercel Token
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Get your token from: https://vercel.com/account/tokens
```

### 2. Get Organization and Project IDs
```bash
# In your project directory
vercel link

# This will create .vercel/project.json with your IDs
cat .vercel/project.json
```

## 📝 Workflow Files Created

The setup includes these GitHub Actions workflows:

### 1. 🚀 `deploy.yml` - Main Deployment Pipeline
- **Triggers**: Push to main/master branch
- **Features**: 
  - Build and test the application
  - Deploy to Vercel production
  - Alternative Netlify deployment
  - Health checks and analytics verification
  - Deployment status notifications

### 2. 🔍 `preview.yml` - PR Preview Deployments  
- **Triggers**: Pull requests
- **Features**:
  - Deploy preview environments for each PR
  - Automated PR comments with preview links
  - Lighthouse performance audits
  - Security scans with npm audit and Snyk

### 3. 🗄️ `migrations.yml` - Database Migration Pipeline
- **Triggers**: Changes to Prisma schema or migrations
- **Features**:
  - Schema validation
  - Automated database migrations
  - Database backups
  - Connection verification

## 🌐 Environment Configuration

### Production Environment Variables

Your production deployment needs these environment variables:

```bash
NEXTAUTH_URL=https://your-production-url.com
NEXTAUTH_SECRET=your-super-secure-secret-key
DATABASE_URL=your-production-database-url

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Other API keys as needed
```

## 🚦 Pipeline Flow

### On Every Push to Main:
1. **Build & Test** - Validate code builds successfully
2. **Deploy** - Deploy to production (Vercel)
3. **Health Check** - Verify deployment is healthy
4. **Notify** - Report success/failure status

### On Every Pull Request:
1. **Build** - Validate PR builds successfully  
2. **Preview Deploy** - Create preview environment
3. **Quality Checks** - Run Lighthouse audits
4. **Security Scan** - Check for vulnerabilities
5. **Comment** - Add preview links to PR

### On Database Changes:
1. **Validate** - Check schema is valid
2. **Backup** - Create database backup
3. **Migrate** - Apply database changes
4. **Verify** - Confirm migrations worked

## 📊 Monitoring & Analytics

The pipelines automatically verify your event collection system:

- ✅ Health endpoint (`/api/health`)
- ✅ Analytics endpoint (`/api/analytics/live`)
- ✅ Core page functionality
- ✅ User interaction tracking

## 🔧 Customization

### Add Custom Tests
Edit `deploy.yml` to add your test commands:

```yaml
- name: 🧪 Run tests
  run: |
    npm test
    npm run test:e2e
```

### Custom Deployment Commands
Modify deployment steps as needed:

```yaml
- name: 🔧 Custom build step
  run: npm run custom:build
```

### Environment-Specific Configuration
Add staging environments or custom deployment targets by modifying the workflow files.

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**: Check environment variables are set correctly
2. **Deploy Failures**: Verify Vercel tokens and project IDs
3. **Migration Failures**: Ensure database URL is accessible
4. **Health Check Failures**: Check production URL is correct

### Debug Steps:

1. Check GitHub Actions logs for detailed error messages
2. Verify all required secrets are configured
3. Test Vercel CLI locally: `vercel --prod`
4. Validate database connection: `npx prisma db pull`

## 📈 Next Steps

1. **Push to GitHub** - Commit these workflow files
2. **Configure Secrets** - Add all required secrets in GitHub
3. **Test Pipeline** - Create a PR to test preview deployment
4. **Monitor Deployments** - Watch the Actions tab for pipeline status
5. **Customize** - Adapt workflows to your specific needs

Your automated deployment pipeline is now ready! 🎉

## 💡 Tips

- Use branch protection rules to require status checks
- Set up notifications for deployment failures
- Monitor your analytics dashboard after each deployment
- Keep your Vercel and database credentials secure
- Regularly update your dependencies and workflow actions