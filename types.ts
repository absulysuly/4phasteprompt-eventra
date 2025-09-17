// FIX: Created the full type definitions for the application, including User, Event, City, Category, and types for the AI service. This resolves numerous module and type errors across the application.
export type Language = 'en' | 'ar' | 'ku';

export interface LocalizedString {
  en: string;
  ar: string;
  ku: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  email: string;
  isVerified: boolean;
  password?: string; // Should not be sent to client, but needed for signup
}

export interface City {
  id: string;
  name: LocalizedString;
  image: string;
}

export type PricingTier = 'free' | 'paid' | 'premium';

export interface Category {
  id: string;
  name: LocalizedString;
  image: string;
  pricingTier?: PricingTier;
  icon?: string;
}

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Review {
  id: string;
  user: User;
  rating: number; // 1-5
  comment: string;
  timestamp: string; // ISO 8601
}

export interface EventPrice {
  amount: number;
  currency: string;
  isFree: boolean;
}

export interface Event {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  organizerId: string;
  organizerName: string;
  categoryId: string;
  cityId: string;
  date: string; // ISO 8601
  venue: string;
  coordinates?: Coordinates;
  organizerPhone: string;
  whatsappNumber?: string;
  imageUrl: string;
  ticketInfo?: string;
  price?: EventPrice;
  reviews: Review[];
  isFeatured?: boolean;
  isTop?: boolean;
}

export type AuthMode = 'login' | 'signup' | 'forgot-password';

// For AI Assistant
export interface AIAutofillData {
  title: LocalizedString;
  description: LocalizedString;
  cityId: string;
  categoryId: string;
  imageBase64: string;
}

export interface AISuggestionResponse extends Omit<AIAutofillData, 'cityId' | 'categoryId' | 'imageBase64'>{
    suggestedCityId: string;
    suggestedCategoryId: string;
    generatedImageBase64: string;
}
