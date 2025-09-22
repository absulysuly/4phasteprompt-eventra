# 🤖 CI-Friendly Rollback Scripts Usage Guide

This document provides comprehensive usage examples and best practices for the non-interactive rollback scripts designed for automation and CI environments.

## 📋 Available Scripts

- `rollback-ci.sh` - Bash version (Linux/macOS/WSL/CI runners)
- `rollback-ci.ps1` - PowerShell version (Windows/PowerShell environments)

## 🚀 Usage Examples

### 🧪 **Dry Run (Safe Testing)**

Always test rollback procedures with dry runs first!

```bash
# Bash - Test rollback plan without executing
./scripts/rollback-ci.sh --deploy-commit abc123 --db-method dump --dry-run

# PowerShell - Test rollback plan without executing  
.\scripts\rollback-ci.ps1 -DeployCommit abc123 -DbMethod dump -DryRun
```

### 🔄 **Standard Rollback (Revert Commit + DB Restore)**

```bash
# Bash - Revert bad commit and restore from existing dump
export DATABASE_URL="postgresql://user:pass@host:5432/db"
./scripts/rollback-ci.sh --deploy-commit abc123 --db-method dump --restore-file /backups/previous_good.dump

# PowerShell - Revert bad commit and restore from existing dump
$env:DATABASE_URL = "postgresql://user:pass@host:5432/db"
.\scripts\rollback-ci.ps1 -DeployCommit abc123 -DbMethod dump -RestoreFile "C:\backups\previous_good.dump"
```

### ⚡ **Force Push Rollback (Dangerous)**

Use with extreme caution - rewrites git history!

```bash
# Bash - Force push known good commit (non-interactive)
./scripts/rollback-ci.sh --previous-commit def456 --git-remote origin --force

# PowerShell - Force push known good commit (non-interactive)
.\scripts\rollback-ci.ps1 -PreviousCommit def456 -GitRemote origin -Force
```

### ☁️ **AWS RDS Snapshot Restore**

```bash
# Bash - Use AWS RDS snapshot (creates new instance)
./scripts/rollback-ci.sh \
  --deploy-commit abc123 \
  --db-method rds \
  --aws-snapshot-id snap-0123456789 \
  --rds-instance-id restored-db-001 \
  --aws-region us-east-1

# PowerShell - Use AWS RDS snapshot (creates new instance)
.\scripts\rollback-ci.ps1 `
  -DeployCommit abc123 `
  -DbMethod rds `
  -AwsSnapshotId snap-0123456789 `
  -RdsInstanceId restored-db-001 `
  -AwsRegion us-east-1
```

### 🏁 **Complete Rollback with Feature Flags**

```bash
# Bash - Full rollback including feature flag disable
./scripts/rollback-ci.sh \
  --deploy-commit abc123 \
  --db-method dump \
  --restore-file /backups/good.dump \
  --feature-api-url "https://api.launchdarkly.com/api/v2/flags/my-project/my-flag" \
  --feature-api-key "sdk-key-123" \
  --feature-flag-key "new-feature" \
  --prod-health-url "https://myapp.com/health"

# PowerShell - Full rollback including feature flag disable
.\scripts\rollback-ci.ps1 `
  -DeployCommit abc123 `
  -DbMethod dump `
  -RestoreFile "C:\backups\good.dump" `
  -FeatureApiUrl "https://api.launchdarkly.com/api/v2/flags/my-project/my-flag" `
  -FeatureApiKey "sdk-key-123" `
  -FeatureFlagKey "new-feature" `
  -ProdHealthUrl "https://myapp.com/health"
```

## 🔧 **CI/CD Integration Examples**

### GitHub Actions Workflow

```yaml
name: Emergency Rollback
on:
  workflow_dispatch:
    inputs:
      deploy_commit:
        description: 'Commit SHA to revert'
        required: true
      restore_file:
        description: 'Path to backup dump file'
        required: false
      dry_run:
        description: 'Dry run only'
        type: boolean
        default: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PostgreSQL client
        run: sudo apt-get update && sudo apt-get install -y postgresql-client
      
      - name: Configure AWS CLI
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Execute Rollback
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          chmod +x scripts/rollback-ci.sh
          ./scripts/rollback-ci.sh \
            --deploy-commit "${{ github.event.inputs.deploy_commit }}" \
            --db-method dump \
            ${{ github.event.inputs.restore_file && format('--restore-file "{0}"', github.event.inputs.restore_file) || '' }} \
            --prod-health-url "https://myapp.com/health" \
            ${{ github.event.inputs.dry_run == 'true' && '--dry-run' || '--force' }}
```

### Azure DevOps Pipeline

```yaml
trigger: none # Manual trigger only

parameters:
- name: deployCommit
  displayName: 'Deploy Commit SHA to Revert'
  type: string
- name: dryRun
  displayName: 'Dry Run Mode'
  type: boolean
  default: true

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: PowerShell@2
  displayName: 'Execute Rollback'
  env:
    DATABASE_URL: $(DATABASE_URL)
    AWS_ACCESS_KEY_ID: $(AWS_ACCESS_KEY_ID)
    AWS_SECRET_ACCESS_KEY: $(AWS_SECRET_ACCESS_KEY)
  inputs:
    targetType: 'inline'
    script: |
      chmod +x scripts/rollback-ci.sh
      ./scripts/rollback-ci.sh \
        --deploy-commit "${{ parameters.deployCommit }}" \
        --db-method dump \
        --prod-health-url "https://myapp.com/health" \
        ${{ eq(parameters.dryRun, true) && '--dry-run' || '--force' }}
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    parameters {
        string(name: 'DEPLOY_COMMIT', description: 'Commit SHA to revert')
        choice(name: 'DB_METHOD', choices: ['dump', 'rds'], description: 'Database restore method')
        booleanParam(name: 'DRY_RUN', defaultValue: true, description: 'Dry run mode')
    }
    
    environment {
        DATABASE_URL = credentials('database-url')
        AWS_ACCESS_KEY_ID = credentials('aws-access-key-id')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    }
    
    stages {
        stage('Rollback') {
            steps {
                script {
                    sh """
                        chmod +x scripts/rollback-ci.sh
                        ./scripts/rollback-ci.sh \\
                          --deploy-commit "${params.DEPLOY_COMMIT}" \\
                          --db-method "${params.DB_METHOD}" \\
                          --prod-health-url "https://myapp.com/health" \\
                          ${params.DRY_RUN ? '--dry-run' : '--force'}
                    """
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'pre-rollback-*.dump', allowEmptyArchive: true
        }
    }
}
```

## 🛡️ **Security & Best Practices**

### **Repository Protection**
```bash
# Store rollback scripts in protected directory
mkdir -p ops/emergency-tools
mv scripts/rollback-ci.* ops/emergency-tools/

# Set restrictive permissions (Linux/macOS)
chmod 750 ops/emergency-tools/
chmod 750 ops/emergency-tools/rollback-ci.sh
```

### **Required Permissions**

#### **CI Runner/User Permissions:**
- **Git**: Push access to production branch
- **Database**: Connection and restore permissions
- **AWS** (if using RDS): 
  - `rds:RestoreDBInstanceFromDBSnapshot`
  - `rds:DescribeDBInstances`
  - `rds:CreateDBInstance`
- **Feature Flags**: API access to toggle flags

#### **Environment Variables (Secure):**
```bash
# Required for dump method
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Required for RDS method  
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_DEFAULT_REGION="us-east-1"

# Optional for feature flags
FEATURE_FLAG_API_KEY="sdk-..."
```

### **Operational Security**

1. **Require PR Review**: All changes to rollback scripts need approval
2. **Audit Trail**: Log all rollback executions
3. **Access Control**: Limit who can trigger rollback workflows
4. **Backup Retention**: Keep pre-rollback dumps securely
5. **Secrets Management**: Use CI/CD secret stores, never hardcode

### **Database-Specific Adaptations**

#### **MySQL Example:**
```bash
# Replace in script for MySQL support
# pg_dump → mysqldump
# pg_restore → mysql

# Backup command
mysqldump --single-transaction --routines --triggers --databases mydb > backup.sql

# Restore command  
mysql mydb < backup.sql
```

#### **MongoDB Example:**
```bash
# Replace in script for MongoDB support
# pg_dump → mongodump
# pg_restore → mongorestore

# Backup command
mongodump --uri="$DATABASE_URL" --gzip --archive=backup.gz

# Restore command
mongorestore --uri="$DATABASE_URL" --gzip --archive=backup.gz --drop
```

## 📚 **Environment-Specific Examples**

### **Staging Environment Testing**
```bash
# Test rollback in staging first
export DATABASE_URL="postgresql://staging-user:pass@staging-host:5432/staging_db"
./scripts/rollback-ci.sh \
  --deploy-commit abc123 \
  --db-method dump \
  --prod-health-url "https://staging.myapp.com/health" \
  --dry-run
```

### **Production Emergency**
```bash
# Production rollback (after staging validation)
export DATABASE_URL="postgresql://prod-user:pass@prod-host:5432/prod_db"  
./scripts/rollback-ci.sh \
  --deploy-commit abc123 \
  --db-method dump \
  --restore-file "/backups/prod-backup-20231201.dump" \
  --feature-api-url "https://api.launchdarkly.com/api/v2/flags/prod/critical-feature" \
  --feature-api-key "${FEATURE_FLAG_API_KEY}" \
  --feature-flag-key "critical-feature" \
  --prod-health-url "https://myapp.com/health" \
  --force  # Only after staging validation!
```

## 🎯 **Post-Rollback Checklist**

After script completion, verify:

- [ ] **Git History**: Confirm revert commit or force-push completed
- [ ] **Database**: Verify data integrity and expected state  
- [ ] **Application**: Check health endpoints and critical flows
- [ ] **Monitoring**: Watch error rates, latency, and business metrics
- [ ] **Feature Flags**: Confirm flags are disabled as expected
- [ ] **DNS/Load Balancer**: Update if RDS restore was used
- [ ] **Stakeholders**: Communicate rollback completion
- [ ] **Documentation**: Record incident timeline and lessons learned

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Permission Denied**: Check git push permissions and database access
2. **Tool Not Found**: Install required tools (git, pg_dump, aws CLI)  
3. **RDS Restore Slow**: AWS RDS restores can take 10-30+ minutes
4. **Health Check Fails**: May indicate incomplete rollback or other issues
5. **Feature Flag API Error**: Check API endpoint and authentication

### **Recovery Options:**

- Use `--dry-run` to diagnose issues without making changes
- Check logs in CI/CD system for detailed error messages  
- Manually verify each step if script fails partway through
- Keep pre-rollback dumps until stability is confirmed

Remember: **Always test in staging first!** 🧪