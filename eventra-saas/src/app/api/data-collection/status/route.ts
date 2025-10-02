import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API Route: Get Data Collection Status
 * 
 * Returns current status, progress, and logs
 */

const STATUS_FILE = path.join(process.cwd(), 'data', 'collection-status.json');
const EXPORTS_DIR = path.join(process.cwd(), 'data', 'iraq-discovery-exports');

export async function GET() {
  try {
    // Read status file
    let status = {
      running: false,
      current_city: undefined,
      current_batch: undefined,
      progress: {
        total_batches: 0,
        total_records: 0,
        cities_completed: [],
        current_step: undefined,
      },
      stats: {},
      last_batch: undefined,
      logs: [],
    };

    if (fs.existsSync(STATUS_FILE)) {
      const fileContent = fs.readFileSync(STATUS_FILE, 'utf-8');
      status = { ...status, ...JSON.parse(fileContent) };
    }

    // Calculate stats from exports
    if (fs.existsSync(EXPORTS_DIR)) {
      const batches = fs.readdirSync(EXPORTS_DIR);
      status.progress.total_batches = batches.length;
      
      const stats: any = {};
      let totalRecords = 0;
      let lastBatch: any = null;

      for (const batch of batches) {
        const batchDir = path.join(EXPORTS_DIR, batch);
        const manifestPath = path.join(batchDir, 'MANIFEST.json');
        
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          const city = manifest.governorate;
          
          stats[city] = (stats[city] || 0) + manifest.total_records;
          totalRecords += manifest.total_records;
          
          if (!lastBatch || new Date(manifest.date_created) > new Date(lastBatch.timestamp)) {
            lastBatch = {
              city: manifest.governorate,
              records: manifest.total_records,
              timestamp: manifest.date_created,
            };
          }
        }
      }

      status.stats = stats;
      status.progress.total_records = totalRecords;
      status.progress.cities_completed = Object.keys(stats);
      status.last_batch = lastBatch;
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error getting collection status:', error);
    return NextResponse.json(
      { error: 'Failed to get status', details: error.message },
      { status: 500 }
    );
  }
}
