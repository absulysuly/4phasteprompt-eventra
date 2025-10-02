import React, { useRef } from 'react';

const GOVERNORATES = [
  { id: 'all', en: 'All', ar: 'الكل', ku: 'هەموو' },
  { id: 'baghdad', en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
  { id: 'basra', en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
  { id: 'mosul', en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' },
  { id: 'erbil', en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  { id: 'kirkuk', en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
  { id: 'najaf', en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
  { id: 'karbala', en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
  { id: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  { id: 'duhok', en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  { id: 'anbar', en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
  { id: 'diyala', en: 'Diyala', ar: 'ديالى', ku: 'دیالە' },
  { id: 'wasit', en: 'Wasit', ar: 'واسط', ku: 'واسیت' },
  { id: 'saladin', en: 'Saladin', ar: 'صلاح الدين', ku: 'سەلاحەدین' },
  { id: 'babil', en: 'Babil', ar: 'بابل', ku: 'بابل' },
  { id: 'dhiqar', en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' },
  { id: 'maysan', en: 'Maysan', ar: 'ميسان', ku: 'مەیسان' },
  { id: 'qadisiyyah', en: 'Al-Qadisiyyah', ar: 'القادسية', ku: 'قادسیە' },
  { id: 'muthanna', en: 'Al-Muthanna', ar: 'المثنى', ku: 'موسەننا' }
];

interface GovernorateFilterProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  onCityChange: (cityId: string) => void;
}

const GovernorateFilterBar: React.FC<GovernorateFilterProps> = ({ locale, selectedCity, onCityChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'ar' || locale === 'ku';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const container = scrollContainerRef.current;
      if (!container) return;
      const children = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
      let nextIndex;
      if ((isRTL && e.key === 'ArrowLeft') || (!isRTL && e.key === 'ArrowRight')) {
        nextIndex = (index + 1) % children.length;
      } else {
        nextIndex = (index - 1 + children.length) % children.length;
      }
      children[nextIndex]?.focus();
    }
  };

  return (
    <div
      className="sticky top-16 z-40 h-14 bg-gray-900/70 backdrop-blur-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        ref={scrollContainerRef}
        role="tablist"
        aria-label="Filter by governorate"
        className="flex h-full items-center overflow-x-auto gap-2 px-4 snap-x snap-mandatory lg:justify-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {GOVERNORATES.map((gov, index) => {
          const isActive = selectedCity === gov.id;
          return (
            <button
              key={gov.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onCityChange(gov.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`snap-start flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-400 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
              }`}
            >
              {gov[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GovernorateFilterBar;