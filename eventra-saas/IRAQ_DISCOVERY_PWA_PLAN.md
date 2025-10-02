# Iraq Discovery PWA - Comprehensive Implementation Plan

## Executive Summary

A mobile-first Progressive Web Application designed to provide real-time discovery and information across all 18 Iraqi governorates, featuring event management, tourism, hospitality, and business listings with trilingual support (Arabic, Kurdish, English).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [UI/UX Design Specification](#uiux-design-specification)
3. [Backend Architecture](#backend-architecture)
4. [Data Pipeline & Integrity](#data-pipeline--integrity)
5. [Content Management System](#content-management-system)
6. [Technology Stack](#technology-stack)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Performance & Optimization](#performance--optimization)
9. [Security Considerations](#security-considerations)

---

## 1. Project Overview

### 1.1 Core Features

- **Multi-Governorate Coverage**: All 18 Iraqi governorates
  - Baghdad, Basra, Mosul, Erbil, Kirkuk, Najaf, Karbala, Sulaymaniyah, 
  - Duhok, Anbar, Diyala, Wasit, Saladin, Babil, Dhi Qar, Maysan, 
  - Al-Qadisiyyah, Al-Muthanna

- **Content Categories**:
  - Events (time-sensitive)
  - Tourism attractions
  - Restaurants
  - Hotels
  - Cafés
  - Local businesses/companies

- **Key Capabilities**:
  - Real-time updates
  - Trilingual interface
  - Social media optimization
  - Offline-first functionality
  - Progressive enhancement

---

## 2. UI/UX Design Specification

### 2.1 Mobile-First Layout Structure

```
┌─────────────────────────────────┐
│  TOP BAR (48px)                 │
│  Logo | Search | Profile        │
├─────────────────────────────────┤
│  LANGUAGE SELECTOR (36px)       │
│  [AR] [KU] [EN]                 │
├─────────────────────────────────┤
│  HERO SECTION (Condensed 200px) │
│  Dynamic Background + CTA       │
├─────────────────────────────────┤
│  PRICING/RESULTS STRIP (48px)   │
│  Live: 234 Events | 1.2k Places │
├─────────────────────────────────┤
│  GOVERNORATE FILTER (56px)      │
│  [All] [Baghdad] [Basra] [...]  │
│  Horizontal scroll              │
├─────────────────────────────────┤
│  CATEGORY TABS (64px)           │
│  [🎉 Events] [🏨 Hotels] [...]  │
├─────────────────────────────────┤
│  CONTENT GRID                   │
│  ┌──────┬──────┐               │
│  │ Card │ Card │               │
│  ├──────┼──────┤               │
│  │ Card │ Card │               │
│  └──────┴──────┘               │
│                                 │
└─────────────────────────────────┘
```

### 2.2 Component Specifications

#### 2.2.1 Top Bar
- **Height**: 48px (mobile), 64px (desktop)
- **Elements**:
  - Logo: 32px × 32px (mobile), 40px × 40px (desktop)
  - Search icon: Expands to full-width overlay
  - Profile/Menu: Hamburger on mobile
- **Sticky**: Fixed position with backdrop blur
- **Z-index**: 1000

#### 2.2.2 Language Selector
- **Position**: Directly below top bar
- **Design**: Pill-style toggle buttons
- **States**: Active (filled), Inactive (outlined)
- **Animation**: Smooth color transition (150ms ease)
- **Persistence**: LocalStorage + URL param
```jsx
<LanguageToggle>
  <Button active={lang === 'ar'}>العربية</Button>
  <Button active={lang === 'ku'}>کوردی</Button>
  <Button active={lang === 'en'}>English</Button>
</LanguageToggle>
```

#### 2.2.3 Hero Section (Condensed)
- **Height**: 200px (mobile), 280px (desktop)
- **Content**:
  - Background: Rotating images of Iraqi landmarks (lazy-loaded)
  - Overlay gradient: Dark to transparent
  - Headline: "Discover Iraq" (h1, 28px mobile, 48px desktop)
  - Subheadline: Brief tagline
  - Primary CTA: "Explore Now" button
- **Optimization**: WebP images with fallback, 85% compression

#### 2.2.4 Pricing/Results Strip
- **Design**: Horizontal auto-scrolling ticker
- **Data Points**:
  - Active events count
  - Total listings
  - Live updates indicator
  - Featured promotions
- **Update Frequency**: WebSocket real-time
- **Animation**: Smooth marquee or fade transitions

#### 2.2.5 Governorate Filter Bar
- **Type**: Horizontal scrollable chips
- **Behavior**:
  - Snap scroll on mobile
  - Multi-select with checkboxes
  - "All" option to reset
  - Active state with accent color
- **Layout**:
```jsx
<FilterBar>
  <Chip active>All</Chip>
  <Chip>Baghdad</Chip>
  <Chip>Basra</Chip>
  <Chip>Erbil</Chip>
  {/* ... 15 more */}
</FilterBar>
```
- **Persistence**: URL query params (?gov=baghdad,basra)

#### 2.2.6 Category Tabs (Sessions List)
- **Icons**: 
  - 🎉 Events (Calendar icon)
  - 🏨 Hotels (Bed icon)
  - 🍴 Restaurants (Fork/knife icon)
  - ☕ Cafés (Coffee cup icon)
  - 🏛️ Tourism (Landmark icon)
  - 🏢 Companies (Building icon)
- **Design**: Icon + label, with badge for count
- **Interaction**: Tab switches, updates URL route
- **Responsive**: 
  - Mobile: Horizontal scroll
  - Desktop: Fixed row of 6

#### 2.2.7 Content Cards

**Standard Card (Mobile)**
```
┌─────────────────────┐
│                     │
│   SQUARE IMAGE      │ 1:1 ratio (320px)
│   (optimized)       │
│                     │
├─────────────────────┤
│ Category Badge      │
│ Title (2 lines)     │
│ Location Icon + Gov │
│ Date/Info           │
│ ┌────┐ ┌─────────┐ │
│ │Share│ │ View →  │ │
│ └────┘ └─────────┘ │
└─────────────────────┘
```

**Grid Layout**:
- Mobile: 1 column (full width - 16px margin)
- Tablet: 2 columns (gap: 16px)
- Desktop: 4 columns (gap: 20px)
- Large Desktop: 4 columns (max-width: 1400px container)

**Event Card Specifics**:
- **Date Badge**: Prominent, top-left overlay
- **Time Indicator**: Clock icon + time
- **Month Filter**: Sticky horizontal month selector
- **Status**: "Upcoming", "Today", "Past" labels
- **RSVP Count**: Social proof indicator

**Share Optimization**:
- Open Graph meta tags
- Twitter Card support
- Square images (1:1) for universal compatibility
- WhatsApp preview optimization
- Dynamic link generation with UTM params

### 2.3 Design System

#### Color Palette
```css
:root {
  /* Primary - Inspired by Iraqi heritage */
  --primary-600: #1E3A8A; /* Deep blue */
  --primary-500: #3B82F6;
  --primary-400: #60A5FA;
  
  /* Accent - Warm desert tones */
  --accent-600: #DC2626; /* Iraqi flag red */
  --accent-500: #EF4444;
  
  /* Success/Tourism */
  --success-500: #10B981;
  
  /* Neutral */
  --gray-900: #111827;
  --gray-700: #374151;
  --gray-500: #6B7280;
  --gray-200: #E5E7EB;
  --gray-50: #F9FAFB;
  
  /* Semantic */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --text-primary: #F9FAFB;
    --text-secondary: #D1D5DB;
  }
}
```

#### Typography
```css
/* Arabic/Kurdish Support */
@font-face {
  font-family: 'Noto Sans Arabic';
  src: url('/fonts/NotoSansArabic-VF.woff2') format('woff2');
  font-display: swap;
}

@font-face {
  font-family: 'Noto Kufi Arabic';
  src: url('/fonts/NotoKufiArabic-VF.woff2') format('woff2');
  font-display: swap;
}

/* English */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-VF.woff2') format('woff2');
  font-display: swap;
}

body {
  font-family: var(--font-primary);
  font-size: 16px;
  line-height: 1.5;
}

[lang="ar"], [lang="ku"] {
  --font-primary: 'Noto Sans Arabic', sans-serif;
  direction: rtl;
}

[lang="en"] {
  --font-primary: 'Inter', sans-serif;
  direction: ltr;
}

/* Scale */
h1 { font-size: clamp(28px, 5vw, 48px); font-weight: 700; }
h2 { font-size: clamp(24px, 4vw, 36px); font-weight: 600; }
h3 { font-size: clamp(20px, 3vw, 28px); font-weight: 600; }
body { font-size: clamp(14px, 2vw, 16px); }
small { font-size: 14px; }
```

#### Spacing System
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 2.4 Responsive Breakpoints
```css
/* Mobile first */
--mobile: 320px;
--mobile-lg: 425px;
--tablet: 768px;
--desktop: 1024px;
--desktop-lg: 1440px;
--desktop-xl: 1920px;
```

### 2.5 Animation & Micro-interactions
- **Card Hover**: Subtle lift (translateY: -4px) + shadow
- **Loading States**: Skeleton screens matching card layout
- **Transitions**: 150ms ease for most, 300ms for page transitions
- **Pull-to-refresh**: Native gesture on mobile
- **Infinite scroll**: Intersection Observer API

---

## 3. Backend Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  PWA (React/Next.js) + Service Worker + IndexedDB      │
└────────────┬───────────────────────────┬────────────────┘
             │                           │
        ┌────▼────┐                 ┌────▼────┐
        │   CDN   │                 │WebSocket│
        │(Cloudflare)               │  Server │
        └────┬────┘                 └────┬────┘
             │                           │
        ┌────▼───────────────────────────▼────┐
        │         API GATEWAY (Kong)          │
        │  Rate Limiting | Auth | Routing     │
        └────┬────────────────────────┬────────┘
             │                        │
    ┌────────▼────────┐      ┌────────▼────────┐
    │  REST API       │      │  GraphQL API    │
    │  (Node.js)      │      │  (Apollo)       │
    └────────┬────────┘      └────────┬────────┘
             │                        │
    ┌────────▼────────────────────────▼────────┐
    │         MICROSERVICES LAYER              │
    ├──────────────────────────────────────────┤
    │ • Events Service                         │
    │ • Places Service (Hotels/Restaurants)    │
    │ • Tourism Service                        │
    │ • Search Service (Elasticsearch)         │
    │ • Media Service (Image processing)       │
    │ • Notifications Service                  │
    │ • Analytics Service                      │
    └────────┬─────────────────────────────────┘
             │
    ┌────────▼─────────────────────────────────┐
    │         DATA LAYER                       │
    ├──────────────────────────────────────────┤
    │ Primary DB: PostgreSQL (TimescaleDB)     │
    │ Cache: Redis (multi-layer)               │
    │ Search: Elasticsearch                    │
    │ Media: S3-compatible (MinIO/Cloudflare)  │
    │ Queue: RabbitMQ / Apache Kafka           │
    └──────────────────────────────────────────┘
```

### 3.2 Technology Stack Recommendations

#### Backend Core
- **Runtime**: Node.js 20 LTS or Go 1.21+
- **API Framework**: 
  - REST: Express.js / Fastify (Node) or Fiber (Go)
  - GraphQL: Apollo Server
- **ORM**: Prisma (Node.js) or GORM (Go)

#### Database Strategy
**Primary Database: PostgreSQL 16 with TimescaleDB Extension**
```sql
-- Optimized for time-series event data
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title JSONB NOT NULL, -- {en: "", ar: "", ku: ""}
  governorate_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  media_urls TEXT[],
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Convert to hypertable for time-series optimization
SELECT create_hypertable('events', 'start_time');

-- Indexes
CREATE INDEX idx_events_governorate ON events(governorate_id, start_time DESC);
CREATE INDEX idx_events_category ON events(category_id, start_time DESC);
CREATE INDEX idx_events_status ON events(status) WHERE status = 'published';
CREATE INDEX idx_events_location ON events USING GIST(location);
```

**Cache Architecture: Redis**
```
Redis Layers:
├── L1: API Response Cache (TTL: 60s)
│   └── Key pattern: api:v1:events:baghdad:2025-01
├── L2: Database Query Cache (TTL: 5min)
│   └── Key pattern: db:query:{hash}
├── L3: Session Storage (TTL: 24h)
│   └── Key pattern: session:{userId}
└── L4: Rate Limiting (TTL: 1h)
    └── Key pattern: ratelimit:{ip}:{endpoint}
```

**Search Engine: Elasticsearch 8**
```json
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "ar": {"type": "text", "analyzer": "arabic"},
          "ku": {"type": "text", "analyzer": "kurdish"},
          "en": {"type": "text", "analyzer": "english"}
        }
      },
      "governorate": {"type": "keyword"},
      "category": {"type": "keyword"},
      "location": {"type": "geo_point"},
      "start_time": {"type": "date"},
      "boost_score": {"type": "float"}
    }
  }
}
```

### 3.3 API Design

#### RESTful Endpoints Structure
```
BASE_URL: https://api.iraqidiscovery.com/v1

Authentication:
POST   /auth/login
POST   /auth/register
POST   /auth/refresh

Events:
GET    /events?gov=baghdad&month=2025-01&category=music
GET    /events/{id}
POST   /events (admin)
PATCH  /events/{id} (admin)
DELETE /events/{id} (admin)

Places:
GET    /places?type=hotel&gov=erbil&page=1&limit=20
GET    /places/{id}
POST   /places (admin)

Governorates:
GET    /governorates
GET    /governorates/{id}/stats

Search:
GET    /search?q=restaurant&gov=basra&type=place

Media:
POST   /media/upload (multipart/form-data)
GET    /media/{id}/variants (returns: original, thumbnail, social)

Analytics:
POST   /analytics/events (track user interactions)
```

#### GraphQL Schema (Alternative/Complementary)
```graphql
type Query {
  events(
    governorate: String
    category: String
    month: String
    limit: Int = 20
    offset: Int = 0
  ): EventConnection!
  
  event(id: ID!): Event
  
  places(
    type: PlaceType!
    governorate: String
    limit: Int = 20
    offset: Int = 0
  ): PlaceConnection!
  
  governorates: [Governorate!]!
  
  search(
    query: String!
    filters: SearchFilters
  ): SearchResults!
}

type Event {
  id: ID!
  title: TranslatedString!
  description: TranslatedString!
  governorate: Governorate!
  category: Category!
  startTime: DateTime!
  endTime: DateTime!
  location: Location!
  media: [Media!]!
  rsvpCount: Int!
  shareUrl: String!
}

type TranslatedString {
  ar: String!
  ku: String!
  en: String!
}

type Governorate {
  id: ID!
  name: TranslatedString!
  slug: String!
  coordinates: Location!
  activeEventsCount: Int!
  placesCount: PlaceTypeCounts!
}

type PlaceTypeCounts {
  hotels: Int!
  restaurants: Int!
  cafes: Int!
  tourism: Int!
}

enum PlaceType {
  HOTEL
  RESTAURANT
  CAFE
  TOURISM
  COMPANY
}
```

### 3.4 Microservices Detail

#### Events Service
**Responsibilities**:
- CRUD operations for events
- Time-based filtering and expiration
- RSVP management
- Recurring event handling

**Key Features**:
- Automatic status transitions (upcoming → active → past)
- Event expiration worker (runs daily)
- Integration with notification service

**Tech Stack**:
- Language: Node.js/TypeScript
- Framework: NestJS
- Database: PostgreSQL with TimescaleDB
- Cache: Redis

#### Places Service
**Responsibilities**:
- Manage hotels, restaurants, cafés, tourism sites, companies
- Location-based queries
- Business hours management
- Rating/review aggregation

**Key Features**:
- Geospatial queries (nearby places)
- Open/closed status calculation
- Integration with Google Maps API

#### Search Service
**Responsibilities**:
- Full-text search across all entities
- Multilingual support (Arabic, Kurdish, English)
- Autocomplete suggestions
- Faceted filtering

**Tech Stack**:
- Elasticsearch 8
- Custom analyzers for Arabic/Kurdish
- Synonym support

#### Media Service
**Responsibilities**:
- Image upload and processing
- Multiple variant generation (thumbnail, social, original)
- CDN integration
- Image optimization (WebP conversion, compression)

**Processing Pipeline**:
```
Upload → Virus Scan → Generate Variants → Upload to CDN → Return URLs
```

**Variants**:
- Original: Max 2048px, 85% quality
- Social: 1200x1200px (square), 80% quality, WebP
- Thumbnail: 400x400px, 75% quality, WebP
- Blur: 20x20px for progressive loading

---

## 4. Data Pipeline & Integrity

### 4.1 Data Ingestion Architecture

```
┌─────────────────────────────────────────────────┐
│           DATA SOURCES                          │
├─────────────────────────────────────────────────┤
│ • Admin CMS                                     │
│ • External APIs (partners)                      │
│ • CSV/Excel imports                             │
│ • Web scraping (with permission)                │
└────────────┬────────────────────────────────────┘
             │
        ┌────▼────────┐
        │  API Gateway │
        │  Validation  │
        └────┬─────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     INGESTION SERVICE                    │
        │  • Schema validation (JSON Schema)       │
        │  • Idempotency key checking              │
        │  • Deduplication                         │
        │  • Rate limiting                         │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼────────┐
        │ Message Queue│ (RabbitMQ/Kafka)
        │  Persistent  │
        └────┬─────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     PROCESSING WORKERS                   │
        │  • Enrichment (geocoding, translations)  │
        │  • Media processing                      │
        │  • Duplicate detection                   │
        │  • Validation                            │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     STAGING DATABASE                     │
        │  Temporary storage for review            │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     APPROVAL/AUTO-PUBLISH                │
        │  • Quality checks                        │
        │  • Admin review (if required)            │
        │  • Auto-publish (trusted sources)        │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     PRODUCTION DATABASE                  │
        │  + Change Data Capture (CDC)             │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     CDC PROCESSOR (Debezium)             │
        │  Captures all DB changes                 │
        └────┬─────────────────────────────────────┘
             │
        ┌────▼─────────────────────────────────────┐
        │     DOWNSTREAM UPDATES                   │
        │  • Search index (Elasticsearch)          │
        │  • Cache invalidation (Redis)            │
        │  • WebSocket notifications               │
        │  • Analytics                             │
        └──────────────────────────────────────────┘
```

### 4.2 Idempotency Implementation

**Idempotency Key Strategy**:
```javascript
// Client includes idempotency key in header
POST /api/v1/events
Headers:
  Idempotency-Key: uuid-v4-or-hash
  
// Server-side handling
async function handleRequest(req, res) {
  const idempotencyKey = req.headers['idempotency-key'];
  
  // Check if request already processed
  const cached = await redis.get(`idempotency:${idempotencyKey}`);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }
  
  // Use distributed lock to prevent concurrent processing
  const lock = await redlock.lock(`lock:${idempotencyKey}`, 5000);
  
  try {
    // Process request
    const result = await processEvent(req.body);
    
    // Cache result for 24 hours
    await redis.setex(
      `idempotency:${idempotencyKey}`,
      86400,
      JSON.stringify(result)
    );
    
    return res.status(201).json(result);
  } finally {
    await lock.unlock();
  }
}
```

### 4.3 Retry Logic with Exponential Backoff

```javascript
class RetryableQueue {
  async processMessage(message, attempt = 1) {
    const MAX_ATTEMPTS = 5;
    
    try {
      await this.processEvent(message);
      await this.ackMessage(message);
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) {
        // Move to dead letter queue
        await this.moveToDeadLetter(message, error);
        return;
      }
      
      // Exponential backoff: 2^attempt seconds
      const delayMs = Math.pow(2, attempt) * 1000;
      
      // Log retry attempt
      await this.logRetry(message.id, attempt, error);
      
      // Requeue with delay
      await this.requeueWithDelay(message, delayMs, attempt + 1);
    }
  }
}
```

### 4.4 Change Data Capture (CDC) Configuration

**Using Debezium with PostgreSQL**:
```yaml
# debezium-connector-config.json
{
  "name": "iraq-discovery-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres-primary",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "${DB_PASSWORD}",
    "database.dbname": "iraq_discovery",
    "database.server.name": "iraq_discovery_db",
    "table.include.list": "public.events,public.places,public.media",
    "plugin.name": "pgoutput",
    "publication.autocreate.mode": "filtered",
    "tombstones.on.delete": "true",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "([^.]+)\\.([^.]+)\\.([^.]+)",
    "transforms.route.replacement": "$3"
  }
}
```

**CDC Event Handler**:
```javascript
kafkaConsumer.on('message', async (message) => {
  const event = JSON.parse(message.value);
  
  switch(event.op) {
    case 'c': // Create
    case 'u': // Update
      await updateSearchIndex(event.after);
      await invalidateCache(event.after.id);
      await notifyWebSocketClients({
        type: 'update',
        entity: message.topic,
        data: event.after
      });
      break;
      
    case 'd': // Delete
      await deleteFromSearchIndex(event.before.id);
      await invalidateCache(event.before.id);
      await notifyWebSocketClients({
        type: 'delete',
        entity: message.topic,
        id: event.before.id
      });
      break;
  }
});
```

### 4.5 Data Integrity Safeguards

**1. Database Constraints**:
```sql
-- Foreign key constraints
ALTER TABLE events ADD CONSTRAINT fk_governorate
  FOREIGN KEY (governorate_id) REFERENCES governorates(id)
  ON DELETE RESTRICT;

-- Check constraints
ALTER TABLE events ADD CONSTRAINT check_event_dates
  CHECK (end_time > start_time);

-- Unique constraints for deduplication
CREATE UNIQUE INDEX idx_events_unique ON events(
  title, governorate_id, start_time
) WHERE status = 'published';
```

**2. Application-Level Validation**:
```typescript
// Zod schema for runtime validation
const EventSchema = z.object({
  title: z.object({
    ar: z.string().min(3).max(200),
    ku: z.string().min(3).max(200),
    en: z.string().min(3).max(200)
  }),
  governorate_id: z.number().int().min(1).max(18),
  category_id: z.number().int().positive(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.object({
    lat: z.number().min(29).max(38), // Iraq bounds
    lng: z.number().min(38).max(49)
  })
}).refine(
  data => new Date(data.end_time) > new Date(data.start_time),
  { message: "End time must be after start time" }
);
```

**3. Transactional Guarantees**:
```javascript
async function publishEvent(eventData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert event
    const event = await client.query(
      'INSERT INTO events ... RETURNING *',
      [...]
    );
    
    // Update related counters
    await client.query(
      'UPDATE governorates SET events_count = events_count + 1 WHERE id = $1',
      [eventData.governorate_id]
    );
    
    // Insert to audit log
    await client.query(
      'INSERT INTO audit_log (action, entity_type, entity_id, user_id) VALUES ($1, $2, $3, $4)',
      ['create', 'event', event.rows[0].id, eventData.created_by]
    );
    
    await client.query('COMMIT');
    return event.rows[0];
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**4. Data Backup Strategy**:
```
Primary Backup: Continuous WAL Archiving
├── PostgreSQL WAL shipping to S3
├── Point-in-time recovery capability
└── Retention: 30 days

Secondary Backup: Daily Snapshots
├── Full database dump
├── Stored in multiple regions
└── Retention: 90 days

Tertiary Backup: Weekly Exports
├── CSV exports for each table
├── For disaster recovery
└── Retention: 1 year
```

### 4.6 Real-Time Update Mechanism

**WebSocket Architecture**:
```javascript
// Server: WebSocket rooms by governorate
io.on('connection', (socket) => {
  socket.on('subscribe', ({ governorates, categories }) => {
    governorates.forEach(gov => {
      socket.join(`gov:${gov}`);
    });
    categories.forEach(cat => {
      socket.join(`cat:${cat}`);
    });
  });
});

// Broadcast updates from CDC handler
function broadcastUpdate(entity, data) {
  if (entity === 'events') {
    io.to(`gov:${data.governorate_id}`).emit('event:update', data);
    io.to(`cat:${data.category_id}`).emit('event:update', data);
  }
}

// Client: Auto-reconnection with exponential backoff
const socket = io('wss://api.iraqidiscovery.com', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity
});

socket.on('event:update', (data) => {
  updateLocalCache(data);
  refreshUI(data);
});
```

---

## 5. Content Management System

### 5.1 Admin Dashboard Architecture

**Tech Stack**:
- Frontend: Next.js Admin Dashboard (separate from PWA)
- UI Library: React Admin or Refine
- Authentication: JWT + Role-Based Access Control (RBAC)

**User Roles**:
```
Super Admin
├── Full access to all features
├── User management
└── System configuration

Governorate Admin
├── Manage content for specific governorate(s)
├── Approve submissions
└── View analytics for their region

Content Editor
├── Create/edit drafts
├── Cannot publish
└── Limited to assigned categories

Partner/Business Owner
├── Manage own listings only
├── Submit events for approval
└── View own analytics
```

### 5.2 CMS Features

#### Content Creation Workflow
```
Draft → Review → Scheduled → Published → Archived
  ↓       ↓          ↓           ↓          ↓
Save   Approve   Auto-Pub    Active    Expired
         ↓
      Reject → Back to Draft
```

#### Bulk Operations
- CSV import for events/places
- Batch editing (change governorate, category, etc.)
- Bulk approval/rejection
- Mass scheduling

#### Media Management
- Drag-and-drop upload
- Automatic image optimization
- Crop/resize tools
- Alt text for accessibility (all 3 languages)
- Media library with search and filters

#### Translation Management
```javascript
// Integrated translation helper
<TranslationEditor>
  <TextArea lang="ar" label="Arabic (Primary)" />
  <TextArea lang="ku" label="Kurdish" />
  <TextArea lang="en" label="English" />
  <Button onClick={autoTranslate}>
    Suggest Translations (AI)
  </Button>
</TranslationEditor>
```

#### Event-Specific Features
- Recurring event creator (daily, weekly, monthly patterns)
- Ticket integration (optional)
- RSVP management
- Automated reminders
- Event cancellation/postponement tools

#### Analytics Dashboard
```
Metrics Displayed:
├── Views per governorate
├── Popular categories
├── Search queries
├── Engagement rates
├── Social shares
├── User demographics
└── Peak traffic times
```

### 5.3 Content Approval Workflow

**Automated Quality Checks**:
```javascript
async function validateContent(content) {
  const issues = [];
  
  // Check for missing translations
  if (!content.title.ar || !content.title.ku || !content.title.en) {
    issues.push('Missing required translations');
  }
  
  // Check image quality
  for (const img of content.media) {
    if (img.width < 800) {
      issues.push(`Image ${img.id} resolution too low`);
    }
  }
  
  // Check for profanity (multilingual)
  const hasProfanity = await checkProfanity([
    content.title.ar,
    content.description.ar
  ]);
  if (hasProfanity) {
    issues.push('Content flagged for review');
  }
  
  // Verify location is within Iraq
  if (!isWithinIraq(content.location)) {
    issues.push('Location outside Iraq boundaries');
  }
  
  return {
    approved: issues.length === 0,
    issues
  };
}
```

### 5.4 Time-Sensitive Content Management

**Event Expiration**:
```javascript
// Cron job runs every hour
cron.schedule('0 * * * *', async () => {
  // Mark past events as archived
  await db.query(`
    UPDATE events
    SET status = 'archived'
    WHERE end_time < NOW()
    AND status = 'published'
  `);
  
  // Send notifications for upcoming events (24h before)
  const upcomingEvents = await db.query(`
    SELECT * FROM events
    WHERE start_time BETWEEN NOW() AND NOW() + INTERVAL '25 hours'
    AND start_time > NOW() + INTERVAL '23 hours'
    AND status = 'published'
  `);
  
  for (const event of upcomingEvents) {
    await sendReminderNotifications(event);
  }
});
```

**Scheduled Publishing**:
```javascript
// Publishes events at their scheduled time
cron.schedule('*/5 * * * *', async () => { // Every 5 minutes
  const toPublish = await db.query(`
    UPDATE events
    SET status = 'published', published_at = NOW()
    WHERE status = 'scheduled'
    AND scheduled_publish_at <= NOW()
    RETURNING *
  `);
  
  // Trigger CDC for each published event
  for (const event of toPublish) {
    await invalidateCache(`event:${event.id}`);
    await indexInElasticsearch(event);
  }
});
```

---

## 6. Technology Stack Summary

### Frontend (PWA)
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "ui": "Tailwind CSS + Radix UI",
  "state": "Zustand + React Query",
  "pwa": "next-pwa",
  "offline": "IndexedDB (via Dexie.js)",
  "i18n": "next-intl",
  "analytics": "Vercel Analytics + Custom events",
  "maps": "Mapbox GL JS or Google Maps",
  "forms": "React Hook Form + Zod"
}
```

### Backend
```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "NestJS (microservices)",
  "language": "TypeScript",
  "database": "PostgreSQL 16 + TimescaleDB",
  "cache": "Redis 7",
  "search": "Elasticsearch 8",
  "queue": "RabbitMQ or Apache Kafka",
  "cdn": "Cloudflare",
  "storage": "MinIO (S3-compatible) or Cloudflare R2",
  "monitoring": "Prometheus + Grafana",
  "logging": "ELK Stack (Elasticsearch, Logstash, Kibana)",
  "tracing": "Jaeger or Zipkin"
}
```

### DevOps
```json
{
  "containerization": "Docker + Docker Compose",
  "orchestration": "Kubernetes (for production scale)",
  "ci_cd": "GitHub Actions or GitLab CI",
  "infra_as_code": "Terraform",
  "secrets": "Vault or AWS Secrets Manager",
  "monitoring": "Datadog or New Relic"
}
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Project Setup & Design**
- [ ] Design system creation (Figma)
- [ ] Mobile mockups for all screens
- [ ] Database schema design
- [ ] API specification (OpenAPI)
- [ ] Project scaffolding (monorepo setup)

**Week 3-4: Core Infrastructure**
- [ ] PostgreSQL setup with TimescaleDB
- [ ] Redis configuration (multi-layer caching)
- [ ] Basic REST API (auth, events, places CRUD)
- [ ] Admin dashboard boilerplate
- [ ] CI/CD pipeline

### Phase 2: MVP Development (Weeks 5-10)

**Week 5-6: Frontend Core**
- [ ] PWA shell (Next.js + Tailwind)
- [ ] Top bar + language selector
- [ ] Hero section + pricing strip
- [ ] Governorate filter bar
- [ ] Category tabs

**Week 7-8: Content Display**
- [ ] Event cards + grid layout
- [ ] Place cards (hotels, restaurants, etc.)
- [ ] Detail pages (event detail, place detail)
- [ ] Search functionality (basic)
- [ ] Filter & sort

**Week 9-10: Admin CMS**
- [ ] Content creation forms
- [ ] Media upload & processing
- [ ] Translation interface
- [ ] Approval workflow
- [ ] Basic analytics

### Phase 3: Advanced Features (Weeks 11-14)

**Week 11-12: Real-Time & Performance**
- [ ] WebSocket integration
- [ ] CDC setup (Debezium)
- [ ] Elasticsearch integration
- [ ] Service worker (offline support)
- [ ] Image optimization pipeline

**Week 13-14: Enhancements**
- [ ] Social sharing (Open Graph, Twitter Cards)
- [ ] Push notifications
- [ ] User accounts (optional)
- [ ] Favorites/bookmarks
- [ ] Maps integration

### Phase 4: Testing & Polish (Weeks 15-16)

**Week 15: Testing**
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Security audit

**Week 16: Launch Prep**
- [ ] Content seeding (initial data)
- [ ] SEO optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Multi-device testing
- [ ] Load testing
- [ ] Soft launch (beta users)

### Phase 5: Launch & Iterate (Week 17+)

**Week 17: Public Launch**
- [ ] Marketing campaign
- [ ] Monitor performance
- [ ] Gather user feedback
- [ ] Bug fixes

**Ongoing: Iteration**
- [ ] Feature additions based on feedback
- [ ] Content expansion
- [ ] Partnership integrations
- [ ] Mobile app (React Native) consideration

---

## 8. Performance & Optimization

### 8.1 Frontend Performance Targets

```
Metrics (Mobile 3G):
├── First Contentful Paint (FCP): < 1.8s
├── Largest Contentful Paint (LCP): < 2.5s
├── Time to Interactive (TTI): < 3.8s
├── Total Blocking Time (TBT): < 300ms
├── Cumulative Layout Shift (CLS): < 0.1
└── Lighthouse Score: > 90
```

### 8.2 Optimization Strategies

**Code Splitting**:
```javascript
// Next.js automatic code splitting
// Dynamic imports for heavy components
const MapComponent = dynamic(() => import('@/components/Map'), {
  loading: () => <MapSkeleton />,
  ssr: false // Map doesn't need SSR
});

const AdminDashboard = dynamic(() => import('@/components/Admin'), {
  loading: () => <LoadingSpinner />
});
```

**Image Optimization**:
```jsx
// Using Next.js Image component
import Image from 'next/image';

<Image
  src={event.image}
  alt={event.title[lang]}
  width={320}
  height={320}
  quality={85}
  placeholder="blur"
  blurDataURL={event.blurHash}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
/>
```

**Lazy Loading**:
```javascript
// Intersection Observer for infinite scroll
const { ref, inView } = useInView({
  threshold: 0.5,
  triggerOnce: false
});

useEffect(() => {
  if (inView && hasMore) {
    loadMoreEvents();
  }
}, [inView]);
```

**Service Worker Caching**:
```javascript
// next-pwa configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.iraqidiscovery\.com\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 300 // 5 minutes
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /^https:\/\/cdn\.iraqidiscovery\.com\/.*\.(jpg|jpeg|png|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 2592000 // 30 days
        }
      }
    }
  ]
});
```

### 8.3 Backend Performance

**Database Query Optimization**:
```sql
-- Use materialized views for heavy aggregations
CREATE MATERIALIZED VIEW governorate_stats AS
SELECT
  g.id,
  g.name,
  COUNT(DISTINCT e.id) as events_count,
  COUNT(DISTINCT p.id) as places_count,
  AVG(p.rating) as avg_rating
FROM governorates g
LEFT JOIN events e ON g.id = e.governorate_id AND e.status = 'published'
LEFT JOIN places p ON g.id = p.governorate_id
GROUP BY g.id, g.name;

-- Refresh every hour
CREATE UNIQUE INDEX ON governorate_stats (id);
-- Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY governorate_stats;
```

**Redis Caching Strategy**:
```javascript
async function getEvents(governorate, month) {
  const cacheKey = `events:${governorate}:${month}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const events = await db.query(
    'SELECT * FROM events WHERE governorate_id = $1 AND ...',
    [governorate]
  );
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(events));
  
  return events;
}
```

**Connection Pooling**:
```javascript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20, // Maximum pool size
  min: 5,  // Minimum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Redis connection pool
const redis = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  },
  clusterRetryStrategy: (times) => Math.min(100 * times, 2000)
});
```

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

**JWT Strategy**:
```javascript
// Access token (short-lived)
const accessToken = jwt.sign(
  { userId, role, governorates },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);

// Refresh token (long-lived)
const refreshToken = jwt.sign(
  { userId, tokenVersion },
  process.env.REFRESH_SECRET,
  { expiresIn: '7d' }
);

// Store refresh token in httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

**RBAC Middleware**:
```javascript
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
}

// Usage
router.post('/events', 
  authenticate,
  requireRole(['admin', 'editor']),
  createEvent
);
```

### 9.2 API Security

**Rate Limiting**:
```javascript
// Using express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  // Redis store for distributed rate limiting
  store: new RedisStore({
    client: redis,
    prefix: 'rl:'
  })
});

app.use('/api/', limiter);
```

**Input Validation**:
```javascript
// Using Zod + express-validator
import { z } from 'zod';

const eventSchema = z.object({
  title: z.object({
    ar: z.string().min(3).max(200),
    ku: z.string().min(3).max(200),
    en: z.string().min(3).max(200)
  }),
  governorate_id: z.number().int().min(1).max(18)
});

app.post('/events', async (req, res) => {
  try {
    const validated = eventSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ errors: error.errors });
  }
});
```

**SQL Injection Prevention**:
```javascript
// Always use parameterized queries
const result = await db.query(
  'SELECT * FROM events WHERE governorate_id = $1 AND status = $2',
  [governorateId, 'published']
);

// Never concatenate user input
// BAD: `SELECT * FROM events WHERE title = '${userInput}'`
```

**CORS Configuration**:
```javascript
const corsOptions = {
  origin: [
    'https://iraqidiscovery.com',
    'https://www.iraqidiscovery.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 9.3 Data Privacy

**GDPR Compliance**:
- User consent for cookies
- Right to data export
- Right to deletion
- Clear privacy policy

**Data Encryption**:
```javascript
// Encrypt sensitive data at rest
const crypto = require('crypto');

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-gcm', process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Use HTTPS for all connections
// PostgreSQL SSL mode: require
```

---

## 10. Monitoring & Analytics

### 10.1 Application Monitoring

**Key Metrics**:
```javascript
// Custom metrics with Prometheus client
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeUsers = new prometheus.Gauge({
  name: 'active_websocket_connections',
  help: 'Number of active WebSocket connections'
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});
```

### 10.2 User Analytics

**Event Tracking**:
```javascript
// Client-side analytics
function trackEvent(category, action, label, value) {
  // Send to custom analytics endpoint
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userAgent: navigator.userAgent
    })
  });
}

// Usage
trackEvent('Event', 'View', event.id, event.governorate_id);
trackEvent('Share', 'Social', 'Facebook', event.id);
```

---

## 11. Deployment Architecture

### 11.1 Production Infrastructure

```
┌─────────────────────────────────────────────────────┐
│                  CLOUDFLARE CDN                     │
│  (DDoS Protection, SSL, Edge Caching)               │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼─────────────┐
        │   LOAD BALANCER (NGINX)  │
        └────────────┬─────────────┘
                     │
        ┌────────────▼─────────────────────────┐
        │      KUBERNETES CLUSTER              │
        ├──────────────────────────────────────┤
        │  ┌────────────┐  ┌────────────┐     │
        │  │ API Pods   │  │ Worker Pods│     │
        │  │ (3 replicas)  │ (2 replicas)     │
        │  └──────┬─────┘  └──────┬─────┘     │
        │         │                │           │
        │  ┌──────▼────────────────▼─────┐    │
        │  │     SERVICE MESH (Istio)    │    │
        │  └─────────────────────────────┘    │
        └──────────────────────────────────────┘
                     │
        ┌────────────▼─────────────────────────┐
        │       DATA LAYER                     │
        ├──────────────────────────────────────┤
        │  PostgreSQL Primary                  │
        │  PostgreSQL Replicas (Read-only)     │
        │  Redis Cluster                       │
        │  Elasticsearch Cluster               │
        └──────────────────────────────────────┘
```

### 11.2 Environment Configuration

**Development**:
- Local Docker Compose setup
- Hot reloading enabled
- Debug logging
- Seeded test data

**Staging**:
- Mirrors production architecture
- Automated deployment on merge to `develop`
- Used for QA testing

**Production**:
- Blue-green deployment
- Auto-scaling based on CPU/memory
- Zero-downtime deployments
- Automated backups

---

## 12. Cost Estimation (Monthly)

### 12.1 Infrastructure Costs

**Hosting (VPS/Cloud)**:
- 3× API servers (4GB RAM, 2 vCPU): $30 × 3 = $90
- 1× Database server (8GB RAM, 4 vCPU): $80
- 1× Redis/Elasticsearch (4GB RAM): $40
- Load balancer: $20
- **Total Hosting**: ~$230/month

**CDN & Storage**:
- Cloudflare Pro: $20/month
- Media storage (500GB): $10/month
- Bandwidth (1TB): Included in Cloudflare
- **Total CDN/Storage**: ~$30/month

**Services**:
- Domain + SSL: $15/year (~$1.25/month)
- Monitoring (Datadog/New Relic): $0-50/month (free tier available)
- Email service: $0-10/month
- **Total Services**: ~$10-60/month

**Total Monthly Cost**: **$270-320/month** (initial scale)

### 12.2 Scaling Considerations

At 100k monthly active users:
- Increase to 6× API servers: +$180
- Upgrade database: +$100
- Additional cache/search nodes: +$80
- **Total**: ~$630-700/month

---

## 13. Success Metrics

### 13.1 Technical KPIs
- **Uptime**: > 99.9%
- **API Response Time**: < 200ms (p95)
- **Page Load Time**: < 3s (mobile 3G)
- **Error Rate**: < 0.1%
- **Cache Hit Rate**: > 80%

### 13.2 Business KPIs
- **Monthly Active Users (MAU)**
- **Daily Active Users (DAU)**
- **Average Session Duration**
- **Event Discovery Rate**
- **Social Share Rate**
- **Content Submission Rate** (from partners)

---

## 14. Next Steps

1. **Review & Feedback**: Gather feedback on this plan from stakeholders
2. **Design Mockups**: Create high-fidelity designs in Figma
3. **Technical Proof of Concept**: Build a small prototype (2-3 screens + API)
4. **Team Assembly**: Hire/assign developers, designers, content creators
5. **Sprint Planning**: Break down Phase 1 into 2-week sprints
6. **Kickoff Meeting**: Align team on goals, timeline, and responsibilities

---

## Appendix A: Iraqi Governorates Data Structure

```json
[
  {
    "id": 1,
    "name": {
      "ar": "بغداد",
      "ku": "بەغدا",
      "en": "Baghdad"
    },
    "slug": "baghdad",
    "coordinates": { "lat": 33.3152, "lng": 44.3661 },
    "population": 7665292,
    "area_km2": 4555
  },
  {
    "id": 2,
    "name": {
      "ar": "البصرة",
      "ku": "بەسرە",
      "en": "Basra"
    },
    "slug": "basra",
    "coordinates": { "lat": 30.5085, "lng": 47.7835 },
    "population": 2600000,
    "area_km2": 19070
  },
  // ... 16 more governorates
]
```

---

## Appendix B: Category Taxonomy

```json
{
  "events": {
    "subcategories": [
      "music",
      "arts",
      "sports",
      "education",
      "business",
      "community",
      "festivals"
    ]
  },
  "places": {
    "hotels": ["budget", "mid-range", "luxury"],
    "restaurants": ["iraqi", "middle-eastern", "international", "fast-food"],
    "cafes": ["coffee-shop", "tea-house", "hookah"],
    "tourism": ["historical", "religious", "natural", "museums"]
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-02  
**Author**: AI Architecture Assistant  
**Status**: Draft - Awaiting Review
