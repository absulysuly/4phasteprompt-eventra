# 🚀 Eventra SaaS Production Deployment Guide

## ✅ CRITICAL Pre-Launch Security Fixes (COMPLETED)

All critical security vulnerabilities have been addressed:

- ✅ **NextAuth Secret Enforcement**: Added runtime validation for NEXTAUTH_SECRET
- ✅ **bcrypt Consistency**: Standardized password hashing to use env variable  
- ✅ **Rate Limiting**: Implemented with Redis for all vulnerable endpoints
- ✅ **Content Security Policy**: Removed unsafe-eval/unsafe-inline directives
- ✅ **Image Optimization**: Replaced raw img tags with Next.js Image component

## 🔧 Required Dependencies Installation

Before deployment, install the new security dependencies:

```powershell
# Install rate limiting packages
npm install @upstash/ratelimit @upstash/redis

# Optional: Email service (for password reset)
npm install resend

# Optional: Error monitoring
npm install @sentry/nextjs
```

## 🌍 Environment Variables Setup

### 1. Local Development (.env)

```powershell
# Copy the template
Copy-Item .env.example .env

# Generate a strong NextAuth secret
$env:NEXTAUTH_SECRET = (openssl rand -base64 32)
echo "NEXTAUTH_SECRET=$env:NEXTAUTH_SECRET" >> .env
```

### 2. Production Environment (Vercel)

**Critical Variables (MUST SET):**

```bash
# NextAuth Configuration
vercel env add NEXTAUTH_SECRET production
# Paste the generated secret from above

vercel env add NEXTAUTH_URL production
# Set to: https://yourdomain.com

# Database
vercel env add DATABASE_URL production
# Set to your PostgreSQL connection string

# Security
vercel env add BCRYPT_ROUNDS production
# Set to: 12

# Rate Limiting (Production Required)
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

**Optional Variables:**

```bash
# Email Service
vercel env add RESEND_API_KEY production

# Error Monitoring
vercel env add SENTRY_DSN production

# OAuth
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
```

## 🗄️ Database Setup

### Development (SQLite)
```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

### Production (PostgreSQL)
```bash
# On Vercel, this runs automatically via postinstall hook
npx prisma migrate deploy
```

## 🧪 Testing Checklist

### 1. Environment Validation
```powershell
# Start development server
npm run dev

# Test NextAuth secret validation
# Should start without errors about missing NEXTAUTH_SECRET

# Test bcrypt consistency  
# Both registration and password reset should work
```

### 2. Rate Limiting Test (Local)
```powershell
# Without Redis configured, should see warning but allow requests
# With Redis, should enforce limits

# Test registration endpoint (5 requests per 10 min)
for ($i=1; $i -le 6; $i++) {
    Invoke-RestMethod -Uri http://localhost:3000/api/register -Method POST -ContentType "application/json" -Body '{"email":"test'$i'@test.com","password":"TestPassword123!","name":"Test"}'
}
# 6th request should return 429
```

### 3. Security Headers Test
```powershell
# Check CSP headers
curl -I http://localhost:3000
# Should see strict Content-Security-Policy without unsafe-eval
```

### 4. Manual User Flow Test
1. **Registration**: Create new account → should work
2. **Login**: Sign in with created account → should work
3. **Event Creation**: Create a test event → should work
4. **Event Viewing**: Visit public event page → should work
5. **Language Switching**: Test all 3 languages (en/ar/ku) → should work
6. **Rate Limiting**: Try creating 21 events rapidly → should be limited

## 🚀 Deployment Steps

### 1. Pre-deployment Validation
```powershell
# Type checking
npm run type-check

# Linting (40 warnings expected, 0 errors)
npm run lint

# Production build test
npm run build
```

### 2. Deploy to Vercel
```powershell
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel --prod

# Or push to main branch if GitHub integration is set up
git push origin main
```

### 3. Post-deployment Verification

Visit your production URL and test:

1. **Health Check**: `https://yourdomain.com/api/health`
2. **Registration**: Create a new account
3. **Login**: Sign in successfully  
4. **Event Creation**: Create and view an event
5. **Language Switching**: Test RTL/LTR layouts
6. **Rate Limiting**: Check response headers for X-RateLimit-*

## 🔍 Production Monitoring

### Error Tracking (Optional)
```bash
# Install and configure Sentry
npx @sentry/wizard -i nextjs

# Test error tracking
# Visit /api/throw (create temporary error endpoint)
```

### Performance Monitoring
- Monitor Vercel Analytics dashboard
- Check Core Web Vitals
- Monitor error rates in Vercel Functions logs

## 🛡️ Security Hardening (Post-Launch)

### 1. Domain Security
- Set up HSTS preload: https://hstspreload.org/
- Configure DNS CAA records
- Enable Vercel Security Headers

### 2. Database Security  
- Enable connection pooling
- Set up database backups
- Configure read replicas (if needed)

### 3. API Rate Limiting Review
- Monitor Upstash Redis usage
- Adjust rate limits based on real usage
- Set up alerts for high error rates

## 🚨 Troubleshooting Common Issues

### NextAuth Issues
```
Error: NEXTAUTH_SECRET not defined
```
**Solution**: Ensure NEXTAUTH_SECRET is set and at least 32 characters

### Rate Limiting Issues
```
Warning: Rate limiting disabled: Redis not configured
```
**Solution**: Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

### Image Loading Issues
```
Error: Invalid src prop on next/image
```
**Solution**: Add domain to next.config.ts remotePatterns

### Database Issues
```
Error: Migration failed
```
**Solution**: Run `npx prisma migrate resolve --rollback` and redeploy

## 📋 Launch Day Checklist

- [ ] All environment variables set in production
- [ ] Database migrations applied successfully
- [ ] Rate limiting Redis connection working
- [ ] Email service configured (if required)
- [ ] Error monitoring set up (recommended)
- [ ] Security headers validated
- [ ] Full user flow tested in production
- [ ] Performance monitoring enabled
- [ ] Backup strategy documented

## 🎉 Success Metrics

Your deployment is successful when:
- ✅ Registration and login work flawlessly
- ✅ All 3 languages (English, Arabic, Kurdish) display correctly
- ✅ Rate limiting returns proper 429 responses when exceeded
- ✅ Images load optimally via Next.js Image component
- ✅ Security headers are properly configured
- ✅ No critical errors in server logs

**Congratulations! Your Eventra SaaS platform is now production-ready and secure.** 🎊