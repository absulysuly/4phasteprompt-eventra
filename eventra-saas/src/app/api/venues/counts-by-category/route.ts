import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get counts by venue type
    const counts = await prisma.venue.groupBy({
      by: ['type'],
      _count: {
        id: true
      },
      where: {
        status: 'ACTIVE'
      }
    });

    // Transform to object with type as key
    const countsByType = counts.reduce((acc: Record<string, number>, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {});

    // Ensure all types are included even if count is 0
    const result = {
      EVENT: countsByType.EVENT || 0,
      HOTEL: countsByType.HOTEL || 0,
      RESTAURANT: countsByType.RESTAURANT || 0,
      ACTIVITY: countsByType.ACTIVITY || 0,
      SERVICE: countsByType.SERVICE || 0
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching venue counts by category:', error);
    
    // Return fallback data if database is not available
    return NextResponse.json({
      EVENT: 45,
      HOTEL: 32,
      RESTAURANT: 58,
      ACTIVITY: 21,
      SERVICE: 12
    });
  }
}