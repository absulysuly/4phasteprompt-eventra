import { render, screen, fireEvent } from '@testing-library/react';
import { SUPPORTED_LOCALES, isValidLocale, detectLocale, formatDate } from '../src/lib/i18n';

describe('Internationalization', () => {
  describe('Locale Configuration', () => {
    test('should support required locales', () => {
      const requiredLocales = ['en', 'ar', 'ku'];
      
      requiredLocales.forEach(locale => {
        expect(SUPPORTED_LOCALES[locale]).toBeDefined();
        expect(SUPPORTED_LOCALES[locale].code).toBe(locale);
      });
    });

    test('should validate locales correctly', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
      expect(isValidLocale('ku')).toBe(true);
      expect(isValidLocale('invalid')).toBe(false);
    });

    test('should detect locale with fallback', () => {
      expect(detectLocale('en-US', 'en')).toBe('en');
      expect(detectLocale('ar-IQ', 'ar')).toBe('ar');
      expect(detectLocale('invalid', undefined)).toBe('en');
    });

    test('should format dates correctly for different locales', () => {
      const testDate = new Date('2024-01-01T12:00:00Z');
      
      expect(formatDate(testDate, 'en')).toContain('2024');
      expect(formatDate(testDate, 'ar')).toBeDefined();
      expect(formatDate(testDate, 'ku')).toBeDefined();
    });
  });

  describe('RTL Support', () => {
    test('should identify RTL languages correctly', () => {
      expect(SUPPORTED_LOCALES.ar.direction).toBe('rtl');
      expect(SUPPORTED_LOCALES.ku.direction).toBe('rtl');
      expect(SUPPORTED_LOCALES.en.direction).toBe('ltr');
    });
  });
});