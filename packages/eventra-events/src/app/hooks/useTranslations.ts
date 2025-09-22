"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import { DEFAULT_LOCALE, isValidLocale, TranslationKey, validateTranslationKey } from '../../lib/i18n';

type TranslationValue = string | { [key: string]: any };
type Messages = { [key: string]: TranslationValue };

import { loadMessages as loadMessagesFromModule } from '../../../messages';

// Cache for loaded translations to prevent re-loading
const translationCache = new Map<string, Messages>();

// Error tracking for missing translations
const missingTranslations = new Set<string>();

export function useTranslations() {
  const { language, localeConfig } = useLanguage();
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages with caching and robust error handling
  const loadMessages = useCallback(async (locale: string): Promise<Messages> => {
    // Check cache first
    if (translationCache.has(locale)) {
      return translationCache.get(locale)!;
    }

    try {
      const messages = await loadMessagesFromModule(locale as string as any);
      translationCache.set(locale, messages);
      return messages;
    } catch (error) {
      console.error(`Failed to load messages for locale: ${locale}`, error);
      
      // If not default locale, try fallback
      if (locale !== DEFAULT_LOCALE) {
        try {
          const fallbackMessages = await loadMessagesFromModule(DEFAULT_LOCALE as string as any);
          // Don't cache fallback under the requested locale
          return fallbackMessages;
        } catch (fallbackError) {
          console.error('Failed to load fallback messages:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeTranslations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const loadedMessages = await loadMessages(language);
        if (isMounted) {
          setMessages(loadedMessages);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load translations');
          setMessages({}); // Set empty messages to prevent crashes
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeTranslations();
    
    return () => {
      isMounted = false;
    };
  }, [language, loadMessages]);

  // Enhanced translation function with better error handling and type safety
  const t = useCallback((key: string, params?: { [key: string]: any }): string => {
    // Validate translation key in development
    if (process.env.NODE_ENV === 'development' && !validateTranslationKey(key)) {
      console.warn(`Invalid translation key format: ${key}`);
    }

    const keys = key.split('.');
    let value: any = messages;

    // Traverse the nested object structure
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Track missing translations in development
        if (process.env.NODE_ENV === 'development' && !missingTranslations.has(key)) {
          console.warn(`Missing translation key: ${key} for locale: ${language}`);
          missingTranslations.add(key);
        }
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation key ${key} does not resolve to a string`);
      }
      return key;
    }

    // Enhanced parameter substitution with better error handling
    if (params) {
      return value.replace(/{(\w+)}/g, (match, paramKey) => {
        if (paramKey in params) {
          const paramValue = params[paramKey];
          // Handle pluralization for count parameters
          if (paramKey === 'count' && typeof paramValue === 'number') {
            return paramValue.toString();
          }
          return String(paramValue);
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing parameter '${paramKey}' for translation key: ${key}`);
        }
        return match; // Return placeholder if parameter not found
      });
    }

    return value;
  }, [messages, language]);

  // Pluralization helper
  const plural = useCallback((key: string, count: number, params?: { [key: string]: any }): string => {
    const pluralParams = { ...params, count };
    
    // Try specific plural forms first
    if (count === 0) {
      const zeroForm = t(`${key}.zero`, pluralParams);
      if (zeroForm !== `${key}.zero`) return zeroForm;
    }
    
    if (count === 1) {
      const oneForm = t(`${key}.one`, pluralParams);
      if (oneForm !== `${key}.one`) return oneForm;
    }
    
    // Fall back to other form
    const otherForm = t(`${key}.other`, pluralParams);
    if (otherForm !== `${key}.other`) return otherForm;
    
    // Final fallback to base key
    return t(key, pluralParams);
  }, [t]);

  return { 
    t, 
    plural,
    isLoading, 
    error,
    language,
    localeConfig,
    messages // Expose messages for debugging
  };
}