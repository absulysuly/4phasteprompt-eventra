export type Language = 'en' | 'ar' | 'ku';
export type AuthMode = 'login' | 'signup' | 'forgot-password';

export interface LocalizedString {
  en: string;
  ar: string;
  ku: string;
}

export interface City {
  id: string;
  name: LocalizedString;
  image: string;
}

export interface Category {
  id: string;
  name: LocalizedString;
  image: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  email: string;
  password?: string; // Should not be sent to client
  isVerified: boolean;
}

export interface Review {
  id: string;
  user: User;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Event {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  organizerId: string;
  organizerName: string;
  categoryId: string;
  cityId: string;
  date: string;
  venue: string;
  coordinates?: { lat: number; lon: number };
  organizerPhone: string;
  whatsappNumber?: string;
  imageUrl: string;
  ticketInfo?: string;
  reviews: Review[];
  isFeatured?: boolean;
  isTop?: boolean;
}

export interface AISuggestionResponse {
    title: LocalizedString;
    description: LocalizedString;
    suggestedCategoryId: string;
    suggestedCityId: string;
    generatedImageBase64: string;
}

export interface AIAutofillData {
    title: LocalizedString;
    description: LocalizedString;
    categoryId: string;
    cityId: string;
    imageBase64: string;
}
