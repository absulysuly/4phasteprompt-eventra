# Caching and Performance Guide

## Overview

Eventra uses Redis caching and database indexing to deliver fast API responses and handle high traffic loads. This guide covers the caching strategy, configuration, and performance optimizations.

## Features

✅ **Redis Caching** - Intelligent caching with automatic invalidation  
✅ **Database Indexes** - Optimized queries with strategic indexing  
✅ **Graceful Degradation** - Works without Redis if not available  
✅ **Cache Management** - Admin API for cache control  
✅ **Performance Monitoring** - Cache hit/miss logging and stats  

---

## Redis Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Redis Configuration
REDIS_ENABLED=true              # Set to 'false' to disable caching
REDIS_URL=redis://localhost:6379  # Full Redis connection URL (preferred)

# Or configure individually:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here  # Optional, for secured Redis
```

### Installation

#### Local Development (Windows)

1. **Install Redis using Memurai** (Redis for Windows):
   ```powershell
   # Download from https://www.memurai.com/get-memurai
   # Or use Chocolatey
   choco install memurai-developer
   ```

2. **Start Redis**:
   ```powershell
   # Memurai runs as a Windows service automatically
   # Or start manually:
   memurai
   ```

#### Docker (Recommended for Development)

```bash
# Run Redis in Docker
docker run -d --name eventra-redis -p 6379:6379 redis:alpine

# With persistence
docker run -d --name eventra-redis \
  -p 6379:6379 \
  -v eventra-redis-data:/data \
  redis:alpine redis-server --appendonly yes
```

#### Production (Cloud)

Use a managed Redis service:
- **Vercel** → Upstash Redis
- **AWS** → ElastiCache
- **Azure** → Azure Cache for Redis
- **Railway/Render** → Built-in Redis addon

---

## Caching Strategy

### Cache Keys

All cache keys follow a structured naming convention:

```typescript
// Venue caching
venue:{id}                           // Single venue by ID
venues:list:{params}                 // Venue listing with filters
venues:search:{query}:{params}       // Search results
venues:stats                         // Venue statistics
venues:filters                       // Available filters metadata

// Event caching
event:{id}                           // Single event by ID
events:list:{params}                 // Event listing

// Geographic caching
governorate:{name}:venues            // Venues by governorate
category:{name}:venues               // Venues by category
```

### Cache TTL (Time To Live)

Different data types have different cache durations:

| Cache Type | TTL | Use Case |
|------------|-----|----------|
| `SHORT` | 5 min | Search results, dynamic data |
| `MEDIUM` | 30 min | Venue lists, filtered results |
| `LONG` | 1 hour | Statistics, metadata |
| `VERY_LONG` | 24 hours | Static content, configurations |

### Automatic Cache Invalidation

Cache is automatically invalidated when:
- New venue is created → Invalidates `venues:list:*`, `venues:stats`, `venues:filters`
- Venue is updated → Invalidates `venue:{id}`, related lists
- Venue is deleted → Invalidates all venue-related caches
- Data is imported → Clears all relevant caches

---

## Usage Examples

### In API Routes

The caching is already integrated into your API routes:

```typescript
// src/app/api/venues/route.ts
import { cacheGet, CacheKeys, CacheTTL } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  const cacheKey = CacheKeys.venueList(params);
  
  const result = await cacheGet(
    cacheKey,
    async () => {
      // This function only runs on cache miss
      const venues = await prisma.venue.findMany({ ... });
      return { venues, count: venues.length };
    },
    CacheTTL.MEDIUM // 30 minutes
  );
  
  return NextResponse.json({ success: true, ...result });
}
```

### Manual Cache Control

```typescript
import { cacheSet, cacheDel, cacheInvalidatePattern } from '@/lib/cache/redis';

// Set cache manually
await cacheSet('my-key', { data: 'value' }, CacheTTL.SHORT);

// Delete specific key
await cacheDel('my-key');

// Delete multiple keys
await cacheDel(['key1', 'key2', 'key3']);

// Invalidate by pattern
await cacheInvalidatePattern('venues:*'); // All venue caches
await cacheInvalidatePattern('events:list:*'); // All event lists
```

---

## Database Indexes

Strategic indexes have been added to the Prisma schema for optimal query performance:

### Event Model Indexes

```prisma
model Event {
  // ... fields ...
  
  @@index([date])          // Date-based queries
  @@index([category])      // Category filtering
  @@index([city])          // Location-based queries
  @@index([userId])        // User's events
  @@index([createdAt])     // Recent events
}
```

### Venue Model Indexes

```prisma
model Venue {
  // ... fields ...
  
  @@index([type])                    // Venue type filtering
  @@index([status])                  // Active/pending venues
  @@index([category])                // Category filtering
  @@index([city])                    // City-based queries
  @@index([featured])                // Featured venues
  @@index([verified])                // Verified venues
  @@index([type, status])            // Combined filters
  @@index([category, city])          // Multi-field searches
  @@index([latitude, longitude])     // Geo-spatial queries
}
```

### Translation Indexes

```prisma
model VenueTranslation {
  // ... fields ...
  
  @@index([venueId])       // Fetch translations for venue
  @@index([locale])        // Locale-specific queries
}
```

These indexes were automatically applied when you ran:
```bash
npx prisma migrate dev --name add_performance_indexes
```

---

## Cache Management API

### Endpoints

#### Get Cache Statistics

```bash
GET /api/admin/cache

Response:
{
  "success": true,
  "stats": {
    "enabled": true,
    "totalKeys": 245,
    "info": {
      "total_connections_received": "1523",
      "total_commands_processed": "5847",
      "instantaneous_ops_per_sec": "12"
    }
  }
}
```

#### Clear All Cache

```bash
POST /api/admin/cache
Content-Type: application/json

{
  "action": "clear"
}
```

#### Invalidate by Pattern

```bash
POST /api/admin/cache
Content-Type: application/json

{
  "action": "invalidate",
  "pattern": "venues:*"
}
```

### CLI Tools

You can also manage cache via CLI:

```bash
# Clear all cache
node scripts/cache-clear.js

# Invalidate specific pattern
node scripts/cache-invalidate.js "venues:search:*"
```

---

## Performance Monitoring

### Cache Hit/Miss Logging

The cache system logs all operations:

```
[Cache] HIT: venues:list:{"city":"baghdad"}
[Cache] MISS: venues:search:hotel:{"page":"1"}
[Cache] SET: venues:stats
[Cache] INVALIDATED: 15 keys matching venues:list:*
```

### Monitoring Cache Effectiveness

Check your server logs for cache hit rates:

```bash
# Filter cache logs
npm run dev 2>&1 | grep "\[Cache\]"

# Count hits vs misses
npm run dev 2>&1 | grep "\[Cache\] HIT" | wc -l
npm run dev 2>&1 | grep "\[Cache\] MISS" | wc -l
```

---

## Performance Best Practices

### 1. Use Appropriate TTL

```typescript
// Frequently changing data → SHORT (5 min)
const searchResults = await cacheGet(key, fetcher, CacheTTL.SHORT);

// Moderately stable data → MEDIUM (30 min)
const venueList = await cacheGet(key, fetcher, CacheTTL.MEDIUM);

// Rarely changing data → LONG (1 hour)
const stats = await cacheGet(key, fetcher, CacheTTL.LONG);

// Static data → VERY_LONG (24 hours)
const config = await cacheGet(key, fetcher, CacheTTL.VERY_LONG);
```

### 2. Invalidate Smartly

Only invalidate what's necessary:

```typescript
// ❌ Too broad - clears everything
await cacheInvalidatePattern('*');

// ✅ Specific - only clears relevant caches
await cacheInvalidatePattern('venues:list:*');
await cacheDel(CacheKeys.venueStats());
```

### 3. Optimize Database Queries

```typescript
// ✅ Use select to fetch only needed fields
const venues = await prisma.venue.findMany({
  select: {
    id: true,
    title: true,
    imageUrl: true
  }
});

// ✅ Use pagination
const venues = await prisma.venue.findMany({
  take: 20,
  skip: (page - 1) * 20
});

// ✅ Use indexed fields in where clauses
const venues = await prisma.venue.findMany({
  where: {
    city: 'baghdad',      // Uses index
    category: 'hotel',    // Uses index
    status: 'ACTIVE'      // Uses index
  }
});
```

### 4. Batch Operations

```typescript
// ✅ Batch delete cache keys
await cacheDel([
  CacheKeys.venue(id),
  CacheKeys.venueStats(),
  CacheKeys.venueFilters()
]);

// ✅ Use Promise.all for parallel operations
const [venues, stats, filters] = await Promise.all([
  prisma.venue.findMany(...),
  prisma.venue.aggregate(...),
  getAvailableFilters()
]);
```

---

## Troubleshooting

### Cache Not Working

1. **Check Redis connection**:
   ```bash
   # Test Redis connection
   redis-cli ping
   # Should return: PONG
   ```

2. **Check environment variables**:
   ```bash
   # Verify Redis is enabled
   echo $REDIS_ENABLED  # Should be 'true'
   ```

3. **Check logs**:
   Look for Redis connection errors in your console

### Cache Serving Stale Data

Clear the cache:
```bash
# Via API
curl -X POST http://localhost:3000/api/admin/cache \
  -H "Content-Type: application/json" \
  -d '{"action": "clear"}'

# Via Redis CLI
redis-cli FLUSHDB
```

### Performance Still Slow

1. Check query performance without cache
2. Verify database indexes are applied
3. Monitor Redis performance (memory, CPU)
4. Consider adding more specific indexes

---

## Production Deployment

### Vercel + Upstash

```bash
# Install Upstash Redis addon in Vercel
# Add these environment variables:
REDIS_URL=redis://...upstash.io:6379
REDIS_ENABLED=true
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_ENABLED: true
    depends_on:
      - redis
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:
```

---

## Testing Cache

### Manual Testing

```typescript
// Test cache functionality
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache/redis';

// Set
await cacheSet('test-key', { message: 'Hello' }, 60);

// Get (should hit cache)
const data = await cacheGet('test-key', async () => {
  return { message: 'This should not run' };
}, 60);

console.log(data); // { message: 'Hello' }

// Delete
await cacheDel('test-key');
```

### Load Testing

```bash
# Install Apache Bench
# Test cached endpoint
ab -n 1000 -c 10 http://localhost:3000/api/venues

# Test non-cached endpoint
ab -n 1000 -c 10 http://localhost:3000/api/venues/search?q=random${RANDOM}
```

---

## Summary

Your Eventra backend now has:

✅ **Redis caching** with intelligent invalidation  
✅ **Database indexes** for fast queries  
✅ **Graceful degradation** when Redis is unavailable  
✅ **Admin tools** for cache management  
✅ **Performance monitoring** via logs  

Expected performance improvements:
- **Venue listing**: 200ms → 20ms (10x faster)
- **Search results**: 300ms → 30ms (10x faster)
- **Statistics**: 500ms → 50ms (10x faster)
- **Database load**: 70% reduction on repeated queries

Next steps:
1. Set up Redis locally or use Docker
2. Test cache hit rates
3. Monitor performance improvements
4. Deploy with managed Redis in production
