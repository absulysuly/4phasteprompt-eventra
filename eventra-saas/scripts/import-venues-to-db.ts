/**
 * Database Import Script for CSV Venues
 * 
 * Imports venues from CSV file into the Prisma database
 * with full validation, translation support, and error handling
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, VenueType, VenueStatus } from '@prisma/client';
import {
  importVenuesFromCSV,
  CSVImportResult
} from '../src/lib/dataCollection/csvImporter';
import {
  formatVenueForDatabase,
  VenueData
} from '../src/lib/dataCollection/venueUtils';

const prisma = new PrismaClient();

interface ImportStats {
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  errors: Array<{
    venue: string;
    error: string;
  }>;
}

/**
 * Import venues from CSV file to database
 */
async function importVenuesToDatabase(csvFilePath: string, userId?: string): Promise<ImportStats> {
  const stats: ImportStats = {
    total: 0,
    imported: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  try {
    console.log('📂 Reading CSV file...');
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    console.log('🔍 Parsing and validating venues...');
    const result: CSVImportResult = await importVenuesFromCSV(csvContent);
    
    stats.total = result.imported + result.failed;
    
    if (!result.success) {
      console.log('❌ CSV import failed');
      console.log('Errors:', result.errors);
      return stats;
    }
    
    console.log(`✅ Successfully parsed ${result.venues.length} venues`);
    
    // Get or create default user for imports
    let importUserId = userId;
    if (!importUserId) {
      console.log('👤 Finding or creating import user...');
      const importUser = await findOrCreateImportUser();
      importUserId = importUser.id;
    }
    
    console.log('💾 Importing venues to database...\n');
    
    // Import each venue
    for (const venue of result.venues) {
      try {
        await importSingleVenue(venue, importUserId);
        stats.imported++;
        console.log(`✅ Imported: ${venue.name} (${venue.type})`);
      } catch (error: any) {
        stats.failed++;
        stats.errors.push({
          venue: venue.name,
          error: error.message
        });
        console.log(`❌ Failed: ${venue.name} - ${error.message}`);
      }
    }
    
    return stats;
  } catch (error: any) {
    console.error('💥 Fatal error during import:', error);
    throw error;
  }
}

/**
 * Find or create a default user for CSV imports
 */
async function findOrCreateImportUser() {
  const importEmail = 'csv-import@eventra.app';
  
  let user = await prisma.user.findUnique({
    where: { email: importEmail }
  });
  
  if (!user) {
    console.log('Creating import user...');
    user = await prisma.user.create({
      data: {
        email: importEmail,
        name: 'CSV Import System',
        password: 'N/A' // This is a system user, not for login
      }
    });
  }
  
  return user;
}

/**
 * Import a single venue with translations
 */
async function importSingleVenue(venue: VenueData, userId: string) {
  // Check if venue already exists by publicId
  const publicId = generatePublicId(venue.name);
  
  const existing = await prisma.venue.findUnique({
    where: { publicId }
  });
  
  if (existing) {
    console.log(`   ⚠️  Venue already exists: ${venue.name} - Skipping`);
    return existing;
  }
  
  // Map venue type
  const venueType = mapVenueType(venue.type);
  
  // Create venue with translations
  const created = await prisma.venue.create({
    data: {
      type: venueType,
      status: VenueStatus.ACTIVE,
      publicId: publicId,
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
      userId: userId,
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
            title: venue.name, // TODO: Add Arabic translation
            description: venue.description,
            location: venue.address || venue.city
          },
          {
            locale: 'ku',
            title: venue.name, // TODO: Add Kurdish translation
            description: venue.description,
            location: venue.address || venue.city
          }
        ]
      }
    },
    include: {
      translations: true
    }
  });
  
  return created;
}

/**
 * Map venue type string to Prisma enum
 */
function mapVenueType(type: string): VenueType {
  const typeMap: Record<string, VenueType> = {
    'HOTEL': VenueType.HOTEL,
    'RESTAURANT': VenueType.RESTAURANT,
    'ACTIVITY': VenueType.ACTIVITY,
    'SERVICE': VenueType.SERVICE,
    'EVENT': VenueType.EVENT
  };
  
  return typeMap[type.toUpperCase()] || VenueType.SERVICE;
}

/**
 * Generate a URL-friendly public ID
 */
function generatePublicId(name: string): string {
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
 * Print import statistics
 */
function printStats(stats: ImportStats) {
  console.log('\n========================================');
  console.log('📊 IMPORT SUMMARY');
  console.log('========================================\n');
  console.log(`Total Venues: ${stats.total}`);
  console.log(`✅ Imported: ${stats.imported}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(err => {
      console.log(`   - ${err.venue}: ${err.error}`);
    });
  }
  
  console.log('\n========================================\n');
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  let csvFilePath = path.join(__dirname, '..', 'data', 'sample-venues.csv');
  let userId: string | undefined = undefined;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      csvFilePath = args[i + 1];
      i++;
    } else if (args[i] === '--user' && args[i + 1]) {
      userId = args[i + 1];
      i++;
    }
  }
  
  console.log('\n========================================');
  console.log('🚀 VENUE DATABASE IMPORT');
  console.log('========================================\n');
  console.log(`CSV File: ${csvFilePath}`);
  console.log(`User ID: ${userId || 'Auto (system user)'}\n`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    // Run import
    const stats = await importVenuesToDatabase(csvFilePath, userId);
    
    // Print results
    printStats(stats);
    
    // Exit
    await prisma.$disconnect();
    process.exit(stats.failed > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n💥 Import failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { importVenuesToDatabase, ImportStats };
