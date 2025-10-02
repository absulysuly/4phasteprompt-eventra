# 🚀 Backend Data Pipeline - Quick Start Guide

## What You Now Have

A complete automated data collection system for Iraqi venues that:
- ✅ Collects venue data from Google Maps (and extensible to other sources)
- ✅ Validates Iraqi phone numbers (+964 format)
- ✅ Normalizes addresses for all 18 governorates
- ✅ Automatically imports to your database with multi-language support
- ✅ Runs on schedule (daily at 2-4 AM for different cities)
- ✅ Includes CLI tools for manual testing and collection

## Files Created

### Core Pipeline
```
src/lib/dataCollection/
├── scheduler.ts                      # Main scheduler with cron jobs
├── dataValidator.ts                  # Validation & cleaning pipeline
├── csvImporter.ts                    # CSV import utilities
├── venueUtils.ts                     # Venue data utilities
└── scrapers/
    ├── googleMapsCollector.ts        # Google Places API collector
    └── (future: facebookCollector.ts, instagramCollector.ts)
```

### Scripts & Tools
```
scripts/
├── run-data-collector.ts             # CLI tool for data collection
├── import-venues-to-db.ts            # CSV to database importer
└── import-events-from-csv.ts         # CSV events importer
```

### Documentation
```
├── DATA_PIPELINE.md                  # Comprehensive documentation
└── BACKEND_QUICKSTART.md            # This file
```

## 5-Minute Test

### 1. Verify Setup
```bash
# Check database exists
ls prisma/dev.db

# If not, create it:
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 2. Test Collection (Mock Data - No API Key Needed)
```bash
npm run collect:test
```

**Expected Output:**
```
✅ Collected 3 venues from google_maps
✅ Validated 3 venues
✅ Imported 3 venues to database
```

### 3. View Imported Data
```bash
# Open Prisma Studio
npm run db:studio

# Then navigate to http://localhost:5555
# Click on "Venue" table to see your imported venues
```

### 4. List Available Jobs
```bash
npm run collect:list
```

### 5. Run Specific Job
```bash
# Test Baghdad collection
npm run collect:data -- --job google-maps-baghdad

# Test Erbil collection
npm run collect:data -- --job google-maps-erbil
```

## Next Steps

### Option 1: Test Mode (No API Key Required)
Perfect for development and testing:
```bash
npm run collect:test
```
This uses mock data to demonstrate the full pipeline.

### Option 2: Production Mode (Requires Google API Key)

#### Step 1: Get Google Places API Key
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Places API"
4. Create credentials → API Key
5. Copy the key

#### Step 2: Add to Environment
```bash
# Edit .env file
GOOGLE_PLACES_API_KEY=AIza...your_key_here
```

#### Step 3: Run Real Collection
```bash
# Collect real venues from Baghdad
npm run collect:data -- --job google-maps-baghdad
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run collect:list` | List all collection jobs |
| `npm run collect:test` | Test with mock data |
| `npm run collect:data` | Run all enabled jobs |
| `npm run collect:data -- --job <id>` | Run specific job |
| `npm run collect:data -- --help` | Show help |
| `npm run db:studio` | Open database viewer |

## Integration with Frontend

### Query Venues from Your App

```typescript
// In your Next.js page/component
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all venues
const venues = await prisma.venue.findMany({
  include: {
    translations: true
  }
});

// Filter by city
const baghdadVenues = await prisma.venue.findMany({
  where: {
    city: 'baghdad'
  },
  include: {
    translations: {
      where: { locale: 'en' }
    }
  }
});

// Search by type
const hotels = await prisma.venue.findMany({
  where: {
    type: 'HOTEL',
    city: 'erbil'
  }
});
```

### Create API Endpoint

```typescript
// app/api/venues/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const type = searchParams.get('type');

  const venues = await prisma.venue.findMany({
    where: {
      ...(city && { city }),
      ...(type && { type }),
      status: 'ACTIVE'
    },
    include: {
      translations: true
    }
  });

  return NextResponse.json(venues);
}
```

## Scheduled Automated Collection

### Option 1: Local Scheduler (Development)
```typescript
// In your Next.js API route or separate process
import { getScheduler } from '@/lib/dataCollection/scheduler';

const scheduler = getScheduler();
await scheduler.start();

// Runs automatically on schedule
// Baghdad: Daily at 2 AM
// Erbil: Daily at 3 AM
// Basra: Daily at 4 AM
```

### Option 2: Cron Job (Production)
```bash
# Add to crontab
0 2 * * * cd /path/to/eventra-saas && npm run collect:data -- --job google-maps-baghdad
0 3 * * * cd /path/to/eventra-saas && npm run collect:data -- --job google-maps-erbil
0 4 * * * cd /path/to/eventra-saas && npm run collect:data -- --job google-maps-basra
```

### Option 3: Cloud Scheduler (Vercel/AWS/Azure)
Use your platform's scheduler to run:
```bash
npm run collect:data
```

## Monitoring & Maintenance

### Check Last Collection
```typescript
import { getScheduler } from '@/lib/dataCollection/scheduler';

const scheduler = getScheduler();
const jobs = scheduler.getJobs();

jobs.forEach(job => {
  console.log(`${job.name}`);
  console.log(`Last run: ${job.lastRun}`);
  console.log(`Next run: ${job.nextRun}`);
  console.log(`Status: ${job.status}`);
});
```

### View Database Stats
```bash
# Open Prisma Studio
npm run db:studio

# Or query programmatically
```

```typescript
const stats = await prisma.$queryRaw`
  SELECT 
    type,
    city,
    COUNT(*) as count
  FROM Venue
  GROUP BY type, city
`;
```

## Troubleshooting

### "No venues collected"
- ✅ Running in test mode? Use `npm run collect:test`
- ✅ API key set? Check `.env` file
- ✅ API enabled? Visit Google Cloud Console

### "Duplicate venues"
This is expected! The system automatically skips duplicates.

### "Database locked"
Stop Prisma Studio before running collection.

### "Invalid phone number"
Check format: Must be +964 or 07XXXXXXXXX

## Cost Considerations

### Google Places API
- **Free Tier**: 28,500 requests/month
- **Each Collection Run**: ~50-100 requests per city
- **Daily Schedule**: ~3,000 requests/month
- **Conclusion**: Free tier is sufficient! ✅

### Database Storage
- **SQLite**: Free, suitable for 10,000+ venues
- **PostgreSQL**: Recommended for production
  - Supabase: Free tier available
  - Vercel Postgres: $20/month
  - AWS RDS: ~$15-30/month

## Extending the System

### Add New City
Edit `src/lib/dataCollection/scheduler.ts`:

```typescript
{
  id: 'google-maps-mosul',
  name: 'Google Maps - Mosul Venues',
  source: 'google_maps',
  enabled: true,
  schedule: '0 5 * * *',
  status: 'idle',
  config: {
    city: 'Mosul',
    governorate: 'nineveh',
    types: ['hotel', 'restaurant', 'cafe', 'tourist_attraction'],
    radius: 40000,
    coordinates: { lat: 36.3350, lng: 43.1189 }
  }
}
```

### Add New Data Source
1. Create collector: `src/lib/dataCollection/scrapers/yourSourceCollector.ts`
2. Implement: `export async function collectVenues(config): Promise<VenueData[]>`
3. Add job to scheduler
4. Test!

## Support

- 📖 Full docs: `DATA_PIPELINE.md`
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📧 Email: contact@eventra.app

## Summary

You now have a **production-ready data pipeline** that can:
1. ✅ Collect venue data automatically
2. ✅ Validate and clean Iraqi-specific data
3. ✅ Import to your database with translations
4. ✅ Run on schedule without manual intervention
5. ✅ Scale to all 18 Iraqi governorates

**Next**: Connect your frontend to display this data! 🎉

---

**Built with ❤️ for Iraq's digital transformation**
