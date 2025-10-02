/**
 * Extended Venue Type Definitions
 * 
 * Type-safe definitions for Shopping and Entertainment venue types
 */

// Shopping venue specific data
export interface ShoppingVenueData {
  productCategories?: string[];  // e.g., ["Electronics", "Clothing", "Home & Garden"]
  brands?: string[];             // e.g., ["Nike", "Apple", "Samsung"]
  paymentMethods?: string[];     // e.g., ["Cash", "Credit Card", "Zain Cash", "Fastpay"]
  tags?: string[];
}

// Entertainment/Company venue specific data
export interface EntertainmentVenueData {
  businessType?: string;         // e.g., "Cinema", "Gaming Center", "Tech Company"
  services?: string[];           // e.g., ["Web Development", "Consulting", "Training"]
  operatingHours?: {
    [day: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  tags?: string[];
}

// Restaurant venue specific data (existing)
export interface RestaurantVenueData {
  cuisineType?: string;          // e.g., "Iraqi", "Turkish", "Italian"
  dietaryOptions?: string[];     // e.g., ["Halal", "Vegan", "Gluten-Free"]
  tags?: string[];
}

// Hotel venue specific data (existing)
export interface HotelVenueData {
  amenities?: string[];          // e.g., ["WiFi", "Pool", "Gym", "Parking"]
  features?: string[];           // e.g., ["Restaurant", "Room Service", "Airport Shuttle"]
  tags?: string[];
}

// Activity venue specific data (existing)
export interface ActivityVenueData {
  tags?: string[];
  features?: string[];
}

// Event venue specific data (existing)
export interface EventVenueData {
  eventDate?: Date;
  tags?: string[];
}

// Union type for all venue-specific data
export type VenueSpecificData = 
  | ShoppingVenueData 
  | EntertainmentVenueData 
  | RestaurantVenueData 
  | HotelVenueData 
  | ActivityVenueData 
  | EventVenueData;

// Category definitions for each type
export const SHOPPING_CATEGORIES = {
  MALL: "Shopping Mall",
  SUPERMARKET: "Supermarket",
  CLOTHING_STORE: "Clothing Store",
  ELECTRONICS: "Electronics Store",
  JEWELRY: "Jewelry Store",
  BOOKSTORE: "Bookstore",
  PHARMACY: "Pharmacy",
  FURNITURE: "Furniture Store",
  MARKET: "Traditional Market (Souq)",
  DEPARTMENT_STORE: "Department Store",
} as const;

export const ENTERTAINMENT_CATEGORIES = {
  CINEMA: "Cinema",
  THEATER: "Theater",
  GAMING_CENTER: "Gaming Center",
  AMUSEMENT_PARK: "Amusement Park",
  BOWLING: "Bowling Alley",
  ESCAPE_ROOM: "Escape Room",
  TECH_COMPANY: "Technology Company",
  CONSULTANCY: "Consultancy Firm",
  CREATIVE_AGENCY: "Creative Agency",
  EVENT_COMPANY: "Event Management Company",
} as const;

// Payment methods common in Iraq
export const PAYMENT_METHODS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Zain Cash",
  "Fastpay",
  "Qi Card",
  "Asia Hawala",
] as const;

// Helper function to validate venue type specific data
export function validateVenueData(type: string, data: any): boolean {
  switch (type) {
    case 'SHOPPING':
      return validateShoppingData(data);
    case 'ENTERTAINMENT':
      return validateEntertainmentData(data);
    case 'RESTAURANT':
      return validateRestaurantData(data);
    case 'HOTEL':
      return validateHotelData(data);
    default:
      return true;
  }
}

function validateShoppingData(data: ShoppingVenueData): boolean {
  // Basic validation
  if (data.productCategories && !Array.isArray(data.productCategories)) return false;
  if (data.brands && !Array.isArray(data.brands)) return false;
  if (data.paymentMethods && !Array.isArray(data.paymentMethods)) return false;
  return true;
}

function validateEntertainmentData(data: EntertainmentVenueData): boolean {
  // Basic validation
  if (data.services && !Array.isArray(data.services)) return false;
  if (data.operatingHours && typeof data.operatingHours !== 'object') return false;
  return true;
}

function validateRestaurantData(data: RestaurantVenueData): boolean {
  if (data.dietaryOptions && !Array.isArray(data.dietaryOptions)) return false;
  return true;
}

function validateHotelData(data: HotelVenueData): boolean {
  if (data.amenities && !Array.isArray(data.amenities)) return false;
  if (data.features && !Array.isArray(data.features)) return false;
  return true;
}

// Helper to get appropriate category options for a venue type
export function getCategoryOptions(type: string): Record<string, string> {
  switch (type) {
    case 'SHOPPING':
      return SHOPPING_CATEGORIES;
    case 'ENTERTAINMENT':
      return ENTERTAINMENT_CATEGORIES;
    default:
      return {};
  }
}

export default {
  SHOPPING_CATEGORIES,
  ENTERTAINMENT_CATEGORIES,
  PAYMENT_METHODS,
  validateVenueData,
  getCategoryOptions,
};
