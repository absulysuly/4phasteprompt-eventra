/**
 * Advanced Venues Search API
 * 
 * GET /api/venues/search
 * 
 * Query Parameters:
 * - q: Search query (searches title, description, location)
 * - type: HOTEL | RESTAURANT | ACTIVITY | SERVICE
 * - city: City/governorate filter
 * - category: Category filter
 * - priceRange: Price range filter ($, $$, $$$, $$$$)
 * - minRating: Minimum rating (0-5)
 * - amenities: Comma-separated amenities
 * - featured: true | false
 * - verified: true | false
 * - locale: en | ar | ku (default: en)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - sort: Sort field (relevance, rating, price, date, name)
 * - order: asc | desc
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { cacheGet, CacheKeys, CacheTTL } from '../../../../lib/cache/redis';

const prisma = new PrismaClient();

interface SearchParams {
  q?: string;
  type?: string;
  city?: string;
  category?: string;
  priceRange?: string;
  minRating?: string;
  amenities?: string;
  cuisineType?: string;
  featured?: string;
  verified?: string;
  locale?: string;
  page?: string;
  limit?: string;
  sort?: string;
  order?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract and validate parameters
    const params: SearchParams = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      priceRange: searchParams.get('priceRange') || undefined,
      minRating: searchParams.get('minRating') || undefined,
      amenities: searchParams.get('amenities') || undefined,
      cuisineType: searchParams.get('cuisineType') || undefined,
      featured: searchParams.get('featured') || undefined,
      verified: searchParams.get('verified') || undefined,
      locale: searchParams.get('locale') || 'en',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sort: searchParams.get('sort') || 'relevance',
      order: searchParams.get('order') || 'desc',
    };

    // Validate and sanitize pagination
    const page = Math.max(1, parseInt(params.page));
    const limit = Math.min(100, Math.max(1, parseInt(params.limit)));
    const skip = (page - 1) * limit;

    // Create cache key from search params
    const cacheKey = CacheKeys.venueSearch(params.q || '', params);

    // Use cache with fetcher function
    const result = await cacheGet(
      cacheKey,
      async () => {
        // Build where clause
        const where: Prisma.VenueWhereInput = {
          status: 'ACTIVE', // Only show active venues
        };

        // Type filter
        if (params.type) {
          where.type = params.type as any;
        }

        // City filter (case-insensitive)
        if (params.city) {
          where.city = {
            equals: params.city.toLowerCase(),
            mode: 'insensitive' as Prisma.QueryMode
          };
        }

        // Category filter
        if (params.category) {
          where.category = params.category;
        }

        // Price range filter
        if (params.priceRange) {
          where.priceRange = params.priceRange;
        }

        // Cuisine type filter
        if (params.cuisineType) {
          where.cuisineType = {
            contains: params.cuisineType,
            mode: 'insensitive' as Prisma.QueryMode
          };
        }

        // Featured filter
        if (params.featured === 'true') {
          where.featured = true;
        }

        // Verified filter
        if (params.verified === 'true') {
          where.verified = true;
        }

        // Search query - search in translations
        if (params.q) {
          where.translations = {
            some: {
              OR: [
                {
                  title: {
                    contains: params.q,
                    mode: 'insensitive' as Prisma.QueryMode
                  }
                },
                {
                  description: {
                    contains: params.q,
                    mode: 'insensitive' as Prisma.QueryMode
                  }
                },
                {
                  location: {
                    contains: params.q,
                    mode: 'insensitive' as Prisma.QueryMode
                  }
                }
              ]
            }
          };
        }

        // Build orderBy clause
        let orderBy: Prisma.VenueOrderByWithRelationInput[] = [];

        if (params.sort === 'relevance' && params.q) {
          // Relevance sorting - prioritize featured and verified
          orderBy = [
            { featured: 'desc' },
            { verified: 'desc' },
            { createdAt: 'desc' }
          ];
        } else if (params.sort === 'date') {
          orderBy = [{ createdAt: params.order === 'asc' ? 'asc' : 'desc' }];
        } else if (params.sort === 'name') {
          orderBy = [{ id: params.order === 'asc' ? 'asc' : 'desc' }]; // Will sort by title after localization
        } else {
          // Default: featured first, then newest
          orderBy = [
            { featured: 'desc' },
            { verified: 'desc' },
            { createdAt: 'desc' }
          ];
        }

        // Execute query with pagination
        const [venues, totalCount] = await Promise.all([
          prisma.venue.findMany({
            where,
            include: {
              translations: true,
              user: {
                select: { id: true, name: true }
              }
            },
            orderBy,
            skip,
            take: limit
          }),
          prisma.venue.count({ where })
        ]);

        // Localize venues
        let localizedVenues = venues.map((venue: any) => {
      const translation = venue.translations.find((t: any) => t.locale === params.locale) || 
                         venue.translations.find((t: any) => t.locale === 'en') || 
                         venue.translations[0];

      // Parse JSON fields safely
      const parseJson = (field: string | null) => {
        if (!field) return [];
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      };

          return {
            id: venue.id,
            publicId: venue.publicId,
            type: venue.type,
            status: venue.status,
            title: translation?.title || 'Untitled Venue',
            description: translation?.description || '',
            location: translation?.location || venue.address || '',
            city: venue.city,
            address: venue.address,
            latitude: venue.latitude,
            longitude: venue.longitude,
            category: venue.category,
            subcategory: venue.subcategory,
            priceRange: venue.priceRange,
            imageUrl: venue.imageUrl,
            galleryUrls: parseJson(venue.galleryUrls),
            website: venue.website,
            businessPhone: venue.businessPhone,
            whatsappPhone: venue.whatsappPhone,
            contactMethod: venue.contactMethod,
            bookingUrl: venue.bookingUrl,
            eventDate: venue.eventDate,
            cuisineType: venue.cuisineType,
            dietaryOptions: parseJson(venue.dietaryOptions),
            amenities: parseJson(translation?.amenities || venue.amenities),
            features: parseJson(translation?.features || venue.features),
            tags: parseJson(venue.tags),
            // Shopping-specific
            productCategories: parseJson(venue.productCategories),
            brands: parseJson(venue.brands),
            paymentMethods: parseJson(venue.paymentMethods),
            // Entertainment-specific
            businessType: venue.businessType,
            services: parseJson(venue.services),
            operatingHours: venue.operatingHours ? JSON.parse(venue.operatingHours) : null,
            featured: venue.featured,
            verified: venue.verified,
            createdAt: venue.createdAt,
            updatedAt: venue.updatedAt,
            owner: venue.user
          };
        });

        // Sort by name if requested (after localization)
        if (params.sort === 'name') {
          localizedVenues.sort((a, b) => {
            const comparison = a.title.localeCompare(b.title);
            return params.order === 'asc' ? comparison : -comparison;
          });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
          venues: localizedVenues,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNextPage,
            hasPrevPage
          },
          filters: {
            q: params.q,
            type: params.type,
            city: params.city,
            category: params.category,
            priceRange: params.priceRange,
            minRating: params.minRating,
            cuisineType: params.cuisineType,
            featured: params.featured,
            verified: params.verified
          },
          locale: params.locale
        };
      },
      CacheTTL.SHORT // 5 minutes cache for search results
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('Error searching venues:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search venues',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Example Requests:
 * 
 * Basic search:
 * GET /api/venues/search?q=hotel
 * 
 * Filter by city and type:
 * GET /api/venues/search?city=baghdad&type=HOTEL
 * 
 * Advanced filtering:
 * GET /api/venues/search?type=RESTAURANT&city=erbil&cuisineType=Iraqi&priceRange=$$
 * 
 * Pagination:
 * GET /api/venues/search?page=2&limit=10
 * 
 * Featured venues in Arabic:
 * GET /api/venues/search?featured=true&locale=ar
 * 
 * Search with sorting:
 * GET /api/venues/search?q=restaurant&sort=date&order=desc
 */
