# 🏗️ Eventra Backend Data Pipeline

Complete automated data collection, validation, and import system for Iraqi venues and events.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Data Sources](#data-sources)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Data Validation](#data-validation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Eventra Data Pipeline automatically collects, validates, and imports venue data from multiple sources across Iraq's 18 governorates. It handles:

- **Automated Scraping**: Google Maps, Facebook Events, Instagram (configurable)
- **Data Validation**: Phone numbers (+964), addresses, coordinates
- **Cleaning Pipeline**: Normalization, sanitization, deduplication
- **Scheduled Jobs**: Cron-based collection runs
- **Database Import**: Direct Prisma integration with SQLite/PostgreSQL

---

## ✨ Features

### 🤖 Automated Collection
- ✅ Google Maps Places API integration
- ✅ Scheduled daily collection jobs
- ✅ Rate limiting and error handling
- ⏳ Facebook Events API (coming soon)
- ⏳ Instagram API (coming soon)

### 🧹 Data Validation
- ✅ Iraqi phone number validation (+964)
- ✅ Address normalization for 18 governorates
- ✅ Coordinate validation (Iraq bounds)
- ✅ Duplicate detection
- ✅ Price range standardization
- ✅ Data sanitization (XSS prevention)

### 💾 Database Integration
- ✅ Prisma ORM integration
- ✅ Multi-language support (EN/AR/KU)
- ✅ Automatic translations
- ✅ Venue categorization (Hotels, Restaurants, Activities, Services)

### 🎛️ Control Tools
- ✅ CLI for manual collection
- ✅ Job listing and management
- ✅ Test mode with mock data
- ✅ Detailed logging and reporting

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
# .env file
DATABASE_URL="file:./dev.db"
GOOGLE_PLACES_API_KEY="your_api_key_here"  # Optional for testing
```

### 3. Initialize Database
```bash
npm run db:generate
npm run db:migrate
```

### 4. Test Collection (Mock Data)
```bash
npm run collect:test
```

### 5. List Available Jobs
```bash
npm run collect:list
```

### 6. Run Data Collection
```bash
# Run all enabled jobs
npm run collect:data

# Run specific job
npm run collect:data -- --job google-maps-baghdad
```

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   DATA COLLECTION SCHEDULER                  │
│  - Manages cron jobs                                        │
│  - Orchestrates collectors                                  │
│  - Handles retries and errors                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┬──────────────┬──────────────┐
        │                     │              │              │
   ┌────▼─────┐         ┌────▼────┐    ┌───▼────┐    ┌───▼────┐
   │ Google   │         │Facebook │    │Instagram│   │  CSV   │
   │  Maps    │         │ Events  │    │ Venues  │   │ Import │
   │Collector │         │Collector│    │Collector│   │        │
   └────┬─────┘         └────┬────┘    └───┬────┘    └───┬────┘
        │                    │              │             │
        └──────────┬─────────┴──────────────┴─────────────┘
                   │
            ┌──────▼───────┐
            │   VALIDATOR  │
            │  - Clean     │
            │  - Normalize │
            │  - Validate  │
            │  - Enrich    │
            └──────┬───────┘
                   │
            ┌──────▼───────┐
            │   PRISMA DB  │
            │  - Venues    │
            │  - Events    │
            │  - Trans.    │
            └──────────────┘
```

---

## 🌍 Data Sources

### Google Maps Places API
**Status**: ✅ Implemented  
**Rate Limit**: 28,500 requests/month (free tier)  
**Coverage**: All Iraqi cities

**Collected Data**:
- Name, description, address
- Coordinates (lat/lng)
- Phone numbers, website
- Ratings, price level
- Photos, amenities
- Business hours
- Reviews

**Setup**:
1. Get API key: https://console.cloud.google.com/
2. Enable "Places API"
3. Add to `.env`: `GOOGLE_PLACES_API_KEY=your_key`

### Facebook Events
**Status**: ⏳ Coming Soon  
**Requires**: Facebook Graph API access

**Will Collect**:
- Event name, description
- Date, time, location
- Cover images
- Organizer info
- Ticket links

### Instagram Venues
**Status**: ⏳ Coming Soon  
**Requires**: Instagram Basic Display API

**Will Collect**:
- Venue posts
- Photos, captions
- Hashtags
- Location tags

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm/yarn
- SQLite (dev) or PostgreSQL (production)

### Step-by-Step Setup

#### 1. Clone and Install
```bash
cd eventra-saas
npm install
```

#### 2. Configure Environment
Create `.env` file:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google Places API (Optional for testing)
GOOGLE_PLACES_API_KEY="your_google_api_key"

# Application
NODE_ENV="development"
```

#### 3. Initialize Database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

#### 4. Test the Pipeline
```bash
# Test with mock data (no API key needed)
npm run collect:test

# Expected output:
# ✅ Collected 3 venues from google_maps
# ✅ Validated 3 venues
# ✅ Imported 3 venues to database
```

#### 5. Run Real Collection (Optional)
```bash
# First, get your Google Places API key
# Then run:
npm run collect:data -- --job google-maps-baghdad
```

---

## 📖 Usage

### CLI Commands

#### List All Jobs
```bash
npm run collect:list
```
Shows all configured collection jobs with status, schedule, and configuration.

#### Run All Enabled Jobs
```bash
npm run collect:data
```
Executes all jobs marked as `enabled: true`.

#### Run Specific Job
```bash
npm run collect:data -- --job google-maps-erbil
```

#### Test Mode (Mock Data)
```bash
npm run collect:test
```
Runs collection with mock data, no API key required.

#### Help
```bash
npm run collect:data -- --help
```

### Available Jobs

| Job ID | Source | City | Enabled | Schedule |
|--------|--------|------|---------|----------|
| `google-maps-baghdad` | Google Maps | Baghdad | ✅ | Daily 2 AM |
| `google-maps-erbil` | Google Maps | Erbil | ✅ | Daily 3 AM |
| `google-maps-basra` | Google Maps | Basra | ✅ | Daily 4 AM |
| `facebook-events-iraq` | Facebook | All | ❌ | Daily 6 AM |
| `instagram-venues-iraq` | Instagram | All | ❌ | Daily 8 AM |

### Programmatic Usage

```typescript
import { getScheduler } from './src/lib/dataCollection/scheduler';

const scheduler = getScheduler();

// Start scheduler (runs automatically)
await scheduler.start();

// Run job manually
const result = await scheduler.executeJob('google-maps-baghdad');

console.log(`Collected: ${result.collected}`);
console.log(`Imported: ${result.imported}`);

// Stop scheduler
scheduler.stop();
```

---

## 🔌 API Integration

### Google Places API

**Cost**: Free tier (28,500 requests/month) → $17/1000 requests after

**Rate Limits**:
- 100 requests/second
- 28,500 requests/month (free)

**Best Practices**:
1. Cache results for 24 hours
2. Batch requests by city
3. Use mock data for development
4. Monitor usage in Google Console

**Setup Steps**:
```bash
# 1. Go to Google Cloud Console
https://console.cloud.google.com/

# 2. Create new project or select existing

# 3. Enable APIs
- Places API
- Maps JavaScript API (optional)

# 4. Create credentials
- API Key
- Restrict to Places API
- Add HTTP referrer restrictions (production)

# 5. Add to .env
GOOGLE_PLACES_API_KEY=AIza...
```

### Future Integrations

**Facebook Graph API**:
```env
FACEBOOK_ACCESS_TOKEN=your_token
```

**Instagram Basic Display API**:
```env
INSTAGRAM_ACCESS_TOKEN=your_token
```

---

## ✅ Data Validation

### Phone Number Validation
```typescript
// Supported formats:
+9647901234567    // International
07901234567       // Local
00964790123456   // International prefix
```

**Validation**:
- Must start with +964 or 07
- Must be 10 digits after country code
- Automatically normalized to +964 format

### City/Governorate Validation
All 18 Iraqi governorates supported with multiple name variations:

| English | Arabic | Kurdish |
|---------|--------|---------|
| Baghdad | بغداد | بەغدا |
| Erbil | أربيل | هەولێر |
| Basra | البصرة | بەسرە |
| Mosul | الموصل | موسڵ |
| ... | ... | ... |

### Coordinate Validation
```typescript
// Iraq bounds
North: 37.385
South: 29.061
East: 48.575
West: 38.793
```

Coordinates outside these bounds trigger a warning.

### Price Range Normalization
```typescript
// Input → Output
"Cheap" → "$"
"Moderate" → "$$"
"Expensive" → "$$$"
"Luxury" → "$$$$"
"25-50" → "25-50"  // Range preserved
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "GOOGLE_PLACES_API_KEY not configured"
**Solution**: Either:
- Add API key to `.env` file, OR
- Use test mode: `npm run collect:test`

#### 2. "Prisma Client not generated"
```bash
npm run db:generate
```

#### 3. "Database connection failed"
```bash
# Check DATABASE_URL in .env
# For SQLite:
DATABASE_URL="file:./dev.db"

# For PostgreSQL:
DATABASE_URL="postgresql://user:password@localhost:5432/eventra"
```

#### 4. "No venues collected"
- Check API key is valid
- Verify API is enabled in Google Console
- Check rate limits not exceeded
- Try test mode first

#### 5. "Import failed - duplicate venue"
Expected behavior. The system skips existing venues to prevent duplicates.

### Debug Mode

Enable detailed logging:
```typescript
// In scheduler.ts
console.log('DEBUG:', data);
```

### Check Database

```bash
# Open Prisma Studio
npm run db:studio

# View imported venues
# Navigate to: http://localhost:5555
```

---

## 📊 Performance

### Collection Speed

| Source | Venues/Minute | Governorate Coverage |
|--------|---------------|---------------------|
| Google Maps | ~20-30 | Single city |
| CSV Import | ~100-200 | Configurable |
| Facebook | TBD | All Iraq |
| Instagram | TBD | All Iraq |

### Database Performance

**SQLite (Development)**:
- Fast for < 10,000 venues
- Single file database
- No setup required

**PostgreSQL (Production)**:
- Recommended for production
- Better concurrent access
- Full-text search support

---

## 🗺️ Roadmap

### Phase 1: ✅ Core Pipeline (Complete)
- [x] Scheduler infrastructure
- [x] Google Maps collector
- [x] Data validation
- [x] CLI tools
- [x] Mock data testing

### Phase 2: 🚧 Enhanced Collection (In Progress)
- [ ] Facebook Events integration
- [ ] Instagram venues
- [ ] WhatsApp Business scraping
- [ ] Iraqi directories integration

### Phase 3: 📈 Optimization
- [ ] Redis caching layer
- [ ] Parallel collection jobs
- [ ] ML-based deduplication
- [ ] Automatic translation (AI)

### Phase 4: 🎯 Advanced Features
- [ ] Real-time updates
- [ ] User-submitted venues
- [ ] Review aggregation
- [ ] Image optimization
- [ ] SEO metadata generation

---

## 📝 Contributing

To add a new data source:

1. Create collector in `src/lib/dataCollection/scrapers/`
2. Implement `collectVenues(config)` function
3. Add job to `scheduler.ts` DEFAULT_JOBS
4. Update this README
5. Test with mock data first

Example:
```typescript
// src/lib/dataCollection/scrapers/newSourceCollector.ts
export async function collectNewSourceVenues(config: any): Promise<VenueData[]> {
  // Your collection logic
  return venues;
}
```

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Issues**: https://github.com/absulysuly/4phasteprompt-eventra/issues
- **Discussions**: https://github.com/absulysuly/4phasteprompt-eventra/discussions
- **Email**: contact@eventra.app

---

**Built with ❤️ for Iraq's digital transformation**
