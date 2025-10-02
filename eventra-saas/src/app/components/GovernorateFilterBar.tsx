'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useRef } from 'react';

// 18 Iraqi Governorates with trilingual names
const IRAQI_GOVERNORATES = [
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

interface GovernorateFilterBarProps {
  onFilterChange?: (city: string | null) => void;
}

export default function GovernorateFilterBar({ onFilterChange }: GovernorateFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'en' | 'ar' | 'ku';
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'ar' || locale === 'ku';

  const currentCity = searchParams.get('city') || 'all';

  const handleCityChange = (cityId: string) => {
    const params = new URLSearchParams(searchParams);
    if (cityId === 'all') {
      params.delete('city');
    } else {
      params.set('city', cityId);
    }
    
    router.push(`?${params.toString()}`);
    
    if (onFilterChange) {
      onFilterChange(cityId === 'all' ? null : cityId);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollRef.current) return;
      
      const currentIndex = IRAQI_GOVERNORATES.findIndex(g => g.id === currentCity);
      
      if (e.key === 'ArrowRight' && !isRTL) {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, IRAQI_GOVERNORATES.length - 1);
        handleCityChange(IRAQI_GOVERNORATES[nextIndex].id);
      } else if (e.key === 'ArrowLeft' && !isRTL) {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        handleCityChange(IRAQI_GOVERNORATES[prevIndex].id);
      } else if (e.key === 'ArrowLeft' && isRTL) {
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, IRAQI_GOVERNORATES.length - 1);
        handleCityChange(IRAQI_GOVERNORATES[nextIndex].id);
      } else if (e.key === 'ArrowRight' && isRTL) {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        handleCityChange(IRAQI_GOVERNORATES[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCity, isRTL]);

  return (
    <div
      className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollPaddingLeft: '16px',
            scrollPaddingRight: '16px',
          }}
        >
          {IRAQI_GOVERNORATES.map((governorate) => {
            const isActive = currentCity === governorate.id;
            const name = governorate[locale];

            return (
              <button
                key={governorate.id}
                onClick={() => handleCityChange(governorate.id)}
                className={`
                  snap-start flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-150 ease-in-out whitespace-nowrap
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:scale-105'
                  }
                `}
                aria-pressed={isActive}
                aria-label={`Filter by ${name}`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
