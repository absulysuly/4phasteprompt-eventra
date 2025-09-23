# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```powershell
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

### Database Operations
```powershell
# Generate Prisma client (run after schema changes)
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Reset database (DESTRUCTIVE)
npm run db:reset

# Seed database with initial data
npm run db:seed

# Deploy migrations to production
npm run db:deploy

# One-command setup (deploy + seed)
npm run db:setup

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Internationalization
```powershell
# Validate all translation files
npm run validate:translations

# Validate translations with fail-fast (CI)
npm run validate:translations:ci

# Check i18n configuration
npm run i18n:check
```

### Data Import
```powershell
# Import events from CSV files
npm run import:events:csv
```

### Testing Single Components
```powershell
# Test specific API endpoint
curl http://localhost:3000/api/health

# Test specific page during development
# Navigate to: http://localhost:3000/[locale]/events
# Navigate to: http://localhost:3000/ar/events (Arabic)
# Navigate to: http://localhost:3000/ku/events (Kurdish)
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.5.3 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Version 5+ with strict mode
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js with credentials + Google OAuth
- **Internationalization**: next-intl with 3 locales (en, ar, ku)
- **Styling**: Tailwind CSS v4 with RTL support
- **PWA**: next-pwa for offline capabilities
- **Security**: Rate limiting with Upstash Redis
- **Email**: Resend for transactional emails
- **Bundler**: Turbopack for ultra-fast builds

### Multi-Language Architecture
This is a sophisticated multilingual application supporting:
- **English (en)**: Default locale, no URL prefix
- **Arabic (ar)**: RTL language with /ar prefix
- **Kurdish (ku)**: RTL language with /ku prefix

**Key Components:**
- `middleware.ts`: Handles locale detection and routing
- `i18n.ts`: next-intl configuration
- `messages/`: JSON translation files for each locale
- `src/lib/i18n.ts`: Translation utilities
- Database translations via `EventTranslation` and `VenueTranslation` models

### Database Architecture
Prisma schema with sophisticated multi-venue platform support:

**Core Models:**
- `User`: Authentication with event/venue ownership
- `Event`: Events with localized content via translations
- `Venue`: Multi-type venues (EVENT, HOTEL, RESTAURANT, ACTIVITY, SERVICE)
- `EventTranslation`/`VenueTranslation`: Localized content storage
- `PasswordResetToken`: Secure password reset flow
- `Content`: CMS-style content management per locale

### Project Structure
```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── events/         # Event management pages
│   │   ├── register/       # User registration
│   │   └── event/[publicId]/ # Public event pages
│   ├── api/                # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── events/        # Event CRUD operations
│   │   ├── venues/        # Venue management
│   │   ├── health/        # System health check
│   │   └── upload/        # File upload handling
│   ├── components/        # Reusable UI components
│   ├── dashboard/         # User dashboard components
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── lib/                  # Core business logic
│   ├── auth.ts          # NextAuth configuration
│   ├── i18n.ts          # Translation utilities
│   ├── ratelimit.ts     # Rate limiting setup
│   └── geocode.ts       # Location services
└── types/               # TypeScript definitions

prisma/
├── schema.prisma        # Database schema
├── migrations/          # Database migration history
└── seed.ts             # Database seeding script

messages/               # i18n translation files
├── en.json            # English translations
├── ar.json            # Arabic translations
└── ku.json            # Kurdish translations
```

### Authentication System
- **NextAuth.js** with JWT strategy
- **Providers**: Email/password credentials + Google OAuth (when configured)
- **Security**: Secure cookie settings, session management
- **Database**: User storage with Prisma
- **Password Reset**: Token-based reset flow with expiration

### Security Features
- **CSP Headers**: Strict Content Security Policy
- **Security Headers**: HSTS, X-Frame-Options, etc.
- **Rate Limiting**: API endpoints protected with Upstash Redis
- **Input Validation**: TypeScript + runtime validation
- **SQL Injection**: Protected via Prisma ORM

### Performance Optimization
- **Turbopack**: Ultra-fast development builds
- **PWA**: Service worker for offline functionality
- **Image Optimization**: Next.js Image component with Unsplash CDN
- **Font Optimization**: Google Fonts with preloading
- **Caching**: API route caching and static generation

## Development Guidelines

### Internationalization Best Practices
- All user-facing text must be in translation files (`messages/`)
- Use `useTranslations()` hook in components
- Database content uses separate translation tables
- Test all locales: `http://localhost:3000`, `/ar`, `/ku`
- RTL layouts automatically applied for Arabic/Kurdish

### Database Workflow
1. Modify `prisma/schema.prisma` for schema changes
2. Run `npm run db:migrate` to create migration
3. Run `npm run db:generate` to update Prisma client
4. Update TypeScript types as needed
5. Test with `npm run db:studio`

### Multi-Venue Platform Concepts
This platform supports multiple venue types:
- **Events**: Concerts, conferences, festivals
- **Hotels**: Accommodations with amenities
- **Restaurants**: Dining with cuisine types
- **Activities**: Tours, experiences
- **Services**: Various business services

Each venue type shares common fields but has specialized attributes.

### API Development
- Rate limiting applied to all API routes
- Authentication required for protected endpoints
- Input validation with TypeScript
- Error handling with proper HTTP status codes
- Health check endpoint: `/api/health`

### Component Architecture
- **Server Components**: Default for better performance
- **Client Components**: Marked with "use client" for interactivity
- **Responsive Design**: Mobile-first with Tailwind CSS
- **RTL Support**: Automatic layout mirroring for Arabic/Kurdish

### Environment Setup
Required environment variables:
- `DATABASE_URL`: Prisma database connection
- `NEXTAUTH_SECRET`: JWT signing secret (32+ chars)
- `NEXTAUTH_URL`: Application URL
- Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for OAuth
- Optional: `UPSTASH_REDIS_*` for rate limiting
- Optional: `RESEND_API_KEY` for emails
