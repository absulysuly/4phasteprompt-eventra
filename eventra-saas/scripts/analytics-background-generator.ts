import { PrismaClient, EventType, DeviceType } from '@prisma/client';

const prisma = new PrismaClient();

// Configuration for background event generation
const CONFIG = {
  // Events generated per cycle
  eventsPerCycle: 10,
  // Cycle interval in milliseconds (default: every 30 seconds)
  cycleInterval: 30000,
  // Maximum number of active sessions to maintain
  maxActiveSessions: 50,
  // Session duration range in milliseconds
  sessionDurationMin: 300000,  // 5 minutes
  sessionDurationMax: 1800000, // 30 minutes
};

// Sample data for generating realistic events
const SAMPLE_PAGES = [
  '/en/events', '/ar/events', '/ku/events',
  '/en/venues', '/ar/venues', '/ku/venues',
  '/en/categories', '/en/events/create',
  '/en/event/ai-summit-2025',
  '/en/event/kurdish-music-festival',
  '/ar/event/business-workshop-basra',
];

const SAMPLE_SEARCH_QUERIES = [
  'hotels in Baghdad', 'restaurants near me', 'cultural events', 'business meetings',
  'Kurdish music', 'tech conferences', 'traditional food', 'luxury hotels',
  'family activities', 'wedding venues', 'conference rooms', 'live music',
  'فنادق في بغداد', 'مطاعم قريبة مني', 'فعاليات ثقافية', 'اجتماعات عمل',
  'مۆسیقای کوردی', 'کۆنفرانسی تەکنەلۆژی', 'خواردنی نەریتی', 'هوتێلی لوکس',
];

const SAMPLE_COMPONENTS = [
  'VenueCard', 'SearchBar', 'HeroSection', 'FilterBar', 'EventCard',
  'CategoryGrid', 'NavigationMenu', 'BookingForm', 'StoryViewer',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

// Helper functions
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateSessionId() {
  return 'bg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function detectDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (ua.includes('tablet') || ua.includes('ipad')) return DeviceType.TABLET;
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return DeviceType.MOBILE;
  return DeviceType.DESKTOP;
}

interface ActiveSession {
  id: string;
  sessionId: string;
  startedAt: Date;
  lastActiveAt: Date;
  deviceType: DeviceType;
  language: string;
  eventsGenerated: number;
}

class BackgroundAnalyticsGenerator {
  private activeSessions: Map<string, ActiveSession> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Background analytics generator is already running');
      return;
    }

    console.log('🚀 Starting background analytics generator...');
    console.log(`📊 Configuration:
- Events per cycle: ${CONFIG.eventsPerCycle}
- Cycle interval: ${CONFIG.cycleInterval}ms (${CONFIG.cycleInterval / 1000}s)
- Max active sessions: ${CONFIG.maxActiveSessions}
- Session duration: ${CONFIG.sessionDurationMin / 1000}s - ${CONFIG.sessionDurationMax / 1000}s
    `);

    this.isRunning = true;

    // Initialize with some active sessions
    await this.initializeActiveSessions();

    // Start the periodic generation cycle
    this.intervalId = setInterval(async () => {
      try {
        await this.generateCycle();
      } catch (error) {
        console.error('❌ Error in generation cycle:', error);
      }
    }, CONFIG.cycleInterval);

    console.log('✅ Background analytics generator started successfully!');
  }

  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ Background analytics generator is not running');
      return;
    }

    console.log('🛑 Stopping background analytics generator...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.activeSessions.clear();

    console.log('✅ Background analytics generator stopped');
  }

  private async initializeActiveSessions() {
    const initialSessions = Math.min(CONFIG.maxActiveSessions, randomInt(5, 15));
    
    for (let i = 0; i < initialSessions; i++) {
      await this.createNewSession();
    }

    console.log(`📱 Initialized ${initialSessions} active sessions`);
  }

  private async createNewSession(): Promise<ActiveSession> {
    const now = new Date();
    const userAgent = randomChoice(USER_AGENTS);
    const deviceType = detectDeviceType(userAgent);
    const sessionId = generateSessionId();

    // Create session in database
    const dbSession = await prisma.userSession.create({
      data: {
        sessionId,
        ipAddress: `192.168.${randomInt(1, 254)}.${randomInt(1, 254)}`,
        userAgent,
        deviceType,
        language: randomChoice(['en', 'ar', 'ku']),
        country: 'Iraq',
        startedAt: now,
        lastActiveAt: now,
      },
    });

    const activeSession: ActiveSession = {
      id: dbSession.id,
      sessionId,
      startedAt: now,
      lastActiveAt: now,
      deviceType,
      language: dbSession.language || 'en',
      eventsGenerated: 0,
    };

    this.activeSessions.set(sessionId, activeSession);
    return activeSession;
  }

  private async generateCycle() {
    const now = new Date();
    console.log(`🔄 Generation cycle at ${now.toLocaleTimeString()}`);

    // Clean up expired sessions
    await this.cleanupExpiredSessions();

    // Ensure minimum active sessions
    await this.ensureMinimumSessions();

    // Generate events for active sessions
    await this.generateEventsForActiveSessions();

    console.log(`📊 Cycle complete. Active sessions: ${this.activeSessions.size}`);
  }

  private async cleanupExpiredSessions() {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.activeSessions) {
      const sessionAge = now.getTime() - session.startedAt.getTime();
      const maxAge = randomInt(CONFIG.sessionDurationMin, CONFIG.sessionDurationMax);

      if (sessionAge > maxAge) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.activeSessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  private async ensureMinimumSessions() {
    const minSessions = Math.floor(CONFIG.maxActiveSessions * 0.3); // 30% minimum
    const currentCount = this.activeSessions.size;

    if (currentCount < minSessions) {
      const sessionsToCreate = minSessions - currentCount;
      
      for (let i = 0; i < sessionsToCreate; i++) {
        await this.createNewSession();
      }

      console.log(`➕ Created ${sessionsToCreate} new sessions`);
    }

    // Randomly create new sessions to simulate traffic
    if (Math.random() > 0.7 && currentCount < CONFIG.maxActiveSessions) {
      await this.createNewSession();
      console.log(`🆕 Created random new session`);
    }
  }

  private async generateEventsForActiveSessions() {
    const eventsToGenerate = CONFIG.eventsPerCycle;
    const sessionIds = Array.from(this.activeSessions.keys());

    if (sessionIds.length === 0) {
      console.log('⚠️ No active sessions to generate events for');
      return;
    }

    const events: Array<{
      sessionId: string;
      eventType: EventType;
      eventName: string;
      page?: string;
      component?: string;
      elementId?: string;
      properties: any;
      value?: number;
      duration?: number;
    }> = [];

    for (let i = 0; i < eventsToGenerate; i++) {
      const sessionId = randomChoice(sessionIds);
      const session = this.activeSessions.get(sessionId)!;
      
      const eventType = randomChoice([
        EventType.PAGE_VIEW,
        EventType.PAGE_VIEW, // Weight page views more heavily
        EventType.CLICK,
        EventType.SCROLL,
        EventType.SEARCH,
        EventType.CATEGORY_SELECT,
        EventType.PERFORMANCE,
      ]);

      let eventName = 'background_event';
      let page = randomChoice(SAMPLE_PAGES);
      let component: string | undefined;
      let elementId: string | undefined;
      let properties: any = { 
        source: 'background_generator',
        sessionType: 'synthetic',
        language: session.language,
        deviceType: session.deviceType,
      };
      let value: number | undefined;
      let duration: number | undefined;

      switch (eventType) {
        case EventType.PAGE_VIEW:
          eventName = 'synthetic_page_view';
          properties.referrer = Math.random() > 0.6 ? 'google.com' : Math.random() > 0.3 ? 'facebook.com' : 'direct';
          properties.loadTime = randomInt(800, 2500);
          break;

        case EventType.CLICK:
          eventName = 'synthetic_click';
          component = randomChoice(SAMPLE_COMPONENTS);
          elementId = randomChoice(['btn-search', 'card-venue', 'link-more', 'btn-book', 'tab-filter']);
          properties.component = component;
          properties.clickPosition = `${randomInt(0, 1920)},${randomInt(0, 1080)}`;
          break;

        case EventType.SCROLL:
          eventName = 'synthetic_scroll';
          value = randomChoice([25, 50, 75, 90, 100]);
          properties.scrollPercentage = value;
          properties.scrollDirection = randomChoice(['down', 'up']);
          break;

        case EventType.SEARCH:
          eventName = 'synthetic_search';
          const query = randomChoice(SAMPLE_SEARCH_QUERIES);
          properties.query = query;
          properties.resultsCount = randomInt(0, 50);
          properties.searchDuration = randomInt(100, 1000);
          break;

        case EventType.CATEGORY_SELECT:
          eventName = 'synthetic_category_select';
          properties.category = randomChoice(['hotels', 'restaurants', 'events', 'activities']);
          properties.previousCategory = randomChoice(['all', 'hotels', 'restaurants', 'events']);
          break;

        case EventType.PERFORMANCE:
          eventName = 'synthetic_performance';
          duration = randomInt(500, 3000);
          properties.loadTime = duration;
          properties.connectionType = randomChoice(['4g', 'wifi', '3g']);
          properties.renderTime = randomInt(100, 500);
          break;
      }

      events.push({
        sessionId: session.id,
        eventType,
        eventName,
        page,
        component,
        elementId,
        properties,
        value,
        duration,
      });

      // Update session
      session.eventsGenerated++;
      session.lastActiveAt = new Date();
    }

    // Batch insert events
    await this.batchInsertEvents(events);
    
    console.log(`📈 Generated ${events.length} synthetic analytics events`);
  }

  private async batchInsertEvents(events: any[]) {
    const batchSize = 50;
    
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      await Promise.all(batch.map(event => 
        prisma.analyticsEvent.create({
          data: {
            sessionId: event.sessionId,
            eventType: event.eventType,
            eventName: event.eventName,
            page: event.page,
            component: event.component,
            elementId: event.elementId,
            properties: JSON.stringify(event.properties),
            value: event.value,
            duration: event.duration,
            timestamp: new Date(),
          },
        })
      ));
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSessions: this.activeSessions.size,
      totalEventsGenerated: Array.from(this.activeSessions.values()).reduce((sum, s) => sum + s.eventsGenerated, 0),
    };
  }
}

// CLI interface
async function main() {
  const generator = new BackgroundAnalyticsGenerator();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received shutdown signal...');
    await generator.stop();
    await prisma.$disconnect();
    process.exit(0);
  });

  // Start the generator
  await generator.start();

  // Keep the process alive
  setInterval(() => {
    const status = generator.getStatus();
    console.log(`📊 Status: ${status.isRunning ? 'Running' : 'Stopped'} | Sessions: ${status.activeSessions} | Total Events: ${status.totalEventsGenerated}`);
  }, 60000); // Status update every minute
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BackgroundAnalyticsGenerator };