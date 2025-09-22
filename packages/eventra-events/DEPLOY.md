# Production Deployment Checklist

## Pre-deploy
- [ ] **Code review**: All PRs reviewed and approved
- [ ] **Branch sync**: Ensure `main` branch is up-to-date
- [ ] **Environment**: Verify Node.js ≥18 in production

## CI/CD Pipeline
Run these commands locally to verify before deploy:
```bash
npm ci
npx prisma generate
npx tsc --noEmit
npm run build
npm run lint
npm run test:ci
```

**GitHub Actions**: CI pipeline must pass (`CI — Build & Verify (unit tests)` workflow)

## Database & Prisma
- [ ] **Schema review**: Database migrations tested in staging
- [ ] **Deploy migrations**: `npm run db:deploy` or `npx prisma migrate deploy`
- [ ] **Generate client**: `npx prisma generate` (automated in CI)

## Staging Verification
- [ ] **Deploy to staging**: Ensure staging mirrors production config
- [ ] **Health check**: `curl -fsS https://staging.yourdomain.com/health`
- [ ] **Manual testing**: Test critical user flows
- [ ] **Performance**: Check Core Web Vitals and load times
- [ ] **E2E tests**: Trigger E2E workflow or run `npm run e2e` against staging

## Production Rollout & Rollback
- [ ] **Deploy**: Trigger production deployment
- [ ] **Monitor**: Watch error rates, response times, business metrics
- [ ] **Rollback ready**: Have `ops/tools/rollback-ci.sh` configured with:
  - Recent commit SHA for `--deploy-commit`
  - Known good commit SHA for `--previous-commit`
  - DATABASE_URL configured for `--db-method dump`

**Quick rollback**: `./ops/tools/rollback-ci.sh --deploy-commit <SHA> --db-method dump --force`

## Monitoring & Logging  
- [ ] **Error tracking**: Monitor Sentry/Bugsnag for new errors
- [ ] **APM**: Check response times and database query performance
- [ ] **Logs**: Review application logs for warnings/errors
- [ ] **Alerts**: Ensure monitoring alerts are active

## Post-deploy Verification
- [ ] **Health endpoints**: `curl -fsS https://yourdomain.com/health`
- [ ] **Core features**: Test login, main workflows, payments
- [ ] **Database**: Verify migrations applied successfully
- [ ] **CDN/Assets**: Check static assets loading correctly
- [ ] **Cleanup**: Remove old deployment artifacts and logs

---
**SWC Migration**: Custom Babel config disabled, SWC enabled for faster builds  
**PR Template**: `Enable CI/CD, staging E2E, and ops tooling for safe production rollouts`  
**Commit**: `chore(ci): add CI & E2E workflows, rollback script, DEPLOY.md, and .gitignore`
