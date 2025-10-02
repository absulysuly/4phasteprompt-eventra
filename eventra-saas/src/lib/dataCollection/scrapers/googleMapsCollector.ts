/**
 * Google Maps Places API Collector
 * 
 * Collects venue data from Google Maps Places API for Iraqi locations
 * 
 * Setup Instructions:
 * 1. Get API key from https://console.cloud.google.com/
 * 2. Enable Places API
 * 3. Add to .env: GOOGLE_PLACES_API_KEY=your_key_here
 * 
 * Rate Limits:
 * - Free tier: 28,500 requests/month
 * - Consider caching and batching requests
 */

import { VenueData } from '../venueUtils';

export interface GoogleMapsConfig {
  city: string;
  governorate: string;
  types: string[]; // e.g., ['hotel', 'restaurant', 'cafe', 'tourist_attraction']
  radius: number; // Search radius in meters
  coordinates: { lat: number; lng: number };
  apiKey?: string;
}

/**
 * Collect venues from Google Maps Places API
 */
export async function collectGoogleMapsVenues(
  config: GoogleMapsConfig
): Promise<VenueData[]> {
  const apiKey = config.apiKey || process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey || apiKey === 'your_key_here' || apiKey === 'disabled') {
    console.log('⚠️  Google Places API key not configured');
    console.log('   Set GOOGLE_PLACES_API_KEY in .env to enable');
    return getMockVenues(config); // Return mock data for testing
  }

  console.log(`🗺️  Collecting venues from Google Maps: ${config.city}`);
  
  const venues: VenueData[] = [];

  try {
    // Collect venues for each type
    for (const type of config.types) {
      console.log(`   Searching for: ${type}`);
      
      const typeVenues = await searchPlacesByType(
        config.coordinates,
        config.radius,
        type,
        apiKey
      );
      
      venues.push(...typeVenues);
      console.log(`   Found ${typeVenues.length} ${type}(s)`);
      
      // Rate limiting - wait between requests
      await sleep(1000);
    }

    console.log(`✅ Collected ${venues.length} total venues from Google Maps`);
    return venues;
  } catch (error: any) {
    console.error(`❌ Google Maps API error: ${error.message}`);
    throw error;
  }
}

/**
 * Search Google Places API by type
 */
async function searchPlacesByType(
  coordinates: { lat: number; lng: number },
  radius: number,
  type: string,
  apiKey: string
): Promise<VenueData[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${coordinates.lat},${coordinates.lng}`);
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('type', type);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API returned status: ${data.status}`);
  }

  const venues: VenueData[] = [];

  for (const place of data.results || []) {
    try {
      const venue = await convertGooglePlaceToVenue(place, type, apiKey);
      venues.push(venue);
    } catch (error: any) {
      console.error(`   ⚠️  Failed to convert place: ${place.name} - ${error.message}`);
    }
  }

  return venues;
}

/**
 * Convert Google Place to VenueData format
 */
async function convertGooglePlaceToVenue(
  place: any,
  searchType: string,
  apiKey: string
): Promise<VenueData> {
  // Get detailed place information
  const details = await getPlaceDetails(place.place_id, apiKey);

  // Map Google place type to our venue type
  const venueType = mapGoogleTypeToVenueType(searchType, place.types || []);

  // Extract amenities from place types
  const amenities = extractAmenities(place.types || [], details);

  // Build description
  const description = details.editorial_summary?.overview ||
    details.description ||
    `${place.name} in ${details.vicinity || place.vicinity}`;

  const venue: VenueData = {
    name: place.name,
    description: description,
    type: venueType,
    city: extractCity(details.address_components || []),
    address: details.formatted_address || details.vicinity || place.vicinity,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    phoneNumber: details.formatted_phone_number || details.international_phone_number,
    website: details.website,
    priceRange: mapPriceLevel(place.price_level),
    rating: place.rating,
    imageUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0], apiKey) : undefined,
    amenities,
    cuisineType: extractCuisineType(place.types || []),
    tags: extractTags(place.types || [])
  };

  return venue;
}

/**
 * Get detailed place information
 */
async function getPlaceDetails(placeId: string, apiKey: string): Promise<any> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,international_phone_number,website,address_components,editorial_summary,description');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Place details API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Place details returned status: ${data.status}`);
  }

  return data.result || {};
}

/**
 * Get photo URL from Google Places
 */
function getPhotoUrl(photo: any, apiKey: string): string {
  const maxWidth = 1200;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photo.photo_reference}&key=${apiKey}`;
}

/**
 * Map Google place type to our venue type
 */
function mapGoogleTypeToVenueType(
  searchType: string,
  types: string[]
): 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE' {
  const typeMap: Record<string, 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE'> = {
    'lodging': 'HOTEL',
    'hotel': 'HOTEL',
    'restaurant': 'RESTAURANT',
    'cafe': 'RESTAURANT',
    'bar': 'RESTAURANT',
    'food': 'RESTAURANT',
    'tourist_attraction': 'ACTIVITY',
    'museum': 'ACTIVITY',
    'park': 'ACTIVITY',
    'amusement_park': 'ACTIVITY',
    'zoo': 'ACTIVITY',
    'aquarium': 'ACTIVITY',
    'art_gallery': 'ACTIVITY',
    'shopping_mall': 'SERVICE',
    'spa': 'SERVICE',
    'gym': 'SERVICE',
    'beauty_salon': 'SERVICE'
  };

  // Check search type first
  if (typeMap[searchType]) {
    return typeMap[searchType];
  }

  // Then check place types
  for (const type of types) {
    if (typeMap[type]) {
      return typeMap[type];
    }
  }

  return 'SERVICE';
}

/**
 * Extract city from address components
 */
function extractCity(addressComponents: any[]): string {
  for (const component of addressComponents) {
    if (component.types.includes('locality') || 
        component.types.includes('administrative_area_level_1')) {
      return component.long_name;
    }
  }
  return 'Unknown';
}

/**
 * Extract amenities from place types and details
 */
function extractAmenities(types: string[], details: any): string[] {
  const amenities: string[] = [];

  const amenityMap: Record<string, string> = {
    'parking': 'Parking',
    'wheelchair_accessible_entrance': 'Wheelchair Accessible',
    'wifi': 'WiFi',
    'outdoor_seating': 'Outdoor Seating',
    'takeout': 'Takeout',
    'delivery': 'Delivery',
    'reservable': 'Reservations',
    'serves_breakfast': 'Breakfast',
    'serves_lunch': 'Lunch',
    'serves_dinner': 'Dinner',
    'bar': 'Bar',
    'gym': 'Gym',
    'spa': 'Spa',
    'pool': 'Pool',
    'air_conditioning': 'Air Conditioning'
  };

  for (const type of types) {
    if (amenityMap[type]) {
      amenities.push(amenityMap[type]);
    }
  }

  return [...new Set(amenities)];
}

/**
 * Extract cuisine type from place types
 */
function extractCuisineType(types: string[]): string | undefined {
  const cuisineTypes: Record<string, string> = {
    'italian_restaurant': 'Italian',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'mexican_restaurant': 'Mexican',
    'indian_restaurant': 'Indian',
    'middle_eastern_restaurant': 'Middle Eastern',
    'mediterranean_restaurant': 'Mediterranean',
    'american_restaurant': 'American',
    'french_restaurant': 'French',
    'thai_restaurant': 'Thai',
    'korean_restaurant': 'Korean',
    'vietnamese_restaurant': 'Vietnamese',
    'turkish_restaurant': 'Turkish',
    'lebanese_restaurant': 'Lebanese',
    'iraqi_restaurant': 'Iraqi',
    'kurdish_restaurant': 'Kurdish',
    'fast_food_restaurant': 'Fast Food',
    'cafe': 'Cafe',
    'bakery': 'Bakery',
    'seafood_restaurant': 'Seafood',
    'steakhouse': 'Steakhouse',
    'vegetarian_restaurant': 'Vegetarian',
    'vegan_restaurant': 'Vegan'
  };

  for (const type of types) {
    if (cuisineTypes[type]) {
      return cuisineTypes[type];
    }
  }

  return undefined;
}

/**
 * Extract tags from place types
 */
function extractTags(types: string[]): string[] {
  return types
    .filter(t => !t.includes('establishment') && !t.includes('point_of_interest'))
    .map(t => t.replace(/_/g, ' '))
    .slice(0, 5);
}

/**
 * Map Google price level to our format
 */
function mapPriceLevel(priceLevel?: number): string | undefined {
  if (priceLevel === undefined || priceLevel === null) return undefined;
  
  const priceMap: Record<number, string> = {
    0: 'Free',
    1: '$',
    2: '$$',
    3: '$$$',
    4: '$$$$'
  };

  return priceMap[priceLevel];
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate mock venues for testing (when API key not available)
 */
function getMockVenues(config: GoogleMapsConfig): VenueData[] {
  console.log('   📝 Using mock data for testing');
  
  const mockVenues: VenueData[] = [
    {
      name: `${config.city} Grand Hotel`,
      description: `Luxury hotel in the heart of ${config.city} with modern amenities and excellent service`,
      type: 'HOTEL',
      city: config.governorate,
      address: `123 Main Street, ${config.city}`,
      latitude: config.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: config.coordinates.lng + (Math.random() - 0.5) * 0.1,
      phoneNumber: '+9647901234567',
      website: `https://example-hotel-${config.governorate}.com`,
      priceRange: '$$$',
      rating: 4.5,
      amenities: ['WiFi', 'Parking', 'Pool', 'Gym', 'Restaurant'],
      tags: ['luxury', 'business', 'central']
    },
    {
      name: `${config.city} Traditional Restaurant`,
      description: `Authentic Iraqi cuisine with traditional atmosphere and live music on weekends`,
      type: 'RESTAURANT',
      city: config.governorate,
      address: `45 Restaurant Street, ${config.city}`,
      latitude: config.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: config.coordinates.lng + (Math.random() - 0.5) * 0.1,
      phoneNumber: '+9647507654321',
      priceRange: '$$',
      rating: 4.7,
      cuisineType: 'Iraqi',
      amenities: ['Outdoor Seating', 'WiFi', 'Reservations'],
      tags: ['traditional', 'local', 'family-friendly']
    },
    {
      name: `${config.city} Cultural Center`,
      description: `Museum and cultural center showcasing ${config.city}'s rich history and heritage`,
      type: 'ACTIVITY',
      city: config.governorate,
      address: `Cultural District, ${config.city}`,
      latitude: config.coordinates.lat + (Math.random() - 0.5) * 0.1,
      longitude: config.coordinates.lng + (Math.random() - 0.5) * 0.1,
      phoneNumber: '+9647809876543',
      priceRange: '$',
      rating: 4.3,
      amenities: ['Parking', 'Wheelchair Accessible', 'Guided Tours'],
      tags: ['culture', 'museum', 'education', 'tourism']
    }
  ];

  return mockVenues;
}

/**
 * Placeholder collectors for other sources
 */
export async function collectFacebookEvents(config: any): Promise<VenueData[]> {
  console.log('⚠️  Facebook collector not yet implemented');
  console.log('   Requires Facebook Graph API access');
  return [];
}

export async function collectInstagramVenues(config: any): Promise<VenueData[]> {
  console.log('⚠️  Instagram collector not yet implemented');
  console.log('   Requires Instagram API access');
  return [];
}
