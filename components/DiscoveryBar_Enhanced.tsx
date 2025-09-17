import React, { useState, useRef, useEffect } from 'react';
import type { City, Category, Language } from '../types';

interface DiscoveryBarProps {
  cities: City[];
  categories: Category[];
  onFilterChange: (type: 'city' | 'category', id: string) => void;
  activeFilters: { city: string | null; category: string | null };
  lang: Language;
  eventCounts?: Record<string, number>; // Optional event counts per filter
}

const CityButton: React.FC<{ 
  city: City; 
  onClick: () => void; 
  isActive: boolean; 
  lang: Language; 
  eventCount?: number;
  index: number;
}> = ({ city, onClick, isActive, lang, eventCount, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center justify-center flex-shrink-0 h-14 px-6 rounded-xl border-2 transition-all duration-300 whitespace-nowrap group overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent text-white font-bold shadow-lg transform scale-105' 
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'
      }`} />
      
      {/* Content */}
      <div className="relative flex items-center space-x-2">
        <span className={`text-sm font-semibold transition-colors duration-200 ${
          isActive ? 'text-white' : 'text-gray-700 group-hover:text-blue-600'
        }`}>
          {city.name[lang]}
        </span>
        
        {eventCount !== undefined && eventCount > 0 && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium transition-colors duration-200 ${
            isActive 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
          }`}>
            {eventCount}
          </span>
        )}
      </div>

      {/* Hover Effect */}
      {isHovered && !isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 animate-pulse" />
      )}
    </button>
  );
};

const CategoryButton: React.FC<{ 
  category: Category; 
  onClick: () => void; 
  isActive: boolean; 
  lang: Language; 
  eventCount?: number;
  index: number;
}> = ({ category, onClick, isActive, lang, eventCount, index }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, string> = {
      'all': '🎯',
      'conference': '🏢',
      'workshop': '🛠️',
      'social': '🎉',
      'cultural': '🎭',
      'sports': '⚽',
      'education': '📚',
      'business': '💼',
      'technology': '💻',
      'health': '🏥',
      'food': '🍽️',
      'music': '🎵',
      'art': '🎨',
      'festival': '🎪',
      'charity': '❤️'
    };
    return icons[categoryId] || '📅';
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center flex-shrink-0 w-20 group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 overflow-hidden shadow-md ${
        isActive 
          ? 'border-blue-500 shadow-lg shadow-blue-500/30 bg-gradient-to-br from-blue-500 to-purple-600 transform scale-110' 
          : 'bg-white border-gray-200 group-hover:border-blue-300 group-hover:shadow-lg group-hover:-translate-y-1'
      }`}>
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-10'
        }`} />
        
        {/* Image or Icon */}
        {category.image && !imageError ? (
          <img 
            src={category.image} 
            alt={category.name[lang]} 
            className={`w-10 h-10 object-cover rounded-lg transition-all duration-300 ${
              isActive ? 'brightness-0 invert' : 'group-hover:scale-110'
            }`}
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={`text-2xl transition-all duration-300 ${
            isActive ? 'brightness-0 invert scale-110' : 'group-hover:scale-110'
          }`}>
            {getCategoryIcon(category.id)}
          </span>
        )}

        {/* Event Count Badge */}
        {eventCount !== undefined && eventCount > 0 && (
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            isActive 
              ? 'bg-white text-blue-600' 
              : 'bg-blue-500 text-white group-hover:bg-blue-600'
          }`}>
            {eventCount > 99 ? '99+' : eventCount}
          </div>
        )}

        {/* Pulse Effect for Active */}
        {isActive && (
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-400 animate-ping opacity-30" />
        )}
      </div>
      
      <span className={`mt-2 text-xs text-center font-medium transition-colors duration-200 h-8 flex items-center ${
        isActive 
          ? 'text-blue-600 font-bold' 
          : 'text-gray-600 group-hover:text-blue-600'
      }`}>
        {category.name[lang]}
      </span>
    </button>
  );
};

export const DiscoveryBar: React.FC<DiscoveryBarProps> = ({ 
  cities, categories, onFilterChange, activeFilters, lang, eventCounts = {} 
}) => {
  const [cityScrollPosition, setCityScrollPosition] = useState(0);
  const [showCityGradients, setShowCityGradients] = useState({ left: false, right: true });
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const cityScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const t = {
    cities: { en: 'Explore Cities', ar: 'استكشف المدن', ku: 'شارەکان بگەڕێ' },
    categories: { en: 'Find by Category', ar: 'البحث حسب الفئة', ku: 'بەپێی پۆلێن بدۆزەرەوە' },
    showMore: { en: 'Show More', ar: 'عرض المزيد', ku: 'زیاتر نیشان بدە' },
    showLess: { en: 'Show Less', ar: 'عرض أقل', ku: 'کەمتر نیشان بدە' },
    clearFilters: { en: 'Clear All', ar: 'مسح الكل', ku: 'سڕینەوەی هەمووی' },
    activeFilters: { en: 'Active Filters', ar: 'المرشحات النشطة', ku: 'پاڵێوەرە چالاکەکان' }
  };

  // Handle city scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (cityScrollRef.current) {
        const scrollLeft = cityScrollRef.current.scrollLeft;
        const maxScroll = cityScrollRef.current.scrollWidth - cityScrollRef.current.clientWidth;
        
        setShowCityGradients({
          left: scrollLeft > 0,
          right: scrollLeft < maxScroll - 10
        });
      }
    };

    const scrollElement = cityScrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollCities = (direction: 'left' | 'right') => {
    if (cityScrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = cityScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      cityScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = categoryScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const clearAllFilters = () => {
    onFilterChange('city', '');
    onFilterChange('category', 'all');
  };

  const hasActiveFilters = activeFilters.city || (activeFilters.category && activeFilters.category !== 'all');

  return (
    <div className="py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header with Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">{t.activeFilters[lang]}</span>
              <div className="flex space-x-2">
                {activeFilters.city && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {cities.find(c => c.id === activeFilters.city)?.name[lang]}
                  </span>
                )}
                {activeFilters.category && activeFilters.category !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    {categories.find(c => c.id === activeFilters.category)?.name[lang]}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              {t.clearFilters[lang]}
            </button>
          </div>
        )}

        {/* Cities Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800 flex items-center">
              <span className="mr-2">🏙️</span>
              {t.cities[lang]}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollCities('left')}
                disabled={!showCityGradients.left}
                className="p-2 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollCities('right')}
                disabled={!showCityGradients.right}
                className="p-2 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div 
              ref={cityScrollRef}
              className="flex overflow-x-auto scrollbar-hide gap-3 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {cities.map((city, index) => (
                <CityButton
                  key={city.id}
                  city={city}
                  onClick={() => onFilterChange('city', city.id === activeFilters.city ? '' : city.id)}
                  isActive={activeFilters.city === city.id}
                  lang={lang}
                  eventCount={eventCounts[`city_${city.id}`]}
                  index={index}
                />
              ))}
            </div>
            
            {/* Gradient Overlays */}
            {showCityGradients.left && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
            )}
            {showCityGradients.right && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-gray-800 flex items-center">
              <span className="mr-2">🎯</span>
              {t.categories[lang]}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollCategories('left')}
                className="p-2 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollCategories('right')}
                className="p-2 rounded-full bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div 
              ref={categoryScrollRef}
              className="flex overflow-x-auto scrollbar-hide gap-4 py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category, index) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  onClick={() => {
                    const newValue = category.id === 'all' ? '' : category.id;
                    const currentValue = activeFilters.category === 'all' ? '' : activeFilters.category;
                    onFilterChange('category', newValue === currentValue ? 'all' : newValue);
                  }}
                  isActive={
                    activeFilters.category === category.id || 
                    (category.id === 'all' && (!activeFilters.category || activeFilters.category === 'all'))
                  }
                  lang={lang}
                  eventCount={eventCounts[`category_${category.id}`]}
                  index={index}
                />
              ))}
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
          </div>
        </section>
      </div>

      {/* Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};