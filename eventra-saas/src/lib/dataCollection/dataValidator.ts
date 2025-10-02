/**
 * Data Validation and Cleaning Pipeline
 * 
 * Validates, cleans, and enriches venue data with:
 * - Iraqi phone number validation (+964)
 * - Address normalization
 * - Geocoding validation
 * - Data sanitization
 * - Deduplication
 */

import {
  VenueData,
  validateVenueData,
  isValidIraqiPhone,
  normalizeCityName,
  sanitizeText,
  isDuplicate
} from './venueUtils';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: VenueData;
}

// Iraqi governorates with coordinates
const IRAQI_GOVERNORATES: Record<string, { lat: number; lng: number; names: string[] }> = {
  baghdad: { lat: 33.3152, lng: 44.3661, names: ['baghdad', 'بغداد', 'بەغدا'] },
  erbil: { lat: 36.1911, lng: 44.0091, names: ['erbil', 'arbil', 'hewlêr', 'هەولێر', 'أربيل'] },
  basra: { lat: 30.5085, lng: 47.7837, names: ['basra', 'البصرة', 'بەسرە'] },
  nineveh: { lat: 36.3350, lng: 43.1189, names: ['mosul', 'nineveh', 'الموصل', 'موسڵ', 'نينوى'] },
  sulaymaniyah: { lat: 35.5558, lng: 45.4375, names: ['sulaymaniyah', 'sulaimani', 'سلێمانی', 'السليمانية'] },
  kirkuk: { lat: 35.4681, lng: 44.3922, names: ['kirkuk', 'كركوك', 'کەرکووک'] },
  najaf: { lat: 31.9961, lng: 44.3152, names: ['najaf', 'النجف'] },
  karbala: { lat: 32.6160, lng: 44.0246, names: ['karbala', 'كربلاء'] },
  duhok: { lat: 36.8676, lng: 42.9876, names: ['duhok', 'dohuk', 'دهوك', 'دهۆک'] },
  anbar: { lat: 33.3353, lng: 43.3065, names: ['anbar', 'الأنبار', 'ramadi', 'الرمادي'] },
  diyala: { lat: 33.7539, lng: 45.1556, names: ['diyala', 'ديالى', 'baqubah', 'بعقوبة'] },
  saladin: { lat: 34.5600, lng: 43.6780, names: ['saladin', 'صلاح الدين', 'tikrit', 'تكريت'] },
  wasit: { lat: 32.5024, lng: 45.8165, names: ['wasit', 'واسط', 'kut', 'الكوت'] },
  babil: { lat: 32.4644, lng: 44.4203, names: ['babil', 'babylon', 'بابل', 'hillah', 'الحلة'] },
  maysan: { lat: 31.8530, lng: 47.1459, names: ['maysan', 'ميسان', 'amarah', 'العمارة'] },
  dhi_qar: { lat: 31.0589, lng: 46.2587, names: ['dhi qar', 'ذي قار', 'nasiriyah', 'الناصرية'] },
  muthanna: { lat: 29.9095, lng: 45.2875, names: ['muthanna', 'المثنى', 'samawah', 'السماوة'] },
  qadisiyyah: { lat: 32.0172, lng: 44.9358, names: ['qadisiyyah', 'القادسية', 'diwaniyah', 'الديوانية'] }
};

/**
 * Validates and cleans venue data
 */
export async function validateAndCleanVenueData(
  venue: Partial<VenueData>
): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    data: undefined
  };

  // Start with base validation
  const baseValidation = validateVenueData(venue);
  if (!baseValidation.valid) {
    result.valid = false;
    result.errors = baseValidation.errors;
    return result;
  }

  // Clean and enrich the data
  const cleaned: VenueData = {
    name: sanitizeText(venue.name || ''),
    description: sanitizeText(venue.description || ''),
    type: venue.type || 'SERVICE',
    city: normalizeCityName(venue.city || ''),
    address: venue.address ? sanitizeText(venue.address) : undefined,
    latitude: venue.latitude,
    longitude: venue.longitude,
    phoneNumber: venue.phoneNumber,
    website: venue.website,
    priceRange: venue.priceRange,
    rating: venue.rating,
    imageUrl: venue.imageUrl,
    amenities: venue.amenities,
    cuisineType: venue.cuisineType,
    tags: venue.tags
  };

  // Validate and format phone number
  if (cleaned.phoneNumber) {
    cleaned.phoneNumber = normalizeIraqiPhone(cleaned.phoneNumber);
    if (!isValidIraqiPhone(cleaned.phoneNumber)) {
      result.warnings.push(`Phone number may not be valid: ${cleaned.phoneNumber}`);
    }
  }

  // Validate city against known Iraqi governorates
  const cityValidation = validateIraqiCity(cleaned.city);
  if (!cityValidation.valid) {
    result.warnings.push(`City not recognized as Iraqi governorate: ${cleaned.city}`);
  } else if (cityValidation.normalized) {
    cleaned.city = cityValidation.normalized;
  }

  // Validate coordinates if provided
  if (cleaned.latitude && cleaned.longitude) {
    const coordValidation = validateCoordinatesInIraq(cleaned.latitude, cleaned.longitude);
    if (!coordValidation.valid) {
      result.warnings.push(coordValidation.error || 'Coordinates outside Iraq');
    }
  } else if (cityValidation.coordinates) {
    // Add default coordinates for city if not provided
    cleaned.latitude = cityValidation.coordinates.lat;
    cleaned.longitude = cityValidation.coordinates.lng;
    result.warnings.push(`Coordinates set to city center (${cleaned.city})`);
  }

  // Validate and clean website URL
  if (cleaned.website) {
    cleaned.website = normalizeUrl(cleaned.website);
  }

  // Validate price range format
  if (cleaned.priceRange) {
    cleaned.priceRange = normalizePriceRange(cleaned.priceRange);
  }

  // Validate rating
  if (cleaned.rating !== undefined) {
    if (cleaned.rating < 0) cleaned.rating = 0;
    if (cleaned.rating > 5) cleaned.rating = 5;
  }

  // Enhance description if too short
  if (cleaned.description.length < 20) {
    result.warnings.push('Description is very short');
  }

  result.data = cleaned;
  return result;
}

/**
 * Normalize Iraqi phone numbers to +964 format
 */
export function normalizeIraqiPhone(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert various formats to +964
  if (cleaned.startsWith('00964')) {
    cleaned = '+964' + cleaned.substring(5);
  } else if (cleaned.startsWith('964')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // 07XXXXXXXXX -> +9647XXXXXXXXX
    cleaned = '+964' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+964')) {
    cleaned = '+964' + cleaned;
  }

  return cleaned;
}

/**
 * Validate Iraqi city/governorate
 */
export function validateIraqiCity(city: string): {
  valid: boolean;
  normalized?: string;
  coordinates?: { lat: number; lng: number };
} {
  const normalized = normalizeCityName(city);
  
  for (const [key, data] of Object.entries(IRAQI_GOVERNORATES)) {
    if (data.names.some(name => name === normalized)) {
      return {
        valid: true,
        normalized: key,
        coordinates: { lat: data.lat, lng: data.lng }
      };
    }
  }

  return { valid: false };
}

/**
 * Validate coordinates are within Iraq bounds
 */
export function validateCoordinatesInIraq(lat: number, lng: number): {
  valid: boolean;
  error?: string;
} {
  // Iraq approximate bounds
  const IRAQ_BOUNDS = {
    north: 37.385,
    south: 29.061,
    east: 48.575,
    west: 38.793
  };

  if (lat < IRAQ_BOUNDS.south || lat > IRAQ_BOUNDS.north) {
    return {
      valid: false,
      error: `Latitude ${lat} is outside Iraq (${IRAQ_BOUNDS.south} to ${IRAQ_BOUNDS.north})`
    };
  }

  if (lng < IRAQ_BOUNDS.west || lng > IRAQ_BOUNDS.east) {
    return {
      valid: false,
      error: `Longitude ${lng} is outside Iraq (${IRAQ_BOUNDS.west} to ${IRAQ_BOUNDS.east})`
    };
  }

  return { valid: true };
}

/**
 * Normalize URL format
 */
export function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Add https:// if no protocol
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }

  try {
    const parsed = new URL(normalized);
    return parsed.toString();
  } catch {
    return url; // Return original if parsing fails
  }
}

/**
 * Normalize price range format
 */
export function normalizePriceRange(priceRange: string): string {
  const normalized = priceRange.trim().toUpperCase();
  
  // Convert to standard formats
  const priceMap: Record<string, string> = {
    'CHEAP': '$',
    'BUDGET': '$',
    'INEXPENSIVE': '$',
    'MODERATE': '$$',
    'MID-RANGE': '$$',
    'MIDRANGE': '$$',
    'EXPENSIVE': '$$$',
    'HIGH-END': '$$$',
    'LUXURY': '$$$$',
    'PREMIUM': '$$$$'
  };

  if (priceMap[normalized]) {
    return priceMap[normalized];
  }

  // Already in $ format
  if (/^\$+$/.test(normalized)) {
    return normalized;
  }

  // Range format like "25-50" or "IQD 25,000-50,000"
  if (normalized.match(/\d+.*-.*\d+/)) {
    return normalized;
  }

  return priceRange;
}

/**
 * Batch validate multiple venues
 */
export async function batchValidateVenues(
  venues: Partial<VenueData>[]
): Promise<{
  valid: VenueData[];
  invalid: Array<{ venue: Partial<VenueData>; errors: string[] }>;
  warnings: Array<{ venue: Partial<VenueData>; warnings: string[] }>;
}> {
  const result = {
    valid: [] as VenueData[],
    invalid: [] as Array<{ venue: Partial<VenueData>; errors: string[] }>,
    warnings: [] as Array<{ venue: Partial<VenueData>; warnings: string[] }>
  };

  for (const venue of venues) {
    const validation = await validateAndCleanVenueData(venue);
    
    if (validation.valid && validation.data) {
      result.valid.push(validation.data);
      
      if (validation.warnings.length > 0) {
        result.warnings.push({ venue, warnings: validation.warnings });
      }
    } else {
      result.invalid.push({ venue, errors: validation.errors });
    }
  }

  return result;
}

/**
 * Check for duplicates in a batch of venues
 */
export function detectDuplicates(venues: VenueData[]): {
  unique: VenueData[];
  duplicates: Array<{ original: VenueData; duplicate: VenueData }>;
} {
  const unique: VenueData[] = [];
  const duplicates: Array<{ original: VenueData; duplicate: VenueData }> = [];

  for (const venue of venues) {
    const existingDuplicate = unique.find(u => isDuplicate(u, venue));
    
    if (existingDuplicate) {
      duplicates.push({ original: existingDuplicate, duplicate: venue });
    } else {
      unique.push(venue);
    }
  }

  return { unique, duplicates };
}

/**
 * Geocode address to coordinates (placeholder - requires geocoding service)
 */
export async function geocodeAddress(address: string, city: string): Promise<{
  lat: number;
  lng: number;
} | null> {
  // Check if city has default coordinates
  const cityValidation = validateIraqiCity(city);
  
  if (cityValidation.coordinates) {
    // Return city center as fallback
    return cityValidation.coordinates;
  }

  // TODO: Integrate with actual geocoding service
  // - Google Geocoding API
  // - OpenStreetMap Nominatim
  // - Here Geocoding API
  
  return null;
}

/**
 * Extract metadata from venue data for search/filtering
 */
export function extractVenueMetadata(venue: VenueData): {
  keywords: string[];
  searchTerms: string[];
  filters: Record<string, string[]>;
} {
  const keywords: string[] = [];
  const searchTerms: string[] = [];
  const filters: Record<string, string[]> = {
    type: [venue.type],
    city: [venue.city],
    amenities: venue.amenities || [],
    tags: venue.tags || []
  };

  // Extract keywords from name and description
  const text = `${venue.name} ${venue.description}`.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 3);
  keywords.push(...new Set(words));

  // Add search terms
  searchTerms.push(venue.name.toLowerCase());
  searchTerms.push(venue.city.toLowerCase());
  if (venue.address) searchTerms.push(venue.address.toLowerCase());
  if (venue.cuisineType) searchTerms.push(venue.cuisineType.toLowerCase());

  // Price range filter
  if (venue.priceRange) {
    filters.priceRange = [venue.priceRange];
  }

  // Rating filter
  if (venue.rating) {
    const ratingTier = Math.floor(venue.rating);
    filters.rating = [`${ratingTier}+`];
  }

  return { keywords, searchTerms, filters };
}
