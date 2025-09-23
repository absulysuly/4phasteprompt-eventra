import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { i18n, getDirection, type Locale } from '../../i18n/locales'
import I18nTroubleshooter from '../utils/i18nTroubleshooting'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  direction: 'rtl' | 'ltr'
  isRTL: boolean
  t: (key: string, section?: string) => string
  switchLanguage: (newLocale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LOCALE_STORAGE_KEY = 'eventara_locale'

// Translation helper function
const translate = (locale: Locale, key: string, section: string = 'common'): string => {
  // This is a simple implementation - you can expand it based on your needs
  const translations = {
    ar: {
      common: {
        language: 'اللغة',
        arabic: 'العربية',
        kurdish: 'الكردية', 
        english: 'الإنجليزية',
        events: 'الفعاليات',
        home: 'الرئيسية',
        loading: 'جاري التحميل...'
      }
    },
    ku: {
      common: {
        language: 'زمان',
        arabic: 'عەرەبی',
        kurdish: 'کوردی',
        english: 'ئینگلیزی',
        events: 'ڕووداوەکان',
        home: 'سەرەتا',
        loading: 'بارکردن...'
      }
    },
    en: {
      common: {
        language: 'Language',
        arabic: 'Arabic',
        kurdish: 'Kurdish',
        english: 'English',
        events: 'Events',
        home: 'Home',
        loading: 'Loading...'
      }
    }
  }

  return translations[locale]?.[section]?.[key] || key
}

// Get stored locale or detect from browser/URL
const getInitialLocale = (): Locale => {
  // 1. Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale
    if (stored && i18n.locales.includes(stored)) {
      return stored
    }

    // 2. Check URL for locale
    const pathLocale = window.location.pathname.split('/')[1] as Locale
    if (pathLocale && i18n.locales.includes(pathLocale)) {
      return pathLocale
    }

    // 3. Check browser language
    const browserLang = navigator.language.split('-')[0] as Locale
    if (i18n.locales.includes(browserLang)) {
      return browserLang
    }
  }

  // 4. Fall back to default locale
  return i18n.defaultLocale
}

interface I18nProviderProps {
  children: ReactNode
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const [troubleshooter] = useState(() => I18nTroubleshooter.getInstance())

  // Initialize troubleshooting on mount
  useEffect(() => {
    troubleshooter.initialize()
  }, [troubleshooter])

  // Update DOM attributes when locale changes
  useEffect(() => {
    const direction = getDirection(locale)
    
    // Update HTML attributes
    document.documentElement.setAttribute('lang', locale)
    document.documentElement.setAttribute('dir', direction)
    
    // Store in localStorage
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    
    // Apply troubleshooting fixes
    troubleshooter.handleLanguageSwitch(locale)

    console.log(`🌍 Language switched to: ${locale} (${direction})`)
  }, [locale, troubleshooter])

  const setLocale = (newLocale: Locale) => {
    if (!i18n.locales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }

    setLocaleState(newLocale)
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('localeChange', { 
      detail: { 
        locale: newLocale, 
        direction: getDirection(newLocale) 
      } 
    }))
  }

  const switchLanguage = (newLocale: Locale) => {
    // Use troubleshooter for robust language switching
    troubleshooter.handleLanguageSwitch(newLocale)
    setLocale(newLocale)
  }

  const direction = getDirection(locale)
  const isRTL = direction === 'rtl'

  const t = (key: string, section: string = 'common') => {
    return translate(locale, key, section)
  }

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    direction,
    isRTL,
    t,
    switchLanguage
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Hook for language detection
export const useLanguageDetection = () => {
  const { locale, switchLanguage } = useI18n()
  
  useEffect(() => {
    // Listen for URL changes to detect locale
    const handleLocationChange = () => {
      const pathLocale = window.location.pathname.split('/')[1] as Locale
      if (pathLocale && i18n.locales.includes(pathLocale) && pathLocale !== locale) {
        switchLanguage(pathLocale)
      }
    }

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleLocationChange)
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
  }, [locale, switchLanguage])

  return { locale, switchLanguage }
}

export default I18nContext