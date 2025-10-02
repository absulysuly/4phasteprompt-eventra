/**
 * Enhanced Google Maps Collector for Iraq Discovery
 * 
 * Collects comprehensive data for all 8 categories from Google Maps Places API
 * Handles: Accommodation, Restaurants/Cafes, Tourism, Shopping, Services, Companies, Government, Events
 */

import { 
  Category, 
  IraqDiscoveryPlace, 
  Governorate,
  PriceRange,
  OpeningHours,
  TimeRange
} from './iraqDiscoverySchema';

// ========================================
// GOOGLE MAPS TYPE MAPPINGS
// ========================================

const GOOGLE_TYPE_TO_CATEGORY: Record<string, { category: Category; subcategory: string }> = {
  // Accommodation
  'lodging': { category: 'Accommodation', subcategory: 'Hotels' },
  'hotel': { category: 'Accommodation', subcategory: 'Hotels' },
  'hostel': { category: 'Accommodation', subcategory: 'Hostels' },
  'guest_house': { category: 'Accommodation', subcategory: 'Guesthouses' },
  
  // Cafe & Restaurants
  'restaurant': { category: 'Cafe & Restaurants', subcategory: 'Restaurants' },
  'cafe': { category: 'Cafe & Restaurants', subcategory: 'Cafes' },
  'coffee_shop': { category: 'Cafe & Restaurants', subcategory: 'Cafes' },
  'fast_food': { category: 'Cafe & Restaurants', subcategory: 'Fast Food' },
  'food': { category: 'Cafe & Restaurants', subcategory: 'Restaurants' },
  
  // Tourism
  'tourist_attraction': { category: 'Tourism', subcategory: 'Landmark' },
  'museum': { category: 'Tourism', subcategory: 'Museum' },
  'park': { category: 'Tourism', subcategory: 'Park' },
  'art_gallery': { category: 'Tourism', subcategory: 'Cultural Site' },
  'zoo': { category: 'Tourism', subcategory: 'Activity Center' },
  'aquarium': { category: 'Tourism', subcategory: 'Activity Center' },
  'amusement_park': { category: 'Tourism', subcategory: 'Activity Center' },
  'historic_site': { category: 'Tourism', subcategory: 'Cultural Site' },
  
  // Shopping
  'shopping_mall': { category: 'Shopping', subcategory: 'Shopping Mall' },
  'store': { category: 'Shopping', subcategory: 'Retail Store' },
  'supermarket': { category: 'Shopping', subcategory: 'Supermarket' },
  'clothing_store': { category: 'Shopping', subcategory: 'Boutique' },
  'electronics_store': { category: 'Shopping', subcategory: 'Retail Store' },
  'jewelry_store': { category: 'Shopping', subcategory: 'Boutique' },
  'book_store': { category: 'Shopping', subcategory: 'Retail Store' },
  'convenience_store': { category: 'Shopping', subcategory: 'Retail Store' },
  
  // Services
  'hospital': { category: 'Services', subcategory: 'Health' },
  'doctor': { category: 'Services', subcategory: 'Health' },
  'dentist': { category: 'Services', subcategory: 'Health' },
  'pharmacy': { category: 'Services', subcategory: 'Health' },
  'bank': { category: 'Services', subcategory: 'Financial' },
  'atm': { category: 'Services', subcategory: 'Financial' },
  'lawyer': { category: 'Services', subcategory: 'Legal' },
  'school': { category: 'Services', subcategory: 'Education' },
  'university': { category: 'Services', subcategory: 'Education' },
  'car_repair': { category: 'Services', subcategory: 'Repair' },
  'laundry': { category: 'Services', subcategory: 'Professional' },
  'beauty_salon': { category: 'Services', subcategory: 'Professional' },
  'hair_care': { category: 'Services', subcategory: 'Professional' },
  'spa': { category: 'Services', subcategory: 'Professional' },
  
  // Government Offices
  'local_government_office': { category: 'Government Offices', subcategory: 'Municipality' },
  'post_office': { category: 'Government Offices', subcategory: 'Municipal Services' },
  'police': { category: 'Government Offices', subcategory: 'Police Station' },
  'courthouse': { category: 'Government Offices', subcategory: 'Court' },
  
  // Companies (catch-all for business)
  'establishment': { category: 'Companies', subcategory: 'Business' },
  'point_of_interest': { category: 'Companies', subcategory: 'Business' },
};

// ========================================
// COLLECTOR CONFIG
// ========================================

export interface CollectorConfig {
  city: string;
  governorate: Governorate;
  categories: Category[];
  radius: number; // meters
  coordinates: { lat: number; lng: number };
  max_results_per_category?: number;
}

// ========================================
// COLLECTOR IMPLEMENTATION
// ========================================

export async function collectIraqDiscoveryPlaces(
  config: CollectorConfig
): Promise<IraqDiscoveryPlace[]> {
  console.log(`🔍 Collecting data for ${config.city} (${config.governorate})`);
  console.log(`   Categories: ${config.categories.join(', ')}`);
  
  const allPlaces: IraqDiscoveryPlace[] = [];
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  GOOGLE_PLACES_API_KEY not configured - using mock data');
    return generateMockData(config);
  }
  
  for (const category of config.categories) {
    const categoryPlaces = await collectCategory(config, category, apiKey);
    allPlaces.push(...categoryPlaces);
    console.log(`   ✓ ${category}: ${categoryPlaces.length} places`);
    
    // Rate limiting: wait 1 second between categories
    await sleep(1000);
  }
  
  console.log(`✅ Total collected: ${allPlaces.length} places`);
  return allPlaces;
}

async function collectCategory(
  config: CollectorConfig,
  category: Category,
  apiKey: string
): Promise<IraqDiscoveryPlace[]> {
  const places: IraqDiscoveryPlace[] = [];
  const searchTypes = getCategorySearchTypes(category);
  
  for (const type of searchTypes) {
    try {
      const results = await searchGooglePlaces(
        config.coordinates,
        type,
        config.radius,
        apiKey
      );
      
      for (const result of results) {
        const place = await convertToIraqDiscoveryPlace(result, category, config.governorate, apiKey);
        if (place) {
          places.push(place);
        }
      }
      
      // Rate limiting
      await sleep(500);
    } catch (error: any) {
      console.error(`   ⚠️  Error collecting ${type}: ${error.message}`);
    }
  }
  
  return places;
}

function getCategorySearchTypes(category: Category): string[] {
  const mapping: Record<Category, string[]> = {
    'Accommodation': ['lodging', 'hotel'],
    'Cafe & Restaurants': ['restaurant', 'cafe', 'food'],
    'Events': ['event_venue', 'convention_center', 'stadium'],
    'Tourism': ['tourist_attraction', 'museum', 'park', 'historic_site'],
    'Government Offices': ['local_government_office', 'post_office', 'police', 'courthouse'],
    'Services': ['hospital', 'bank', 'school', 'pharmacy', 'lawyer'],
    'Companies': ['establishment'],
    'Shopping': ['shopping_mall', 'store', 'supermarket'],
  };
  
  return mapping[category] || ['establishment'];
}

async function searchGooglePlaces(
  location: { lat: number; lng: number },
  type: string,
  radius: number,
  apiKey: string
): Promise<any[]> {
  // Using Places API (New)  - Text Search
  const url = `https://places.googleapis.com/v1/places:searchText`;
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.rating',
      'places.userRatingCount',
      'places.priceLevel',
      'places.types',
      'places.phoneNumber',
      'places.websiteUri',
      'places.businessStatus',
      'places.regularOpeningHours',
      'places.photos'
    ].join(',')
  };
  
  const body = {
    textQuery: `${type} in area`,
    locationBias: {
      circle: {
        center: {
          latitude: location.lat,
          longitude: location.lng
        },
        radius: radius
      }
    },
    maxResultCount: 20
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error(`Failed to fetch from Google Places API: ${error}`);
    return [];
  }
}

async function convertToIraqDiscoveryPlace(
  googlePlace: any,
  category: Category,
  governorate: Governorate,
  apiKey: string
): Promise<IraqDiscoveryPlace | null> {
  try {
    const id = `${governorate}_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine subcategory from Google types
    let subcategory = 'General';
    for (const type of googlePlace.types || []) {
      if (GOOGLE_TYPE_TO_CATEGORY[type]) {
        subcategory = GOOGLE_TYPE_TO_CATEGORY[type].subcategory;
        break;
      }
    }
    
    // Universal fields
    const universalFields = {
      id,
      name: googlePlace.displayName?.text || 'Unknown',
      canonical_category: category,
      subcategory,
      tags: googlePlace.types || [],
      address: {
        street: googlePlace.formattedAddress || '',
        city: extractCity(googlePlace.formattedAddress),
        governorate,
      },
      latitude: googlePlace.location?.latitude || 0,
      longitude: googlePlace.location?.longitude || 0,
      phone: googlePlace.phoneNumber,
      website: googlePlace.websiteUri,
      opening_hours: convertOpeningHours(googlePlace.regularOpeningHours),
      price_range: convertPriceLevel(googlePlace.priceLevel) as PriceRange,
      rating: googlePlace.rating,
      rating_count: googlePlace.userRatingCount,
      images: extractImages(googlePlace.photos || [], apiKey),
      featured_image: extractImages(googlePlace.photos || [], apiKey)[0],
      languages_supported: ['en', 'ar'],
      description: generateDescription(googlePlace, category),
      accessibility: {
        wheelchair_accessible: undefined,
        family_friendly: true,
        parking_available: undefined,
      },
      source_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googlePlace.displayName?.text || '')}`,
      source_type: 'google_maps' as const,
      license: 'Google Maps Platform',
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    
    // Category-specific data
    const categoryData = generateCategoryData(googlePlace, category);
    
    return {
      ...universalFields,
      canonical_category: category,
      category_data: categoryData,
    } as IraqDiscoveryPlace;
    
  } catch (error: any) {
    console.error(`Failed to convert place: ${error.message}`);
    return null;
  }
}

function generateCategoryData(googlePlace: any, category: Category): any {
  switch (category) {
    case 'Accommodation':
      return {
        star_rating: estimateStarRating(googlePlace.rating, googlePlace.priceLevel),
        amenities: ['WiFi', 'AC', 'Reception'],
      };
      
    case 'Cafe & Restaurants':
      return {
        cuisine_types: ['Local', 'International'],
        delivery_available: false,
        takeout_available: true,
      };
      
    case 'Tourism':
      return {
        tourism_type: 'Landmark',
        entry_fee: { free: true },
      };
      
    case 'Shopping':
      return {
        store_type: 'Retail Store',
        main_products: ['General'],
        payment_methods: ['Cash', 'Credit Card'],
      };
      
    case 'Services':
      return {
        primary_service_type: 'Professional',
        subcategory: 'General',
      };
      
    case 'Government Offices':
      return {
        office_type: 'Municipal Services',
        services_offered: ['General Services'],
      };
      
    case 'Companies':
      return {
        industry: 'Other',
        services_products: ['General'],
      };
      
    case 'Events':
      return {
        event_type: 'Conference',
        start_datetime: new Date().toISOString(),
        end_datetime: new Date().toISOString(),
        venue_name: googlePlace.displayName?.text || 'Unknown',
        organizer: { name: 'Unknown' },
      };
      
    default:
      return {};
  }
}

function convertOpeningHours(hours: any): OpeningHours | undefined {
  if (!hours || !hours.weekdayDescriptions) return undefined;
  
  // Simplified parsing - would need more robust implementation
  return {
    monday: [{ open: '09:00', close: '18:00' }],
    tuesday: [{ open: '09:00', close: '18:00' }],
    wednesday: [{ open: '09:00', close: '18:00' }],
    thursday: [{ open: '09:00', close: '18:00' }],
    friday: [{ open: '09:00', close: '14:00' }],
    saturday: [{ open: '09:00', close: '18:00' }],
    sunday: [{ open: '09:00', close: '18:00' }],
  };
}

function convertPriceLevel(priceLevel: string | undefined): string {
  const mapping: Record<string, string> = {
    'PRICE_LEVEL_FREE': 'free',
    'PRICE_LEVEL_INEXPENSIVE': 'low',
    'PRICE_LEVEL_MODERATE': 'medium',
    'PRICE_LEVEL_EXPENSIVE': 'high',
    'PRICE_LEVEL_VERY_EXPENSIVE': 'very_high',
  };
  return priceLevel ? mapping[priceLevel] || 'medium' : 'medium';
}

function estimateStarRating(rating: number | undefined, priceLevel: string | undefined): 0 | 1 | 2 | 3 | 4 | 5 {
  if (!rating) return 3;
  if (rating >= 4.5) return 5;
  if (rating >= 4.0) return 4;
  if (rating >= 3.5) return 3;
  if (rating >= 3.0) return 2;
  return 1;
}

function extractImages(photos: any[], apiKey: string): string[] {
  return photos.slice(0, 5).map((photo: any) => {
    return `https://places.googleapis.com/v1/${photo.name}/media?key=${apiKey}&maxHeightPx=800`;
  });
}

function extractCity(address: string | undefined): string {
  if (!address) return 'Unknown';
  // Simple city extraction - would need more robust implementation
  const parts = address.split(',');
  return parts[parts.length - 2]?.trim() || 'Unknown';
}

function generateDescription(place: any, category: Category): string {
  const name = place.displayName?.text || 'This place';
  const rating = place.rating ? `Rated ${place.rating}/5` : '';
  const location = place.formattedAddress || '';
  
  return `${name} is a ${category.toLowerCase()} located at ${location}. ${rating}`.trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// MOCK DATA GENERATOR
// ========================================

function generateMockData(config: CollectorConfig): IraqDiscoveryPlace[] {
  console.log('📦 Generating mock data...');
  
  const mockPlaces: IraqDiscoveryPlace[] = [];
  
  for (const category of config.categories) {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 places per category
    
    for (let i = 0; i < count; i++) {
      const place = generateMockPlace(category, config.governorate, config.city, i);
      mockPlaces.push(place);
    }
  }
  
  return mockPlaces;
}

function generateMockPlace(
  category: Category,
  governorate: Governorate,
  city: string,
  index: number
): IraqDiscoveryPlace {
  const id = `mock_${governorate}_${category}_${index}`;
  
  const base = {
    id,
    name: `${category} ${index + 1} - ${city}`,
    canonical_category: category,
    subcategory: 'Mock',
    tags: ['mock', category.toLowerCase()],
    address: {
      street: `Street ${index + 1}`,
      city,
      governorate,
    },
    latitude: 33.3 + Math.random() * 0.1,
    longitude: 44.4 + Math.random() * 0.1,
    phone: '+9647901234567',
    website: `https://example.com/${id}`,
    price_range: 'medium' as PriceRange,
    rating: 4 + Math.random(),
    rating_count: Math.floor(Math.random() * 100) + 10,
    images: ['https://via.placeholder.com/800x600'],
    languages_supported: ['en', 'ar'],
    description: `This is a mock ${category} for testing purposes in ${city}.`,
    accessibility: {
      wheelchair_accessible: true,
      family_friendly: true,
    },
    source_type: 'google_maps' as const,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  
  const categoryData = generateCategoryData({}, category);
  
  return {
    ...base,
    category_data: categoryData,
  } as IraqDiscoveryPlace;
}
