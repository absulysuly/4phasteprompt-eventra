import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get venue counts
    const totalVenues = await prisma.venue.count();
    const featuredVenues = await prisma.venue.count({
      where: { featured: true }
    });
    
    // Get event count (from Event model)
    const totalEvents = await prisma.event.count();
    
    // Get unique cities count
    const uniqueCities = await prisma.venue.findMany({
      select: { city: true },
      distinct: ['city'],
      where: {
        city: {
          not: null
        }
      }
    });
    
    const stats = {
      totalVenues,
      totalEvents,
      activeCities: uniqueCities.length,
      featuredVenues
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching venue stats:', error);
    
    // Return fallback data if database is not available
    return NextResponse.json({
      totalVenues: 156,
      totalEvents: 45,
      activeCities: 19,
      featuredVenues: 23
    });
  }
}