/**
 * Admin Venue Management API
 * 
 * PATCH /api/admin/venues/[id] - Update venue (status, featured, verified, etc.)
 * DELETE /api/admin/venues/[id] - Delete venue
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import { cacheInvalidatePattern, cacheDel, CacheKeys } from '../../../../../lib/cache/redis';

const prisma = new PrismaClient();

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const venueId = params.id;
    const updates = await request.json();

    // Validate venue exists
    const existingVenue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!existingVenue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Prepare update data (only allow specific fields)
    const updateData: any = {};

    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    if (updates.featured !== undefined) {
      updateData.featured = updates.featured;
    }

    if (updates.verified !== undefined) {
      updateData.verified = updates.verified;
    }

    if (updates.type !== undefined) {
      updateData.type = updates.type;
    }

    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }

    if (updates.subcategory !== undefined) {
      updateData.subcategory = updates.subcategory;
    }

    if (updates.city !== undefined) {
      updateData.city = updates.city;
    }

    if (updates.priceRange !== undefined) {
      updateData.priceRange = updates.priceRange;
    }

    // Update venue
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: updateData,
      include: {
        translations: true
      }
    });

    // Invalidate caches
    await Promise.all([
      cacheDel(CacheKeys.venue(venueId)),
      cacheInvalidatePattern('venues:list:*'),
      cacheInvalidatePattern('venues:search:*'),
      cacheDel(CacheKeys.venueStats()),
      cacheDel(CacheKeys.venueFilters())
    ]);

    return NextResponse.json({
      success: true,
      venue: updatedVenue,
      message: 'Venue updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating venue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update venue',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const venueId = params.id;

    // Validate venue exists
    const existingVenue = await prisma.venue.findUnique({
      where: { id: venueId }
    });

    if (!existingVenue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    // Delete venue (this will cascade delete translations due to Prisma relations)
    await prisma.venue.delete({
      where: { id: venueId }
    });

    // Invalidate all venue-related caches
    await Promise.all([
      cacheDel(CacheKeys.venue(venueId)),
      cacheInvalidatePattern('venues:*'),
      cacheDel(CacheKeys.venueStats()),
      cacheDel(CacheKeys.venueFilters())
    ]);

    return NextResponse.json({
      success: true,
      message: 'Venue deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting venue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete venue',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const venueId = params.id;

    // Fetch venue with all details
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        translations: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!venue) {
      return NextResponse.json(
        { success: false, error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venue
    });

  } catch (error: any) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch venue',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
