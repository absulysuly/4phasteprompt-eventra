/**
 * API Route: Import Venues from CSV File
 * POST /api/admin/import-csv
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { PrismaClient, VenueType, VenueStatus } from '@prisma/client';
import { importVenuesFromCSV } from '@/lib/dataCollection/csvImporter';

const prisma = new PrismaClient();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filepath, filename } = body;
    
    if (!filepath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }
    
    // Read CSV file
    const csvContent = await readFile(filepath, 'utf-8');
    
    // Parse and validate venues
    const parseResult = await importVenuesFromCSV(csvContent);
    
    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'CSV parsing failed',
        errors: parseResult.errors
      }, { status: 400 });
    }
    
    // Get or create import user
    const importUser = await findOrCreateImportUser();
    
    // Import stats
    const stats: ImportStats = {
      total: parseResult.venues.length,
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
    
    // Import each venue
    for (const venue of parseResult.venues) {
      try {
        await importSingleVenue(venue, importUser.id);
        stats.imported++;
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          stats.skipped++;
        } else {
          stats.failed++;
          stats.errors.push({
            venue: venue.name,
            error: error.message
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      stats,
      message: `Successfully imported ${stats.imported} venues`
    });
    
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import venues', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Find or create import user
 */
async function findOrCreateImportUser() {
  const importEmail = 'csv-import@eventra.app';
  
  let user = await prisma.user.findUnique({
    where: { email: importEmail }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: importEmail,
        name: 'CSV Import System',
        password: 'N/A'
      }
    });
  }
  
  return user;
}

/**
 * Import a single venue
 */
async function importSingleVenue(venue: any, userId: string) {
  const publicId = generatePublicId(venue.name);
  
  // Check if exists
  const existing = await prisma.venue.findUnique({
    where: { publicId }
  });
  
  if (existing) {
    throw new Error(`Venue already exists: ${venue.name}`);
  }
  
  // Map venue type
  const venueType = mapVenueType(venue.type);
  
  // Create venue with translations
  return await prisma.venue.create({
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
}

/**
 * Map venue type
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
 * Generate public ID
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
