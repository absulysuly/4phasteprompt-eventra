import { describe, it, expect } from '@jest/globals'

// Mock i18n utility functions that validate translation keys
const validateTranslationKeys = (messages: Record<string, any>, requiredKeys: string[]) => {
  const missingKeys: string[] = []
  
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  requiredKeys.forEach(key => {
    const value = getNestedValue(messages, key)
    if (value === undefined || value === null || value === '') {
      missingKeys.push(key)
    }
  })
  
  return { isValid: missingKeys.length === 0, missingKeys }
}

const checkTranslationCompleteness = (locales: Record<string, any>) => {
  const keys = Object.keys(locales)
  if (keys.length === 0) return { isComplete: false, issues: ['No locales found'] }
  
  // Get all possible translation keys from the first locale
  const baseKeys = extractAllKeys(locales[keys[0]] || {})
  const issues: string[] = []
  
  // Check each locale for missing keys
  keys.forEach(locale => {
    const localeMessages = locales[locale] || {}
    const localeKeys = extractAllKeys(localeMessages)
    
    baseKeys.forEach(key => {
      if (!localeKeys.includes(key)) {
        issues.push(`Missing key '${key}' in locale '${locale}'`)
      }
    })
  })
  
  return { isComplete: issues.length === 0, issues }
}

const extractAllKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = []
  
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(extractAllKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  })
  
  return keys
}

describe('i18n Utility Functions', () => {
  const mockMessages = {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
    },
    navigation: {
      home: 'Home',
      events: 'Events',
      about: 'About',
    },
    events: {
      create: 'Create Event',
      edit: 'Edit Event',
      delete: 'Delete Event',
      free: 'Free',
      paid: 'Paid',
    }
  }

  describe('validateTranslationKeys', () => {
    it('should validate that all required keys exist', () => {
      const requiredKeys = ['common.save', 'common.cancel', 'navigation.home']
      const result = validateTranslationKeys(mockMessages, requiredKeys)
      
      expect(result.isValid).toBe(true)
      expect(result.missingKeys).toHaveLength(0)
    })

    it('should detect missing translation keys', () => {
      const requiredKeys = ['common.save', 'common.missing', 'navigation.nonexistent']
      const result = validateTranslationKeys(mockMessages, requiredKeys)
      
      expect(result.isValid).toBe(false)
      expect(result.missingKeys).toContain('common.missing')
      expect(result.missingKeys).toContain('navigation.nonexistent')
    })

    it('should handle nested keys correctly', () => {
      const requiredKeys = ['events.create', 'events.actions.view']
      const result = validateTranslationKeys(mockMessages, requiredKeys)
      
      expect(result.isValid).toBe(false) // events.actions.view doesn't exist
      expect(result.missingKeys).toContain('events.actions.view')
    })
  })

  describe('extractAllKeys', () => {
    it('should extract all nested keys from an object', () => {
      const keys = extractAllKeys(mockMessages)
      
      expect(keys).toContain('common.save')
      expect(keys).toContain('common.cancel')
      expect(keys).toContain('navigation.home')
      expect(keys).toContain('events.create')
      expect(keys).toContain('events.free')
    })

    it('should handle empty objects', () => {
      const keys = extractAllKeys({})
      expect(keys).toHaveLength(0)
    })

    it('should handle deeply nested objects', () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              value: 'deep value'
            }
          }
        }
      }
      
      const keys = extractAllKeys(deepObject)
      expect(keys).toContain('level1.level2.level3.value')
    })
  })

  describe('checkTranslationCompleteness', () => {
    it('should validate completeness across multiple locales', () => {
      const locales = {
        en: {
          common: { save: 'Save', cancel: 'Cancel' },
          navigation: { home: 'Home' }
        },
        ar: {
          common: { save: 'حفظ', cancel: 'إلغاء' },
          navigation: { home: 'الرئيسية' }
        }
      }
      
      const result = checkTranslationCompleteness(locales)
      expect(result.isComplete).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should detect missing keys in locales', () => {
      const locales = {
        en: {
          common: { save: 'Save', cancel: 'Cancel' },
          navigation: { home: 'Home' }
        },
        ar: {
          common: { save: 'حفظ' }, // Missing 'cancel'
          // Missing entire 'navigation' section
        }
      }
      
      const result = checkTranslationCompleteness(locales)
      expect(result.isComplete).toBe(false)
      expect(result.issues.some(issue => issue.includes('cancel'))).toBe(true)
      expect(result.issues.some(issue => issue.includes('navigation.home'))).toBe(true)
    })

    it('should handle empty locales', () => {
      const result = checkTranslationCompleteness({})
      expect(result.isComplete).toBe(false)
      expect(result.issues).toContain('No locales found')
    })
  })

  describe('Locale fallback behavior', () => {
    it('should test fallback to default locale', () => {
      const getTranslation = (key: string, locale: string, messages: any, fallback = 'en') => {
        const getNestedValue = (obj: any, path: string) => {
          return path.split('.').reduce((current, key) => current?.[key], obj)
        }
        
        // Try requested locale first
        let value = getNestedValue(messages[locale], key)
        if (value !== undefined) return value
        
        // Fallback to default locale
        value = getNestedValue(messages[fallback], key)
        if (value !== undefined) return value
        
        // Return key if no translation found
        return key
      }
      
      const messages = {
        en: { greeting: 'Hello' },
        ar: { /* missing greeting */ }
      }
      
      expect(getTranslation('greeting', 'ar', messages)).toBe('Hello') // Falls back to English
      expect(getTranslation('missing', 'en', messages)).toBe('missing') // Returns key when not found
    })
  })
})