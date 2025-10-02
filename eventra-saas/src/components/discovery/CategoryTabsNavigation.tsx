'use client';

import React from 'react';

interface CategoryTabsNavigationProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  locale?: 'en' | 'ar' | 'ku';
  eventCounts?: Record<string, number>; // category -> event count
}

const categories = [
  {
    id: 'ALL',
    label: { en: 'All Events', ar: 'جميع الفعاليات', ku: 'هەموو ڕووداوەکان' },
    icon: '🎯',
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    id: 'WEDDING',
    label: { en: 'Weddings', ar: 'حفلات الزفاف', ku: 'ئاهەنگی زەماوەند' },
    icon: '💍',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    id: 'CONFERENCE',
    label: { en: 'Conferences', ar: 'المؤتمرات', ku: 'کۆنفرانسەکان' },
    icon: '🎤',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'CONCERT',
    label: { en: 'Concerts', ar: 'الحفلات الموسيقية', ku: 'کۆنسێرتەکان' },
    icon: '🎵',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'EXHIBITION',
    label: { en: 'Exhibitions', ar: 'المعارض', ku: 'پێشانگاکان' },
    icon: '🎨',
    gradient: 'from-amber-500 to-orange-500'
  },
  {
    id: 'SPORT',
    label: { en: 'Sports', ar: 'الرياضة', ku: 'وەرزشەکان' },
    icon: '⚽',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'SOCIAL',
    label: { en: 'Social', ar: 'اجتماعي', ku: 'کۆمەڵایەتی' },
    icon: '🎉',
    gradient: 'from-indigo-500 to-blue-500'
  }
];

export default function CategoryTabsNavigation({
  activeCategory,
  onCategoryChange,
  locale = 'en',
  eventCounts
}: CategoryTabsNavigationProps) {
  const isRTL = locale === 'ar' || locale === 'ku';

  const getCategoryLabel = (category: typeof categories[0]) => {
    return category.label[locale];
  };

  const getEventCount = (categoryId: string) => {
    if (categoryId === 'ALL' && eventCounts) {
      // Sum all category counts for "ALL"
      return Object.entries(eventCounts)
        .filter(([key]) => key !== 'ALL')
        .reduce((sum, [, count]) => sum + count, 0);
    }
    return eventCounts?.[categoryId];
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Desktop: Horizontal Tabs */}
        <div className="hidden md:flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const count = getEventCount(category.id);

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  relative flex-shrink-0 px-6 py-3 rounded-xl font-semibold text-sm
                  transition-all duration-300 whitespace-nowrap
                  flex items-center gap-2
                  ${isActive
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-primary-300`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{getCategoryLabel(category)}</span>
                {count !== undefined && count > 0 && (
                  <span className={`
                    px-2.5 py-0.5 rounded-full text-xs font-bold
                    ${isActive
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

        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            const count = getEventCount(category.id);

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  relative flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-xs
                  transition-all duration-300 whitespace-nowrap
                  flex flex-col items-center gap-1 min-w-[80px]
                  ${isActive
                    ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-[10px] leading-tight text-center">
                  {getCategoryLabel(category)}
                </span>
                {count !== undefined && count > 0 && (
                  <span className={`
                    absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold
                    ${isActive
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'bg-primary-500 text-white'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
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
