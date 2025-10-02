/**
 * API Route: Get Venue Statistics
 * GET /api/admin/venues/stats
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get total venues
    const total = await prisma.venue.count();
    
    // Get venues by type
    const byType = await prisma.venue.groupBy({
      by: ['type'],
      _count: true
    });
    
    // Get venues by status
    const byStatus = await prisma.venue.groupBy({
      by: ['status'],
      _count: true
    });
    
    // Get venues by city
    const byCity = await prisma.venue.groupBy({
      by: ['city'],
      _count: true,
      orderBy: {
        _count: {
          city: 'desc'
        }
      },
      take: 10
    });
    
    // Get recent venues
    const recent = await prisma.venue.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        translations: {
          where: {
            locale: 'en'
          }
        }
      }
    });
    
    // Calculate statistics
    const typeStats = byType.reduce((acc, item) => {
      acc[item.type] = item._count;
      return acc;
    }, {} as Record<string, number>);
    
    const statusStats = byStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);
    
    const cityStats = byCity.map(item => ({
      city: item.city,
      count: item._count
    }));
    
    return NextResponse.json({
      total,
      byType: typeStats,
      byStatus: statusStats,
      byCity: cityStats,
      recent: recent.map(v => ({
        id: v.id,
        publicId: v.publicId,
        type: v.type,
        title: v.translations[0]?.title || 'Untitled',
        city: v.city,
        createdAt: v.createdAt
      }))
    });
    
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
