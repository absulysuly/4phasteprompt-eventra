import { NextRequest, NextResponse } from 'next/server';

// Define supported locales
const locales = ['ar', 'ku'];
const defaultLocale = 'ar';

function getLocale(request: NextRequest): string {
  // Check for locale in pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    // Try to detect locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      for (const locale of locales) {
        if (acceptLanguage.includes(locale)) {
          return locale;
        }
      }
    }
    return defaultLocale;
  }

  // Extract locale from pathname
  return pathname.split('/')[1] || defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Handle locale redirection for event routes
  if (pathname.startsWith('/event/') && !locales.some(locale => pathname.startsWith(`/${locale}/`))) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Handle locale redirection for events listing
  if (pathname === '/events' || pathname.startsWith('/events/')) {
    if (!locales.some(locale => pathname.startsWith(`/${locale}/`))) {
      const locale = getLocale(request);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  // Create response
  const response = NextResponse.next();

  // Add enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Strict CSP - removing unsafe-eval and unsafe-inline where possible
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval' https://va.vercel-scripts.com", // Removed unsafe-eval/inline
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Tailwind requires unsafe-inline
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.unsplash.com https://via.placeholder.com",
    "connect-src 'self' https://sentry.io https://*.sentry.io https://vitals.vercel-insights.com https://*.upstash.io",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    process.env.NODE_ENV === 'production' ? "upgrade-insecure-requests" : ""
  ].filter(Boolean).join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Rate limiting headers (for API routes)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    response.headers.set('X-RateLimit-Reset', String(Date.now() + 15 * 60 * 1000));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};