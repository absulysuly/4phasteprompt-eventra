export const locales = ['en'] as const;
export const defaultLocale = 'en' as const;

// Backward compatibility exports for existing components
export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = {
  en: 'English',
  ar: 'Arabic',
  ku: 'Kurdish'
};
export const LOCALE_CODES = ['en', 'ar', 'ku'];

// Helper functions for backward compatibility
export function isValidLocale(locale: string): locale is keyof typeof SUPPORTED_LOCALES {
  return locale in SUPPORTED_LOCALES;
}

export function getLocaleConfig(locale: string) {
  // Return a simple config object for backward compatibility
  return {
    code: locale,
    name: SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] || 'English',
    nativeName: SUPPORTED_LOCALES[locale as keyof typeof SUPPORTED_LOCALES] || 'English',
    direction: (locale === 'ar' || locale === 'ku') ? 'rtl' : 'ltr',
    flag: locale === 'en' ? '🇺🇸' : locale === 'ar' ? '🇮🇶' : '🏴',
    dateFormat: locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-IQ' : 'ckb-IQ',
    numberFormat: locale === 'en' ? 'en-US' : locale === 'ar' ? 'ar-IQ' : 'ckb-IQ',
    currency: locale === 'en' ? 'USD' : 'IQD'
  };
}

export function detectLocale(acceptLanguage?: string, urlLocale?: string): string {
  // Priority: URL locale > Accept-Language > Default
  if (urlLocale && isValidLocale(urlLocale)) {
    return urlLocale;
  }
  
  if (acceptLanguage) {
    for (const locale of LOCALE_CODES) {
      if (acceptLanguage.toLowerCase().includes(locale.toLowerCase())) {
        return locale;
      }
    }
  }
  
  return DEFAULT_LOCALE;
}

export function isRTL(locale: string): boolean {
  return locale === 'ar' || locale === 'ku';
}

export function getStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Simple translation function
export function getTranslations() {
  return {
    en: {
      navigation: {
        home: 'Home',
        events: 'Events',
        register: 'Register',
        login: 'Login'
      }
    }
  }
}
