import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');

    // Build base filter
    const where: any = {
      status: 'ACTIVE'
    };

    if (city && city !== 'all') {
      where.city = city;
    }

    // Map frontend categories to backend venue types/categories
    const categoryMapping = {
      'events': { type: 'EVENT' },
      'hotels': { type: 'HOTEL' },
      'restaurants': { type: 'RESTAURANT' },
      'cafes': { type: 'RESTAURANT', category: 'cafe' }, // Assuming cafes are restaurants with cafe category
      'tourism': { type: 'ACTIVITY', category: 'tourism' },
      'companies': { type: 'SERVICE' }
    };

    const counts: Record<string, number> = {};

    for (const [categoryId, filter] of Object.entries(categoryMapping)) {
      const categoryWhere = { ...where, ...filter };
      const count = await prisma.venue.count({ where: categoryWhere });
      counts[categoryId] = count;
    }

    return NextResponse.json({
      success: true,
      counts
    });

  } catch (error) {
    console.error('Error fetching venue counts by category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venue counts by category' },
      { status: 500 }
    );
  }
}