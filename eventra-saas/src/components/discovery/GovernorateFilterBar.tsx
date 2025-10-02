'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface GovernorateFilterBarProps {
  selectedGovernorate: string | null;
  onGovernorateChange: (governorate: string | null) => void;
  locale?: 'en' | 'ar' | 'ku';
  eventCounts?: Record<string, number>; // governorate -> event count
}

const governorates = [
  { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
  { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
  { en: 'Nineveh', ar: 'نينوى', ku: 'نەینەوا' },
  { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
  { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
  { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
  { en: 'Diyala', ar: 'ديالى', ku: 'دیالە' },
  { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
  { en: 'Saladin', ar: 'صلاح الدين', ku: 'سەلاحەددین' },
  { en: 'Wasit', ar: 'واسط', ku: 'واسیت' },
  { en: 'Babil', ar: 'بابل', ku: 'بابل' },
  { en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' },
  { en: 'Maysan', ar: 'ميسان', ku: 'مەیسان' },
  { en: 'Muthanna', ar: 'المثنى', ku: 'موسەنا' },
  { en: 'Qadisiyyah', ar: 'القادسية', ku: 'قادسیە' }
];

const translations = {
  all: { en: 'All Locations', ar: 'جميع المواقع', ku: 'هەموو شوێنەکان' }
};

export default function GovernorateFilterBar({
  selectedGovernorate,
  onGovernorateChange,
  locale = 'en',
  eventCounts
}: GovernorateFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'ar' || locale === 'ku';

  // Auto-scroll to selected governorate on mount
  useEffect(() => {
    if (selectedGovernorate && scrollContainerRef.current) {
      const button = scrollContainerRef.current.querySelector(`[data-governorate="${selectedGovernorate}"]`);
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedGovernorate]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    const scrollDirection = isRTL 
      ? (direction === 'left' ? scrollAmount : -scrollAmount)
      : (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollContainerRef.current.scrollBy({ left: scrollDirection, behavior: 'smooth' });
  };

  const getGovernorateName = (gov: typeof governorates[0]) => {
    return locale === 'ar' ? gov.ar : locale === 'ku' ? gov.ku : gov.en;
  };

  const getEventCount = (govName: string) => {
    return eventCounts?.[govName];
  };

  const getTotalCount = () => {
    return eventCounts 
      ? Object.values(eventCounts).reduce((sum, count) => sum + count, 0)
      : undefined;
  };

  return (
    <div className="relative bg-white border-b border-gray-200 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Scroll Left Button */}
        <button
          onClick={() => scroll('left')}
          className={`
            hidden md:flex absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10
            w-10 h-10 items-center justify-center rounded-full
            bg-white shadow-lg border border-gray-200
            hover:bg-gray-50 hover:border-gray-300 transition-all
            ${isRTL ? '-mr-5' : '-ml-5'}
          `}
          aria-label="Scroll left"
        >
          <ChevronLeft className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
        </button>

        {/* Scrollable Governorate Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-2 -mx-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* All Locations Button */}
          <button
            data-governorate="all"
            onClick={() => onGovernorateChange(null)}
            className={`
              relative flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-300 whitespace-nowrap
              flex items-center gap-2
              ${selectedGovernorate === null
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }
            `}
          >
            <MapPin className="w-4 h-4" />
            <span>{translations.all[locale]}</span>
            {getTotalCount() !== undefined && getTotalCount()! > 0 && (
              <span className={`
                ml-1 px-2 py-0.5 rounded-full text-xs font-bold
                ${selectedGovernorate === null
                  ? 'bg-white/30 text-white'
                  : 'bg-primary-100 text-primary-700'
                }
              `}>
                {getTotalCount()}
              </span>
            )}
          </button>

          {/* Governorate Buttons */}
          {governorates.map((gov) => {
            const isSelected = selectedGovernorate === gov.en;
            const count = getEventCount(gov.en);

            return (
              <button
                key={gov.en}
                data-governorate={gov.en}
                onClick={() => onGovernorateChange(gov.en)}
                className={`
                  relative flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm
                  transition-all duration-300 whitespace-nowrap
                  ${isSelected
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                `}
              >
                <span>{getGovernorateName(gov)}</span>
                {count !== undefined && count > 0 && (
                  <span className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                    ${isSelected
                      ? 'bg-white/30 text-white'
                      : 'bg-primary-100 text-primary-700'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => scroll('right')}
          className={`
            hidden md:flex absolute ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10
            w-10 h-10 items-center justify-center rounded-full
            bg-white shadow-lg border border-gray-200
            hover:bg-gray-50 hover:border-gray-300 transition-all
            ${isRTL ? '-ml-5' : '-mr-5'}
          `}
          aria-label="Scroll right"
        >
          <ChevronRight className={`w-5 h-5 text-gray-600 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
