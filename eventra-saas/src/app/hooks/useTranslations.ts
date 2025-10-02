import { useLanguage } from '../components/LanguageProvider'

// Simple translation strings
const translations = {
  en: {
    'discovery.venuesFound': 'venues found',
    'discovery.noVenuesFound': 'No venues found',
    'discovery.tryDifferentFilters': 'Try adjusting your filters',
    'discovery.clearFilters': 'Clear All Filters',
    'navigation.home': 'Home',
    'navigation.events': 'Events',
    'navigation.about': 'About',
    'navigation.dashboard': 'Dashboard'
  },
  ar: {
    'discovery.venuesFound': 'مكان',
    'discovery.noVenuesFound': 'لم يتم العثور على أماكن',
    'discovery.tryDifferentFilters': 'جرب تعديل الفلاتر',
    'discovery.clearFilters': 'مسح جميع الفلاتر',
    'navigation.home': 'الرئيسية',
    'navigation.events': 'الفعاليات',
    'navigation.about': 'معلومات عنا',
    'navigation.dashboard': 'لوحة التحكم'
  },
  ku: {
    'discovery.venuesFound': 'شوێن دۆزرایەوە',
    'discovery.noVenuesFound': 'هیچ شوێنێك نەدۆزرایەوە',
    'discovery.tryDifferentFilters': 'فلتەرەکان بگۆڕە',
    'discovery.clearFilters': 'سڕینەوەی هەموو فلتەرەکان',
    'navigation.home': 'سەرەتا',
    'navigation.events': 'بۆنەکان',
    'navigation.about': 'دەربارە',
    'navigation.dashboard': 'داشبۆرد'
  }
};

export function useTranslations() {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    const lang = language as keyof typeof translations;
    const translation = translations[lang]?.[key as keyof typeof translations['en']];
    return translation || key;
  };

  return { t, locale: language, setLocale: () => {} };
}
