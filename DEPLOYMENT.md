# 🚀 Eventra Deployment Guide

This guide covers multiple deployment options for the Eventra event management platform.

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- (Optional) Docker for containerized deployment

## 🛠️ Build Process

### 1. Local Build

```bash
# Install dependencies
npm ci

# Run quality checks
npm run lint
npm run type-check
npm run test:run

# Build for production
npm run build

# Preview locally
npm run preview
```

### 2. Using Deployment Script

**Windows (PowerShell):**
```powershell
# Full deployment
.\scripts\deploy.ps1

# Skip tests and linting (faster)
.\scripts\deploy.ps1 -SkipTests -SkipLint

# Build Docker image
.\scripts\deploy.ps1 -Docker

# Show help
.\scripts\deploy.ps1 -Help
```

**Linux/macOS (Bash):**
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Full deployment
./scripts/deploy.sh

# Skip tests and linting
./scripts/deploy.sh --skip-tests --skip-lint

# Build Docker image  
./scripts/deploy.sh --docker
```

## 🌐 Deployment Options

### 1. GitHub Pages (Automatic)

✅ **Already configured!** Your GitHub Actions workflow will automatically deploy to GitHub Pages when you push to the `main` branch.

**Setup:**
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select "GitHub Actions" as source
4. Your site will be available at: `https://yourusername.github.io/eventra-draft`

### 2. Vercel

**Quick Deploy:**
1. Connect your GitHub repository to Vercel
2. Vercel will auto-detect the Vite configuration
3. Set environment variables in Vercel dashboard

**Environment Variables:**
```
VITE_API_URL=https://your-api-domain.com
VITE_APP_NAME=Eventra
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ANALYTICS_ID=your-analytics-id
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Manual Deploy:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Netlify

**Drag & Drop:**
1. Build your project: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deploy area

**Git Integration:**
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in Netlify dashboard

**CLI Deploy:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### 4. Docker Deployment

**Build Image:**
```bash
docker build -t eventra:latest .
```

**Run Container:**
```bash
docker run -d -p 80:80 --name eventra eventra:latest
```

**Docker Compose (Production):**
```bash
# Start full production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale frontend service
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

### 5. Other Static Hosting Providers

**Firebase Hosting:**
```bash
npm i -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**AWS S3 + CloudFront:**
```bash
# Upload dist folder to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete
```

**Digital Ocean App Platform:**
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

## ⚙️ Environment Variables

### Required Variables
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name (default: "Eventra")

### Optional Variables
- `VITE_APP_VERSION` - Application version
- `VITE_SENTRY_DSN` - Sentry error tracking
- `VITE_ANALYTICS_ID` - Google Analytics ID
- `VITE_GEMINI_API_KEY` - Google Gemini API key

### Platform-Specific Setup

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add variables with `VITE_` prefix

**Netlify:**
1. Go to Site Settings → Environment Variables
2. Add variables with `VITE_` prefix

**GitHub Pages:**
1. Go to Repository Settings → Secrets and Variables → Actions
2. Add secrets (they'll be available in GitHub Actions)

## 🔒 Security Considerations

### Production Checklist

- [ ] Update Content Security Policy headers
- [ ] Configure CORS on your backend
- [ ] Set up SSL/TLS certificates
- [ ] Enable security headers (configured in `vercel.json` and `netlify.toml`)
- [ ] Review environment variables exposure
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (Google Analytics)

### Security Headers (Already Configured)

```
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: (configured for React apps)
```

## 📊 Performance Optimization

### Build Optimization (Already Included)

- Tree shaking for smaller bundle size
- Code splitting with React.lazy()
- Static asset optimization
- Gzip compression
- Browser caching headers

### Runtime Performance

- Service Worker for caching (via Vite PWA plugin)
- Image optimization
- Lazy loading of routes
- React Query for efficient data fetching

## 🏥 Health Checks & Monitoring

### Health Check Endpoints

The application includes health check functionality:

- Basic health: `/health` (configured in nginx/Docker)
- Application health: Available through the API

### Monitoring Setup

1. **Error Tracking:** Configure Sentry DSN
2. **Analytics:** Set up Google Analytics
3. **Performance:** Use Lighthouse CI
4. **Uptime:** Set up monitoring with services like Pingdom

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables Not Working:**
- Ensure variables have `VITE_` prefix
- Restart development server after adding variables
- Check platform-specific variable configuration

**Routing Issues in Production:**
- Verify SPA routing configuration
- Check `vercel.json` and `netlify.toml` redirect rules
- For other hosts, configure server to serve `index.html` for all routes

**Docker Issues:**
```bash
# Check logs
docker logs eventra

# Rebuild without cache
docker build --no-cache -t eventra:latest .
```

### Debug Mode

Enable debug information by setting:
```
NODE_ENV=development
```

## 📈 Scaling

### Horizontal Scaling

**Docker Swarm:**
```bash
docker service create --replicas 3 --name eventra-service eventra:latest
```

**Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eventra
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eventra
  template:
    spec:
      containers:
      - name: eventra
        image: eventra:latest
        ports:
        - containerPort: 80
```

### CDN Setup

Configure CDN for static assets:
- Cloudflare (automatic with most hosting providers)
- AWS CloudFront
- Vercel Edge Network (built-in)
- Netlify CDN (built-in)

## 🔄 CI/CD Pipeline

### Automated Deployment

The repository includes GitHub Actions workflows:

1. **Basic GitHub Pages** (`.github/workflows/deploy.yml`)
2. **Multi-platform Deployment** (`.github/workflows/deploy-production.yml`)

### Manual Deployment Triggers

You can manually trigger deployments from GitHub Actions:
1. Go to Actions tab
2. Select "Production Deployment" workflow
3. Click "Run workflow"
4. Choose deployment target

## 📞 Support

### Getting Help

1. Check this deployment guide
2. Review GitHub Issues
3. Check platform-specific documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
   - [Docker Docs](https://docs.docker.com)

### Deployment Status

After deployment, verify your application is working:

1. ✅ Application loads without errors
2. ✅ Routing works (try navigating between pages)
3. ✅ Environment variables are loaded correctly
4. ✅ API connections work (if backend is configured)
5. ✅ Analytics and error tracking are functioning

---

**🎉 Congratulations! Your Eventra application is now deployed!**

Visit your deployed application and start managing events! 🚀