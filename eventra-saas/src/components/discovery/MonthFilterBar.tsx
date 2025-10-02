'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthFilterBarProps {
  selectedMonth: number | null; // 1-12, null for "All"
  onMonthChange: (month: number | null) => void;
  locale?: 'en' | 'ar' | 'ku';
  year?: number;
  eventCounts?: Record<number, number>; // month -> event count
}

const monthNames = {
  en: [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  ar: [
    'جميع الأشهر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ],
  ku: [
    'هەموو مانگەکان', 'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
    'تەمموز', 'ئاب', 'ئەیلول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'
  ]
};

const monthShortNames = {
  en: ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: ['الكل', 'ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  ku: ['هەموو', 'کان2', 'شوب', 'ئاز', 'نیس', 'ئای', 'حوز', 'تەم', 'ئاب', 'ئەی', 'تشر1', 'تشر2', 'کان1']
};

export default function MonthFilterBar({
  selectedMonth,
  onMonthChange,
  locale = 'en',
  year = new Date().getFullYear(),
  eventCounts
}: MonthFilterBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'ar' || locale === 'ku';
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Auto-scroll to selected month on mount
  useEffect(() => {
    if (selectedMonth !== null && scrollContainerRef.current) {
      const button = scrollContainerRef.current.querySelector(`[data-month="${selectedMonth}"]`);
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedMonth]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    const scrollDirection = isRTL 
      ? (direction === 'left' ? scrollAmount : -scrollAmount)
      : (direction === 'left' ? -scrollAmount : scrollAmount);
    
    scrollContainerRef.current.scrollBy({ left: scrollDirection, behavior: 'smooth' });
  };

  const months = Array.from({ length: 13 }, (_, i) => i); // 0 = "All", 1-12 = months

  const getMonthLabel = (monthIndex: number) => {
    return monthNames[locale][monthIndex];
  };

  const getMonthShortLabel = (monthIndex: number) => {
    return monthShortNames[locale][monthIndex];
  };

  const getEventCount = (monthIndex: number) => {
    if (monthIndex === 0) {
      // Sum all months for "All"
      return eventCounts 
        ? Object.values(eventCounts).reduce((sum, count) => sum + count, 0)
        : undefined;
    }
    return eventCounts?.[monthIndex];
  };

  const isCurrentMonth = (monthIndex: number) => {
    return monthIndex === currentMonth;
  };

  const isSelected = (monthIndex: number) => {
    return monthIndex === 0 ? selectedMonth === null : selectedMonth === monthIndex;
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

        {/* Scrollable Month Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-2 -mx-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {months.map((monthIndex) => {
            const selected = isSelected(monthIndex);
            const isCurrent = isCurrentMonth(monthIndex);
            const count = getEventCount(monthIndex);
            const monthValue = monthIndex === 0 ? null : monthIndex;

            return (
              <button
                key={monthIndex}
                data-month={monthIndex}
                onClick={() => onMonthChange(monthValue)}
                className={`
                  relative flex-shrink-0 px-5 py-3 rounded-xl font-semibold text-sm
                  transition-all duration-300 whitespace-nowrap
                  ${selected
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                  ${isCurrent && !selected ? 'ring-2 ring-primary-300 ring-offset-2' : ''}
                `}
              >
                <div className="flex flex-col items-center gap-1">
                  {/* Month Name */}
                  <span className="hidden sm:inline">{getMonthLabel(monthIndex)}</span>
                  <span className="sm:hidden">{getMonthShortLabel(monthIndex)}</span>
                  
                  {/* Event Count Badge */}
                  {count !== undefined && count > 0 && (
                    <span className={`
                      text-xs font-bold px-2 py-0.5 rounded-full
                      ${selected 
                        ? 'bg-white/30 text-white' 
                        : 'bg-primary-100 text-primary-700'
                      }
                    `}>
                      {count}
                    </span>
                  )}
                </div>

                {/* Current Month Indicator */}
                {isCurrent && (
                  <div className={`
                    absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full
                    ${selected ? 'bg-white' : 'bg-primary-500'}
                  `} />
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
