# 🎨 AI Studio Frontend Generation Prompts
## Iraq Discovery PWA - Eventra Integration

> **Context**: These prompts are designed for AI Studio (Cursor, Windsurf, Bolt, v0, etc.) to generate frontend components that seamlessly integrate with the existing Eventra app structure.

> **Repository**: https://github.com/absulysuly/4phasteprompt-eventra
> **Current Branch**: `feature/ui-improvements-and-data-pipeline`
> **Tech Stack**: Next.js 15.5, React 19, TypeScript, Tailwind CSS, Prisma, SQLite

---

## 📋 Prerequisites for AI Studio

Before using these prompts, ensure AI Studio is aware of:

1. **Existing Database Schema** (`prisma/schema.prisma`):
   - `Venue` model with `VenueType` enum (EVENT, HOTEL, RESTAURANT, ACTIVITY, SERVICE)
   - `VenueTranslation` for multilingual support (ar, ku, en)
   - Location fields: `city`, `latitude`, `longitude`
   
2. **Current Project Structure**:
   ```
   eventra-saas/
   ├── src/app/
   │   ├── page.tsx (current homepage)
   │   ├── [locale]/ (i18n routes)
   │   ├── venues/list/page.tsx
   │   ├── admin/data-import/page.tsx
   │   └── components/ (shared components)
   ├── prisma/schema.prisma
   ├── messages/ (ar.json, ku.json, en.json)
   └── public/
   ```

3. **Existing Features**:
   - ✅ Trilingual support (Arabic RTL, Kurdish, English)
   - ✅ PWA configured (`next-pwa`)
   - ✅ Tailwind CSS for styling
   - ✅ Prisma ORM with SQLite
   - ✅ API routes for venues and stats
   - ✅ Component library (Navigation, LanguageProvider, etc.)

4. **API Endpoints Already Available**:
   - `GET /api/admin/venues/stats` - Get venue statistics
   - `POST /api/admin/venues` - Create/import venues
   - `GET /api/venues` - List venues (to be created)

---

## 🎯 Prompt 1: Governorate Filter Bar Component
### "The 18 Iraqi Governorates Horizontal Scroller"

```
CONTEXT: I'm working on the Eventra app (Next.js 15, TypeScript, Tailwind). The app has a Venue model with a 'city' field. I need a mobile-first horizontal scrollable filter bar for all 18 Iraqi governorates.

TASK: Create a React component called `GovernorateFilterBar.tsx` in `src/app/components/` that:

1. **Data Structure**: Use this exact list of 18 Iraqi governorates:
   - Baghdad (بغداد / بەغدا)
   - Basra (البصرة / بەسرە)
   - Mosul (الموصل / مووسڵ)
   - Erbil (أربيل / هەولێر)
   - Kirkuk (كركوك / کەرکووک)
   - Najaf (النجف / نەجەف)
   - Karbala (كربلاء / کەربەلا)
   - Sulaymaniyah (السليمانية / سلێمانی)
   - Duhok (دهوك / دهۆک)
   - Anbar (الأنبار / ئەنبار)
   - Diyala (ديالى / دیالە)
   - Wasit (واسط / واسیت)
   - Saladin (صلاح الدين / سەلاحەدین)
   - Babil (بابل / بابل)
   - Dhi Qar (ذي قار / زیقار)
   - Maysan (ميسان / مەیسان)
   - Al-Qadisiyyah (القادسية / قادسیە)
   - Al-Muthanna (المثنى / موسەننا)

2. **Features**:
   - Horizontal scroll with snap-scroll on mobile
   - "All" chip as first option
   - Active state styling (gradient background: from-blue-600 to-indigo-600)
   - Inactive state (white bg with border)
   - Update URL query params (?city=baghdad)
   - Sync with existing `next-intl` for translations
   - Responsive: sticky on scroll (top: 64px below navigation)

3. **Design Specs**:
   - Height: 56px
   - Chip padding: px-4 py-2
   - Gap between chips: 8px
   - Font: 14px medium weight
   - Border radius: 9999px (fully rounded)
   - Shadow on active: shadow-md

4. **Integration**:
   - Accept `onFilterChange={(city: string | null) => void}` prop
   - Export as default from the file
   - Use TypeScript with proper types
   - Follow Tailwind utility-first approach

5. **Accessibility**:
   - ARIA labels for screen readers
   - Keyboard navigation (arrow keys)
   - Focus visible states

STYLE: Match the existing Eventra homepage style (gradient blues, clean modern UI)

OUTPUT: Complete component code with TypeScript, no placeholders, production-ready.
```

---

## 🎯 Prompt 2: Event Card Grid with Month Filter
### "Time-Sensitive Event Discovery System"

```
CONTEXT: I'm building on the Eventra platform (Next.js 15, Prisma, TypeScript). The app has an Event model with date, translations, and location fields. I need a sophisticated event discovery interface.

TASK: Create TWO components:

**Component 1: `MonthFilterBar.tsx`** in `src/app/components/`
- Horizontal scrollable month selector (current month + next 11 months)
- Display format: "Jan 2025", "Feb 2025", etc.
- Active state: gradient bg (from-pink-500 to-pink-600), white text
- Inactive: white bg, gray text
- Count badge on each month (number of events)
- Sticky positioning (below governorate filter)

**Component 2: `EventCardGrid.tsx`** in `src/app/components/`

1. **Event Card Design**:
   ```
   ┌─────────────────────┐
   │ [DATE BADGE]        │ ← Top-left overlay (e.g., "25 JAN")
   │                     │
   │   SQUARE IMAGE      │ ← 1:1 ratio, 320px, optimized for sharing
   │   (with fallback)   │
   │                     │
   ├─────────────────────┤
   │ 🎉 Music Event      │ ← Category icon + title (2 lines max)
   │ 📍 Baghdad Central  │ ← Location with icon
   │ 🕐 7:00 PM - 11:00 PM│ ← Time range
   ├─────────────────────┤
   │ [Share] [Details →] │ ← Share button + CTA
   └─────────────────────┘
   ```

2. **Grid Layout**:
   - Mobile: 1 column (full width - 16px margins)
   - Tablet: 2 columns (gap: 16px)
   - Desktop: 4 columns (gap: 20px)
   - Max container width: 1400px

3. **Features**:
   - Lazy loading with Intersection Observer
   - Skeleton loading states
   - Empty state: "No events in {month}" with illustration
   - Hover effect: lift (translateY: -4px) + shadow-xl
   - Share button: Web Share API with fallback to copy link
   - RTL support for Arabic/Kurdish

4. **Data Fetching**:
   - Fetch from `GET /api/events?city={city}&month={month}`
   - Use React Query or SWR (already in package.json)
   - Show loading spinner on filter change
   - Debounce filter changes (300ms)

5. **Social Sharing Metadata**:
   - Each card generates Open Graph tags dynamically
   - Share URL format: `https://eventra.app/events/{publicId}`
   - Include image, title, description, location

6. **Integration**:
   - Props: `selectedCity`, `selectedMonth`, `onEventClick`
   - Use existing `next-intl` for translations
   - Integrate with Prisma `Event` model
   - Follow existing API route patterns

EXISTING CODE REFERENCE: 
- Look at `src/app/page.tsx` for styling patterns
- Use `src/app/components/Navigation.tsx` for header integration
- Follow `prisma/schema.prisma` Event model structure

STYLE: Gradient pink theme for events (from-pink-500 to-pink-600), modern card design, smooth animations

OUTPUT: Two complete components with TypeScript, API integration, and production-ready code.
```

---

## 🎯 Prompt 3: Dynamic Hero Section with Language Selector
### "Condensed Hero with Live Stats Ticker"

```
CONTEXT: Eventra app needs a visually condensed hero section optimized for mobile-first discovery. Current homepage has a large hero - we need it more compact and informative.

TASK: Create `HeroSection.tsx` in `src/app/components/` that combines:

**Section 1: Top Bar Integration (48px height)**
- Logo, Search icon, Language selector, Profile menu
- Language selector: [العربية] [کوردی] [English]
- Pill-style toggle buttons (current: filled gradient, others: outlined)
- Position: sticky top-0, backdrop-blur-lg, z-50
- Store language in localStorage + sync with `next-intl`

**Section 2: Condensed Hero (200px mobile, 280px desktop)**
1. **Background**:
   - Rotating images of Iraqi landmarks (lazy-loaded, WebP format)
   - Images array: Baghdad landmarks, Erbil Citadel, Basra canals, etc.
   - Overlay gradient: from-slate-900/80 to transparent
   - Auto-rotate every 5 seconds with smooth fade transition

2. **Content (centered)**:
   - Headline: "Discover Iraq" (28px mobile, 48px desktop, font-bold)
   - Subheadline: "Events, Hotels & Restaurants" (16px, font-medium)
   - Primary CTA: "Explore Now" button (gradient from-blue-600 to-indigo-600)
   - Compact vertical spacing (8px between elements)

**Section 3: Live Stats Ticker (48px height)**
- Horizontal auto-scrolling marquee OR static centered stats
- Data points:
  - "🎉 234 Live Events"
  - "🏨 1.2k Hotels"
  - "🍽️ 3.5k Restaurants"
  - "🎯 890 Activities"
- Fetch from `GET /api/admin/venues/stats`
- Update every 30 seconds
- Animation: smooth fade or marquee scroll
- Background: white with subtle shadow

**Technical Requirements**:
1. Fetch stats from existing API endpoint
2. Handle loading states (show placeholder counts)
3. Responsive font sizes using clamp()
4. Optimize images (next/image component)
5. Prefetch landmark images on component mount
6. Accessibility: proper heading hierarchy, ARIA labels

**Integration Points**:
- Replace current hero in `src/app/page.tsx`
- Use existing stats API (`/api/admin/venues/stats`)
- Connect to `next-intl` for language switching
- Match existing color scheme and Tailwind config

**Design Specs**:
- Total height: 296px mobile (48 + 200 + 48)
- No wasted space - every pixel counts
- High-contrast text for readability
- Fast load time (<500ms for hero paint)

STYLE: Modern, condensed, information-dense, optimized for quick discovery

OUTPUT: Complete component with image optimization, stats fetching, and language integration. Include sample landmark image URLs (placeholder.com).
```

---

## 🎯 Prompt 4: Multi-Category Navigation Tabs
### "Smart Sessions List with Live Counts"

```
CONTEXT: Eventra platform (Next.js 15, Prisma) needs a category navigation system that dynamically shows available content across 6 venue types.

TASK: Create `CategoryTabsNavigation.tsx` in `src/app/components/`

**Categories (from Prisma VenueType enum)**:
1. 🎉 Events (type: EVENT)
2. 🏨 Hotels (type: HOTEL)
3. 🍴 Restaurants (type: RESTAURANT)
4. ☕ Cafés (type: ACTIVITY, subcategory: cafe)
5. 🏛️ Tourism (type: ACTIVITY, subcategory: tourism)
6. 🏢 Companies (type: SERVICE)

**Features**:

1. **Tab Design**:
   - Icon (24px) + Label + Count Badge
   - Example: "🎉 Events (234)"
   - Active state: gradient bg, white text, shadow-lg
   - Inactive: transparent bg, gray text
   - Smooth transitions (150ms ease)

2. **Layout**:
   - Mobile: Horizontal scroll with snap-scroll
   - Desktop: Fixed row of 6, evenly spaced
   - Height: 64px
   - Sticky: top: 104px (below hero and governorate filter)

3. **Dynamic Count Badges**:
   - Fetch from `GET /api/venues/count?type={type}&city={selectedCity}`
   - Show "0" if no results (grayed out tab)
   - Update on city filter change
   - Cache for 60 seconds

4. **Routing**:
   - On click, navigate to: `/[type]?city={city}`
   - Routes: `/events`, `/hotels`, `/restaurants`, `/cafes`, `/tourism`, `/companies`
   - Update URL without full page reload (Next.js router)
   - Highlight active tab based on current route

5. **Loading States**:
   - Skeleton badges while fetching counts
   - Smooth fade-in when data loads
   - Error state: show "?" in badge

**API Integration**:
Create the API endpoint `/api/venues/count`:
```typescript
// src/app/api/venues/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type');
  const city = searchParams.get('city');

  const where = {
    ...(type && { type }),
    ...(city && city !== 'all' && { city }),
    status: 'ACTIVE'
  };

  const count = await prisma.venue.count({ where });

  return NextResponse.json({ count });
}
```

**Color Themes per Category**:
- Events: from-pink-500 to-pink-600
- Hotels: from-blue-500 to-blue-600
- Restaurants: from-orange-500 to-orange-600
- Cafés: from-amber-500 to-amber-600
- Tourism: from-purple-500 to-purple-600
- Companies: from-green-500 to-green-600

**Accessibility**:
- Keyboard navigation (Tab key, Enter to select)
- ARIA role="tablist"
- Screen reader announces count

**Integration**:
- Props: `selectedCity: string | null`, `onTabChange: (type: string) => void`
- Works with `GovernorateFilterBar` from Prompt 1
- Uses Next.js App Router for navigation
- Integrates with existing Prisma schema

EXISTING CODE: Reference `src/app/page.tsx` categories array for styling patterns

STYLE: Clean, modern, with color-coded gradients per category

OUTPUT: Complete component + API route, TypeScript, production-ready with error handling.
```

---

## 🎯 Prompt 5: Venue Detail Modal with Social Sharing
### "Full-Screen Detail View with WhatsApp Integration"

```
CONTEXT: Eventra needs a detailed view for venues (events, hotels, restaurants, etc.) that's optimized for mobile sharing and social media.

TASK: Create `VenueDetailModal.tsx` in `src/app/components/`

**Modal Structure**:
```
┌─────────────────────────────────────┐
│ [×]                    [Share] [❤️] │ ← Close, Share, Favorite
├─────────────────────────────────────┤
│                                     │
│     HERO IMAGE CAROUSEL             │ ← Full width, swipeable
│     • • • (3 images)                │
│                                     │
├─────────────────────────────────────┤
│ 🎉 Music Festival                   │ ← Category badge + title
│ ⭐⭐⭐⭐⭐ 4.8 (124 reviews)         │ ← Rating (if available)
├─────────────────────────────────────┤
│ 📍 Location                         │
│    Baghdad Central Park             │
│    [View on Map]                    │
├─────────────────────────────────────┤
│ 📅 Date & Time (for events)         │
│    Saturday, Jan 25, 2025           │
│    7:00 PM - 11:00 PM               │
├─────────────────────────────────────┤
│ 💰 Price Range                      │
│    $25-50 per person                │
├─────────────────────────────────────┤
│ 📝 Description                      │
│    [Full multilingual description]  │
│                                     │
├─────────────────────────────────────┤
│ ✨ Amenities/Features (if hotel)    │
│    • Free WiFi • Parking            │
│    • Pool • Restaurant              │
├─────────────────────────────────────┤
│ 🍽️ Cuisine Type (if restaurant)    │
│    Iraqi, Middle Eastern            │
├─────────────────────────────────────┤
│ [WhatsApp Contact] [Book Now]       │ ← CTAs
└─────────────────────────────────────┘
```

**Features**:

1. **Image Carousel**:
   - Swipeable on mobile (touch gestures)
   - Arrow navigation on desktop
   - Indicator dots at bottom
   - Lazy load subsequent images
   - Pinch-to-zoom capability
   - Fallback: placeholder if no image

2. **Social Sharing**:
   - Share button opens native share sheet (Web Share API)
   - Fallback: Copy link + WhatsApp/Facebook/Twitter buttons
   - Generated share URL: `https://eventra.app/v/{publicId}`
   - Include Open Graph metadata:
     ```html
     <meta property="og:title" content="{title}" />
     <meta property="og:description" content="{description}" />
     <meta property="og:image" content="{imageUrl}" />
     <meta property="og:type" content="website" />
     ```

3. **WhatsApp Integration**:
   - "Contact via WhatsApp" button
   - Opens WhatsApp with pre-filled message:
     ```
     Hi! I'm interested in {venue.title}. 
     Link: https://eventra.app/v/{publicId}
     ```
   - Use `whatsappPhone` from Venue model
   - Handle international format (+964...)

4. **Map Integration**:
   - "View on Map" button
   - Opens Google Maps with coordinates (latitude, longitude)
   - Fallback: Open in Apple Maps on iOS

5. **Multilingual Support**:
   - Fetch translation from `VenueTranslation` model
   - Switch based on current locale (next-intl)
   - RTL layout for Arabic/Kurdish

6. **Data Structure** (TypeScript Interface):
```typescript
interface VenueDetail {
  id: string;
  publicId: string;
  type: VenueType;
  title: string; // from translation
  description: string; // from translation
  imageUrl: string;
  galleryUrls: string[]; // parsed JSON
  city: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  whatsappPhone?: string;
  website?: string;
  eventDate?: Date;
  amenities?: string[]; // parsed JSON
  cuisineType?: string;
}
```

7. **API Endpoint**:
Create `GET /api/venues/[publicId]`:
```typescript
// src/app/api/venues/[publicId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  const locale = req.headers.get('Accept-Language')?.split(',')[0] || 'en';
  
  const venue = await prisma.venue.findUnique({
    where: { publicId: params.publicId },
    include: {
      translations: {
        where: { locale }
      }
    }
  });

  if (!venue) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Transform and return
  return NextResponse.json({
    ...venue,
    title: venue.translations[0]?.title,
    description: venue.translations[0]?.description
  });
}
```

8. **Modal Behavior**:
   - Full-screen on mobile
   - Centered with overlay on desktop (max-width: 800px)
   - Smooth slide-up animation on open
   - Close on: X button, outside click, ESC key
   - Prevent body scroll when open
   - URL updates to `/v/{publicId}` (shareable)

9. **Performance**:
   - Lazy load modal component
   - Preload data on hover (desktop)
   - Cache venue details (60 seconds)

**Integration**:
- Open from `EventCardGrid` (Prompt 2) on card click
- Accept props: `venueId: string`, `isOpen: boolean`, `onClose: () => void`
- Use Next.js router for URL management
- Connect to existing Prisma schema

**Accessibility**:
- Focus trap when modal open
- ARIA dialog role
- Keyboard navigation (Tab, ESC)
- Screen reader friendly

STYLE: Clean, modern, Instagram-story-like design for mobile, professional card design for desktop

OUTPUT: Complete modal component + API route, with TypeScript types, carousel implementation, and social sharing logic.
```

---

## 🎯 Prompt 6: Smart Search with Autocomplete
### "AI-Powered Multi-Field Search Experience"

```
CONTEXT: Eventra app needs an intelligent search system that understands Iraqi locations, venue names, and categories in three languages (Arabic, Kurdish, English).

TASK: Create a comprehensive search system with 3 components:

**Component 1: `SearchBar.tsx`** in `src/app/components/`

1. **Design**:
   ```
   ┌─────────────────────────────────────────────┐
   │ 🔍  Search events, hotels, restaurants...   │
   │                                         [×] │
   └─────────────────────────────────────────────┘
   ```
   - Expands to full-screen overlay on mobile when clicked
   - Sticky search bar on desktop (in header)
   - Height: 48px, rounded-xl, shadow-lg when focused
   - Auto-focus on mount (desktop only)

2. **Features**:
   - Real-time search as user types
   - Debounced API calls (300ms)
   - Clear button (appears when text entered)
   - Voice search button (Web Speech API)
   - Search history (localStorage, last 5 searches)

**Component 2: `SearchResults.tsx`** (Dropdown/Overlay)

1. **Result Categories**:
   ```
   Suggestions (based on popular searches)
   ─────────────────────────────────
   🎉 Music events in Baghdad
   🏨 Hotels near Erbil Citadel
   
   Events (3)
   ─────────────────────────────────
   [Event Card Preview]
   [Event Card Preview]
   [View all 45 events →]
   
   Hotels (5)
   ─────────────────────────────────
   [Hotel Card Preview]
   [Hotel Card Preview]
   [View all 23 hotels →]
   
   Restaurants (8)
   ─────────────────────────────────
   [Restaurant Card Preview]
   ...
   ```

2. **Result Card Preview**:
   - Thumbnail image (60px × 60px)
   - Title (1 line)
   - Location + Type badge
   - Click opens detail modal

3. **Smart Features**:
   - Highlight matching text in results
   - "Did you mean?" suggestions for typos
   - Empty state: "No results for '{query}'" with suggestions
   - Show loading skeleton while searching

**Component 3: `SearchAPI.ts`** (API Route + Logic)

Create `GET /api/search`:
```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q');
  const locale = searchParams.get('locale') || 'en';
  const type = searchParams.get('type'); // optional filter
  const city = searchParams.get('city'); // optional filter

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // Multi-field search
  const venues = await prisma.venue.findMany({
    where: {
      status: 'ACTIVE',
      ...(type && { type }),
      ...(city && city !== 'all' && { city }),
      OR: [
        { translations: { some: { title: { contains: query, mode: 'insensitive' } } } },
        { translations: { some: { description: { contains: query, mode: 'insensitive' } } } },
        { city: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      translations: {
        where: { locale }
      }
    },
    take: 20,
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  // Group by type
  const grouped = venues.reduce((acc, venue) => {
    const type = venue.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      id: venue.id,
      publicId: venue.publicId,
      title: venue.translations[0]?.title || 'Untitled',
      description: venue.translations[0]?.description?.substring(0, 100),
      imageUrl: venue.imageUrl,
      city: venue.city,
      type: venue.type
    });
    return acc;
  }, {} as Record<string, any[]>);

  return NextResponse.json({
    query,
    total: venues.length,
    results: grouped
  });
}
```

**Search Algorithm Features**:

1. **Multi-Language Search**:
   - Searches across all translation tables
   - Fuzzy matching for Arabic/Kurdish text
   - Handle typos (Levenshtein distance)

2. **Smart Ranking**:
   - Featured venues appear first
   - Exact matches prioritized
   - Recent/popular venues boosted
   - Location proximity (if user location available)

3. **Filters**:
   - By venue type (events, hotels, etc.)
   - By city/governorate
   - By price range
   - By date (for events)
   - By rating (future feature)

4. **Search Suggestions**:
   - Popular searches (tracked in Content model)
   - Location-based: "Hotels in {city}"
   - Type-based: "Restaurants near {landmark}"
   - Trending searches

**Performance Optimizations**:
1. Index these fields in Prisma:
   ```prisma
   @@index([city, type, status])
   @@fulltext([title, description]) // for VenueTranslation
   ```

2. Cache search results (Redis/localStorage):
   - Cache key: `search:{query}:{locale}:{filters}`
   - TTL: 5 minutes
   - Invalidate on new venue creation

3. Implement virtual scrolling for results >50

**Advanced Features** (Optional):
- Voice search with speech-to-text
- Search filters panel (slide-in on mobile)
- Save searches (authenticated users)
- Search analytics (track popular queries)
- "Search nearby" with geolocation

**Integration**:
- Mount in header (replace current search icon)
- Works with `GovernorateFilterBar` filters
- Opens `VenueDetailModal` on result click
- Updates URL: `/search?q={query}&type={type}`

**Accessibility**:
- ARIA live region for results
- Keyboard navigation (arrow keys)
- Screen reader announcements
- High contrast mode support

STYLE: Modern, fast, Google-like search experience with Iraqi/Kurdistan cultural awareness

OUTPUT: Three complete files (SearchBar component, SearchResults component, API route) with TypeScript, debouncing, caching, and production-ready search logic.
```

---

## 📦 Implementation Guide for AI Studio

### Step 1: Context Setup
Before running any prompt, paste this into AI Studio:

```
PROJECT CONTEXT:
- Repository: https://github.com/absulysuly/4phasteprompt-eventra
- Branch: feature/ui-improvements-and-data-pipeline
- Directory: eventra-saas/
- Tech: Next.js 15.5, React 19, TypeScript, Prisma, SQLite
- Current files: src/app/page.tsx, prisma/schema.prisma
- Database: Venue model with translations (ar, ku, en)
- I18n: next-intl with messages/ directory
- Styling: Tailwind CSS with gradient themes
```

### Step 2: Run Prompts Sequentially
Recommended order:
1. **Prompt 1** (Governorate Filter) - Foundation
2. **Prompt 4** (Category Tabs) - Navigation structure
3. **Prompt 3** (Hero Section) - Homepage integration
4. **Prompt 2** (Event Cards) - Content display
5. **Prompt 5** (Detail Modal) - Detail views
6. **Prompt 6** (Search) - Discovery feature

### Step 3: Integration Checklist
After AI generates each component:

- [ ] Files created in correct directory (`src/app/components/`)
- [ ] TypeScript types defined
- [ ] API routes created (if needed)
- [ ] Integrated with existing `next-intl`
- [ ] Responsive design tested (mobile + desktop)
- [ ] RTL support for Arabic/Kurdish
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Accessibility features present

### Step 4: Testing Commands
```bash
# Generate Prisma client
npm run db:generate

# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint:fix
```

### Step 5: Database Updates (if needed)
If Prisma schema changes:
```bash
# Create migration
npx prisma migrate dev --name add_search_index

# Seed database
npm run db:seed

# Open Prisma Studio to verify
npm run db:studio
```

---

## 🎨 Design Tokens Reference
For consistency across all generated components:

```css
/* Color Palette (Tailwind config) */
--primary: from-blue-600 to-indigo-600
--events: from-pink-500 to-pink-600
--hotels: from-blue-500 to-blue-600
--restaurants: from-orange-500 to-orange-600
--cafes: from-amber-500 to-amber-600
--tourism: from-purple-500 to-purple-600
--companies: from-green-500 to-green-600

/* Spacing */
--gap-mobile: 16px
--gap-desktop: 20px
--container-max: 1400px

/* Typography */
--font-primary: Inter (for English)
--font-arabic: Noto Sans Arabic
--font-kurdish: Noto Kufi Arabic

/* Timing */
--transition-fast: 150ms ease
--transition-normal: 300ms ease
--debounce-search: 300ms
```

---

## 🚀 Next Steps After Generation

1. **Merge Components**: Integrate all 6 components into `src/app/page.tsx`
2. **Create Routes**: Set up `/events`, `/hotels`, `/restaurants`, etc.
3. **API Optimization**: Add Redis caching for search and stats
4. **PWA Enhancement**: Update service worker for offline search
5. **Analytics**: Track search queries, popular venues, user flows
6. **SEO**: Add dynamic metadata for each venue detail page
7. **Performance**: Implement image optimization and lazy loading
8. **Testing**: Add unit tests for search logic and filters

---

## 📞 Support & Resources

- **Full Plan**: See `IRAQ_DISCOVERY_PWA_PLAN.md` for architecture details
- **Repository**: https://github.com/absulysuly/4phasteprompt-eventra
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-02  
**Author**: Eventra Team  
**Status**: Ready for AI Studio Implementation
