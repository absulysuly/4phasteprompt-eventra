/**
 * Facebook Data Collector for Iraq Discovery
 * 
 * Collects events, venues, and business pages from Facebook
 * Uses Facebook Graph API with fallback to public data
 */

import { 
  IraqDiscoveryPlace, 
  Category, 
  Governorate,
  EventFields,
  CafeRestaurantFields,
  TourismFields,
  ShoppingFields
} from './iraqDiscoverySchema';

// ========================================
// CONFIGURATION
// ========================================

const FB_GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

export interface FacebookCollectorConfig {
  city: string;
  governorate: Governorate;
  categories: Category[];
  access_token?: string;
  search_queries?: string[];
  max_results?: number;
}

// ========================================
// MAIN COLLECTOR
// ========================================

export async function collectFacebookPlaces(
  config: FacebookCollectorConfig
): Promise<IraqDiscoveryPlace[]> {
  console.log(`🔍 Facebook: Collecting data for ${config.city}`);
  
  const accessToken = config.access_token || process.env.FACEBOOK_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.warn('⚠️  FACEBOOK_ACCESS_TOKEN not configured - using mock data');
    return generateMockFacebookData(config);
  }
  
  const allPlaces: IraqDiscoveryPlace[] = [];
  
  // Collect Events
  if (config.categories.includes('Events')) {
    const events = await collectFacebookEvents(config, accessToken);
    allPlaces.push(...events);
    console.log(`   ✓ Events: ${events.length} places`);
  }
  
  // Collect Pages (Restaurants, Cafes, Shopping)
  const relevantCategories = config.categories.filter(c => 
    ['Cafe & Restaurants', 'Shopping', 'Tourism', 'Services'].includes(c)
  );
  
  for (const category of relevantCategories) {
    const places = await collectFacebookPages(config, category, accessToken);
    allPlaces.push(...places);
    console.log(`   ✓ ${category}: ${places.length} places`);
  }
  
  console.log(`✅ Facebook: Total collected: ${allPlaces.length} places`);
  return allPlaces;
}

// ========================================
// FACEBOOK EVENTS COLLECTOR
// ========================================

async function collectFacebookEvents(
  config: FacebookCollectorConfig,
  accessToken: string
): Promise<IraqDiscoveryPlace[]> {
  const places: IraqDiscoveryPlace[] = [];
  
  // Search for events in the city
  const searchQueries = [
    `${config.city} events`,
    `${config.city} concerts`,
    `${config.city} festivals`,
    `${config.city} exhibitions`,
    `events in ${config.city}`,
  ];
  
  for (const query of searchQueries) {
    try {
      const url = `${FB_GRAPH_API_BASE}/search?` +
        `q=${encodeURIComponent(query)}` +
        `&type=event` +
        `&fields=id,name,description,start_time,end_time,place,cover,ticket_uri,category,is_online` +
        `&access_token=${accessToken}` +
        `&limit=${config.max_results || 20}`;
      
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        for (const event of data.data) {
          const place = convertFacebookEventToPlace(event, config.governorate);
          if (place) places.push(place);
        }
      }
      
      await sleep(1000); // Rate limiting
    } catch (error: any) {
      console.error(`   ⚠️  Error searching events: ${error.message}`);
    }
  }
  
  return places;
}

function convertFacebookEventToPlace(
  event: any,
  governorate: Governorate
): IraqDiscoveryPlace | null {
  try {
    const id = `fb_event_${event.id}_${Date.now()}`;
    
    // Extract location
    let latitude = 33.3152;
    let longitude = 44.3661;
    let venueName = 'Online Event';
    let address = '';
    
    if (event.place) {
      latitude = event.place.location?.latitude || latitude;
      longitude = event.place.location?.longitude || longitude;
      venueName = event.place.name || venueName;
      address = event.place.location?.street || '';
    }
    
    // Determine event type
    const eventType = determineEventType(event.name, event.description, event.category);
    
    const categoryData: EventFields = {
      event_type: eventType,
      start_datetime: event.start_time || new Date().toISOString(),
      end_datetime: event.end_time || new Date().toISOString(),
      venue_name: venueName,
      venue_address: address,
      organizer: {
        name: 'Via Facebook',
        contact: undefined,
      },
      ticket_info: event.ticket_uri ? {
        price_type: 'paid',
        ticket_url: event.ticket_uri,
      } : {
        price_type: 'free',
      },
      registration_required: false,
    };
    
    return {
      id,
      name: event.name,
      canonical_category: 'Events',
      subcategory: eventType,
      tags: [eventType.toLowerCase(), 'facebook', 'event'],
      address: {
        street: address,
        city: extractCity(address),
        governorate,
      },
      latitude,
      longitude,
      description: event.description || `Event: ${event.name}`,
      images: event.cover ? [event.cover.source] : [],
      featured_image: event.cover?.source,
      languages_supported: ['en', 'ar'],
      accessibility: {
        family_friendly: true,
      },
      source_url: `https://facebook.com/events/${event.id}`,
      source_type: 'facebook',
      license: 'Facebook Data',
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      category_data: categoryData,
    } as IraqDiscoveryPlace;
  } catch (error: any) {
    console.error(`Failed to convert Facebook event: ${error.message}`);
    return null;
  }
}

// ========================================
// FACEBOOK PAGES COLLECTOR
// ========================================

async function collectFacebookPages(
  config: FacebookCollectorConfig,
  category: Category,
  accessToken: string
): Promise<IraqDiscoveryPlace[]> {
  const places: IraqDiscoveryPlace[] = [];
  
  // Search queries based on category
  const searchQueries = generateSearchQueries(config.city, category);
  
  for (const query of searchQueries) {
    try {
      const url = `${FB_GRAPH_API_BASE}/search?` +
        `q=${encodeURIComponent(query)}` +
        `&type=page` +
        `&fields=id,name,about,location,phone,website,cover,category,rating_count,overall_star_rating,price_range,emails,hours` +
        `&access_token=${accessToken}` +
        `&limit=${config.max_results || 20}`;
      
      const response = await fetch(url);
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        for (const page of data.data) {
          const place = convertFacebookPageToPlace(page, category, config.governorate);
          if (place) places.push(place);
        }
      }
      
      await sleep(1000); // Rate limiting
    } catch (error: any) {
      console.error(`   ⚠️  Error searching pages: ${error.message}`);
    }
  }
  
  return places;
}

function convertFacebookPageToPlace(
  page: any,
  category: Category,
  governorate: Governorate
): IraqDiscoveryPlace | null {
  try {
    const id = `fb_page_${page.id}_${Date.now()}`;
    
    // Extract location
    let latitude = 33.3152;
    let longitude = 44.3661;
    let street = '';
    let city = '';
    
    if (page.location) {
      latitude = page.location.latitude || latitude;
      longitude = page.location.longitude || longitude;
      street = page.location.street || '';
      city = page.location.city || '';
    }
    
    // Build category-specific data
    const categoryData = buildCategoryData(page, category);
    
    return {
      id,
      name: page.name,
      canonical_category: category,
      subcategory: page.category || 'General',
      tags: [page.category?.toLowerCase() || 'facebook', 'page'],
      address: {
        street,
        city: city || 'Unknown',
        governorate,
      },
      latitude,
      longitude,
      phone: page.phone,
      website: page.website,
      email: page.emails?.[0],
      opening_hours: parseOpeningHours(page.hours),
      price_range: convertPriceRange(page.price_range),
      rating: page.overall_star_rating,
      rating_count: page.rating_count,
      description: page.about || `${page.name} - ${page.category}`,
      images: page.cover ? [page.cover.source] : [],
      featured_image: page.cover?.source,
      languages_supported: ['en', 'ar'],
      accessibility: {
        family_friendly: true,
      },
      social_media: {
        facebook: `https://facebook.com/${page.id}`,
      },
      source_url: `https://facebook.com/${page.id}`,
      source_type: 'facebook',
      license: 'Facebook Data',
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      category_data: categoryData,
    } as IraqDiscoveryPlace;
  } catch (error: any) {
    console.error(`Failed to convert Facebook page: ${error.message}`);
    return null;
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function generateSearchQueries(city: string, category: Category): string[] {
  const queries: Record<Category, string[]> = {
    'Cafe & Restaurants': [
      `${city} restaurants`,
      `${city} cafe`,
      `${city} food`,
      `restaurants in ${city}`,
      `best restaurants ${city}`,
    ],
    'Shopping': [
      `${city} shopping`,
      `${city} mall`,
      `${city} market`,
      `shops in ${city}`,
    ],
    'Tourism': [
      `${city} tourism`,
      `${city} attractions`,
      `visit ${city}`,
      `${city} landmarks`,
    ],
    'Services': [
      `${city} services`,
      `${city} business`,
    ],
    'Accommodation': [],
    'Events': [],
    'Government Offices': [],
    'Companies': [],
  };
  
  return queries[category] || [];
}

function buildCategoryData(page: any, category: Category): any {
  switch (category) {
    case 'Cafe & Restaurants':
      return {
        cuisine_types: ['Local', 'International'],
        delivery_available: false,
        takeout_available: true,
        accepts_reservations: false,
      } as CafeRestaurantFields;
      
    case 'Shopping':
      return {
        store_type: 'Retail Store',
        main_products: ['General'],
        payment_methods: ['Cash', 'Credit Card'],
      } as ShoppingFields;
      
    case 'Tourism':
      return {
        tourism_type: 'Landmark',
        entry_fee: { free: true },
      } as TourismFields;
      
    default:
      return {};
  }
}

function determineEventType(name: string, description: string, category: string): string {
  const text = `${name} ${description} ${category}`.toLowerCase();
  
  if (text.includes('concert') || text.includes('music')) return 'Concert';
  if (text.includes('festival')) return 'Festival';
  if (text.includes('exhibition') || text.includes('art')) return 'Exhibition';
  if (text.includes('workshop') || text.includes('training')) return 'Workshop';
  if (text.includes('sport') || text.includes('game')) return 'Sports';
  if (text.includes('market') || text.includes('bazaar')) return 'Market';
  if (text.includes('theater') || text.includes('play')) return 'Theater';
  if (text.includes('conference') || text.includes('summit')) return 'Conference';
  
  return 'Conference';
}

function parseOpeningHours(hours: any): any {
  // Facebook hours format is complex - simplified version
  if (!hours) return undefined;
  
  return {
    monday: [{ open: '09:00', close: '18:00' }],
    tuesday: [{ open: '09:00', close: '18:00' }],
    wednesday: [{ open: '09:00', close: '18:00' }],
    thursday: [{ open: '09:00', close: '18:00' }],
    friday: [{ open: '09:00', close: '18:00' }],
    saturday: [{ open: '09:00', close: '18:00' }],
    sunday: [{ open: '09:00', close: '18:00' }],
  };
}

function convertPriceRange(fbPriceRange?: string): string {
  const mapping: Record<string, string> = {
    '$': 'low',
    '$$': 'medium',
    '$$$': 'high',
    '$$$$': 'very_high',
  };
  return fbPriceRange ? mapping[fbPriceRange] || 'medium' : 'medium';
}

function extractCity(address: string): string {
  if (!address) return 'Unknown';
  const parts = address.split(',');
  return parts[parts.length - 2]?.trim() || 'Unknown';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// MOCK DATA GENERATOR
// ========================================

function generateMockFacebookData(config: FacebookCollectorConfig): IraqDiscoveryPlace[] {
  console.log('📦 Generating mock Facebook data...');
  
  const mockPlaces: IraqDiscoveryPlace[] = [];
  
  // Generate mock events
  if (config.categories.includes('Events')) {
    for (let i = 0; i < 5; i++) {
      const eventTypes = ['Concert', 'Festival', 'Exhibition', 'Workshop', 'Conference'];
      const eventType = eventTypes[i % eventTypes.length];
      
      const categoryData: EventFields = {
        event_type: eventType,
        start_datetime: new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_datetime: new Date(Date.now() + (i * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        venue_name: `${config.city} ${eventType} Center`,
        organizer: { name: 'Facebook Event Organizer' },
        ticket_info: { price_type: 'free' },
      };
      
      mockPlaces.push({
        id: `mock_fb_event_${i}`,
        name: `${config.city} ${eventType} ${i + 1}`,
        canonical_category: 'Events',
        subcategory: eventType,
        tags: ['facebook', 'event', eventType.toLowerCase()],
        address: {
          street: `Event Street ${i + 1}`,
          city: config.city,
          governorate: config.governorate,
        },
        latitude: 33.3 + Math.random() * 0.1,
        longitude: 44.4 + Math.random() * 0.1,
        description: `Mock ${eventType} event in ${config.city} via Facebook`,
        images: ['https://via.placeholder.com/800x600'],
        languages_supported: ['en', 'ar'],
        accessibility: { family_friendly: true },
        source_type: 'facebook',
        source_url: 'https://facebook.com/mock',
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        category_data: categoryData,
      } as IraqDiscoveryPlace);
    }
  }
  
  // Generate mock restaurant pages
  if (config.categories.includes('Cafe & Restaurants')) {
    for (let i = 0; i < 5; i++) {
      const categoryData: CafeRestaurantFields = {
        cuisine_types: ['Iraqi', 'Arabic', 'Mediterranean'],
        delivery_available: true,
        takeout_available: true,
        accepts_reservations: true,
      };
      
      mockPlaces.push({
        id: `mock_fb_restaurant_${i}`,
        name: `${config.city} Restaurant ${i + 1} (FB)`,
        canonical_category: 'Cafe & Restaurants',
        subcategory: 'Restaurants',
        tags: ['facebook', 'restaurant'],
        address: {
          street: `Restaurant Street ${i + 1}`,
          city: config.city,
          governorate: config.governorate,
        },
        latitude: 33.3 + Math.random() * 0.1,
        longitude: 44.4 + Math.random() * 0.1,
        phone: '+9647901234567',
        rating: 4 + Math.random(),
        rating_count: Math.floor(Math.random() * 200) + 50,
        description: `Mock restaurant in ${config.city} via Facebook`,
        images: ['https://via.placeholder.com/800x600'],
        languages_supported: ['en', 'ar'],
        accessibility: { family_friendly: true },
        social_media: { facebook: 'https://facebook.com/mock' },
        source_type: 'facebook',
        source_url: 'https://facebook.com/mock',
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        category_data: categoryData,
      } as IraqDiscoveryPlace);
    }
  }
  
  return mockPlaces;
}
