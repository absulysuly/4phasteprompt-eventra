import type { NextConfig } from "next";
// PWA disabled to fix CSP issues
// import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
  // Fix CSP issues by allowing necessary scripts
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https: blob:;
              connect-src 'self' https: wss: ws:;
              frame-src 'self' https:;
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ];
  },
  // Remove i18n config since we're using next-intl with app directory
  // i18n: {
  //   locales: ['en', 'ar', 'ku'],
  //   defaultLocale: 'en',
  //   localeDetection: true,
  // },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
