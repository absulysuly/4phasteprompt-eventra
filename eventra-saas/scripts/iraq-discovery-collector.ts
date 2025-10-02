#!/usr/bin/env tsx
/**
 * Iraq Discovery Continuous Data Collection Agent
 * 
 * Orchestrates continuous data collection for all 8 categories
 * Priority: Erbil → Baghdad → Other cities
 * 
 * Usage:
 *   npm run collect:iraq:discovery          # Start continuous collection
 *   npm run collect:iraq:erbil              # Collect Erbil only
 *   npm run collect:iraq:baghdad            # Collect Baghdad only
 *   npm run collect:iraq:batch <governorate> # Generate single batch
 */

import { 
  collectIraqDiscoveryPlaces,
  CollectorConfig 
} from '../src/lib/dataCollection/enhancedGoogleMapsCollector';
import { exportBatch, generateMockAPIEndpoints } from '../src/lib/dataCollection/exportPipeline';
import { deduplicateVenues } from '../src/lib/dataCollection/venueUtils';
import { 
  Category, 
  Governorate,
  IraqDiscoveryPlace 
} from '../src/lib/dataCollection/iraqDiscoverySchema';

// ========================================
// CONFIGURATION
// ========================================

const ALL_CATEGORIES: Category[] = [
  'Accommodation',
  'Cafe & Restaurants',
  'Events',
  'Tourism',
  'Government Offices',
  'Services',
  'Companies',
  'Shopping',
];

const CITY_CONFIGS: Record<string, CollectorConfig> = {
  erbil: {
    city: 'Erbil',
    governorate: 'erbil',
    categories: ALL_CATEGORIES,
    radius: 40000, // 40km
    coordinates: { lat: 36.1911, lng: 44.0091 },
  },
  baghdad: {
    city: 'Baghdad',
    governorate: 'baghdad',
    categories: ALL_CATEGORIES,
    radius: 50000, // 50km
    coordinates: { lat: 33.3152, lng: 44.3661 },
  },
  basra: {
    city: 'Basra',
    governorate: 'basra',
    categories: ALL_CATEGORIES,
    radius: 40000,
    coordinates: { lat: 30.5085, lng: 47.7837 },
  },
  sulaymaniyah: {
    city: 'Sulaymaniyah',
    governorate: 'sulaymaniyah',
    categories: ALL_CATEGORIES,
    radius: 30000,
    coordinates: { lat: 35.5556, lng: 45.4378 },
  },
  nineveh: {
    city: 'Mosul',
    governorate: 'nineveh',
    categories: ALL_CATEGORIES,
    radius: 40000,
    coordinates: { lat: 36.3350, lng: 43.1189 },
  },
  najaf: {
    city: 'Najaf',
    governorate: 'najaf',
    categories: ALL_CATEGORIES,
    radius: 25000,
    coordinates: { lat: 31.9966, lng: 44.3237 },
  },
  karbala: {
    city: 'Karbala',
    governorate: 'karbala',
    categories: ALL_CATEGORIES,
    radius: 25000,
    coordinates: { lat: 32.6161, lng: 44.0322 },
  },
  duhok: {
    city: 'Duhok',
    governorate: 'duhok',
    categories: ALL_CATEGORIES,
    radius: 25000,
    coordinates: { lat: 36.8675, lng: 42.9925 },
  },
  kirkuk: {
    city: 'Kirkuk',
    governorate: 'kirkuk',
    categories: ALL_CATEGORIES,
    radius: 30000,
    coordinates: { lat: 35.4681, lng: 44.3922 },
  },
};

const PRIORITY_ORDER = [
  'erbil',
  'baghdad',
  'basra',
  'sulaymaniyah',
  'nineveh',
  'najaf',
  'karbala',
  'duhok',
  'kirkuk',
];

// ========================================
// MAIN ORCHESTRATOR
// ========================================

async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║    IRAQ DISCOVERY DATA COLLECTION AGENT                  ║');
  console.log('║    Comprehensive 8-Category Data Pipeline                ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  try {
    // Parse command
    if (args.includes('--continuous')) {
      await runContinuousCollection();
    } else if (args.includes('--city')) {
      const cityIndex = args.indexOf('--city');
      const city = args[cityIndex + 1];
      await collectSingleCity(city);
    } else if (args.includes('--help')) {
      printHelp();
    } else {
      // Default: collect priority cities in sequence
      await collectPriorityCities();
    }
    
    console.log('\n✅ Collection agent completed successfully!\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ========================================
// COLLECTION MODES
// ========================================

async function runContinuousCollection() {
  console.log('🔄 Starting CONTINUOUS collection mode...');
  console.log('   This will collect data repeatedly until stopped (Ctrl+C)\n');
  
  let batchNumber = 1;
  let iteration = 1;
  
  while (true) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`ITERATION #${iteration} - ${new Date().toLocaleString()}`);
    console.log('='.repeat(70));
    
    for (const city of PRIORITY_ORDER) {
      try {
        await collectAndExportCity(city, batchNumber);
        batchNumber++;
        
        // Wait 5 minutes between cities to respect rate limits
        console.log('\n⏱️  Waiting 5 minutes before next city...\n');
        await sleep(5 * 60 * 1000);
      } catch (error: any) {
        console.error(`❌ Failed to collect ${city}: ${error.message}`);
        continue;
      }
    }
    
    iteration++;
    
    // Wait 1 hour between full iterations
    console.log('\n⏱️  Full iteration complete. Waiting 1 hour before next round...\n');
    await sleep(60 * 60 * 1000);
  }
}

async function collectPriorityCities() {
  console.log('📋 Collecting priority cities: Erbil → Baghdad → Others\n');
  
  let batchNumber = 1;
  
  for (const city of PRIORITY_ORDER) {
    try {
      await collectAndExportCity(city, batchNumber);
      batchNumber++;
      
      // Small delay between cities
      if (city !== PRIORITY_ORDER[PRIORITY_ORDER.length - 1]) {
        console.log('\n⏱️  Waiting 2 minutes before next city...\n');
        await sleep(2 * 60 * 1000);
      }
    } catch (error: any) {
      console.error(`❌ Failed to collect ${city}: ${error.message}`);
      continue;
    }
  }
}

async function collectSingleCity(cityKey: string) {
  console.log(`📍 Single city collection: ${cityKey}\n`);
  
  if (!CITY_CONFIGS[cityKey]) {
    console.error(`❌ Unknown city: ${cityKey}`);
    console.log(`\nAvailable cities: ${Object.keys(CITY_CONFIGS).join(', ')}`);
    process.exit(1);
  }
  
  await collectAndExportCity(cityKey, 1);
}

// ========================================
// CORE COLLECTION & EXPORT
// ========================================

async function collectAndExportCity(
  cityKey: string,
  batchNumber: number
): Promise<void> {
  const config = CITY_CONFIGS[cityKey];
  if (!config) {
    throw new Error(`Unknown city: ${cityKey}`);
  }
  
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`🌆 ${config.city.toUpperCase()} (${config.governorate})`);
  console.log('━'.repeat(70));
  
  // Step 1: Collect data
  console.log('\n📡 Step 1: Collecting data from sources...\n');
  let places = await collectIraqDiscoveryPlaces(config);
  
  if (places.length === 0) {
    console.warn(`⚠️  No data collected for ${config.city}`);
    return;
  }
  
  // Step 2: Deduplicate
  console.log(`\n🔍 Step 2: Deduplicating records...`);
  const beforeCount = places.length;
  places = deduplicateAndNormalize(places);
  const afterCount = places.length;
  console.log(`   Removed ${beforeCount - afterCount} duplicates`);
  console.log(`   Unique records: ${afterCount}`);
  
  // Step 3: Validate & Quality Check
  console.log(`\n✅ Step 3: Validating data quality...`);
  const validPlaces = validatePlaces(places);
  console.log(`   Valid records: ${validPlaces.length}/${places.length}`);
  
  // Step 4: Export
  console.log(`\n💾 Step 4: Exporting batch...`);
  const manifest = await exportBatch(
    validPlaces,
    batchNumber,
    config.governorate as Governorate,
    `${config.city} Complete Dataset - Batch ${batchNumber}`
  );
  
  // Step 5: Generate mock API
  const batchDir = `./data/iraq-discovery-exports/batch-${batchNumber}-${config.governorate}`;
  await generateMockAPIEndpoints(batchDir);
  
  // Summary
  console.log(`\n${'━'.repeat(70)}`);
  console.log(`✅ ${config.city} Collection Complete`);
  console.log('━'.repeat(70));
  console.log(`   Total Records: ${validPlaces.length}`);
  console.log(`   Complete Records: ${manifest.quality_metrics.complete_records} (${Math.round(manifest.quality_metrics.complete_records / validPlaces.length * 100)}%)`);
  console.log(`   Geocoded: ${manifest.quality_metrics.geocoded}`);
  console.log(`   With Images: ${manifest.quality_metrics.with_images}`);
  console.log(`   Batch Number: ${batchNumber}`);
  console.log(`   Export Location: ${batchDir}`);
  console.log('━'.repeat(70));
}

// ========================================
// DATA PROCESSING HELPERS
// ========================================

function deduplicateAndNormalize(places: IraqDiscoveryPlace[]): IraqDiscoveryPlace[] {
  // Simple deduplication based on name + coordinates
  const seen = new Set<string>();
  const unique: IraqDiscoveryPlace[] = [];
  
  for (const place of places) {
    const key = `${place.name.toLowerCase().trim()}_${place.latitude.toFixed(4)}_${place.longitude.toFixed(4)}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      
      // Normalize data
      place.name = place.name.trim();
      if (place.phone) {
        place.phone = normalizePhone(place.phone);
      }
      
      unique.push(place);
    }
  }
  
  return unique;
}

function normalizePhone(phone: string): string {
  // Iraqi phone normalization
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert to +964 format
  if (normalized.startsWith('07')) {
    normalized = '+964' + normalized.substring(1);
  } else if (normalized.startsWith('00964')) {
    normalized = '+964' + normalized.substring(5);
  } else if (!normalized.startsWith('+964')) {
    normalized = '+964' + normalized;
  }
  
  return normalized;
}

function validatePlaces(places: IraqDiscoveryPlace[]): IraqDiscoveryPlace[] {
  return places.filter(place => {
    // Required fields check
    if (!place.name || place.name.trim().length === 0) return false;
    if (!place.canonical_category) return false;
    if (!place.address || !place.address.city) return false;
    if (place.latitude === 0 || place.longitude === 0) return false;
    
    // Coordinate bounds check for Iraq
    if (place.latitude < 29 || place.latitude > 38) return false;
    if (place.longitude < 38 || place.longitude > 49) return false;
    
    return true;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// HELP
// ========================================

function printHelp() {
  console.log('Iraq Discovery Data Collection Agent');
  console.log('');
  console.log('USAGE:');
  console.log('  npm run collect:iraq:discovery               # Collect all priority cities');
  console.log('  npm run collect:iraq:discovery -- --continuous    # Run continuously');
  console.log('  npm run collect:iraq:discovery -- --city erbil    # Single city');
  console.log('  npm run collect:iraq:discovery -- --help          # Show help');
  console.log('');
  console.log('AVAILABLE CITIES:');
  console.log(`  ${Object.keys(CITY_CONFIGS).join(', ')}`);
  console.log('');
  console.log('PRIORITY ORDER:');
  PRIORITY_ORDER.forEach((city, idx) => {
    console.log(`  ${idx + 1}. ${city}`);
  });
  console.log('');
  console.log('OUTPUT:');
  console.log('  All data exported to: ./data/iraq-discovery-exports/');
  console.log('  Format: JSON (primary) + CSV (secondary) + README + Manifest');
  console.log('');
  console.log('CATEGORIES:');
  ALL_CATEGORIES.forEach(cat => {
    console.log(`  • ${cat}`);
  });
  console.log('');
}

// ========================================
// RUN
// ========================================

main();
