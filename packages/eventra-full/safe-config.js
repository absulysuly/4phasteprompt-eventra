/**
 * Content Security Policy configuration for Eventra SaaS
 * Using next-safe-middleware for better security
 */
module.exports = {
  defaultSrc: ["'self'"],
  
  // Scripts: Only allow self-hosted and specific CDNs
  scriptSrc: [
    "'self'",
    // Allow Vercel analytics and insights
    "https://va.vercel-scripts.com",
    // Allow service worker
    "'wasm-unsafe-eval'", // Required for some Next.js features
  ],
  
  // Styles: Self-hosted and Google Fonts
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    "https://fonts.googleapis.com",
  ],
  
  // Images: Self, data URIs, and Unsplash for event images
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "https://images.unsplash.com",
    "https://via.placeholder.com", // For fallback images
  ],
  
  // Fonts: Self and Google Fonts
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  
  // Connections: API calls and external services
  connectSrc: [
    "'self'",
    // Allow Sentry for error reporting (when configured)
    "https://sentry.io",
    "https://*.sentry.io",
    // Allow Vercel analytics
    "https://vitals.vercel-insights.com",
    // Allow Upstash Redis for rate limiting
    "https://*.upstash.io",
  ],
  
  // Media: Self-hosted content
  mediaSrc: ["'self'"],
  
  // Objects: Disable for security
  objectSrc: ["'none'"],
  
  // Base URI: Only self
  baseUri: ["'self'"],
  
  // Forms: Only submit to self
  formAction: ["'self'"],
  
  // Frames: Completely disable
  frameAncestors: ["'none'"],
  frameSrc: ["'none'"],
  
  // Worker: Allow service worker
  workerSrc: ["'self'", "blob:"],
  
  // Upgrade insecure requests in production
  upgradeInsecureRequests: process.env.NODE_ENV === 'production',
};