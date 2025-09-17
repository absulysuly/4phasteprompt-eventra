import React from 'react';
import type { City, Language } from '@/types';

interface ExploreCitiesProps {
  cities: City[];
  selectedCityId: string | null;
  onCitySelect: (cityId: string | null) => void;
  lang: Language;
}

export const ExploreCities: React.FC<ExploreCitiesProps> = ({
  cities,
  selectedCityId,
  onCitySelect,
  lang
}) => {
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {lang === 'en' ? 'Explore Cities' : lang === 'ar' ? 'استكشف المدن' : 'گەڕان بە شارەکان'}
        </h2>
        
        {/* Scrollable Cities Container */}
        <div className="relative">
          <div 
            className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 snap-x snap-mandatory" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* All Cities Button */}
            <button
              onClick={() => onCitySelect(null)}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 snap-center flex-shrink-0 ${
                !selectedCityId
                  ? 'bg-gray-800 text-white shadow-2xl shadow-gray-800/50 scale-105'
                  : 'bg-white/80 text-gray-800 hover:bg-white hover:shadow-xl shadow-lg backdrop-blur-sm'
              }`}
              style={{
                boxShadow: !selectedCityId 
                  ? '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              }}
            >
              {lang === 'en' ? 'All Cities' : lang === 'ar' ? 'كل المدن' : 'هەموو شارەکان'}
            </button>
            
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => onCitySelect(city.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 snap-center flex-shrink-0 ${
                  selectedCityId === city.id
                    ? 'bg-gray-800 text-white shadow-2xl shadow-gray-800/50 scale-105'
                    : 'bg-white/80 text-gray-800 hover:bg-white hover:shadow-xl shadow-lg backdrop-blur-sm'
                }`}
                style={{
                  boxShadow: selectedCityId === city.id 
                    ? '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                }}
              >
                {city.name[lang]}
              </button>
            ))}
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-yellow-400 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};