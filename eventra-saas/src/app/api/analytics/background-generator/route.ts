import { NextRequest, NextResponse } from 'next/server';

// Global instance to track the background generator
let backgroundGeneratorProcess: any = null;

// POST /api/analytics/background-generator - Start background generator
export async function POST(request: NextRequest) {
  try {
    if (backgroundGeneratorProcess !== null) {
      return NextResponse.json({
        success: false,
        error: 'Background generator is already running'
      }, { status: 400 });
    }

    // Import and start the background generator
    const { BackgroundAnalyticsGenerator } = await import('../../../../../scripts/analytics-background-generator');
    
    backgroundGeneratorProcess = new BackgroundAnalyticsGenerator();
    await backgroundGeneratorProcess.start();

    return NextResponse.json({
      success: true,
      message: 'Background analytics generator started successfully'
    });

  } catch (error) {
    console.error('Error starting background generator:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start background generator'
    }, { status: 500 });
  }
}

// DELETE /api/analytics/background-generator - Stop background generator
export async function DELETE(request: NextRequest) {
  try {
    if (backgroundGeneratorProcess === null) {
      return NextResponse.json({
        success: false,
        error: 'Background generator is not running'
      }, { status: 400 });
    }

    await backgroundGeneratorProcess.stop();
    backgroundGeneratorProcess = null;

    return NextResponse.json({
      success: true,
      message: 'Background analytics generator stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping background generator:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to stop background generator'
    }, { status: 500 });
  }
}

// GET /api/analytics/background-generator - Get generator status
export async function GET(request: NextRequest) {
  try {
    if (backgroundGeneratorProcess === null) {
      return NextResponse.json({
        success: true,
        isRunning: false,
        activeSessions: 0,
        totalEventsGenerated: 0
      });
    }

    const status = backgroundGeneratorProcess.getStatus();

    return NextResponse.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('Error getting generator status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get generator status'
    }, { status: 500 });
  }
}