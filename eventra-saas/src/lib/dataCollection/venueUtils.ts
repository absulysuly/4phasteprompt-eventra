/**
 * Venue Data Collection Utilities
 * 
 * Provides helper functions for:
 * - Data validation and sanitization
 * - Format conversion and standardization
 * - Deduplication logic
 * - Data enrichment
 */

export interface VenueData {
  name: string;
  description: string;
  type: 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE';
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  website?: string;
  priceRange?: string;
  rating?: number;
  imageUrl?: string;
  amenities?: string[];
  cuisineType?: string;
  tags?: string[];
}

export interface VenueTranslation {
  locale: 'en' | 'ar' | 'ku';
  title: string;
  description: string;
  location?: string;
}

/**
 * Validates venue data structure
 */
export function validateVenueData(data: Partial<VenueData>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  if (!data.type || !['HOTEL', 'RESTAURANT', 'ACTIVITY', 'SERVICE'].includes(data.type)) {
    errors.push('Valid venue type is required (HOTEL, RESTAURANT, ACTIVITY, SERVICE)');
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.push('City is required');
  }

  // Optional field validations
  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (data.rating !== undefined && (data.rating < 0 || data.rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  if (data.phoneNumber && !isValidIraqiPhone(data.phoneNumber)) {
    errors.push('Phone number format is invalid');
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push('Website URL format is invalid');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates Iraqi phone number format
 */
export function isValidIraqiPhone(phone: string): boolean {
  // Iraqi phone formats: +964XXXXXXXXX or 07XXXXXXXXX
  const phoneRegex = /^(\+964|00964|0)?7[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes city names for consistency
 */
export function normalizeCityName(city: string): string {
  const cityMap: Record<string, string> = {
    'baghdad': 'baghdad',
    'بغداد': 'baghdad',
    'بەغدا': 'baghdad',
    'erbil': 'erbil',
    'arbil': 'erbil',
    'hewlêr': 'erbil',
    'هەولێر': 'erbil',
    'أربيل': 'erbil',
    'basra': 'basra',
    'البصرة': 'basra',
    'بەسرە': 'basra',
    'mosul': 'nineveh',
    'الموصل': 'nineveh',
    'موسڵ': 'nineveh',
    'sulaymaniyah': 'sulaymaniyah',
    'sulaimani': 'sulaymaniyah',
    'سلێمانی': 'sulaymaniyah',
    'السليمانية': 'sulaymaniyah',
    'kirkuk': 'kirkuk',
    'كركوك': 'kirkuk',
    'کەرکووک': 'kirkuk',
    'najaf': 'najaf',
    'النجف': 'najaf',
    'karbala': 'karbala',
    'كربلاء': 'karbala',
    'duhok': 'duhok',
    'دهوك': 'duhok',
    'دهۆک': 'duhok'
  };

  const normalized = city.toLowerCase().trim();
  return cityMap[normalized] || normalized;
}

/**
 * Sanitizes text input to prevent XSS
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Formats venue data for database insertion
 */
export function formatVenueForDatabase(venue: VenueData, userId: string) {
  return {
    type: venue.type,
    status: 'PENDING' as const,
    publicId: generatePublicId(venue.name),
    priceRange: venue.priceRange || null,
    businessEmail: null,
    businessPhone: venue.phoneNumber || null,
    website: venue.website || null,
    address: venue.address || null,
    city: normalizeCityName(venue.city),
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
    userId: userId
  };
}

/**
 * Generates a URL-friendly public ID
 */
export function generatePublicId(name: string): string {
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
 * Checks if two venues are duplicates based on similarity
 */
export function isDuplicate(venue1: VenueData, venue2: VenueData): boolean {
  // Check name similarity
  const nameSimilarity = calculateStringSimilarity(
    venue1.name.toLowerCase(),
    venue2.name.toLowerCase()
  );

  // Same city and very similar name = likely duplicate
  if (
    normalizeCityName(venue1.city) === normalizeCityName(venue2.city) &&
    nameSimilarity > 0.85
  ) {
    return true;
  }

  // Same location coordinates = definitely duplicate
  if (
    venue1.latitude &&
    venue1.longitude &&
    venue2.latitude &&
    venue2.longitude
  ) {
    const distance = calculateDistance(
      venue1.latitude,
      venue1.longitude,
      venue2.latitude,
      venue2.longitude
    );
    // Within 100 meters = duplicate
    if (distance < 0.1) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculates distance between two coordinates in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Enriches venue data with additional information
 */
export async function enrichVenueData(venue: VenueData): Promise<VenueData> {
  // Add default image based on type if none provided
  if (!venue.imageUrl) {
    venue.imageUrl = getDefaultImage(venue.type);
  }

  // Add default tags based on type
  if (!venue.tags || venue.tags.length === 0) {
    venue.tags = getDefaultTags(venue.type);
  }

  // Add default amenities for hotels
  if (venue.type === 'HOTEL' && (!venue.amenities || venue.amenities.length === 0)) {
    venue.amenities = ['WiFi', 'Parking', 'Reception'];
  }

  return venue;
}

function getDefaultImage(type: string): string {
  const defaults: Record<string, string> = {
    HOTEL: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    RESTAURANT: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    ACTIVITY: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    SERVICE: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df'
  };
  return defaults[type] || defaults.SERVICE;
}

function getDefaultTags(type: string): string[] {
  const tagMap: Record<string, string[]> = {
    HOTEL: ['accommodation', 'lodging', 'hotel'],
    RESTAURANT: ['dining', 'food', 'restaurant'],
    ACTIVITY: ['tourism', 'attractions', 'activities'],
    SERVICE: ['service', 'business']
  };
  return tagMap[type] || [];
}

/**
 * Batch processes multiple venues with deduplication
 */
export function deduplicateVenues(venues: VenueData[]): VenueData[] {
  const unique: VenueData[] = [];
  
  for (const venue of venues) {
    const isDupe = unique.some(existing => isDuplicate(venue, existing));
    if (!isDupe) {
      unique.push(venue);
    }
  }
  
  return unique;
}
