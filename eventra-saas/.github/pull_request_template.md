# Pull Request Checklist

## 📋 **RPI (Readiness & Release Inspection) Checklist**

Before this PR can be merged, ensure all automated checks pass:

### ✅ **Required Checks**
- [ ] 🛡️  **Foundation Protection**: No unauthorized changes to protected files
- [ ] 🔍 **Linting**: ESLint passes without errors
- [ ] 📝 **TypeScript**: Type checking passes
- [ ] 🗃️  **Database**: Prisma client generates successfully
- [ ] 🧪 **Tests**: All unit tests pass
- [ ] 🏗️  **Build**: Production build completes successfully
- [ ] 🌐 **i18n Parity**: All translation keys exist in en.json, ar.json, ku.json
- [ ] 🔥 **Smoke Tests**: Staging environment tests pass (if STAGING_URL configured)

### 📊 **Optional Checks**
- [ ] 📊 **CodeQL**: Security analysis passes
- [ ] ⚡ **Performance**: No significant performance regressions
- [ ] 🎨 **UI**: Visual changes reviewed and approved

---

## 🛡️ **Foundation Changes (Special Approval Required)**

If this PR modifies any **protected foundation files**, special approval is required:

### Protected Files/Directories:
- `types.ts`
- `i18n/`
- `config.ts`
- `src/`
- `eventra-saas/`
- `PHASE1_FOUNDATION_PROMPT.md`
- `COMPLETE_6_PHASE_SYSTEM.md`
- `DEPLOYMENT.md`
- `prisma/schema.prisma` or `prisma/migrations/`
- `middleware.ts`
- `next.config.*`
- `auth.ts`
- `ratelimit.ts`

### 🚨 **If Foundation Files Are Modified:**

1. **Obtain Architecture/Security Team Approval**
   - [ ] Changes reviewed by architecture team
   - [ ] Security implications assessed
   - [ ] Documentation updated if needed

2. **Add Bypass Label**
   - [ ] Add the `FOUNDATION-CHANGE-APPROVED` label to this PR
   - [ ] Ensure label is added by a maintainer with appropriate permissions

3. **Additional Validation**
   - [ ] Migration strategy documented (if database changes)
   - [ ] Rollback plan prepared
   - [ ] Impact analysis completed

---

## 📝 **Change Description**

### What does this PR do?
<!-- Describe the changes in this PR -->

### Why is this change needed?
<!-- Explain the motivation or issue being resolved -->

### How was this tested?
<!-- Describe your testing approach -->

---

## 🔗 **Related Links**
- Closes #<!-- issue number -->
- Related to #<!-- issue number -->
- Documentation: <!-- link to docs -->
- Staging URL: <!-- link to staging deployment -->

---

## 🧪 **Testing Checklist**

### Manual Testing
- [ ] Tested on desktop browsers (Chrome, Firefox, Safari)
- [ ] Tested on mobile devices
- [ ] Tested with different screen sizes
- [ ] Tested with different languages (en/ar/ku)

### Functionality Testing
- [ ] User authentication flows work correctly
- [ ] Event creation/management workflows function
- [ ] API endpoints respond as expected
- [ ] Database operations complete successfully

### Performance Testing
- [ ] Page load times are acceptable
- [ ] No memory leaks detected
- [ ] Bundle size hasn't increased significantly

---

## 📊 **Deployment Information**

### Environment Variables
- [ ] No new environment variables required
- [ ] New environment variables documented
- [ ] Environment variables added to staging/production

### Database Changes
- [ ] No database migrations required
- [ ] Database migrations tested
- [ ] Backward compatibility maintained

### Third-Party Services
- [ ] No new third-party integrations
- [ ] New integrations properly configured
- [ ] Rate limits and quotas considered

---

## 🚀 **Post-Merge Actions**

After this PR is merged:

- [ ] Monitor deployment logs for errors
- [ ] Verify functionality in production
- [ ] Update documentation if needed
- [ ] Notify team of breaking changes (if any)

---

## 📞 **Reviewer Notes**

<!-- Add any specific instructions for reviewers -->

### Areas of Focus
- [ ] Code quality and maintainability
- [ ] Security implications
- [ ] Performance impact
- [ ] User experience
- [ ] Multi-language compatibility

---

**🔥 Automated RPI checks will run when this PR is opened/updated. All checks must pass before merge is allowed.**

For questions about the RPI process, see the [deployment readiness documentation](../docs/deployment-readiness.md).