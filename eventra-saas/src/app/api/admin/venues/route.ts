/**
 * Admin Venues API
 * GET /api/admin/venues - List all venues with filters
 * 
 * Query Parameters:
 * - status: Filter by venue status (PENDING, ACTIVE, SUSPENDED, CLOSED)
 * - type: Filter by venue type
 * - city: Filter by city
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication (add proper admin check in production)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.VenueWhereInput = {};

    if (status) {
      where.status = status as any;
    }

    if (type) {
      where.type = type as any;
    }

    if (city) {
      where.city = {
        equals: city.toLowerCase(),
        mode: 'insensitive' as Prisma.QueryMode
      };
    }

    // Fetch venues with translations and user info
    const [venues, totalCount] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          translations: {
            where: {
              locale: 'en' // Default to English for admin view
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // PENDING first
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.venue.count({ where })
    ]);

    // Format response
    const formattedVenues = venues.map(venue => ({
      id: venue.id,
      publicId: venue.publicId,
      type: venue.type,
      status: venue.status,
      title: venue.translations[0]?.title || 'Untitled Venue',
      description: venue.translations[0]?.description || '',
      city: venue.city,
      category: venue.category,
      subcategory: venue.subcategory,
      featured: venue.featured,
      verified: venue.verified,
      businessPhone: venue.businessPhone,
      businessEmail: venue.businessEmail,
      website: venue.website,
      address: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude,
      imageUrl: venue.imageUrl,
      priceRange: venue.priceRange,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
      owner: venue.user
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      venues: formattedVenues,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin venues:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch venues',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
