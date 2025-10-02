import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city');

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE',
      type: 'EVENT',
      eventDate: {
        not: null
      }
    };

    if (city && city !== 'all') {
      where.city = city;
    }

    // Fetch events with eventDate
    const events = await prisma.venue.findMany({
      where,
      select: {
        eventDate: true
      }
    });

    // Count events by month
    const counts: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.eventDate) {
        const month = event.eventDate.toISOString().substring(0, 7); // YYYY-MM
        counts[month] = (counts[month] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      counts
    });

  } catch (error) {
    console.error('Error fetching event counts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event counts' },
      { status: 500 }
    );
  }
}