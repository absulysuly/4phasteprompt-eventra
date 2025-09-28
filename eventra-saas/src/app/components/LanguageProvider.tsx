"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE, 
  LOCALE_CODES,
  getLocaleConfig,
  isValidLocale,
  isRTL as checkIsRTL,
  detectLocale
} from '../../lib/i18n';

type Language = keyof typeof SUPPORTED_LOCALES;
type TranslationFunction = (key: string) => string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  localeConfig: ReturnType<typeof getLocaleConfig>;
  switchLanguage: (lang: Language, preservePath?: boolean) => void;
  t: TranslationFunction;
  locale: Language;
  setLocale: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode, initialLanguage?: Language }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Translation cache
  const [translations, setTranslations] = useState<Record<string, any>>({});
  
  // Initialize with URL locale if available, otherwise fall back to detection/default
  const getInitialLanguage = (): Language => {
    // On server render, prefer initialLanguage from layout to prevent hydration mismatch
    if (typeof window === 'undefined') return initialLanguage || DEFAULT_LOCALE;
    
    // Extract locale from pathname (e.g., /ar/events -> ar)
    const pathSegments = pathname.split('/').filter(Boolean);
    const urlLocale = pathSegments[0];
    
    if (urlLocale && isValidLocale(urlLocale)) {
      return urlLocale as Language;
    }
    
    // Check localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && isValidLocale(savedLanguage)) {
      return savedLanguage as Language;
    }
    
    // Detect from browser
    const detected = detectLocale(navigator.language);
    return (isValidLocale(detected) ? (detected as Language) : DEFAULT_LOCALE) as Language;
  };
  
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const localeConfig = getLocaleConfig(language);
  const isRTL = checkIsRTL(language);
  
  // Load translation files
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/messages/${language}.json`);
        if (response.ok) {
          const translationData = await response.json();
          setTranslations(translationData);
        } else {
          // Fallback to English if the specific language file fails to load
          const fallbackResponse = await fetch(`/messages/en.json`);
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
        }
      } catch (error) {
        console.warn(`Failed to load translations for ${language}:`, error);
        // Use empty object as fallback
        setTranslations({});
      }
    };
    
    loadTranslations();
  }, [language]);
  
  // Translation function
  const t: TranslationFunction = (key: string) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return the key if translation is not found
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Sync with URL and localStorage whenever language changes
  useEffect(() => {
    // Update DOM attributes
    document.documentElement.dir = localeConfig.direction;
    document.documentElement.lang = language;
    
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language, localeConfig]);

  // Simple setLanguage for backwards compatibility
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
      // Persist to cookie for server detection (30 days)
      document.cookie = `language=${lang}; path=/; max-age=${60 * 60 * 24 * 30}`;
      // Update DOM immediately
      document.documentElement.lang = lang;
      document.documentElement.dir = (lang === 'ar' || lang === 'ku') ? 'rtl' : 'ltr';
    } catch {}
  };
  
  // Advanced language switching with URL navigation
  const switchLanguage = (lang: Language, preservePath: boolean = true) => {
    setLanguageState(lang);
    
    if (preservePath && router) {
      // Build new URL with locale prefix
      const pathSegments = pathname.split('/').filter(Boolean);
      const currentLocale = pathSegments[0];
      
      let newPath;
      if (isValidLocale(currentLocale)) {
        // Replace existing locale
        pathSegments[0] = lang;
        newPath = '/' + pathSegments.join('/');
      } else {
        // Add locale prefix
        newPath = `/${lang}${pathname}`;
      }
      
      router.push(newPath);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      isRTL, 
      localeConfig,
      switchLanguage,
      t,
      locale: language,
      setLocale: setLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // During SSR or if provider is missing, return default values
    if (typeof window === 'undefined') {
      return {
        language: DEFAULT_LOCALE,
        setLanguage: () => {},
        isRTL: false,
        localeConfig: getLocaleConfig(DEFAULT_LOCALE),
        switchLanguage: () => {}
      } as LanguageContextType;
    }
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
