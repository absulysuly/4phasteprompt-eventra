import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const metricsQuerySchema = z.object({
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  eventType: z.string().optional(),
  page: z.string().optional(),
  groupBy: z.enum(['day', 'hour', 'eventType', 'page', 'deviceType']).optional(),
  aggregation: z.enum(['count', 'uniqueUsers', 'avgDuration', 'totalDuration']).optional(),
});

// GET /api/analytics/metrics - Get aggregated analytics metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = metricsQuerySchema.parse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      eventType: searchParams.get('eventType'),
      page: searchParams.get('page'),
      groupBy: searchParams.get('groupBy'),
      aggregation: searchParams.get('aggregation') || 'count',
    });

    const startDate = query.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: 7 days ago
    const endDate = query.endDate || new Date(); // Default: now
    
    // Build the where clause
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      }
    };
    
    if (query.eventType) where.eventType = query.eventType;
    if (query.page) where.page = query.page;

    // Get different types of metrics based on the request
    const metrics = await Promise.all([
      // Total events
      getTotalEvents(where),
      
      // Unique sessions  
      getUniqueSessions(where, startDate, endDate),
      
      // Events by type
      getEventsByType(where),
      
      // Events by page
      getEventsByPage(where),
      
      // Events by device type
      getEventsByDevice(where, startDate, endDate),
      
      // Time series data (if groupBy is specified)
      query.groupBy ? getTimeSeriesData(where, query.groupBy) : null,
      
      // Performance metrics
      getPerformanceMetrics(where),
    ]);

    return NextResponse.json({
      success: true,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      data: {
        totalEvents: metrics[0],
        uniqueSessions: metrics[1],
        eventsByType: metrics[2],
        eventsByPage: metrics[3],
        eventsByDevice: metrics[4],
        timeSeries: metrics[5],
        performance: metrics[6],
      },
    });

  } catch (error) {
    console.error('Analytics metrics error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

async function getTotalEvents(where: any) {
  return await prisma.analyticsEvent.count({ where });
}

async function getUniqueSessions(where: any, startDate: Date, endDate: Date) {
  const sessions = await prisma.userSession.findMany({
    where: {
      startedAt: {
        gte: startDate,
        lte: endDate,
      },
      events: {
        some: where,
      },
    },
    select: { id: true },
  });
  
  return sessions.length;
}

async function getEventsByType(where: any) {
  const results = await prisma.analyticsEvent.groupBy({
    by: ['eventType'],
    where,
    _count: {
      id: true,
    },
    _avg: {
      duration: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  return results.map(result => ({
    eventType: result.eventType,
    count: result._count.id,
    averageDuration: result._avg.duration,
  }));
}

async function getEventsByPage(where: any) {
  const results = await prisma.analyticsEvent.groupBy({
    by: ['page'],
    where: {
      ...where,
      page: { not: null },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 20, // Top 20 pages
  });

  return results.map(result => ({
    page: result.page,
    count: result._count.id,
  }));
}

async function getEventsByDevice(where: any, startDate: Date, endDate: Date) {
  // Get sessions with their device types that have events in the time range
  const results = await prisma.userSession.groupBy({
    by: ['deviceType'],
    where: {
      startedAt: {
        gte: startDate,
        lte: endDate,
      },
      events: {
        some: where,
      },
    },
    _count: {
      id: true,
    },
  });

  return results.map(result => ({
    deviceType: result.deviceType,
    sessions: result._count.id,
  }));
}

async function getTimeSeriesData(where: any, groupBy: string) {
  // This is a simplified time series - in production, you might want more sophisticated grouping
  if (groupBy === 'day') {
    // Get events grouped by day
    const results = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM AnalyticsEvent 
      WHERE timestamp >= ${where.timestamp.gte} 
        AND timestamp <= ${where.timestamp.lte}
        ${where.eventType ? `AND eventType = ${where.eventType}` : ''}
        ${where.page ? `AND page = ${where.page}` : ''}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;
    
    return results;
  }
  
  return null;
}

async function getPerformanceMetrics(where: any) {
  const performanceEvents = await prisma.analyticsEvent.findMany({
    where: {
      ...where,
      eventType: 'PERFORMANCE',
    },
    select: {
      duration: true,
      properties: true,
    },
  });

  if (performanceEvents.length === 0) {
    return {
      averageLoadTime: null,
      totalPerformanceEvents: 0,
    };
  }

  const loadTimes = performanceEvents
    .map(event => event.duration)
    .filter(duration => duration !== null);

  const averageLoadTime = loadTimes.length > 0 
    ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
    : null;

  return {
    averageLoadTime,
    totalPerformanceEvents: performanceEvents.length,
  };
}

// POST /api/analytics/metrics - Update pre-computed metrics (background job)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json({
        success: false,
        error: 'Date is required'
      }, { status: 400 });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all events for the day
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: {
        session: true,
      },
    });

    // Group by eventType, eventName, and page
    const groupedMetrics = new Map();
    
    events.forEach(event => {
      const key = `${event.eventType}|${event.eventName}|${event.page || 'null'}`;
      
      if (!groupedMetrics.has(key)) {
        groupedMetrics.set(key, {
          eventType: event.eventType,
          eventName: event.eventName,
          page: event.page,
          count: 0,
          uniqueUsers: new Set(),
          durations: [],
        });
      }
      
      const metric = groupedMetrics.get(key);
      metric.count++;
      
      if (event.session?.userId) {
        metric.uniqueUsers.add(event.session.userId);
      }
      
      if (event.duration !== null) {
        metric.durations.push(event.duration);
      }
    });

    // Upsert metrics
    const results = [];
    for (const [, metric] of groupedMetrics) {
      const avgDuration = metric.durations.length > 0 
        ? metric.durations.reduce((sum, d) => sum + d, 0) / metric.durations.length 
        : null;

      const result = await prisma.eventMetrics.upsert({
        where: {
          date_eventType_eventName_page: {
            date: startOfDay,
            eventType: metric.eventType,
            eventName: metric.eventName,
            page: metric.page,
          }
        },
        create: {
          date: startOfDay,
          eventType: metric.eventType,
          eventName: metric.eventName,
          page: metric.page,
          totalCount: metric.count,
          uniqueUsers: metric.uniqueUsers.size,
          avgDuration,
        },
        update: {
          totalCount: metric.count,
          uniqueUsers: metric.uniqueUsers.size,
          avgDuration,
          updatedAt: new Date(),
        },
      });
      
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString(),
      metricsUpdated: results.length,
    });

  } catch (error) {
    console.error('Metrics computation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}