// Multi-country configuration for Eventra
// Add new countries here with their specific settings

export interface CountryConfig {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  languages: string[];
  defaultLanguage: string;
  cities: string[];
  timezone: string;
  dateFormat: string;
  features: string[];
  paymentMethods: string[];
  categories: Array<{
    key: string;
    name: string;
    icon: string;
  }>;
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  // EXISTING: Iraq (your current setup)
  IQ: {
    name: 'Iraq',
    code: 'IQ',
    currency: 'IQD',
    currencySymbol: 'د.ع',
    languages: ['ar', 'ku', 'en'],
    defaultLanguage: 'ar',
    cities: [
      'Baghdad', 'Basra', 'Erbil', 'Sulaymaniyah', 
      'Mosul', 'Duhok', 'Kirkuk', 'Anbar', 'Najaf', 'Karbala'
    ],
    timezone: 'Asia/Baghdad',
    dateFormat: 'DD/MM/YYYY',
    features: ['whatsapp_integration', 'cash_payments', 'multilingual'],
    paymentMethods: ['cash', 'bank_transfer'],
    categories: [
      { key: 'tech', name: 'Technology', icon: '💻' },
      { key: 'music', name: 'Music', icon: '🎵' },
      { key: 'business', name: 'Business', icon: '💼' },
      { key: 'art', name: 'Arts & Culture', icon: '🎨' },
      { key: 'sports', name: 'Sports', icon: '⚽' },
      { key: 'food', name: 'Food & Dining', icon: '🍽️' },
      { key: 'health', name: 'Health & Wellness', icon: '🏥' },
      { key: 'community', name: 'Community', icon: '👥' }
    ]
  },

  // NEW: UAE 
  AE: {
    name: 'United Arab Emirates',
    code: 'AE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    languages: ['ar', 'en'],
    defaultLanguage: 'ar',
    cities: [
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 
      'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
    ],
    timezone: 'Asia/Dubai',
    dateFormat: 'DD/MM/YYYY',
    features: ['credit_cards', 'luxury_events', 'international_speakers'],
    paymentMethods: ['credit_card', 'apple_pay', 'google_pay', 'cash'],
    categories: [
      { key: 'business', name: 'Business Networking', icon: '💼' },
      { key: 'luxury', name: 'Luxury Events', icon: '💎' },
      { key: 'tech', name: 'Technology', icon: '💻' },
      { key: 'desert', name: 'Desert Adventures', icon: '🏜️' },
      { key: 'finance', name: 'Finance & Investment', icon: '💰' },
      { key: 'art', name: 'Arts & Culture', icon: '🎨' },
      { key: 'food', name: 'Fine Dining', icon: '🍽️' },
      { key: 'wellness', name: 'Wellness & Spa', icon: '🧘' }
    ]
  },

  // NEW: Saudi Arabia (for future)
  SA: {
    name: 'Saudi Arabia',
    code: 'SA', 
    currency: 'SAR',
    currencySymbol: '﷼',
    languages: ['ar', 'en'],
    defaultLanguage: 'ar',
    cities: [
      'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 
      'Khobar', 'Tabuk', 'Abha', 'Taif'
    ],
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    features: ['vision_2030', 'mega_events', 'cultural_events'],
    paymentMethods: ['credit_card', 'mada', 'apple_pay', 'stc_pay'],
    categories: [
      { key: 'business', name: 'Business', icon: '💼' },
      { key: 'culture', name: 'Cultural Events', icon: '🏛️' },
      { key: 'sports', name: 'Sports', icon: '⚽' },
      { key: 'tech', name: 'Technology', icon: '💻' },
      { key: 'entertainment', name: 'Entertainment', icon: '🎭' },
      { key: 'education', name: 'Education', icon: '📚' }
    ]
  }
};

// Helper functions
export const getCountryConfig = (countryCode: string): CountryConfig | null => {
  return COUNTRY_CONFIGS[countryCode.toUpperCase()] || null;
};

export const getAllCountries = (): CountryConfig[] => {
  return Object.values(COUNTRY_CONFIGS);
};

export const getCountryCities = (countryCode: string): string[] => {
  const config = getCountryConfig(countryCode);
  return config ? config.cities : [];
};

export const getCountryCategories = (countryCode: string) => {
  const config = getCountryConfig(countryCode);
  return config ? config.categories : [];
};