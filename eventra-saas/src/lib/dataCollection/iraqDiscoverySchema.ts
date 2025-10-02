/**
 * Iraq Discovery Unified Data Schema
 * 
 * Comprehensive schema for 8 categories with universal and category-specific fields
 * Supports filters, sorting, and front-end integration
 */

// ========================================
// ENUMS & TYPES
// ========================================

export type Category = 
  | 'Accommodation'
  | 'Cafe & Restaurants'
  | 'Events'
  | 'Tourism'
  | 'Government Offices'
  | 'Services'
  | 'Companies'
  | 'Shopping';

export type PriceRange = 'low' | 'medium' | 'high' | 'very_high' | 'free';

export type Governorate = 
  | 'baghdad'
  | 'erbil'
  | 'basra'
  | 'nineveh'
  | 'sulaymaniyah'
  | 'duhok'
  | 'najaf'
  | 'karbala'
  | 'anbar'
  | 'diyala'
  | 'wasit'
  | 'maysan'
  | 'muthanna'
  | 'qadisiyyah'
  | 'babil'
  | 'kirkuk'
  | 'saladin'
  | 'dhi_qar';

// ========================================
// UNIVERSAL FIELDS (All Categories)
// ========================================

export interface UniversalFields {
  // Identity
  id: string;
  name: string;
  canonical_category: Category;
  subcategory?: string;
  tags: string[];

  // Location
  address: {
    street?: string;
    neighborhood?: string;
    city: string;
    governorate: Governorate;
    postal_code?: string;
  };
  latitude: number;
  longitude: number;

  // Contact
  phone?: string;
  website?: string;
  email?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };

  // Hours & Availability
  opening_hours?: OpeningHours;
  is_open_now?: boolean;

  // Pricing & Rating
  price_range?: PriceRange;
  price_numeric?: {
    min?: number;
    max?: number;
    currency: 'IQD' | 'USD';
  };
  rating?: number;
  rating_count?: number;
  review_summary?: {
    positive: number;
    neutral: number;
    negative: number;
  };

  // Media
  images: string[];
  featured_image?: string;
  videos?: string[];

  // Localization
  languages_supported: string[];
  description: string;
  description_ar?: string;
  description_ku?: string;

  // Accessibility
  accessibility: {
    wheelchair_accessible?: boolean;
    family_friendly?: boolean;
    parking_available?: boolean;
    elevator?: boolean;
  };

  // Metadata
  source_url?: string;
  source_type: 'google_maps' | 'facebook' | 'instagram' | 'manual' | 'government_db' | 'business_listing';
  license?: string;
  data_quality_score?: number;
  last_updated: string; // ISO timestamp
  last_verified?: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// ========================================
// OPENING HOURS STRUCTURE
// ========================================

export interface OpeningHours {
  monday?: TimeRange[];
  tuesday?: TimeRange[];
  wednesday?: TimeRange[];
  thursday?: TimeRange[];
  friday?: TimeRange[];
  saturday?: TimeRange[];
  sunday?: TimeRange[];
  special_hours?: {
    date: string;
    closed?: boolean;
    hours?: TimeRange[];
    note?: string;
  }[];
}

export interface TimeRange {
  open: string;  // HH:MM format
  close: string; // HH:MM format
}

// ========================================
// CATEGORY-SPECIFIC FIELDS
// ========================================

// 1. Accommodation
export interface AccommodationFields {
  star_rating?: 0 | 1 | 2 | 3 | 4 | 5;
  amenities: string[]; // WiFi, Pool, Parking, Gym, AC, Breakfast, etc.
  room_types?: string[];
  check_in_time?: string;
  check_out_time?: string;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  cancellation_policy?: string;
  booking_url?: string;
}

// 2. Cafe & Restaurants
export interface CafeRestaurantFields {
  cuisine_types: string[]; // Arabic, Iraqi, Kurdish, Mediterranean, Turkish, etc.
  dietary_options?: string[]; // Vegetarian, Vegan, Halal, Gluten-free
  delivery_available?: boolean;
  takeout_available?: boolean;
  accepts_reservations?: boolean;
  outdoor_seating?: boolean;
  average_meal_duration?: number; // minutes
  popular_dishes?: string[];
  menu_url?: string;
}

// 3. Events
export interface EventFields {
  event_type: string; // Concert, Festival, Exhibition, Workshop, Sports, Market, Theater, Conference
  start_datetime: string; // ISO datetime
  end_datetime: string; // ISO datetime
  venue_name: string;
  venue_address?: string;
  organizer: {
    name: string;
    contact?: string;
    website?: string;
  };
  ticket_info?: {
    price_type: 'free' | 'paid' | 'donation';
    price?: number;
    currency?: 'IQD' | 'USD';
    ticket_url?: string;
  };
  capacity?: number;
  registration_required?: boolean;
  age_restriction?: string;
}

// 4. Tourism
export interface TourismFields {
  tourism_type: 'Landmark' | 'Picnic Area' | 'Cultural Site' | 'Must See' | 'Hidden Gem' | 'Natural Area' | 'Museum' | 'Park';
  entry_fee?: {
    free: boolean;
    price?: number;
    currency?: 'IQD' | 'USD';
  };
  best_visit_time?: {
    season?: string;
    time_of_day?: string;
  };
  estimated_visit_duration?: number; // minutes
  guided_tours_available?: boolean;
  audio_guide_available?: boolean;
  historical_period?: string;
  unesco_site?: boolean;
}

// 5. Government Offices
export interface GovernmentOfficeFields {
  office_type: 'Passport Office' | 'Municipality' | 'Ministry' | 'Court' | 'Social Services' | 'Police Station' | 'Municipal Services' | 'Other';
  services_offered: string[];
  required_documents?: string[];
  appointment_required?: boolean;
  online_services_available?: boolean;
  citizen_service_center?: boolean;
  emergency_contact?: string;
}

// 6. Services
export interface ServiceFields {
  primary_service_type: 'Health' | 'Professional' | 'Education' | 'Transport' | 'Telecom' | 'Repair' | 'Financial' | 'Legal' | 'Other';
  subcategory: string;
  accepts_online_booking?: boolean;
  emergency_service?: boolean;
  certifications?: string[];
  insurance_accepted?: boolean;
  consultation_fee?: number;
  home_service_available?: boolean;
}

// 7. Companies
export interface CompanyFields {
  industry: 'Architecture' | 'Tourism' | 'Trading' | 'Technology' | 'Manufacturing' | 'Consulting' | 'Retail' | 'Construction' | 'Other';
  company_size?: 'startup' | 'SME' | 'enterprise';
  services_products: string[];
  established_year?: number;
  employees_count?: string; // e.g., "10-50", "50-200"
  business_license?: string;
  export_capability?: boolean;
  seeking_partnerships?: boolean;
}

// 8. Shopping
export interface ShoppingFields {
  store_type: 'Shopping Mall' | 'Retail Store' | 'Bazaar' | 'Boutique' | 'Supermarket' | 'Market';
  main_products: string[]; // Clothing, Electronics, Food, Books, Souvenirs, etc.
  brands_available?: string[];
  payment_methods: string[]; // Cash, Credit Card, Zain Cash, Qi Card, etc.
  return_policy?: string;
  loyalty_program?: boolean;
  online_shopping_available?: boolean;
  gift_wrapping?: boolean;
}

// ========================================
// UNIFIED PLACE RECORD
// ========================================

export type IraqDiscoveryPlace = UniversalFields & (
  | { canonical_category: 'Accommodation'; category_data: AccommodationFields }
  | { canonical_category: 'Cafe & Restaurants'; category_data: CafeRestaurantFields }
  | { canonical_category: 'Events'; category_data: EventFields }
  | { canonical_category: 'Tourism'; category_data: TourismFields }
  | { canonical_category: 'Government Offices'; category_data: GovernmentOfficeFields }
  | { canonical_category: 'Services'; category_data: ServiceFields }
  | { canonical_category: 'Companies'; category_data: CompanyFields }
  | { canonical_category: 'Shopping'; category_data: ShoppingFields }
);

// ========================================
// FILTER METADATA FOR FRONT-END
// ========================================

export interface FilterMetadata {
  field_name: string;
  ui_label: string;
  ui_label_ar?: string;
  ui_label_ku?: string;
  ui_component: 'slider' | 'chips' | 'multi-select' | 'dropdown' | 'range' | 'toggle' | 'search';
  data_type: 'string' | 'number' | 'boolean' | 'array' | 'range';
  options?: { value: string; label: string; count?: number }[];
  min?: number;
  max?: number;
  default_value?: any;
}

// ========================================
// SORTING OPTIONS
// ========================================

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
  label_ar?: string;
  label_ku?: string;
}

// ========================================
// API RESPONSE STRUCTURE
// ========================================

export interface PlacesResponse {
  data: IraqDiscoveryPlace[];
  metadata: {
    total_count: number;
    page: number;
    page_size: number;
    has_more: boolean;
    applied_filters: Record<string, any>;
    available_filters: FilterMetadata[];
    filter_counts?: Record<string, Record<string, number>>;
  };
}

// ========================================
// BATCH DELIVERY MANIFEST
// ========================================

export interface BatchManifest {
  batch_number: number;
  batch_name: string;
  governorate: Governorate;
  date_created: string;
  records_by_category: Record<Category, number>;
  total_records: number;
  quality_metrics: {
    complete_records: number;
    partial_records: number;
    geocoded: number;
    with_images: number;
    verified: number;
  };
  files: {
    json: string[];
    csv: string[];
  };
  changelog?: string;
}

// ========================================
// DATA QUALITY VALIDATION
// ========================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  quality_score: number; // 0-100
  completeness: {
    required_fields: number; // percentage
    optional_fields: number; // percentage
  };
}

// ========================================
// EXPORT HELPERS
// ========================================

export const CATEGORY_FILTERS: Record<Category, FilterMetadata[]> = {
  'Accommodation': [
    { field_name: 'star_rating', ui_label: 'Star Rating', ui_component: 'slider', data_type: 'number', min: 0, max: 5 },
    { field_name: 'price_range', ui_label: 'Price Range', ui_component: 'chips', data_type: 'string', options: [
      { value: 'low', label: 'Budget' },
      { value: 'medium', label: 'Mid-Range' },
      { value: 'high', label: 'Luxury' },
    ]},
    { field_name: 'amenities', ui_label: 'Amenities', ui_component: 'multi-select', data_type: 'array' },
  ],
  'Cafe & Restaurants': [
    { field_name: 'cuisine_types', ui_label: 'Cuisine', ui_component: 'chips', data_type: 'array' },
    { field_name: 'price_range', ui_label: 'Price', ui_component: 'chips', data_type: 'string' },
    { field_name: 'dietary_options', ui_label: 'Dietary Options', ui_component: 'multi-select', data_type: 'array' },
    { field_name: 'outdoor_seating', ui_label: 'Outdoor Seating', ui_component: 'toggle', data_type: 'boolean' },
  ],
  'Events': [
    { field_name: 'event_type', ui_label: 'Event Type', ui_component: 'chips', data_type: 'string' },
    { field_name: 'ticket_info.price_type', ui_label: 'Price', ui_component: 'chips', data_type: 'string', options: [
      { value: 'free', label: 'Free' },
      { value: 'paid', label: 'Paid' },
    ]},
  ],
  'Tourism': [
    { field_name: 'tourism_type', ui_label: 'Type', ui_component: 'chips', data_type: 'string' },
    { field_name: 'entry_fee.free', ui_label: 'Entry Fee', ui_component: 'toggle', data_type: 'boolean' },
  ],
  'Government Offices': [
    { field_name: 'office_type', ui_label: 'Service Type', ui_component: 'dropdown', data_type: 'string' },
    { field_name: 'appointment_required', ui_label: 'Appointment Required', ui_component: 'toggle', data_type: 'boolean' },
  ],
  'Services': [
    { field_name: 'primary_service_type', ui_label: 'Service Type', ui_component: 'dropdown', data_type: 'string' },
    { field_name: 'accepts_online_booking', ui_label: 'Online Booking', ui_component: 'toggle', data_type: 'boolean' },
  ],
  'Companies': [
    { field_name: 'industry', ui_label: 'Industry', ui_component: 'dropdown', data_type: 'string' },
    { field_name: 'company_size', ui_label: 'Company Size', ui_component: 'chips', data_type: 'string' },
  ],
  'Shopping': [
    { field_name: 'store_type', ui_label: 'Store Type', ui_component: 'chips', data_type: 'string' },
    { field_name: 'main_products', ui_label: 'Products', ui_component: 'multi-select', data_type: 'array' },
    { field_name: 'price_range', ui_label: 'Price Range', ui_component: 'chips', data_type: 'string' },
  ],
};

export const DEFAULT_SORT_OPTIONS: Record<Category, SortOption[]> = {
  'Accommodation': [
    { field: 'star_rating', direction: 'desc', label: 'Star Rating (High to Low)' },
    { field: 'rating', direction: 'desc', label: 'Guest Rating' },
    { field: 'price_range', direction: 'asc', label: 'Price (Low to High)' },
  ],
  'Cafe & Restaurants': [
    { field: 'rating', direction: 'desc', label: 'Rating' },
    { field: 'price_range', direction: 'asc', label: 'Price (Low to High)' },
  ],
  'Events': [
    { field: 'start_datetime', direction: 'asc', label: 'Date (Nearest First)' },
    { field: 'rating', direction: 'desc', label: 'Popular' },
  ],
  'Tourism': [
    { field: 'rating', direction: 'desc', label: 'Most Popular' },
    { field: 'tourism_type', direction: 'asc', label: 'Type' },
  ],
  'Government Offices': [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'office_type', direction: 'asc', label: 'Service Type' },
  ],
  'Services': [
    { field: 'rating', direction: 'desc', label: 'Rating' },
    { field: 'primary_service_type', direction: 'asc', label: 'Service Type' },
  ],
  'Companies': [
    { field: 'name', direction: 'asc', label: 'Name (A-Z)' },
    { field: 'industry', direction: 'asc', label: 'Industry' },
  ],
  'Shopping': [
    { field: 'rating', direction: 'desc', label: 'Rating' },
    { field: 'store_type', direction: 'asc', label: 'Store Type' },
  ],
};
