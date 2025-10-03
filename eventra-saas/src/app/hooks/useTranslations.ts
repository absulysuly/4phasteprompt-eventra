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
    'navigation.dashboard': 'Dashboard',
    // Dashboard Stories
    'dashboardStories.title': 'Stories',
    'dashboardStories.subtitle': 'Upload new stories and review moderation status (approved, pending, rejected). Approved stories are visible publicly for 24 hours.',
    'dashboardStories.uploadTitle': 'Upload Story',
    'dashboardStories.caption': 'Caption (optional)',
    'dashboardStories.captionPlaceholder': 'Write a short caption',
    'dashboardStories.language': 'Language (optional)',
    'dashboardStories.tagVenue': 'Tag a venue (optional)',
    'dashboardStories.auto': 'Auto',
    'dashboardStories.none': '— None —',
    'dashboardStories.upload': 'Upload',
    'dashboardStories.uploading': 'Uploading…',
    'dashboardStories.selectFileError': 'Please select an image or video file',
    'dashboardStories.messageSuccess': 'Story uploaded successfully',
    'dashboardStories.messageError': 'Upload failed',
    'dashboardStories.myStories': 'My Stories',
    'dashboardStories.loading': 'Loading…',
    'dashboardStories.noStories': 'No stories yet.',
    'dashboardStories.status': 'Status',
    'dashboardStories.expires': 'Expires',
    'dashboardStories.venue': 'Venue',
    'dashboardStories.filterByVenue': 'Filter by venue',
    'dashboardStories.allVenues': 'All venues',
    'dashboardStories.untagged': 'Untagged'
  },
  ar: {
    'discovery.venuesFound': 'مكان',
    'discovery.noVenuesFound': 'لم يتم العثور على أماكن',
    'discovery.tryDifferentFilters': 'جرب تعديل الفلاتر',
    'discovery.clearFilters': 'مسح جميع الفلاتر',
    'navigation.home': 'الرئيسية',
    'navigation.events': 'الفعاليات',
    'navigation.about': 'معلومات عنا',
    'navigation.dashboard': 'لوحة التحكم',
    // Dashboard Stories
    'dashboardStories.title': 'القصص',
    'dashboardStories.subtitle': 'قم برفع قصص جديدة وراجع حالة المراجعة (مقبول، قيد المراجعة، مرفوض). القصص المقبولة تظهر للعامة لمدة 24 ساعة.',
    'dashboardStories.uploadTitle': 'رفع قصة',
    'dashboardStories.caption': 'العنوان (اختياري)',
    'dashboardStories.captionPlaceholder': 'اكتب وصفاً قصيراً',
    'dashboardStories.language': 'اللغة (اختياري)',
    'dashboardStories.tagVenue': 'ربط بعمل/منشأة (اختياري)',
    'dashboardStories.auto': 'تلقائي',
    'dashboardStories.none': '— بدون —',
    'dashboardStories.upload': 'رفع',
    'dashboardStories.uploading': 'جاري الرفع…',
    'dashboardStories.selectFileError': 'يرجى اختيار ملف صورة أو فيديو',
    'dashboardStories.messageSuccess': 'تم رفع القصة بنجاح',
    'dashboardStories.messageError': 'فشل الرفع',
    'dashboardStories.myStories': 'قصصي',
    'dashboardStories.loading': 'جاري التحميل…',
    'dashboardStories.noStories': 'لا توجد قصص بعد.',
    'dashboardStories.status': 'الحالة',
    'dashboardStories.expires': 'ينتهي',
    'dashboardStories.venue': 'المنشأة',
    'dashboardStories.filterByVenue': 'تصفية حسب المنشأة',
    'dashboardStories.allVenues': 'كل المنشآت',
    'dashboardStories.untagged': 'بدون ربط'
  },
  ku: {
    'discovery.venuesFound': 'شوێن دۆزرایەوە',
    'discovery.noVenuesFound': 'هیچ شوێنێك نەدۆزرایەوە',
    'discovery.tryDifferentFilters': 'فلتەرەکان بگۆڕە',
    'discovery.clearFilters': 'سڕینەوەی هەموو فلتەرەکان',
    'navigation.home': 'سەرەتا',
    'navigation.events': 'بۆنەکان',
    'navigation.about': 'دەربارە',
    'navigation.dashboard': 'داشبۆرد',
    // Dashboard Stories
    'dashboardStories.title': 'چیرۆکەکان',
    'dashboardStories.subtitle': 'چیرۆکی نوێ بەرز بکە و دۆخی پشکنین ببینە (قبووڵکراو، چاوەڕوان، ڕەتکرایەوە). چیرۆکی قبووڵکراو بۆ ٢٤ کاتژمێر بە گشتی دەبینرێت.',
    'dashboardStories.uploadTitle': 'چیرۆک بەرزبکە',
    'dashboardStories.caption': 'سەردێر (ئیختیاری)',
    'dashboardStories.captionPlaceholder': 'پێناسەیەکی کورت بنووسە',
    'dashboardStories.language': 'زمان (ئیختیاری)',
    'dashboardStories.tagVenue': 'پەیوەستکردن بە پەیوەندیدار/کارگێڕ (ئیختیاری)',
    'dashboardStories.auto': 'خۆکار',
    'dashboardStories.none': '— هیچ —',
    'dashboardStories.upload': 'بەرزبکە',
    'dashboardStories.uploading': 'لە بەرزبردن…',
    'dashboardStories.selectFileError': 'تکایە وێنە یان ڤیدیۆ هەلبژێرە',
    'dashboardStories.messageSuccess': 'چیرۆکەکە بەسەرکەوتوویی بەرزکرایەوە',
    'dashboardStories.messageError': 'شکستی هێنا لە بەرزبردن',
    'dashboardStories.myStories': 'چیرۆکەکانم',
    'dashboardStories.loading': 'بارکردن…',
    'dashboardStories.noStories': 'هێشتا هیچ چیرۆکێک نییە.',
    'dashboardStories.status': 'دۆخ',
    'dashboardStories.expires': 'کۆتایی دێت',
    'dashboardStories.venue': 'شوێن/کارگێڕ',
    'dashboardStories.filterByVenue': 'پاڵاوتن بە شوێن',
    'dashboardStories.allVenues': 'هەموو شوێنەکان',
    'dashboardStories.untagged': 'بێ پەیوەستکردن'
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
