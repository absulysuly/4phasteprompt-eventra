# 🚨 Production Rollback Scripts

This directory contains rollback scripts for emergency production recovery. These scripts are designed for **PostgreSQL-focused** environments with optional AWS RDS snapshot support.

## 📋 Available Scripts

- `rollback.sh` - Bash version (Linux/macOS/WSL)
- `rollback.ps1` - PowerShell version (Windows native)

## ⚠️ CRITICAL SAFETY NOTES

### 🧪 **ALWAYS TEST IN STAGING FIRST**
- **Never run these scripts directly in production without staging validation**
- Test the entire rollback flow in a staging environment that mirrors production
- Verify DB restore process with realistic data volumes
- Confirm rollback timing and impact on users

### 🗄️ **Database Restore Considerations**

#### Automatic Backup
- Scripts create a pre-rollback dump automatically (`pre-rollback-YYYYMMDDHHMM.dump`)
- **Keep this backup** until rollback stability is confirmed
- Use this for debugging or partial data recovery if needed

#### RDS Snapshot Restores
- **Creates a NEW database instance** - does not modify existing instance
- You **MUST update connection strings** after restore:
  - Update `DATABASE_URL` environment variable
  - Update DNS/load balancer configuration if applicable
  - Consider read replica promotion if using replication
- New instance endpoint will be provided in script output

#### Migration Reversibility
- **Prisma migrations are NOT automatically reversible**
- Destructive schema changes (DROP TABLE, ALTER COLUMN, etc.) cannot be undone via migration rollback
- **Database restore is the recommended recovery approach** for destructive migrations
- Consider migration strategies that are backward-compatible when possible

### 🛡️ **MySQL/Other Database Support**
For non-PostgreSQL databases, replace these commands:
- `pg_dump` → `mysqldump` (MySQL) or appropriate backup tool
- `pg_restore` → `mysql` (MySQL) or appropriate restore tool

Example MySQL replacements:
```bash
# Backup
mysqldump --single-transaction --routines --triggers $DATABASE_URL > backup.sql

# Restore  
mysql $DATABASE_URL < backup.sql
```

## 🚀 Usage Instructions

### Prerequisites
1. **Environment Variables**:
   ```bash
   # Required
   export DATABASE_URL="postgresql://user:password@host:5432/db"
   
   # Optional (for AWS RDS)
   export AWS_REGION="us-east-1"
   export AWS_PROFILE="production"  # if using AWS profiles
   ```

2. **Required Tools**:
   - Git (for code rollback)
   - PostgreSQL client tools (`pg_dump`, `pg_restore`)
   - AWS CLI (if using RDS snapshots)
   - curl or PowerShell (for health checks)

### Configuration
Before running, edit the script and replace placeholders:

```bash
# In rollback.sh or rollback.ps1
DEPLOY_COMMIT="abc123..."              # Commit SHA to revert
PREVIOUS_RELEASE_COMMIT="def456..."    # Known good commit SHA
RDS_SNAPSHOT_ID="prod-snapshot-20231201"  # RDS snapshot identifier
RDS_RESTORE_INSTANCE_ID="prod-restore-new"  # New instance name
FEATURE_FLAG_TOGGLE_URL="https://api.launchdarkly.com/..."
FEATURE_FLAG_API_KEY="your-api-key"
```

### Running the Script

#### Linux/macOS/WSL:
```bash
# Make executable
chmod +x scripts/rollback.sh

# Run interactively
./scripts/rollback.sh

# Run with minimal interaction (dangerous!)
./scripts/rollback.sh --force
```

#### Windows PowerShell:
```powershell
# Run interactively
.\scripts\rollback.ps1

# Run with minimal interaction (dangerous!)
.\scripts\rollback.ps1 -Force
```

## 🔄 Rollback Process Flow

1. **Safety Checks**
   - Verify DATABASE_URL is set
   - Check required tools are installed
   - Confirm user intent with multiple prompts

2. **Code Rollback** (Choose one):
   - **Option A1**: Git revert (recommended) - creates revert commit
   - **Option A2**: Force push previous commit (dangerous) - rewrites history

3. **Database Restore** (Choose one):
   - **Option 1**: Local dump restore using `pg_restore`
   - **Option 2**: AWS RDS snapshot restore (creates new instance)

4. **Feature Flag Toggle** (Optional):
   - Disable feature flags via API
   - Supports LaunchDarkly, Flagsmith, or custom APIs

5. **Post-Rollback Verification**:
   - Health endpoint check
   - Monitoring recommendations
   - Next steps guidance

## 🎯 Post-Rollback Checklist

After running the rollback script:

### Immediate Actions (0-15 minutes)
- [ ] Monitor application logs for errors
- [ ] Check error tracking dashboard (Sentry/Bugsnag)
- [ ] Verify critical user flows manually
- [ ] Confirm health endpoints returning 200
- [ ] Update team/stakeholders on rollback status

### Short-term Actions (15 minutes - 2 hours)
- [ ] If RDS restore was used:
  - [ ] Update DATABASE_URL environment variable
  - [ ] Update DNS/load balancer if needed
  - [ ] Restart application services
  - [ ] Verify database connectivity
- [ ] Monitor key business metrics
- [ ] Check customer support channels
- [ ] Document the incident timeline

### Medium-term Actions (2+ hours)
- [ ] Keep pre-rollback dump until stability confirmed
- [ ] Clean up temporary git branches
- [ ] If RDS restore was used, plan old instance cleanup
- [ ] Conduct post-incident review
- [ ] Update rollback procedures based on learnings

## 🔧 Customization Options

### Environment-Specific Variables
Create environment-specific config files:
```bash
# config/prod-rollback.env
PROD_REMOTE="production"
PROD_BRANCH="release"
AWS_REGION="us-west-2"
FEATURE_FLAG_TOGGLE_URL="https://your-api.com/flags"
```

### Database-Specific Adaptations
For different databases, modify the backup/restore sections:
- **MongoDB**: Use `mongodump`/`mongorestore`
- **MySQL**: Use `mysqldump`/`mysql`
- **SQLite**: Use file system copy
- **Cloud databases**: Use provider-specific tools

## 🆘 Emergency Contacts

When rollback is needed, contact:
- **On-call Engineer**: [Your rotation system]
- **Database Team**: [DB admin contacts]
- **DevOps Team**: [Infrastructure team]
- **Product Owner**: [Business stakeholder]

## 📚 Related Documentation

- [Deployment Process](./DEPLOYMENT.md)
- [Database Migration Guide](./DATABASE_MIGRATIONS.md)
- [Monitoring & Alerting](./MONITORING.md)
- [Incident Response Playbook](./INCIDENT_RESPONSE.md)