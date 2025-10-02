/**
 * Venues Statistics API
 * 
 * GET /api/venues/stats
 * 
 * Returns aggregated statistics about venues:
 * - Total count by type
 * - Count by city/governorate
 * - Featured/verified counts
 * - Recent additions
 * - Popular categories
 * - Price range distribution
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cacheGet, CacheKeys, CacheTTL } from '../../../../lib/cache/redis';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Use cache for stats (long TTL since stats don't change frequently)
    const stats = await cacheGet(
      CacheKeys.venueStats(),
      async () => {
        // Get all active venues
        const venues = await prisma.venue.findMany({
          where: {
            status: 'ACTIVE'
          },
          include: {
            translations: true
          }
        });

        // Calculate statistics
        return {
      total: venues.length,
      
      // By type
      byType: {
        HOTEL: venues.filter(v => v.type === 'HOTEL').length,
        RESTAURANT: venues.filter(v => v.type === 'RESTAURANT').length,
        ACTIVITY: venues.filter(v => v.type === 'ACTIVITY').length,
        SERVICE: venues.filter(v => v.type === 'SERVICE').length,
        EVENT: venues.filter(v => v.type === 'EVENT').length
      },

      // By city (top 10)
      byCity: Object.entries(
        venues.reduce((acc: Record<string, number>, venue) => {
          const city = venue.city || 'unknown';
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([city, count]) => ({ city, count })),

      // Featured and verified
      featured: venues.filter(v => v.featured).length,
      verified: venues.filter(v => v.verified).length,

      // By price range
      byPriceRange: {
        '$': venues.filter(v => v.priceRange === '$').length,
        '$$': venues.filter(v => v.priceRange === '$$').length,
        '$$$': venues.filter(v => v.priceRange === '$$$').length,
        '$$$$': venues.filter(v => v.priceRange === '$$$$').length,
        'Free': venues.filter(v => v.priceRange === 'Free').length,
        'Unknown': venues.filter(v => !v.priceRange).length
      },

      // Categories (top 10)
      byCategory: Object.entries(
        venues.reduce((acc: Record<string, number>, venue) => {
          if (venue.category) {
            acc[venue.category] = (acc[venue.category] || 0) + 1;
          }
          return acc;
        }, {})
      )
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([category, count]) => ({ category, count })),

      // Cuisine types (for restaurants)
      byCuisine: Object.entries(
        venues
          .filter(v => v.type === 'RESTAURANT' && v.cuisineType)
          .reduce((acc: Record<string, number>, venue) => {
            if (venue.cuisineType) {
              acc[venue.cuisineType] = (acc[venue.cuisineType] || 0) + 1;
            }
            return acc;
          }, {})
      )
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([cuisine, count]) => ({ cuisine, count })),

      // Recent additions (last 7 days)
      recentCount: venues.filter(v => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(v.createdAt) > weekAgo;
      }).length,

      // With contact information
      withPhone: venues.filter(v => v.businessPhone || v.whatsappPhone).length,
      withWebsite: venues.filter(v => v.website).length,
      withBooking: venues.filter(v => v.bookingUrl).length,

      // With media
      withImage: venues.filter(v => v.imageUrl).length,
      withGallery: venues.filter(v => v.galleryUrls).length,

      // With location data
      withCoordinates: venues.filter(v => v.latitude && v.longitude).length,
      withAddress: venues.filter(v => v.address).length,

      // Translation coverage
          translationCoverage: {
            en: venues.filter(v => v.translations.some(t => t.locale === 'en')).length,
            ar: venues.filter(v => v.translations.some(t => t.locale === 'ar')).length,
            ku: venues.filter(v => v.translations.some(t => t.locale === 'ku')).length
          },

          // Get governorate breakdown (Iraqi cities)
          byGovernorate: (() => {
            const governorates = [
              'baghdad', 'erbil', 'basra', 'nineveh', 'sulaymaniyah', 
              'kirkuk', 'najaf', 'karbala', 'duhok', 'anbar',
              'diyala', 'saladin', 'wasit', 'babil', 'maysan',
              'dhi_qar', 'muthanna', 'qadisiyyah'
            ];
            
            return governorates.map(gov => ({
              governorate: gov,
              count: venues.filter(v => v.city?.toLowerCase() === gov).length
            })).filter(g => g.count > 0);
          })()
        };
      },
      CacheTTL.LONG // 1 hour cache for stats
    );

    return NextResponse.json({
      success: true,
      stats,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching venue statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Example Response:
 * {
 *   "success": true,
 *   "stats": {
 *     "total": 150,
 *     "byType": {
 *       "HOTEL": 45,
 *       "RESTAURANT": 78,
 *       "ACTIVITY": 20,
 *       "SERVICE": 7
 *     },
 *     "byCity": [
 *       { "city": "baghdad", "count": 60 },
 *       { "city": "erbil", "count": 45 },
 *       { "city": "basra", "count": 30 }
 *     ],
 *     "featured": 25,
 *     "verified": 80,
 *     "byPriceRange": {
 *       "$": 30,
 *       "$$": 60,
 *       "$$$": 40,
 *       "$$$$": 15,
 *       "Free": 5
 *     }
 *   }
 * }
 */
