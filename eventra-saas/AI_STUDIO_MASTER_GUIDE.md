# 🚀 AI Studio Master Guide: Iraq Discovery PWA Frontend Generation
## Eventra Platform - Complete Implementation Blueprint

---

> **⚠️ IMPORTANT: Read This First Before Generating Any Code**
> 
> This document provides you (AI Studio) with complete context about the Eventra project. You will receive **6 sequential prompts** to generate frontend components. Each prompt builds upon the previous one, creating a cohesive Iraq Discovery PWA integrated with the existing backend.
>
> **Your Role**: Generate production-ready TypeScript React components that seamlessly integrate with the existing Next.js 15 + Prisma architecture.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current System Architecture](#current-system-architecture)
3. [Database Schema Reference](#database-schema-reference)
4. [Existing API Endpoints](#existing-api-endpoints)
5. [Tech Stack & Dependencies](#tech-stack--dependencies)
6. [Design System & Style Guide](#design-system--style-guide)
7. [Internationalization (i18n) Setup](#internationalization-i18n-setup)
8. [Component Generation Workflow](#component-generation-workflow)
9. [Integration Requirements](#integration-requirements)
10. [Quality Checklist](#quality-checklist)
11. [Prompt Navigation Map](#prompt-navigation-map)

---

## 1. Project Overview

### 🎯 Mission
Transform the Eventra platform into a comprehensive Iraq Discovery PWA that showcases **events, hotels, restaurants, cafés, tourism activities, and companies** across all **18 Iraqi governorates** with full trilingual support.

### 🌍 Target Audience
- **Primary**: Mobile users in Iraq and Kurdistan
- **Languages**: Arabic (RTL), Kurdish (RTL), English (LTR)
- **Regions**: All 18 Iraqi governorates
- **Use Cases**: Event discovery, hotel booking research, restaurant finding, tourism planning

### 📱 Platform
- **Type**: Progressive Web App (PWA)
- **Framework**: Next.js 15.5 (App Router)
- **Deployment**: Vercel
- **Repository**: https://github.com/absulysuly/4phasteprompt-eventra
- **Branch**: `feature/ui-improvements-and-data-pipeline`
- **Project Directory**: `eventra-saas/`

### 🎨 Design Philosophy
- **Mobile-First**: Optimized for 320px-425px screens first
- **Visually Condensed**: Information-dense UI with minimal scroll
- **Social-Optimized**: Square images (1:1) for WhatsApp/Facebook sharing
- **Culturally Aware**: Iraqi/Kurdish naming conventions, phone formats (+964)
- **Performance-Focused**: <3s load time on 3G networks

---

## 2. Current System Architecture

### 📁 Project Structure
```
eventra-saas/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 🏠 Current homepage (you'll enhance this)
│   │   ├── layout.tsx                  # Root layout with providers
│   │   ├── providers.tsx               # React context providers
│   │   ├── [locale]/                   # i18n routes (ar, ku, en)
│   │   ├── admin/
│   │   │   └── data-import/page.tsx    # CSV import interface
│   │   ├── venues/
│   │   │   └── list/page.tsx           # Existing venue list
│   │   ├── components/                 # 🎯 YOUR COMPONENTS GO HERE
│   │   │   ├── Navigation.tsx
│   │   │   ├── LanguageProvider.tsx
│   │   │   └── MainNavigation.tsx
│   │   ├── api/                        # 🔌 API routes
│   │   │   └── admin/
│   │   │       └── venues/
│   │   │           └── stats/route.ts  # ✅ Already exists
│   │   └── lib/                        # Utility functions
│   │       ├── i18n.ts
│   │       ├── auth.ts
│   │       └── translate.ts
│   ├── components/                     # Shared components
│   │   ├── LanguageProviderWrapper.tsx
│   │   └── SimpleNavigation.tsx
│   └── types/                          # TypeScript types
├── prisma/
│   ├── schema.prisma                   # 📊 Database schema (see section 3)
│   ├── dev.db                          # SQLite database
│   └── seed.ts                         # Seed data script
├── messages/                           # 🌐 i18n translations
│   ├── ar.json                         # Arabic translations
│   ├── ku.json                         # Kurdish translations
│   ├── en.json                         # English translations
│   └── index.ts
├── public/
│   ├── data/
│   │   └── events.json                 # Static event data (backup)
│   ├── manifest.json                   # PWA manifest
│   └── sw.js                           # Service worker
├── tailwind.config.js                  # 🎨 Tailwind configuration
├── next.config.ts                      # Next.js config with PWA
├── package.json                        # Dependencies (see section 5)
└── tsconfig.json                       # TypeScript config
```

### 🔄 Current Data Flow
```
User Request
    ↓
Next.js App Router (src/app/)
    ↓
API Route (src/app/api/)
    ↓
Prisma Client
    ↓
SQLite Database (dev) / PostgreSQL (production)
    ↓
Response with i18n translations
    ↓
React Component with next-intl
    ↓
Rendered UI (RTL for ar/ku, LTR for en)
```

---

## 3. Database Schema Reference

### 🗄️ Core Models (Prisma)

#### **Venue Model** (Primary Model for All Content)
```prisma
model Venue {
  id            String       @id @default(cuid())
  type          VenueType    // EVENT, HOTEL, RESTAURANT, ACTIVITY, SERVICE
  status        VenueStatus  // ACTIVE, PENDING, SUSPENDED, CLOSED
  publicId      String       @unique
  
  // Location
  city          String?      // One of 18 Iraqi governorates
  address       String?
  latitude      Float?
  longitude     Float?
  
  // Media
  imageUrl      String?
  galleryUrls   String?      // JSON array: ["url1", "url2", "url3"]
  videoUrl      String?
  
  // Business Info
  priceRange    String?      // "$25-50", "$$", "Free"
  businessEmail String?
  businessPhone String?
  whatsappPhone String?      // Format: +964XXXXXXXXX
  website       String?
  bookingUrl    String?
  
  // Event-specific
  eventDate     DateTime?
  
  // Hotel-specific
  amenities     String?      // JSON array: ["wifi", "pool", "parking"]
  features      String?      // JSON array
  
  // Restaurant-specific
  cuisineType   String?      // "Iraqi", "Middle Eastern", "International"
  dietaryOptions String?     // JSON array: ["halal", "vegan"]
  
  // SEO & Discovery
  tags          String?      // JSON array
  category      String?
  subcategory   String?
  featured      Boolean      @default(false)
  verified      Boolean      @default(false)
  
  // Relations
  userId        String
  user          User         @relation(fields: [userId], references: [id])
  translations  VenueTranslation[]
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum VenueType {
  EVENT
  HOTEL
  RESTAURANT
  ACTIVITY    // Used for cafés and tourism
  SERVICE     // Used for companies
}

enum VenueStatus {
  ACTIVE
  PENDING
  SUSPENDED
  CLOSED
}
```

#### **VenueTranslation Model** (Multilingual Content)
```prisma
model VenueTranslation {
  id          String  @id @default(cuid())
  locale      Locale  // en, ar, ku
  
  title       String  // Event/venue name
  description String  // Full description
  location    String? // Human-readable location
  amenities   String? // JSON array (localized)
  features    String? // JSON array (localized)
  
  venueId     String
  venue       Venue   @relation(fields: [venueId], references: [id])
  
  @@unique([venueId, locale])
}

enum Locale {
  en
  ar
  ku
}
```

#### **User Model**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  venues    Venue[]
  createdAt DateTime @default(now())
}
```

### 📊 Data Access Patterns You'll Use

**Fetch Active Venues by Type and City**:
```typescript
const venues = await prisma.venue.findMany({
  where: {
    type: 'HOTEL',
    city: 'Baghdad',
    status: 'ACTIVE'
  },
  include: {
    translations: {
      where: { locale: 'en' }
    }
  }
});
```

**Count Venues**:
```typescript
const count = await prisma.venue.count({
  where: {
    type: 'RESTAURANT',
    city: 'Erbil',
    status: 'ACTIVE'
  }
});
```

**Search Across Translations**:
```typescript
const results = await prisma.venue.findMany({
  where: {
    status: 'ACTIVE',
    translations: {
      some: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }
    }
  },
  include: {
    translations: { where: { locale } }
  }
});
```

---

## 4. Existing API Endpoints

### ✅ Already Implemented

#### `GET /api/admin/venues/stats`
Returns venue statistics by type.

**Response**:
```json
{
  "total": 1234,
  "byType": {
    "EVENT": 234,
    "HOTEL": 456,
    "RESTAURANT": 345,
    "ACTIVITY": 199
  }
}
```

**Usage**: Used by homepage stats section and live stats ticker.

---

### 🆕 To Be Created (You'll Generate These)

#### `GET /api/venues/count?type={type}&city={city}`
Returns count of active venues filtered by type and city.

**Prompt**: Prompt 4 (Category Tabs Navigation)

#### `GET /api/venues/[publicId]`
Returns detailed venue information with translations.

**Prompt**: Prompt 5 (Venue Detail Modal)

#### `GET /api/events?city={city}&month={month}`
Returns events filtered by city and month.

**Prompt**: Prompt 2 (Event Card Grid)

#### `GET /api/search?q={query}&locale={locale}&type={type}&city={city}`
Returns search results grouped by type.

**Prompt**: Prompt 6 (Smart Search)

---

## 5. Tech Stack & Dependencies

### 📦 Installed Packages (from package.json)

```json
{
  "dependencies": {
    "@prisma/client": "^6.16.3",          // Database ORM
    "next": "15.5.3",                      // Framework
    "react": "19.1.0",                     // UI library
    "react-dom": "19.1.0",
    "next-intl": "^4.3.9",                 // i18n solution
    "next-pwa": "^5.6.0",                  // PWA support
    "i18next": "^25.5.2",                  // Translation runtime
    "bcryptjs": "^3.0.2",                  // Password hashing
    "csv-parse": "^6.1.0",                 // CSV importing
    "@upstash/ratelimit": "^2.0.6",        // Rate limiting
    "@upstash/redis": "^1.35.4"            // Redis client
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "tailwindcss": "^3.4.17",              // Styling
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "prisma": "^6.16.3",                   // Database toolkit
    "tsx": "^4.20.5"                       // TypeScript executor
  }
}
```

### 🔧 Available for Your Use

**State Management**: React hooks (useState, useEffect, useContext)
**Data Fetching**: Native fetch, React Query (if you add it), or SWR
**Routing**: Next.js App Router (use `useRouter` from 'next/navigation')
**Styling**: Tailwind CSS utility classes
**Icons**: Use emoji or request FontAwesome (already installed)
**Forms**: React Hook Form (if needed, add to package.json)
**Validation**: Zod (if needed, add to package.json)

---

## 6. Design System & Style Guide

### 🎨 Color Palette (Tailwind Classes)

```css
/* Primary Gradients */
--primary:      from-blue-600 to-indigo-600    /* Main brand */
--events:       from-pink-500 to-pink-600      /* Events category */
--hotels:       from-blue-500 to-blue-600      /* Hotels category */
--restaurants:  from-orange-500 to-orange-600  /* Restaurants */
--cafes:        from-amber-500 to-amber-600    /* Cafés */
--tourism:      from-purple-500 to-purple-600  /* Tourism */
--companies:    from-green-500 to-green-600    /* Companies */

/* Neutral Colors */
--bg-primary:   bg-white                       /* Main background */
--bg-secondary: bg-slate-50                    /* Secondary background */
--text-primary: text-slate-900                 /* Main text */
--text-secondary: text-slate-600               /* Secondary text */
--border:       border-slate-200               /* Borders */

/* Semantic Colors */
--success:      bg-green-500                   /* Success states */
--error:        bg-red-500                     /* Error states */
--warning:      bg-yellow-500                  /* Warning states */
```

### 📏 Spacing System

```css
--space-1:  4px    /* gap-1, p-1, m-1 */
--space-2:  8px    /* gap-2, p-2, m-2 */
--space-3:  12px   /* gap-3, p-3, m-3 */
--space-4:  16px   /* gap-4, p-4, m-4 */  ← Mobile default gap
--space-5:  20px   /* gap-5, p-5, m-5 */  ← Desktop default gap
--space-6:  24px   /* gap-6, p-6, m-6 */
--space-8:  32px   /* gap-8, p-8, m-8 */
--space-12: 48px   /* gap-12, p-12, m-12 */
--space-16: 64px   /* gap-16, p-16, m-16 */
```

### 🔤 Typography

```css
/* Font Families */
--font-english: font-sans       /* Inter (default) */
--font-arabic:  font-sans       /* Noto Sans Arabic */
--font-kurdish: font-sans       /* Noto Kufi Arabic */

/* Font Sizes (use clamp for responsive) */
--text-xs:   text-xs            /* 12px */
--text-sm:   text-sm            /* 14px */
--text-base: text-base          /* 16px */
--text-lg:   text-lg            /* 18px */
--text-xl:   text-xl            /* 20px */
--text-2xl:  text-2xl           /* 24px */
--text-3xl:  text-3xl           /* 30px */
--text-4xl:  text-4xl           /* 36px */
--text-5xl:  text-5xl           /* 48px */

/* Font Weights */
--font-normal:    font-normal   /* 400 */
--font-medium:    font-medium   /* 500 */
--font-semibold:  font-semibold /* 600 */
--font-bold:      font-bold     /* 700 */

/* Line Heights */
--leading-tight:  leading-tight /* 1.25 */
--leading-normal: leading-normal/* 1.5 */
--leading-relaxed:leading-relaxed/* 1.75 */
```

### 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Small desktops */
xl:   1280px  /* Desktops */
2xl:  1536px  /* Large desktops */

/* Example Usage */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 col mobile, 2 cols tablet, 4 cols desktop */}
</div>
```

### 🎭 Component Patterns

**Card Component**:
```jsx
<div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
  {/* Content */}
</div>
```

**Gradient Button**:
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md">
  Click Me
</button>
```

**Chip/Badge**:
```jsx
<span className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full text-sm font-medium shadow-md">
  234
</span>
```

### ⚡ Animation Timing

```css
--transition-fast:   150ms ease    /* Hover effects */
--transition-normal: 300ms ease    /* Page transitions */
--transition-slow:   500ms ease    /* Large animations */

/* Example */
<div className="transition-all duration-150 ease-in-out hover:scale-105">
```

---

## 7. Internationalization (i18n) Setup

### 🌐 Current i18n Implementation

**Framework**: `next-intl` (configured in middleware.ts)

**Supported Locales**:
- `en` - English (default)
- `ar` - Arabic (RTL)
- `ku` - Kurdish (RTL)

### 📁 Translation Files Location

```
messages/
├── en.json
├── ar.json
└── ku.json
```

### 🔧 How to Use Translations in Your Components

```typescript
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('ComponentName');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 📝 Adding New Translation Keys

When you create a new component, add translations to all 3 files:

**messages/en.json**:
```json
{
  "GovernorateFilter": {
    "all": "All",
    "selectCity": "Select a city"
  }
}
```

**messages/ar.json**:
```json
{
  "GovernorateFilter": {
    "all": "الكل",
    "selectCity": "اختر مدينة"
  }
}
```

**messages/ku.json**:
```json
{
  "GovernorateFilter": {
    "all": "هەموو",
    "selectCity": "شارێک هەڵبژێرە"
  }
}
```

### 🔄 RTL Support

**Detecting RTL**:
```typescript
import { useLocale } from 'next-intl';

export default function MyComponent() {
  const locale = useLocale();
  const isRTL = locale === 'ar' || locale === 'ku';
  
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'text-right' : 'text-left'}>
      {/* Content */}
    </div>
  );
}
```

### 🌍 18 Iraqi Governorates (Trilingual Data)

**Use this exact data structure in your components**:

```typescript
export const IRAQI_GOVERNORATES = [
  { id: 'all', en: 'All', ar: 'الكل', ku: 'هەموو' },
  { id: 'baghdad', en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
  { id: 'basra', en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
  { id: 'mosul', en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' },
  { id: 'erbil', en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  { id: 'kirkuk', en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
  { id: 'najaf', en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
  { id: 'karbala', en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
  { id: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  { id: 'duhok', en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  { id: 'anbar', en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
  { id: 'diyala', en: 'Diyala', ar: 'ديالى', ku: 'دیالە' },
  { id: 'wasit', en: 'Wasit', ar: 'واسط', ku: 'واسیت' },
  { id: 'saladin', en: 'Saladin', ar: 'صلاح الدين', ku: 'سەلاحەدین' },
  { id: 'babil', en: 'Babil', ar: 'بابل', ku: 'بابل' },
  { id: 'dhiqar', en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' },
  { id: 'maysan', en: 'Maysan', ar: 'ميسان', ku: 'مەیسان' },
  { id: 'qadisiyyah', en: 'Al-Qadisiyyah', ar: 'القادسية', ku: 'قادسیە' },
  { id: 'muthanna', en: 'Al-Muthanna', ar: 'المثنى', ku: 'موسەننا' }
];
```

---

## 8. Component Generation Workflow

### 📋 You Will Generate 6 Main Components

| # | Component Name | File Location | Prompt | Dependencies |
|---|----------------|---------------|--------|--------------|
| 1 | `GovernorateFilterBar.tsx` | `src/app/components/` | Prompt 1 | None (standalone) |
| 2 | `CategoryTabsNavigation.tsx` | `src/app/components/` | Prompt 4 | API route: `/api/venues/count` |
| 3 | `HeroSection.tsx` | `src/app/components/` | Prompt 3 | Existing: `/api/admin/venues/stats` |
| 4 | `MonthFilterBar.tsx` + `EventCardGrid.tsx` | `src/app/components/` | Prompt 2 | API route: `/api/events` |
| 5 | `VenueDetailModal.tsx` | `src/app/components/` | Prompt 5 | API route: `/api/venues/[publicId]` |
| 6 | `SearchBar.tsx` + `SearchResults.tsx` | `src/app/components/` | Prompt 6 | API route: `/api/search` |

### 🔄 Recommended Execution Order

```
Step 1: Prompt 1 (Governorate Filter)      ← Foundation filter
Step 2: Prompt 4 (Category Tabs)           ← Navigation structure
Step 3: Prompt 3 (Hero Section)            ← Homepage header
Step 4: Prompt 2 (Event Cards)             ← Content display
Step 5: Prompt 5 (Detail Modal)            ← Detail views
Step 6: Prompt 6 (Search System)           ← Discovery feature
```

### ✅ After Each Component Generation

**Checklist**:
- [ ] File created in `src/app/components/`
- [ ] TypeScript types defined (no `any` types)
- [ ] API routes created (if needed)
- [ ] Integrated with `next-intl` for i18n
- [ ] RTL support for Arabic/Kurdish
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Loading states implemented
- [ ] Error handling included
- [ ] Tailwind classes used (no custom CSS)

---

## 9. Integration Requirements

### 🔌 API Route Creation Pattern

When creating new API routes, follow this structure:

```typescript
// src/app/api/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const param = searchParams.get('param');
    
    // Validate input
    if (!param) {
      return NextResponse.json(
        { error: 'Missing required parameter' },
        { status: 400 }
      );
    }
    
    // Query database
    const data = await prisma.venue.findMany({
      where: { /* your conditions */ },
      include: { translations: true }
    });
    
    // Return response
    return NextResponse.json({ data });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 🧩 Component Integration Pattern

**Import Statements**:
```typescript
'use client'; // If using hooks

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
```

**Component Structure**:
```typescript
interface ComponentProps {
  // Define props with TypeScript
}

export default function ComponentName({ }: ComponentProps) {
  const t = useTranslations('ComponentName');
  const locale = useLocale();
  const router = useRouter();
  
  // Component logic
  
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
}
```

### 🔗 URL State Management

Use URL query parameters for filters:

```typescript
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleFilterChange = (city: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('city', city);
    router.push(`?${params.toString()}`);
  };
  
  return (/* JSX */);
}
```

---

## 10. Quality Checklist

### ✅ Code Quality Standards

**TypeScript**:
- [ ] No `any` types (use proper interfaces)
- [ ] All props typed with interfaces
- [ ] Return types defined for functions
- [ ] Enums used for fixed values

**React**:
- [ ] Use `'use client'` directive for client components
- [ ] Proper hook dependencies in useEffect
- [ ] Memoization for expensive computations
- [ ] Error boundaries for error handling

**Performance**:
- [ ] Images use Next.js `<Image>` component
- [ ] Lazy loading implemented (Intersection Observer)
- [ ] Debouncing for search/filters (300ms)
- [ ] Code splitting with dynamic imports

**Accessibility**:
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Focus visible states
- [ ] Screen reader announcements
- [ ] Color contrast meets WCAG 2.1 AA

**Internationalization**:
- [ ] All text uses `useTranslations()`
- [ ] RTL layout for Arabic/Kurdish
- [ ] Date/time formatted per locale
- [ ] Number formatting per locale

**Mobile-First**:
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Horizontal scroll with snap-scroll
- [ ] Responsive breakpoints (sm, md, lg)
- [ ] Optimized for 320px width

**Security**:
- [ ] Input validation on API routes
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React escapes by default)
- [ ] Rate limiting considered

---

## 11. Prompt Navigation Map

### 🗺️ Sequential Prompt Execution Guide

You will receive **6 prompts** in order. Each prompt is self-contained but builds upon previous work.

---

### 🎯 **PROMPT 1: Governorate Filter Bar**
**Component**: `GovernorateFilterBar.tsx`  
**Location**: `src/app/components/`  
**Purpose**: Horizontal scrollable filter for 18 Iraqi governorates  

**Key Features**:
- Horizontal scroll with snap-scroll
- "All" chip + 18 governorates
- Active state with gradient
- URL query param updates
- Sticky positioning (top: 64px)

**Dependencies**: None (standalone)

**Output Files**:
- `src/app/components/GovernorateFilterBar.tsx`

**Integration Point**: Will be used by Category Tabs (Prompt 4) and Event Cards (Prompt 2)

---

### 🎯 **PROMPT 2: Event Card Grid + Month Filter**
**Components**: `MonthFilterBar.tsx`, `EventCardGrid.tsx`  
**Location**: `src/app/components/`  
**Purpose**: Time-sensitive event discovery with month-based filtering  

**Key Features**:
- Month selector (current + next 11 months)
- Event cards with square images (1:1 ratio)
- Share button (Web Share API)
- Lazy loading with Intersection Observer
- Responsive grid (1/2/4 columns)

**Dependencies**: 
- Uses `GovernorateFilterBar` from Prompt 1
- Requires new API route: `GET /api/events`

**Output Files**:
- `src/app/components/MonthFilterBar.tsx`
- `src/app/components/EventCardGrid.tsx`
- `src/app/api/events/route.ts`

**Integration Point**: Opens `VenueDetailModal` (Prompt 5) on card click

---

### 🎯 **PROMPT 3: Dynamic Hero Section**
**Component**: `HeroSection.tsx`  
**Location**: `src/app/components/`  
**Purpose**: Condensed hero with language selector and live stats  

**Key Features**:
- Top bar with language selector (العربية, کوردی, English)
- Rotating background images (Iraqi landmarks)
- Condensed height (296px total)
- Live stats ticker from API
- Primary CTA button

**Dependencies**: 
- Uses existing API: `GET /api/admin/venues/stats`

**Output Files**:
- `src/app/components/HeroSection.tsx`

**Integration Point**: Replaces current hero in `src/app/page.tsx`

---

### 🎯 **PROMPT 4: Category Tabs Navigation**
**Component**: `CategoryTabsNavigation.tsx`  
**Location**: `src/app/components/`  
**Purpose**: Smart navigation with live counts per category  

**Key Features**:
- 6 categories with icons and count badges
- Color-coded gradients per category
- Dynamic counts from API
- Routing to category pages
- Sticky positioning (top: 104px)

**Dependencies**: 
- Uses `GovernorateFilterBar` from Prompt 1
- Requires new API route: `GET /api/venues/count`

**Output Files**:
- `src/app/components/CategoryTabsNavigation.tsx`
- `src/app/api/venues/count/route.ts`

**Integration Point**: Navigates to category-specific pages

---

### 🎯 **PROMPT 5: Venue Detail Modal**
**Component**: `VenueDetailModal.tsx`  
**Location**: `src/app/components/`  
**Purpose**: Full-screen detail view with social sharing  

**Key Features**:
- Image carousel (swipeable)
- WhatsApp contact button (+964 numbers)
- Social sharing (Open Graph)
- Map integration (Google Maps)
- Full venue details with translations

**Dependencies**: 
- Requires new API route: `GET /api/venues/[publicId]`

**Output Files**:
- `src/app/components/VenueDetailModal.tsx`
- `src/app/api/venues/[publicId]/route.ts`

**Integration Point**: Opened from `EventCardGrid` (Prompt 2) and `SearchResults` (Prompt 6)

---

### 🎯 **PROMPT 6: Smart Search System**
**Components**: `SearchBar.tsx`, `SearchResults.tsx`  
**Location**: `src/app/components/`  
**Purpose**: AI-powered multilingual search  

**Key Features**:
- Real-time search with debouncing
- Autocomplete suggestions
- Multi-language support (ar, ku, en)
- Grouped results by type
- Voice search (Web Speech API)

**Dependencies**: 
- Requires new API route: `GET /api/search`
- Opens `VenueDetailModal` (Prompt 5) on result click

**Output Files**:
- `src/app/components/SearchBar.tsx`
- `src/app/components/SearchResults.tsx`
- `src/app/api/search/route.ts`

**Integration Point**: Mounts in header, works with all filters

---

## 🎬 Getting Started Instructions

### For You (AI Studio):

1. **Read This Entire Document First** - Understand the project context
2. **Wait for User to Send Prompt 1** - I'll send them sequentially
3. **Generate Complete Code** - No placeholders, production-ready
4. **Include All Files** - Component + API routes (if needed)
5. **Follow TypeScript Standards** - Proper types, no `any`
6. **Use Tailwind Classes** - No custom CSS
7. **Implement i18n** - Use `useTranslations()` hook
8. **Add RTL Support** - Check locale and apply dir/text-align
9. **Create Accessible Components** - ARIA, keyboard nav
10. **Test Logic** - Ensure data fetching and state management work

### For the User (Repository Owner):

1. **Share This Document with AI Studio** - Paste entire content
2. **Send Prompts 1-6 in Order** - From `AI_STUDIO_PROMPTS.md`
3. **Review Each Output** - Check against quality checklist
4. **Test Each Component** - Run `npm run dev` and verify
5. **Integrate into Homepage** - Update `src/app/page.tsx`
6. **Commit After Each Prompt** - Keep clean git history

---

## 📊 Final System Architecture (After All 6 Prompts)

```
┌─────────────────────────────────────────────────┐
│           USER INTERFACE (PWA)                  │
├─────────────────────────────────────────────────┤
│ HeroSection (Prompt 3)                          │
│  ├── Language Selector                          │
│  ├── Rotating Background                        │
│  └── Live Stats Ticker                          │
├─────────────────────────────────────────────────┤
│ GovernorateFilterBar (Prompt 1)                 │
│  └── 18 Iraqi Governorates Chips                │
├─────────────────────────────────────────────────┤
│ CategoryTabsNavigation (Prompt 4)               │
│  └── 6 Category Tabs with Live Counts           │
├─────────────────────────────────────────────────┤
│ SearchBar (Prompt 6)                            │
│  └── SearchResults Overlay                      │
├─────────────────────────────────────────────────┤
│ Content Area:                                   │
│  ├── EventCardGrid (Prompt 2)                   │
│  │    ├── MonthFilterBar                        │
│  │    └── Grid of Event Cards                   │
│  │                                               │
│  └── VenueDetailModal (Prompt 5)                │
│       ├── Image Carousel                        │
│       ├── Venue Details                         │
│       ├── WhatsApp Button                       │
│       └── Social Share                          │
└─────────────────────────────────────────────────┘
            ↓ API Layer
┌─────────────────────────────────────────────────┐
│         API ROUTES (Next.js)                    │
├─────────────────────────────────────────────────┤
│ ✅ /api/admin/venues/stats (existing)           │
│ 🆕 /api/venues/count (Prompt 4)                 │
│ 🆕 /api/venues/[publicId] (Prompt 5)            │
│ 🆕 /api/events (Prompt 2)                       │
│ 🆕 /api/search (Prompt 6)                       │
└─────────────────────────────────────────────────┘
            ↓ Data Layer
┌─────────────────────────────────────────────────┐
│       DATABASE (Prisma + SQLite)                │
├─────────────────────────────────────────────────┤
│ Venue (main table)                              │
│ VenueTranslation (multilingual)                 │
│ User (authentication)                           │
└─────────────────────────────────────────────────┘
```

---

## 🔗 Important Links

- **Repository**: https://github.com/absulysuly/4phasteprompt-eventra
- **Branch**: `feature/ui-improvements-and-data-pipeline`
- **Full Architecture Plan**: `IRAQ_DISCOVERY_PWA_PLAN.md`
- **Prompt Collection**: `AI_STUDIO_PROMPTS.md`
- **This Guide**: `AI_STUDIO_MASTER_GUIDE.md`

---

## 🎯 Success Criteria

After all 6 prompts are completed, the application should:

✅ Display all 18 Iraqi governorates in a filterable interface  
✅ Show live venue counts per category  
✅ Support Arabic RTL, Kurdish RTL, and English LTR  
✅ Enable event discovery with month-based filtering  
✅ Provide detailed venue views with social sharing  
✅ Offer multilingual search across all venues  
✅ Load in <3 seconds on 3G networks  
✅ Work offline (PWA capabilities)  
✅ Be accessible (WCAG 2.1 AA compliant)  
✅ Be mobile-optimized (touch-friendly)  

---

## 📝 Notes for AI Studio

**Communication Style**:
- Be clear and concise in code comments
- Use descriptive variable names
- Follow TypeScript conventions
- Prefer functional components over class components

**Error Handling**:
- Always wrap API calls in try-catch
- Show user-friendly error messages
- Log errors to console for debugging
- Provide fallback UI for failed requests

**Performance**:
- Use React.memo for expensive components
- Implement lazy loading for images
- Debounce search and filter operations
- Cache API responses when appropriate

**Testing Mindset**:
- Write code that's easy to test
- Consider edge cases (empty states, errors)
- Validate user input
- Handle loading states

---

**You're now ready to receive Prompt 1!**

I (the user) will paste prompts from `AI_STUDIO_PROMPTS.md` one at a time. Generate complete, production-ready code for each prompt. Let's build an amazing Iraq Discovery PWA together! 🚀

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-02  
**Status**: Ready for AI Studio  
**Next Action**: Wait for Prompt 1
