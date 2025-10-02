import React, { useState, useEffect } from 'react';

// --- Helper Components & Data ---

const CATEGORIES = [
  { id: 'events', type: 'EVENT', icon: '🎉', label: { en: 'Events', ar: 'فعاليات', ku: 'ئاهەنگەکان' }, gradient: 'from-pink-500 to-pink-600' },
  { id: 'hotels', type: 'HOTEL', icon: '🏨', label: { en: 'Hotels', ar: 'فنادق', ku: 'هۆتێلەکان' }, gradient: 'from-blue-500 to-blue-600' },
  { id: 'restaurants', type: 'RESTAURANT', icon: '🍴', label: { en: 'Restaurants', ar: 'مطاعم', ku: 'چێشتخانەکان' }, gradient: 'from-orange-500 to-orange-600' },
  { id: 'cafes', type: 'ACTIVITY', icon: '☕', label: { en: 'Cafés', ar: 'مقاهي', ku: 'قاوەخانەکان' }, gradient: 'from-amber-500 to-amber-600' },
  { id: 'tourism', type: 'ACTIVITY', icon: '🏛️', label: { en: 'Tourism', ar: 'سياحة', ku: 'گەشتیاری' }, gradient: 'from-purple-500 to-purple-600' },
  { id: 'companies', type: 'SERVICE', icon: '🏢', label: { en: 'Companies', ar: 'شركات', ku: 'کۆمپانیاکان' }, gradient: 'from-green-500 to-green-600' },
];

const TabSkeleton: React.FC = () => (
  <div className="flex animate-pulse items-center gap-2 rounded-xl bg-gray-200 px-5 py-3 h-[48px] w-36">
    <div className="h-6 w-6 rounded-full bg-gray-300"></div>
    <div className="h-4 w-20 rounded bg-gray-300"></div>
  </div>
);

// Mocks an API call to fetch venue counts. In a real app, this would be a fetch request.
const fetchVenueCounts = async (city: string | null): Promise<Record<string, number>> => {
  console.log(`Fetching counts for city: ${city}...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Generate random counts for demonstration
  const counts: Record<string, number> = {};
  CATEGORIES.forEach(cat => {
    // Give 'all' city higher counts, and some categories more than others
    const cityMultiplier = (!city || city === 'all') ? 5 : 1;
    const baseCount = Math.floor(Math.random() * 50 * cityMultiplier);
    // Occasionally return 0 for some categories to test disabled state
    counts[cat.id] = Math.random() > 0.8 ? 0 : baseCount + Math.floor(Math.random() * 10);
  });
  return counts;
};


// --- Main Component ---

interface CategoryTabsProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryTabsNavigation: React.FC<CategoryTabsProps> = ({ locale, selectedCity, activeCategory, onCategoryChange }) => {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = locale === 'ar' || locale === 'ku';

  useEffect(() => {
    const getCounts = async () => {
      setIsLoading(true);
      const fetchedCounts = await fetchVenueCounts(selectedCity);
      setCounts(fetchedCounts);
      setIsLoading(false);
    };

    getCounts();
  }, [selectedCity]);

  return (
    <div
      className="sticky top-[120px] z-30 h-16 bg-gray-800/80 backdrop-blur-md border-b border-gray-700"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        role="tablist"
        aria-label="Filter by category"
        className="flex h-full items-center overflow-x-auto gap-3 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <TabSkeleton key={i} />)
        ) : (
          CATEGORIES.map(cat => {
            const count = counts?.[cat.id] ?? 0;
            const isActive = activeCategory === cat.id;
            const isDisabled = count === 0;

            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                disabled={isDisabled}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400 ${
                  isActive
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                    : 'text-gray-300 hover:bg-gray-700/50'
                } ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.label[locale]}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryTabsNavigation;