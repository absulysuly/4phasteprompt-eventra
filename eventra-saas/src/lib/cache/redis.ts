import Redis from 'ioredis';

// Create Redis client with environment-based configuration
const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379');
  const password = process.env.REDIS_PASSWORD;
  
  return password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;
};

let redis: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  // If Redis is disabled or not configured, return null (graceful degradation)
  if (process.env.REDIS_ENABLED === 'false') {
    console.log('[Cache] Redis is disabled');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(getRedisUrl(), {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        lazyConnect: true,
      });

      redis.on('error', (err) => {
        console.error('[Redis] Connection error:', err.message);
        // Don't throw - allow graceful degradation
      });

      redis.on('connect', () => {
        console.log('[Redis] Connected successfully');
      });

      // Attempt to connect
      redis.connect().catch((err) => {
        console.error('[Redis] Failed to connect:', err.message);
        redis = null;
      });
    } catch (error) {
      console.error('[Redis] Initialization error:', error);
      redis = null;
    }
  }

  return redis;
};

// Cache key builders
export const CacheKeys = {
  // Venue caching
  venue: (id: string) => `venue:${id}`,
  venueList: (params: Record<string, any>) => `venues:list:${JSON.stringify(params)}`,
  venueSearch: (query: string, params: Record<string, any>) => 
    `venues:search:${query}:${JSON.stringify(params)}`,
  venueStats: () => 'venues:stats',
  venueFilters: () => 'venues:filters',
  
  // Event caching
  event: (id: string) => `event:${id}`,
  eventList: (params: Record<string, any>) => `events:list:${JSON.stringify(params)}`,
  
  // Geographic data
  governorateVenues: (governorate: string) => `governorate:${governorate}:venues`,
  categoryVenues: (category: string) => `category:${category}:venues`,
};

// Cache TTL (Time To Live) in seconds
export const CacheTTL = {
  SHORT: 60 * 5,          // 5 minutes
  MEDIUM: 60 * 30,        // 30 minutes
  LONG: 60 * 60,          // 1 hour
  VERY_LONG: 60 * 60 * 24, // 24 hours
};

/**
 * Get data from cache or fetch and store it
 */
export async function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM
): Promise<T> {
  const client = getRedisClient();

  // If Redis is not available, just fetch the data
  if (!client) {
    return await fetcher();
  }

  try {
    // Try to get from cache
    const cached = await client.get(key);
    
    if (cached) {
      console.log(`[Cache] HIT: ${key}`);
      return JSON.parse(cached) as T;
    }

    console.log(`[Cache] MISS: ${key}`);
    
    // Fetch fresh data
    const data = await fetcher();
    
    // Store in cache
    await client.setex(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('[Cache] Error:', error);
    // Fallback to fetching without cache
    return await fetcher();
  }
}

/**
 * Set data in cache
 */
export async function cacheSet(
  key: string,
  data: any,
  ttl: number = CacheTTL.MEDIUM
): Promise<void> {
  const client = getRedisClient();
  
  if (!client) return;

  try {
    await client.setex(key, ttl, JSON.stringify(data));
    console.log(`[Cache] SET: ${key}`);
  } catch (error) {
    console.error('[Cache] Set error:', error);
  }
}

/**
 * Delete data from cache
 */
export async function cacheDel(key: string | string[]): Promise<void> {
  const client = getRedisClient();
  
  if (!client) return;

  try {
    const keys = Array.isArray(key) ? key : [key];
    await client.del(...keys);
    console.log(`[Cache] DEL: ${keys.join(', ')}`);
  } catch (error) {
    console.error('[Cache] Delete error:', error);
  }
}

/**
 * Invalidate cache by pattern
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  
  if (!client) return;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`[Cache] INVALIDATED: ${keys.length} keys matching ${pattern}`);
    }
  } catch (error) {
    console.error('[Cache] Invalidate pattern error:', error);
  }
}

/**
 * Clear all cache
 */
export async function cacheClear(): Promise<void> {
  const client = getRedisClient();
  
  if (!client) return;

  try {
    await client.flushdb();
    console.log('[Cache] CLEARED all cache');
  } catch (error) {
    console.error('[Cache] Clear error:', error);
  }
}

export default {
  getClient: getRedisClient,
  get: cacheGet,
  set: cacheSet,
  del: cacheDel,
  invalidatePattern: cacheInvalidatePattern,
  clear: cacheClear,
  keys: CacheKeys,
  ttl: CacheTTL,
};
