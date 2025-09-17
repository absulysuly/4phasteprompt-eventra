// Enhanced TypeScript types for robust application
export type Language = 'en' | 'ar' | 'ku';
export type AuthMode = 'login' | 'signup' | 'forgot-password';
export type UserRole = 'user' | 'admin' | 'organizer';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace?.(this, AppError);
  }
}

export interface ErrorState {
  message: string;
  code: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// API State Types
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetched?: Date;
}

// Enhanced Core Types
export interface LocalizedString {
  en: string;
  ar: string;
  ku: string;
}

export interface UserPreferences {
  language: Language;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  email: string;
  password?: string; // Should not be sent to client
  isVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
  bio?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface City {
  id: string;
  name: LocalizedString;
  image: string;
  country: string;
  timezone: string;
  coordinates?: Coordinates;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: LocalizedString;
  image: string;
  description?: LocalizedString;
  color: string;
  iconName: string;
  parentCategoryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
  isVerified?: boolean;
  helpfulCount: number;
  images?: string[];
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
  endDate?: string; // ISO 8601
  venue: string;
  coordinates?: Coordinates;
  organizerPhone: string;
  whatsappNumber?: string;
  imageUrl: string;
  ticketInfo?: string;
  reviews: Review[];
  isFeatured?: boolean;
  isTop?: boolean;
  status: EventStatus;
  maxAttendees?: number;
  currentAttendees: number;
  price?: number;
  currency?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// AI Service Types
export interface AIAutofillData {
  title: LocalizedString;
  description: LocalizedString;
  cityId: string;
  categoryId: string;
  imageBase64: string;
}

export interface AISuggestionResponse extends Omit<AIAutofillData, 'cityId' | 'categoryId' | 'imageBase64'> {
  suggestedCityId: string;
  suggestedCategoryId: string;
  generatedImageBase64: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface EventFormData {
  title: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  cityId: string;
  date: string;
  endDate?: string;
  venue: string;
  organizerPhone: string;
  whatsappNumber?: string;
  ticketInfo?: string;
  maxAttendees?: number;
  price?: number;
  currency?: string;
  tags: string[];
}

// Filter Types
export interface EventFilters {
  query: string;
  month: string;
  category: string | null;
  city: string | null;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
}

// Configuration Types
export interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  features: {
    enableAnalytics: boolean;
    enableAI: boolean;
    enablePWA: boolean;
  };
  security: {
    enableCSRF: boolean;
    sessionTimeout: number;
  };
}

// Hook Types
export interface UseApiOptions {
  immediate?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface UseApiResult<T> extends ApiState<T> {
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Search Types
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}