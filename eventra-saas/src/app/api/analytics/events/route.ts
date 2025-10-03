import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for analytics events
const analyticsEventSchema = z.object({
  sessionId: z.string(),
  eventType: z.enum([
    'PAGE_VIEW',
    'SCROLL', 
    'CLICK',
    'SEARCH',
    'CATEGORY_SELECT',
    'STORY_VIEW',
    'STORY_UPLOAD',
    'FORM_SUBMIT',
    'FILTER_APPLY',
    'VOICE_SEARCH',
    'ERROR',
    'PERFORMANCE'
  ]),
  eventName: z.string(),
  page: z.string().optional(),
  component: z.string().optional(),
  elementId: z.string().optional(),
  properties: z.record(z.any()).optional(),
  value: z.number().optional(),
  duration: z.number().optional(),
});

const batchEventSchema = z.object({
  events: z.array(analyticsEventSchema),
});

// POST /api/analytics/events - Collect analytics events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both single events and batch events
    const events = Array.isArray(body.events) ? body.events : [body];
    
    // Validate the events
    const validatedEvents = events.map(event => analyticsEventSchema.parse(event));
    
    // Process events in batch
    const results = await Promise.all(
      validatedEvents.map(async (event) => {
        // Ensure session exists or create it
        let session = await prisma.userSession.findUnique({
          where: { sessionId: event.sessionId }
        });

        if (!session) {
          // Extract session info from request
          const userAgent = request.headers.get('user-agent') || undefined;
          const forwarded = request.headers.get('x-forwarded-for');
          const ipAddress = forwarded ? forwarded.split(',')[0] : 
                          request.headers.get('x-real-ip') || 
                          request.ip || undefined;
          
          // Detect device type from user agent
          const deviceType = detectDeviceType(userAgent);
          
          session = await prisma.userSession.create({
            data: {
              sessionId: event.sessionId,
              ipAddress,
              userAgent,
              deviceType,
              language: request.headers.get('accept-language')?.split(',')[0] || undefined,
            },
          });
        } else {
          // Update last active time
          await prisma.userSession.update({
            where: { id: session.id },
            data: { lastActiveAt: new Date() },
          });
        }

        // Create the analytics event
        return await prisma.analyticsEvent.create({
          data: {
            sessionId: session.id,
            eventType: event.eventType,
            eventName: event.eventName,
            page: event.page,
            component: event.component,
            elementId: event.elementId,
            properties: event.properties ? JSON.stringify(event.properties) : undefined,
            value: event.value,
            duration: event.duration,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      eventsRecorded: results.length,
      data: results.map(r => ({ id: r.id, timestamp: r.timestamp }))
    });

  } catch (error) {
    console.error('Analytics event collection error:', error);
    
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

// GET /api/analytics/events - Retrieve analytics events (for debugging)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const eventType = searchParams.get('eventType');
    const page = searchParams.get('page');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (sessionId) where.session = { sessionId };
    if (eventType) where.eventType = eventType;
    if (page) where.page = page;

    const events = await prisma.analyticsEvent.findMany({
      where,
      include: {
        session: {
          select: {
            sessionId: true,
            deviceType: true,
            language: true,
            country: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.analyticsEvent.count({ where });

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Analytics events retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

function detectDeviceType(userAgent: string | undefined): 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN' {
  if (!userAgent) return 'UNKNOWN';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'TABLET';
  }
  
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    return 'MOBILE';
  }
  
  if (ua.includes('mozilla') && (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux'))) {
    return 'DESKTOP';
  }
  
  return 'UNKNOWN';
}