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

# Run ESLint
npm run lint
```

### Development Server Details
- Development server runs on http://localhost:3000
- Uses Turbopack for fast hot module replacement
- Auto-updates on file changes in `src/app/` directory

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.5.3 with App Router
- **React**: Version 19.1.0
- **TypeScript**: Version 5+ with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS
- **Bundler**: Turbopack (enabled for both dev and build)
- **Fonts**: Geist Sans and Geist Mono from Google Fonts

### Project Structure
```
src/
├── app/                    # App Router directory (Next.js 13+)
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Homepage component
│   ├── globals.css        # Global styles with Tailwind
│   └── favicon.ico        # Site favicon
public/                    # Static assets
├── file.svg, globe.svg    # Icon assets
├── next.svg, vercel.svg   # Brand logos
└── window.svg
```

### Key Configuration Files
- **next.config.ts**: Next.js configuration (currently minimal)
- **tsconfig.json**: TypeScript configuration with path aliases (`@/*` maps to `./src/*`)
- **eslint.config.mjs**: ESLint configuration using Next.js rules
- **postcss.config.mjs**: PostCSS configuration for Tailwind CSS
- **package.json**: Project dependencies and npm scripts

### Styling System
- **Tailwind CSS v4** with custom CSS variables
- **Dark mode support** via `prefers-color-scheme`
- **Custom properties**:
  - `--background` and `--foreground` for theme colors
  - `--font-geist-sans` and `--font-geist-mono` for typography
- **Font loading**: Optimized with `next/font/google`

## Project Configuration

### Import Aliases
- `@/*` - Maps to `./src/*` directory for cleaner imports

### TypeScript Configuration
- **Target**: ES2017
- **Strict mode**: Enabled
- **Module resolution**: Bundler
- **JSX**: Preserve (handled by Next.js)
- **Incremental compilation**: Enabled

### ESLint Rules
- Extends `next/core-web-vitals` and `next/typescript`
- Ignores build directories: `.next/`, `out/`, `build/`
- Ignores generated files: `next-env.d.ts`

## Development Guidelines

### File Naming Conventions
- React components: PascalCase (e.g., `RootLayout`, `HomePage`)
- Configuration files: kebab-case with appropriate extensions
- App Router: Use `page.tsx` for pages, `layout.tsx` for layouts

### Component Architecture
- **Root Layout** (`src/app/layout.tsx`): Contains HTML structure, font loading, and global metadata
- **Page Components**: Located in `src/app/` following App Router conventions
- **Styling**: Uses Tailwind classes with custom CSS variables for theming

### Performance Considerations
- Turbopack is enabled for faster builds and development
- Next.js Image component is used for optimized image loading
- Fonts are optimized and preloaded using `next/font/google`

### Development Workflow
1. **Local Development**: Use `npm run dev` for hot reloading with Turbopack
2. **Code Quality**: Run `npm run lint` before commits
3. **Production Testing**: Use `npm run build && npm start` to test production builds
4. **File Changes**: Edit `src/app/page.tsx` to modify the homepage

### Current State
This is a fresh Next.js project with minimal customization. The main page (`src/app/page.tsx`) contains the default Next.js starter template with Tailwind CSS styling and includes:
- Next.js logo and branding
- Links to Vercel deployment and Next.js documentation
- Responsive design with dark mode support
- Instructions for getting started

### Next Steps for Development
- Replace the default homepage content with actual application features
- Set up environment variables for external services
- Add database integration (consider Prisma or Drizzle ORM)
- Implement authentication system
- Create additional pages and components as needed
- Add testing framework (Jest, Vitest, or Playwright)