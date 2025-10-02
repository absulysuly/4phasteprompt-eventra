/**
 * Cache Management API
 * 
 * POST /api/admin/cache/clear - Clear all cache
 * POST /api/admin/cache/invalidate - Invalidate cache by pattern
 * GET /api/admin/cache/stats - Get cache statistics
 * 
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getRedisClient, cacheClear, cacheInvalidatePattern } from '../../../../lib/cache/redis';

export async function POST(request: NextRequest) {
  try {
    // Check authentication (add admin check in production)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, pattern } = await request.json();

    if (action === 'clear') {
      await cacheClear();
      return NextResponse.json({
        success: true,
        message: 'All cache cleared successfully'
      });
    }

    if (action === 'invalidate' && pattern) {
      await cacheInvalidatePattern(pattern);
      return NextResponse.json({
        success: true,
        message: `Cache invalidated for pattern: ${pattern}`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing pattern' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to manage cache',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication (add admin check in production)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const redis = getRedisClient();
    
    if (!redis) {
      return NextResponse.json({
        success: true,
        enabled: false,
        message: 'Redis caching is disabled'
      });
    }

    // Get Redis info
    const info = await redis.info('stats');
    const dbSize = await redis.dbsize();
    
    // Parse useful stats from info
    const stats = {
      enabled: true,
      totalKeys: dbSize,
      info: info.split('\n').reduce((acc: any, line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cache statistics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Example Requests:
 * 
 * Clear all cache:
 * POST /api/admin/cache
 * Body: { "action": "clear" }
 * 
 * Invalidate venues cache:
 * POST /api/admin/cache
 * Body: { "action": "invalidate", "pattern": "venues:*" }
 * 
 * Get cache stats:
 * GET /api/admin/cache
 */
