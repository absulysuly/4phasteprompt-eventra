import {
  isValidLocale,
  getLocaleConfig,
  detectLocale,
  formatDate,
  formatNumber,
  formatCurrency,
  getTextDirection,
  isRTL,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_CODES,
} from '../i18n';

describe('i18n utility functions', () => {
  describe('isValidLocale', () => {
    it('returns true for valid locales', () => {
      expect(isValidLocale('en')).toBe(true);
      expect(isValidLocale('ar')).toBe(true);
      expect(isValidLocale('ku')).toBe(true);
    });

    it('returns false for invalid locales', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('es')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
      expect(isValidLocale('')).toBe(false);
      expect(isValidLocale('invalid')).toBe(false);
    });

    it('is case sensitive', () => {
      expect(isValidLocale('EN')).toBe(false);
      expect(isValidLocale('AR')).toBe(false);
      expect(isValidLocale('Ku')).toBe(false);
    });
  });

  describe('getLocaleConfig', () => {
    it('returns correct config for valid locales', () => {
      const enConfig = getLocaleConfig('en');
      expect(enConfig.code).toBe('en');
      expect(enConfig.name).toBe('English');
      expect(enConfig.nativeName).toBe('English');
      expect(enConfig.direction).toBe('ltr');
      expect(enConfig.flag).toBe('🇬🇧');

      const arConfig = getLocaleConfig('ar');
      expect(arConfig.code).toBe('ar');
      expect(arConfig.name).toBe('Arabic');
      expect(arConfig.nativeName).toBe('العربية');
      expect(arConfig.direction).toBe('rtl');
      expect(arConfig.flag).toBe('🇮🇶');

      const kuConfig = getLocaleConfig('ku');
      expect(kuConfig.code).toBe('ku');
      expect(kuConfig.name).toBe('Kurdish');
      expect(kuConfig.nativeName).toBe('کوردی');
      expect(kuConfig.direction).toBe('rtl');
      expect(kuConfig.flag).toBe('🏴');
    });

    it('returns default locale config for invalid locales', () => {
      const invalidConfig = getLocaleConfig('invalid');
      expect(invalidConfig.code).toBe(DEFAULT_LOCALE);

      const frenchConfig = getLocaleConfig('fr');
      expect(frenchConfig.code).toBe(DEFAULT_LOCALE);
    });

    it('handles empty string gracefully', () => {
      const emptyConfig = getLocaleConfig('');
      expect(emptyConfig.code).toBe(DEFAULT_LOCALE);
    });

    it('includes all required configuration fields', () => {
      const config = getLocaleConfig('en');
      expect(config).toHaveProperty('code');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('nativeName');
      expect(config).toHaveProperty('direction');
      expect(config).toHaveProperty('flag');
      expect(config).toHaveProperty('dateFormat');
      expect(config).toHaveProperty('numberFormat');
      expect(config).toHaveProperty('currency');
    });
  });

  describe('detectLocale', () => {
    it('prioritizes URL locale over accept-language', () => {
      const result = detectLocale('ar,en;q=0.8', 'en');
      expect(result).toBe('en');
    });

    it('falls back to accept-language when URL locale is invalid', () => {
      const result = detectLocale('ar,en;q=0.8', 'invalid');
      expect(result).toBe('ar');
    });

    it('falls back to accept-language when URL locale is not provided', () => {
      const result = detectLocale('ku,ar;q=0.9,en;q=0.8');
      expect(result).toBe('ku');
    });

    it('returns default locale when both parameters are invalid', () => {
      const result = detectLocale('fr,de;q=0.8', 'es');
      expect(result).toBe(DEFAULT_LOCALE);
    });

    it('returns default locale when no parameters provided', () => {
      const result = detectLocale();
      expect(result).toBe(DEFAULT_LOCALE);
    });

    it('handles complex accept-language headers', () => {
      const result1 = detectLocale('en-US,en;q=0.9,ar;q=0.8,ku;q=0.7');
      expect(result1).toBe('en');

      const result2 = detectLocale('fr-FR,fr;q=0.9,ar-IQ;q=0.8,ku;q=0.7');
      expect(result2).toBe('ar');
    });

    it('is case insensitive for accept-language matching', () => {
      const result1 = detectLocale('EN,AR;q=0.8');
      expect(result1).toBe('en');

      const result2 = detectLocale('ar-IQ,AR;q=0.8');
      expect(result2).toBe('ar');
    });

    it('matches partial language codes in accept-language', () => {
      const result1 = detectLocale('en-US,en-GB;q=0.8');
      expect(result1).toBe('en');

      const result2 = detectLocale('ar-IQ,ar-SA;q=0.8');
      expect(result2).toBe('ar');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-12-25T10:30:00.000Z');
    const testDateString = '2024-12-25T10:30:00.000Z';

    it('formats dates for English locale', () => {
      const result = formatDate(testDate, 'en');
      expect(result).toContain('December');
      expect(result).toContain('25');
      expect(result).toContain('2024');
    });

    it('formats dates for Arabic locale', () => {
      const result = formatDate(testDate, 'ar');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('formats dates for Kurdish locale', () => {
      const result = formatDate(testDate, 'ku');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts Date objects and date strings', () => {
      const dateObjResult = formatDate(testDate, 'en');
      const dateStringResult = formatDate(testDateString, 'en');
      
      expect(dateObjResult).toBe(dateStringResult);
    });

    it('applies custom options when provided', () => {
      const shortOptions = { 
        month: 'short' as const, 
        day: 'numeric' as const,
        year: 'numeric' as const
      };
      
      const result = formatDate(testDate, 'en', shortOptions);
      expect(result).toContain('Dec');
      expect(result).not.toContain('December');
    });

    it('falls back to default locale for invalid locales', () => {
      const result = formatDate(testDate, 'invalid');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles edge cases with invalid dates', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate, 'en');
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers for English locale', () => {
      const result = formatNumber(1234.56, 'en');
      expect(result).toBe('1,234.56');
    });

    it('formats numbers for Arabic locale', () => {
      const result = formatNumber(1234.56, 'ar');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('formats numbers for Kurdish locale', () => {
      const result = formatNumber(1234.56, 'ku');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('applies custom number format options', () => {
      const percentOptions = { style: 'percent' as const };
      const result = formatNumber(0.85, 'en', percentOptions);
      expect(result).toContain('%');
    });

    it('handles zero and negative numbers', () => {
      expect(formatNumber(0, 'en')).toBe('0');
      expect(formatNumber(-123.45, 'en')).toBe('-123.45');
    });

    it('handles very large numbers', () => {
      const result = formatNumber(1234567890.123, 'en');
      expect(result).toContain('1,234,567,890');
    });

    it('falls back to default locale for invalid locales', () => {
      const result = formatNumber(123.45, 'invalid');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats currency for English locale', () => {
      const result = formatCurrency(1234.56, 'en');
      expect(result).toContain('IQD');
      expect(result).toContain('1,234.56');
    });

    it('formats currency for Arabic locale', () => {
      const result = formatCurrency(1234.56, 'ar');
      expect(result).toContain('IQD');
      expect(typeof result).toBe('string');
    });

    it('formats currency for Kurdish locale', () => {
      const result = formatCurrency(1234.56, 'ku');
      expect(result).toContain('IQD');
      expect(typeof result).toBe('string');
    });

    it('handles zero amount', () => {
      const result = formatCurrency(0, 'en');
      expect(result).toContain('0');
      expect(result).toContain('IQD');
    });

    it('handles negative amounts', () => {
      const result = formatCurrency(-50.25, 'en');
      expect(result).toContain('-');
      expect(result).toContain('50.25');
      expect(result).toContain('IQD');
    });

    it('uses correct currency for all locales', () => {
      const enResult = formatCurrency(100, 'en');
      const arResult = formatCurrency(100, 'ar');
      const kuResult = formatCurrency(100, 'ku');
      
      expect(enResult).toContain('IQD');
      expect(arResult).toContain('IQD');
      expect(kuResult).toContain('IQD');
    });
  });

  describe('getTextDirection', () => {
    it('returns correct direction for LTR locales', () => {
      expect(getTextDirection('en')).toBe('ltr');
    });

    it('returns correct direction for RTL locales', () => {
      expect(getTextDirection('ar')).toBe('rtl');
      expect(getTextDirection('ku')).toBe('rtl');
    });

    it('falls back to default locale direction for invalid locales', () => {
      const defaultDirection = getTextDirection(DEFAULT_LOCALE);
      expect(getTextDirection('invalid')).toBe(defaultDirection);
      expect(getTextDirection('fr')).toBe(defaultDirection);
    });
  });

  describe('isRTL', () => {
    it('returns false for LTR locales', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('returns true for RTL locales', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('ku')).toBe(true);
    });

    it('falls back to default locale RTL status for invalid locales', () => {
      const defaultRTL = isRTL(DEFAULT_LOCALE);
      expect(isRTL('invalid')).toBe(defaultRTL);
      expect(isRTL('fr')).toBe(defaultRTL);
    });
  });

  describe('Constants', () => {
    it('has correct default locale', () => {
      expect(DEFAULT_LOCALE).toBe('ar');
    });

    it('has correct locale codes', () => {
      expect(LOCALE_CODES).toEqual(['en', 'ar', 'ku']);
    });

    it('has all required locales in SUPPORTED_LOCALES', () => {
      expect(SUPPORTED_LOCALES).toHaveProperty('en');
      expect(SUPPORTED_LOCALES).toHaveProperty('ar');
      expect(SUPPORTED_LOCALES).toHaveProperty('ku');
    });

    it('has consistent locale configuration structure', () => {
      Object.values(SUPPORTED_LOCALES).forEach(config => {
        expect(config).toHaveProperty('code');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('nativeName');
        expect(config).toHaveProperty('direction');
        expect(config).toHaveProperty('flag');
        expect(config).toHaveProperty('dateFormat');
        expect(config).toHaveProperty('numberFormat');
        expect(config).toHaveProperty('currency');
        
        expect(['ltr', 'rtl']).toContain(config.direction);
        expect(typeof config.code).toBe('string');
        expect(typeof config.name).toBe('string');
        expect(typeof config.nativeName).toBe('string');
        expect(typeof config.flag).toBe('string');
        expect(typeof config.dateFormat).toBe('string');
        expect(typeof config.numberFormat).toBe('string');
        expect(typeof config.currency).toBe('string');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles undefined inputs gracefully', () => {
      expect(() => getLocaleConfig(undefined as any)).not.toThrow();
      expect(() => isValidLocale(undefined as any)).not.toThrow();
      expect(() => getTextDirection(undefined as any)).not.toThrow();
    });

    it('handles null inputs gracefully', () => {
      expect(() => getLocaleConfig(null as any)).not.toThrow();
      expect(() => isValidLocale(null as any)).not.toThrow();
      expect(() => getTextDirection(null as any)).not.toThrow();
    });

    it('handles numeric inputs to string functions', () => {
      expect(() => getLocaleConfig(123 as any)).not.toThrow();
      expect(() => isValidLocale(456 as any)).not.toThrow();
    });

    it('maintains consistent behavior across all functions', () => {
      const testLocales = ['en', 'ar', 'ku', 'invalid', '', null, undefined];
      
      testLocales.forEach(locale => {
        expect(() => {
          if (locale !== null && locale !== undefined) {
            isValidLocale(locale as string);
            getLocaleConfig(locale as string);
            getTextDirection(locale as string);
            isRTL(locale as string);
          }
        }).not.toThrow();
      });
    });
  });

  describe('Performance', () => {
    it('returns consistent results for repeated calls', () => {
      const locale = 'en';
      const config1 = getLocaleConfig(locale);
      const config2 = getLocaleConfig(locale);
      
      expect(config1).toEqual(config2);
    });

    it('handles many rapid calls without issues', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        isValidLocale('en');
        getLocaleConfig('ar');
        getTextDirection('ku');
        formatNumber(123.45, 'en');
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});