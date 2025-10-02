import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    };

    if (type) {
      where.type = type;
    }

    if (city && city !== 'all') {
      where.city = city;
    }

    const count = await prisma.venue.count({ where });

    return NextResponse.json({ count }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('API Error (venues/count):', error);
    return NextResponse.json(
      { error: 'Internal server error', count: 0 },
      { status: 500 }
    );
  }
}
