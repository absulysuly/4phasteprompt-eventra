# 🚀 Eventra SaaS Deployment Guide

> **AI-Accessible Deployment Instructions**: Complete deployment guide optimized for AI systems and developers working with the Eventra Iraqi Events & Venues Platform.

## 📋 Table of Contents

- [Quick Deploy Options](#quick-deploy-options)
- [Vercel Deployment](#vercel-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

## ⚡ Quick Deploy Options

### 1-Click Deploys
```bash
# Vercel (Recommended)
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=.next

# Railway
npx railway login && railway up
```

## 🌐 Vercel Deployment (Recommended)

### Why Vercel?
- **Perfect for Next.js**: Built by the Next.js team
- **Edge Network**: Global CDN with sub-50ms response times
- **Serverless Functions**: Auto-scaling API routes
- **Preview Deployments**: Every PR gets a preview URL
- **Zero Configuration**: Works out of the box

### Step-by-Step Deployment

#### Option 1: GitHub Integration (Recommended)
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Connect to Vercel
# - Go to https://vercel.com/new
# - Import your GitHub repository
# - Configure environment variables
# - Deploy!
```

#### Option 2: Vercel CLI
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# 5. Redeploy with environment variables
vercel --prod
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/eventra"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-32-character-secret-key"

# Rate Limiting (Optional)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

## 🗄️ Database Setup

### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE eventra;

-- Create user
CREATE USER eventra_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE eventra TO eventra_user;
```

### Database Migration
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

### Deploy with Docker
```bash
# Build the image
docker build -t eventra-saas .

# Run the container
docker run -p 3000:3000 -e DATABASE_URL="your_db_url" eventra-saas
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate Prisma client
        run: npx prisma generate
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

#### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma migrate reset
npx prisma db seed
```

---

**🚀 Ready for Production**: This guide covers deployment scenarios optimized for the Eventra SaaS platform.

**🤖 AI-Optimized**: Complete deployment instructions optimized for AI systems and automated workflows.

# 🚀 **FORTRESS DEPLOYMENT - LIVE IN 10 MINUTES**

## **STEP 1: Supabase Database Setup** (2 minutes)

1. **Go to**: https://supabase.com/dashboard/new
2. **Create Project**: 
   - Name: `eventra-production`
   - Password: `Generate a strong one`
   - Region: `US East (closest to users)`
3. **Get Connection String**:
   - Go to: Settings → Database
   - Copy: `Connection string` 
   - Format: `postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

---

## **STEP 2: Upstash Redis Setup** (1 minute)

1. **Go to**: https://console.upstash.com/redis
2. **Create Database**:
   - Name: `eventra-cache`
   - Region: `US-East-1`
   - Type: `Regional`
3. **Copy Credentials**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## **STEP 3: Vercel Environment Variables** (2 minutes)

Go to: https://vercel.com/absulysulys-projects/eventra-saas/settings/environment-variables

**Add these variables** (one by one):

### **CRITICAL VARIABLES:**
```env
DATABASE_URL = [Your Supabase Connection String]
NEXTAUTH_SECRET = vH;C!AgYw:=oR8Z(eisWVy.3^)AYwNFQ
NEXTAUTH_URL = https://eventra-saas.vercel.app
BCRYPT_ROUNDS = 12
NODE_ENV = production
NEXT_PUBLIC_BASE_URL = https://eventra-saas.vercel.app
```

### **PERFORMANCE & SECURITY:**
```env
UPSTASH_REDIS_REST_URL = [From Upstash]
UPSTASH_REDIS_REST_TOKEN = [From Upstash]
```

---

## **STEP 4: Trigger Deployment** (1 minute)

1. **Go to Vercel Dashboard**: https://vercel.com/absulysulys-projects/eventra-saas
2. **Click**: `Redeploy` button
3. **Wait 2-3 minutes** for deployment

---

## **STEP 5: Test Live Platform** (2 minutes)

Visit: **https://eventra-saas.vercel.app**

**Test Checklist:**
- ✅ Homepage loads
- ✅ Language switching works (EN/AR/KU)
- ✅ Registration works
- ✅ Login works  
- ✅ Event creation works
- ✅ Event viewing works (no 404)

---

## **🎉 SUCCESS METRICS**

Your platform is **LIVE** when:
- ✅ All translations work correctly
- ✅ User registration/login flows work
- ✅ Events can be created and viewed
- ✅ No 404 errors on event pages
- ✅ Forms are readable in all languages

---

## **🔥 IMMEDIATE NEXT STEPS**

1. **Share the live URL** with test users
2. **Create your first events** to populate the platform
3. **Test WhatsApp integration** (when ready)
4. **Set up custom domain** (optional)

**Your fortress is READY TO CONQUER! 🏰⚡**