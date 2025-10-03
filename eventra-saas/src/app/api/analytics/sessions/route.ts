import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const sessionSchema = z.object({
  userId: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
});

// POST /api/analytics/sessions - Create or update user session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = sessionSchema.parse(body);
    
    // Extract session info from request headers
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                    request.headers.get('x-real-ip') || 
                    request.ip || undefined;
    
    // Detect device type from user agent
    const deviceType = detectDeviceType(userAgent);
    
    // Generate unique session ID
    const sessionId = uuidv4();
    
    const session = await prisma.userSession.create({
      data: {
        sessionId,
        userId: validatedData.userId,
        ipAddress,
        userAgent,
        deviceType,
        language: validatedData.language || request.headers.get('accept-language')?.split(',')[0] || undefined,
        country: validatedData.country,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      data: {
        id: session.id,
        sessionId: session.sessionId,
        deviceType: session.deviceType,
        language: session.language,
        country: session.country,
        startedAt: session.startedAt,
      },
    });

  } catch (error) {
    console.error('Session creation error:', error);
    
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

// GET /api/analytics/sessions - Get session information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (sessionId) {
      // Get specific session with event count
      const session = await prisma.userSession.findUnique({
        where: { sessionId },
        include: {
          _count: {
            select: { events: true }
          }
        },
      });

      if (!session) {
        return NextResponse.json({
          success: false,
          error: 'Session not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: session,
      });
    }

    // Get sessions with optional user filter
    const where: any = {};
    if (userId) where.userId = userId;

    const sessions = await prisma.userSession.findMany({
      where,
      include: {
        _count: {
          select: { events: true }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.userSession.count({ where });

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Sessions retrieval error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT /api/analytics/sessions - Update session (e.g., associate with user)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, country } = body;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    const updateData: any = {
      lastActiveAt: new Date(),
    };

    if (userId !== undefined) updateData.userId = userId;
    if (country !== undefined) updateData.country = country;

    const session = await prisma.userSession.update({
      where: { sessionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        sessionId: session.sessionId,
        userId: session.userId,
        deviceType: session.deviceType,
        language: session.language,
        country: session.country,
        lastActiveAt: session.lastActiveAt,
      },
    });

  } catch (error) {
    console.error('Session update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

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