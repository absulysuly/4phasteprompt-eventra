'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

const CATEGORIES = [
  { 
    id: 'events', 
    type: 'EVENT',
    icon: '🎉', 
    gradient: 'from-pink-500 to-pink-600',
    en: 'Events', 
    ar: 'الفعاليات', 
    ku: 'ڕووداوەکان' 
  },
  { 
    id: 'hotels', 
    type: 'HOTEL',
    icon: '🏨', 
    gradient: 'from-blue-500 to-blue-600',
    en: 'Hotels', 
    ar: 'الفنادق', 
    ku: 'هوتێلەکان' 
  },
  { 
    id: 'restaurants', 
    type: 'RESTAURANT',
    icon: '🍴', 
    gradient: 'from-orange-500 to-orange-600',
    en: 'Restaurants', 
    ar: 'المطاعم', 
    ku: 'چێشتخانەکان' 
  },
  { 
    id: 'cafes', 
    type: 'ACTIVITY',
    icon: '☕', 
    gradient: 'from-amber-500 to-amber-600',
    en: 'Cafés', 
    ar: 'المقاهي', 
    ku: 'کافێکان' 
  },
  { 
    id: 'tourism', 
    type: 'ACTIVITY',
    icon: '🏛️', 
    gradient: 'from-purple-500 to-purple-600',
    en: 'Tourism', 
    ar: 'السياحة', 
    ku: 'گەشتیاری' 
  },
  { 
    id: 'companies', 
    type: 'SERVICE',
    icon: '🏢', 
    gradient: 'from-green-500 to-green-600',
    en: 'Companies', 
    ar: 'الشركات', 
    ku: 'کۆمپانیاکان' 
  }
];

interface CategoryTabsNavigationProps {
  selectedCity?: string | null;
  onTabChange?: (type: string) => void;
}

export default function CategoryTabsNavigation({ selectedCity, onTabChange }: CategoryTabsNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale() as 'en' | 'ar' | 'ku';
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const currentCategory = searchParams.get('category') || 'events';
  const isRTL = locale === 'ar' || locale === 'ku';

  // Fetch category counts
  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const promises = CATEGORIES.map(async (category) => {
          const params = new URLSearchParams();
          params.set('type', category.type);
          if (selectedCity && selectedCity !== 'all') {
            params.set('city', selectedCity);
          }
          
          const response = await fetch(`/api/venues/count?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            return { id: category.id, count: data.count || 0 };
          }
          return { id: category.id, count: 0 };
        });
        
        const results = await Promise.all(promises);
        const countsMap = results.reduce((acc, { id, count }) => {
          acc[id] = count;
          return acc;
        }, {} as Record<string, number>);
        
        setCounts(countsMap);
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, [selectedCity]);

  const handleTabClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('category', categoryId);
    
    router.push(`?${params.toString()}`);
    
    if (onTabChange) {
      onTabChange(categoryId);
    }
  };

  return (
    <div 
      className="sticky top-[120px] z-30 bg-white border-b border-slate-200 shadow-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:justify-center">
          {CATEGORIES.map((category) => {
            const isActive = currentCategory === category.id;
            const name = category[locale];
            const count = counts[category.id] || 0;

            return (
              <button
                key={category.id}
                onClick={() => handleTabClick(category.id)}
                className={`
                  snap-start flex-shrink-0 flex flex-col items-center justify-center
                  px-6 py-3 rounded-xl text-sm font-medium transition-all duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                  ${
                    isActive
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg hover:scale-105`
                      : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }
                `}
                aria-pressed={isActive}
                aria-label={`${name} (${count})`}
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className={isActive ? 'font-semibold' : 'font-medium'}>
                  {name}
                </span>
                <span className={`text-xs mt-1 ${isActive ? 'text-white font-bold' : 'text-slate-500'}`}>
                  {isLoading ? (
                    <span className="inline-block w-8 h-3 bg-slate-200 rounded animate-pulse"></span>
                  ) : (
                    `(${count})`
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
