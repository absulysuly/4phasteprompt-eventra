/**
 * CSV Venue Data Importer
 * 
 * Allows importing venue data from CSV files with:
 * - Automatic validation
 * - Format detection
 * - Error reporting
 * - Batch processing
 */

import {
  VenueData,
  validateVenueData,
  enrichVenueData,
  deduplicateVenues,
  sanitizeText
} from './venueUtils';

export interface CSVImportResult {
  success: boolean;
  imported: number;
  failed: number;
  venues: VenueData[];
  errors: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
}

/**
 * CSV Format Expected:
 * name,description,type,city,address,latitude,longitude,phoneNumber,website,priceRange,rating,cuisineType
 */
export async function importVenuesFromCSV(
  csvContent: string
): Promise<CSVImportResult> {
  const result: CSVImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    venues: [],
    errors: []
  };

  try {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header
    const header = parseCSVLine(lines[0]);
    const requiredFields = ['name', 'description', 'type', 'city'];
    
    // Validate header
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        throw new Error(`Missing required column: ${field}`);
      }
    }

    // Parse data rows
    const venues: VenueData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length === 0) continue; // Skip empty lines
      
      try {
        const venueData = parseVenueFromRow(header, values);
        const validation = validateVenueData(venueData);
        
        if (!validation.valid) {
          result.errors.push({
            row: i + 1,
            errors: validation.errors,
            data: venueData
          });
          result.failed++;
        } else {
          const enriched = await enrichVenueData(venueData);
          venues.push(enriched);
          result.imported++;
        }
      } catch (error: any) {
        result.errors.push({
          row: i + 1,
          errors: [error.message],
          data: values
        });
        result.failed++;
      }
    }

    // Deduplicate venues
    result.venues = deduplicateVenues(venues);
    result.success = result.imported > 0;
    
    return result;
  } catch (error: any) {
    result.errors.push({
      row: 0,
      errors: [error.message],
      data: null
    });
    return result;
  }
}

/**
 * Parses a CSV line handling quotes and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parses venue data from CSV row
 */
function parseVenueFromRow(header: string[], values: string[]): VenueData {
  const data: any = {};
  
  for (let i = 0; i < header.length && i < values.length; i++) {
    const key = header[i].trim();
    const value = values[i].trim();
    
    if (value) {
      data[key] = value;
    }
  }

  // Parse and validate types
  const venue: VenueData = {
    name: sanitizeText(data.name || ''),
    description: sanitizeText(data.description || ''),
    type: parseVenueType(data.type),
    city: sanitizeText(data.city || ''),
    address: data.address ? sanitizeText(data.address) : undefined,
    latitude: data.latitude ? parseFloat(data.latitude) : undefined,
    longitude: data.longitude ? parseFloat(data.longitude) : undefined,
    phoneNumber: data.phoneNumber || data.phone || undefined,
    website: data.website || undefined,
    priceRange: data.priceRange || data.price || undefined,
    rating: data.rating ? parseFloat(data.rating) : undefined,
    imageUrl: data.imageUrl || data.image || undefined,
    cuisineType: data.cuisineType || data.cuisine || undefined,
    amenities: data.amenities ? parseArrayField(data.amenities) : undefined,
    tags: data.tags ? parseArrayField(data.tags) : undefined
  };

  return venue;
}

/**
 * Parses venue type string to enum
 */
function parseVenueType(typeString: string): 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE' {
  const normalized = typeString.toUpperCase().trim();
  
  const typeMap: Record<string, 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE'> = {
    'HOTEL': 'HOTEL',
    'HOTELS': 'HOTEL',
    'ACCOMMODATION': 'HOTEL',
    'LODGING': 'HOTEL',
    'RESTAURANT': 'RESTAURANT',
    'RESTAURANTS': 'RESTAURANT',
    'DINING': 'RESTAURANT',
    'CAFE': 'RESTAURANT',
    'CAFES': 'RESTAURANT',
    'COFFEE': 'RESTAURANT',
    'ACTIVITY': 'ACTIVITY',
    'ACTIVITIES': 'ACTIVITY',
    'ATTRACTION': 'ACTIVITY',
    'ATTRACTIONS': 'ACTIVITY',
    'TOURISM': 'ACTIVITY',
    'TOUR': 'ACTIVITY',
    'SERVICE': 'SERVICE',
    'SERVICES': 'SERVICE',
    'BUSINESS': 'SERVICE'
  };

  return typeMap[normalized] || 'SERVICE';
}

/**
 * Parses comma-separated or JSON array fields
 */
function parseArrayField(field: string): string[] {
  try {
    // Try parsing as JSON first
    return JSON.parse(field);
  } catch {
    // Fall back to comma-separated
    return field.split(',').map(item => item.trim()).filter(item => item);
  }
}

/**
 * Generates a sample CSV template
 */
export function generateCSVTemplate(): string {
  const header = [
    'name',
    'description',
    'type',
    'city',
    'address',
    'latitude',
    'longitude',
    'phoneNumber',
    'website',
    'priceRange',
    'rating',
    'cuisineType',
    'amenities',
    'tags'
  ].join(',');

  const sampleRows = [
    [
      'Baghdad Palace Hotel',
      'Luxury hotel in central Baghdad with modern amenities',
      'HOTEL',
      'Baghdad',
      '123 Karrada Street',
      '33.3152',
      '44.3661',
      '+9647901234567',
      'https://example.com',
      '$$$',
      '4.5',
      '',
      '"WiFi,Parking,Pool,Gym"',
      '"luxury,central,5-star"'
    ].join(','),
    [
      'Erbil Grill House',
      'Traditional Kurdish restaurant famous for grilled meats',
      'RESTAURANT',
      'Erbil',
      '45 Main Street, Erbil',
      '36.1911',
      '44.0091',
      '+9647507654321',
      '',
      '$$',
      '4.7',
      'Kurdish Grill',
      '',
      '"traditional,grilled,local"'
    ].join(',')
  ];

  return [header, ...sampleRows].join('\n');
}

/**
 * Validates CSV format before import
 */
export function validateCSVFormat(csvContent: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  try {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      errors.push('CSV must have at least a header row and one data row');
      return { valid: false, errors };
    }

    const header = parseCSVLine(lines[0]);
    const requiredFields = ['name', 'description', 'type', 'city'];
    
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        errors.push(`Missing required column: ${field}`);
      }
    }

    // Check data consistency
    const dataRow = parseCSVLine(lines[1]);
    if (dataRow.length !== header.length) {
      errors.push(`Header has ${header.length} columns but first data row has ${dataRow.length} columns`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error: any) {
    errors.push(`Invalid CSV format: ${error.message}`);
    return { valid: false, errors };
  }
}

/**
 * Converts venues back to CSV format for export
 */
export function exportVenuesToCSV(venues: VenueData[]): string {
  const header = [
    'name',
    'description',
    'type',
    'city',
    'address',
    'latitude',
    'longitude',
    'phoneNumber',
    'website',
    'priceRange',
    'rating',
    'cuisineType',
    'amenities',
    'tags'
  ].join(',');

  const rows = venues.map(venue => {
    return [
      escapeCSVField(venue.name),
      escapeCSVField(venue.description),
      venue.type,
      escapeCSVField(venue.city),
      escapeCSVField(venue.address || ''),
      venue.latitude || '',
      venue.longitude || '',
      venue.phoneNumber || '',
      venue.website || '',
      venue.priceRange || '',
      venue.rating || '',
      venue.cuisineType || '',
      venue.amenities ? `"${venue.amenities.join(',')}"` : '',
      venue.tags ? `"${venue.tags.join(',')}"` : ''
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

/**
 * Escapes CSV field for safe export
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
