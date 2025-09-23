// Comprehensive i18n configuration for Arabic, Kurdish, and English
export const i18n = {
  locales: ['ar', 'ku', 'en'] as const,
  defaultLocale: 'ar' as const,
  rtlLocales: ['ar', 'ku'] as const,
  ltrLocales: ['en'] as const,
}

export type Locale = typeof i18n.locales[number]

// Route configuration
export const routeConfig = {
  // Localized routes
  events: {
    ar: '/ar/events',
    ku: '/ku/events', 
    en: '/en/events'
  },
  event: {
    ar: '/ar/event',
    ku: '/ku/event',
    en: '/en/event'
  },
  home: {
    ar: '/ar',
    ku: '/ku',
    en: '/en'
  }
}

// Utility functions
export const isRTL = (locale: Locale): boolean => 
  i18n.rtlLocales.includes(locale as any)

export const getDirection = (locale: Locale): 'rtl' | 'ltr' => 
  isRTL(locale) ? 'rtl' : 'ltr'

export const getLocalizedRoute = (route: keyof typeof routeConfig, locale: Locale): string => 
  routeConfig[route][locale]

// Translation strings (placeholder structure)
export const translations = {
  ar: {
    common: {
      events: 'الفعاليات',
      home: 'الرئيسية',
      language: 'اللغة',
      loading: 'جاري التحميل...',
    }
  },
  ku: {
    common: {
      events: 'ڕووداوەکان',
      home: 'سەرەتا',
      language: 'زمان',
      loading: 'بارکردن...',
    }
  },
  en: {
    common: {
      events: 'Events',
      home: 'Home', 
      language: 'Language',
      loading: 'Loading...',
    }
  }
} as const

export type TranslationKeys = keyof typeof translations['ar']
export type TranslationNestedKeys = keyof typeof translations['ar']['common']
