/**
 * Data Collection Scheduler
 * 
 * Manages automated, scheduled data collection from multiple sources
 * Coordinates scraping, validation, and database updates
 */

import { PrismaClient } from '@prisma/client';
import { collectGoogleMapsVenues } from './scrapers/googleMapsCollector';
import { collectFacebookEvents } from './scrapers/facebookCollector';
import { collectInstagramVenues } from './scrapers/instagramCollector';
import { validateAndCleanVenueData } from './dataValidator';
import { VenueData } from './venueUtils';

const prisma = new PrismaClient();

export interface CollectionJob {
  id: string;
  name: string;
  source: 'google_maps' | 'facebook' | 'instagram' | 'manual_csv';
  enabled: boolean;
  schedule: string; // cron format
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'success' | 'failed';
  config: Record<string, any>;
}

export interface CollectionResult {
  jobId: string;
  success: boolean;
  collected: number;
  validated: number;
  imported: number;
  failed: number;
  errors: string[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

// Default collection jobs for Iraqi venues
const DEFAULT_JOBS: CollectionJob[] = [
  {
    id: 'google-maps-baghdad',
    name: 'Google Maps - Baghdad Venues',
    source: 'google_maps',
    enabled: true,
    schedule: '0 2 * * *', // Daily at 2 AM
    status: 'idle',
    config: {
      city: 'Baghdad',
      governorate: 'baghdad',
      types: ['hotel', 'restaurant', 'cafe', 'tourist_attraction'],
      radius: 50000, // 50km
      coordinates: { lat: 33.3152, lng: 44.3661 }
    }
  },
  {
    id: 'google-maps-erbil',
    name: 'Google Maps - Erbil Venues',
    source: 'google_maps',
    enabled: true,
    schedule: '0 3 * * *', // Daily at 3 AM
    status: 'idle',
    config: {
      city: 'Erbil',
      governorate: 'erbil',
      types: ['hotel', 'restaurant', 'cafe', 'tourist_attraction'],
      radius: 40000,
      coordinates: { lat: 36.1911, lng: 44.0091 }
    }
  },
  {
    id: 'google-maps-basra',
    name: 'Google Maps - Basra Venues',
    source: 'google_maps',
    enabled: true,
    schedule: '0 4 * * *', // Daily at 4 AM
    status: 'idle',
    config: {
      city: 'Basra',
      governorate: 'basra',
      types: ['hotel', 'restaurant', 'cafe', 'tourist_attraction'],
      radius: 40000,
      coordinates: { lat: 30.5085, lng: 47.7837 }
    }
  },
  {
    id: 'facebook-events-iraq',
    name: 'Facebook - Iraqi Events',
    source: 'facebook',
    enabled: false, // Requires API access
    schedule: '0 6 * * *', // Daily at 6 AM
    status: 'idle',
    config: {
      locations: ['Baghdad, Iraq', 'Erbil, Iraq', 'Basra, Iraq'],
      categories: ['MUSIC_EVENT', 'ARTS_EVENT', 'SPORTS_EVENT', 'FOOD_TASTING']
    }
  },
  {
    id: 'instagram-venues-iraq',
    name: 'Instagram - Iraqi Venues & Restaurants',
    source: 'instagram',
    enabled: false, // Requires API access
    schedule: '0 8 * * *', // Daily at 8 AM
    status: 'idle',
    config: {
      hashtags: [
        'baghdadrestaurants',
        'erbilcafe',
        'iraqievents',
        'baghdadfood',
        'kurdistanhotels'
      ],
      locations: ['Baghdad', 'Erbil', 'Basra', 'Sulaymaniyah']
    }
  }
];

/**
 * Main scheduler class
 */
export class DataCollectionScheduler {
  private jobs: Map<string, CollectionJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private running = false;

  constructor() {
    // Initialize with default jobs
    DEFAULT_JOBS.forEach(job => {
      this.jobs.set(job.id, { ...job });
    });
  }

  /**
   * Start the scheduler
   */
  async start() {
    if (this.running) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    console.log('🚀 Starting data collection scheduler...');
    this.running = true;

    // Schedule all enabled jobs
    for (const [jobId, job] of this.jobs) {
      if (job.enabled) {
        await this.scheduleJob(jobId);
      }
    }

    console.log(`✅ Scheduler started with ${this.intervals.size} active jobs`);
  }

  /**
   * Stop the scheduler
   */
  stop() {
    console.log('🛑 Stopping data collection scheduler...');
    
    for (const [jobId, interval] of this.intervals) {
      clearInterval(interval);
    }
    
    this.intervals.clear();
    this.running = false;
    
    console.log('✅ Scheduler stopped');
  }

  /**
   * Schedule a specific job
   */
  private async scheduleJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Parse cron and calculate next run time
    const nextRun = this.calculateNextRun(job.schedule);
    job.nextRun = nextRun;

    console.log(`📅 Scheduled: ${job.name} - Next run: ${nextRun.toLocaleString()}`);

    // Set interval to check every minute
    const interval = setInterval(async () => {
      const now = new Date();
      if (job.nextRun && now >= job.nextRun && job.status !== 'running') {
        await this.executeJob(jobId);
      }
    }, 60000); // Check every minute

    this.intervals.set(jobId, interval);
  }

  /**
   * Execute a collection job immediately
   */
  async executeJob(jobId: string): Promise<CollectionResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Executing: ${job.name}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = new Date();
    job.status = 'running';
    job.lastRun = startTime;

    const result: CollectionResult = {
      jobId,
      success: false,
      collected: 0,
      validated: 0,
      imported: 0,
      failed: 0,
      errors: [],
      startTime,
      endTime: new Date(),
      duration: 0
    };

    try {
      // Collect data based on source
      let venues: VenueData[] = [];

      switch (job.source) {
        case 'google_maps':
          venues = await collectGoogleMapsVenues(job.config);
          break;
        case 'facebook':
          // venues = await collectFacebookEvents(job.config);
          console.log('⚠️  Facebook collector not yet implemented');
          break;
        case 'instagram':
          // venues = await collectInstagramVenues(job.config);
          console.log('⚠️  Instagram collector not yet implemented');
          break;
        default:
          throw new Error(`Unknown source: ${job.source}`);
      }

      result.collected = venues.length;
      console.log(`✅ Collected ${venues.length} venues from ${job.source}`);

      // Validate and clean data
      const validVenues: VenueData[] = [];
      for (const venue of venues) {
        const validation = await validateAndCleanVenueData(venue);
        if (validation.valid && validation.data) {
          validVenues.push(validation.data);
        } else {
          result.failed++;
          result.errors.push(`${venue.name}: ${validation.errors.join(', ')}`);
        }
      }

      result.validated = validVenues.length;
      console.log(`✅ Validated ${validVenues.length} venues`);

      // Import to database
      const imported = await this.importVenues(validVenues);
      result.imported = imported;
      console.log(`✅ Imported ${imported} venues to database`);

      result.success = true;
      job.status = 'success';
    } catch (error: any) {
      console.error(`❌ Job failed: ${error.message}`);
      result.errors.push(error.message);
      job.status = 'failed';
    }

    // Calculate next run time
    job.nextRun = this.calculateNextRun(job.schedule);

    const endTime = new Date();
    result.endTime = endTime;
    result.duration = endTime.getTime() - startTime.getTime();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Job Complete: ${job.name}`);
    console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);
    console.log(`   Collected: ${result.collected}`);
    console.log(`   Validated: ${result.validated}`);
    console.log(`   Imported: ${result.imported}`);
    console.log(`   Failed: ${result.failed}`);
    console.log(`   Next run: ${job.nextRun?.toLocaleString() || 'N/A'}`);
    console.log(`${'='.repeat(60)}\n`);

    return result;
  }

  /**
   * Import validated venues to database
   */
  private async importVenues(venues: VenueData[]): Promise<number> {
    let imported = 0;

    // Get or create import user
    const importUser = await prisma.user.upsert({
      where: { email: 'auto-collector@eventra.app' },
      update: {},
      create: {
        email: 'auto-collector@eventra.app',
        name: 'Automated Data Collector',
        password: 'N/A'
      }
    });

    for (const venue of venues) {
      try {
        // Check if venue already exists
        const publicId = this.generatePublicId(venue.name);
        const existing = await prisma.venue.findUnique({
          where: { publicId }
        });

        if (existing) {
          console.log(`   ⏭️  Skipped (exists): ${venue.name}`);
          continue;
        }

        // Create venue with translations
        await prisma.venue.create({
          data: {
            type: venue.type === 'HOTEL' ? 'HOTEL' :
                  venue.type === 'RESTAURANT' ? 'RESTAURANT' :
                  venue.type === 'ACTIVITY' ? 'ACTIVITY' : 'SERVICE',
            status: 'PENDING',
            publicId,
            priceRange: venue.priceRange || null,
            businessPhone: venue.phoneNumber || null,
            website: venue.website || null,
            address: venue.address || null,
            city: venue.city.toLowerCase(),
            latitude: venue.latitude || null,
            longitude: venue.longitude || null,
            imageUrl: venue.imageUrl || null,
            whatsappPhone: venue.phoneNumber || null,
            contactMethod: venue.phoneNumber || venue.website || null,
            amenities: venue.amenities ? JSON.stringify(venue.amenities) : null,
            cuisineType: venue.cuisineType || null,
            tags: venue.tags ? JSON.stringify(venue.tags) : null,
            featured: false,
            verified: false,
            userId: importUser.id,
            translations: {
              create: [
                {
                  locale: 'en',
                  title: venue.name,
                  description: venue.description,
                  location: venue.address || venue.city
                },
                {
                  locale: 'ar',
                  title: venue.name,
                  description: venue.description,
                  location: venue.address || venue.city
                },
                {
                  locale: 'ku',
                  title: venue.name,
                  description: venue.description,
                  location: venue.address || venue.city
                }
              ]
            }
          }
        });

        imported++;
        console.log(`   ✅ Imported: ${venue.name}`);
      } catch (error: any) {
        console.error(`   ❌ Failed to import ${venue.name}: ${error.message}`);
      }
    }

    return imported;
  }

  /**
   * Generate unique public ID
   */
  private generatePublicId(name: string): string {
    const timestamp = Date.now().toString(36);
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40);
    
    return `${slug}-${timestamp}`;
  }

  /**
   * Calculate next run time from cron expression
   * Simple implementation - supports basic cron patterns
   */
  private calculateNextRun(cronExpression: string): Date {
    // Parse cron: minute hour day month dayOfWeek
    const parts = cronExpression.split(' ');
    const [minute, hour] = parts.map(p => p === '*' ? null : parseInt(p));

    const now = new Date();
    const next = new Date(now);

    // Set target time
    if (hour !== null) next.setHours(hour);
    if (minute !== null) next.setMinutes(minute);
    next.setSeconds(0);
    next.setMilliseconds(0);

    // If time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  /**
   * Get all jobs
   */
  getJobs(): CollectionJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): CollectionJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Enable/disable a job
   */
  setJobEnabled(jobId: string, enabled: boolean) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.enabled = enabled;
      if (enabled && this.running) {
        this.scheduleJob(jobId);
      } else if (!enabled) {
        const interval = this.intervals.get(jobId);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(jobId);
        }
      }
    }
  }
}

// Singleton instance
let schedulerInstance: DataCollectionScheduler | null = null;

/**
 * Get scheduler instance
 */
export function getScheduler(): DataCollectionScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new DataCollectionScheduler();
  }
  return schedulerInstance;
}
