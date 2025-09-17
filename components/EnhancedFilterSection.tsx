import React from 'react';
import type { City, Category, Language } from '@/types';

interface EnhancedFilterSectionProps {
  cities: City[];
  categories: Category[];
  selectedCityId: string | null;
  selectedCategoryId: string | null;
  lang: Language;
  onCityChange: (cityId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

// Category icon mapping - Updated for actual categories
const categoryIcons: Record<string, string> = {
  'music': '🎵',
  'art': '🎨',
  'food': '🍽️',
  'tech': '💻',
  'sports': '⚽',
  'business': '💼'
};

// City landmark mapping - Updated for Kurdistan cities
const cityLandmarks: Record<string, string> = {
  'erbil': '🏛️', // Ancient citadel
  'slemani': '🏔️', // Mountains
  'duhok': '🌉', // Delal Bridge
  'halabja': '🌹', // Memorial and peace
  'kirkuk': '🛢️', // Oil city
  'zaxo': '🌉'  // Historic bridge
};

export const EnhancedFilterSection: React.FC<EnhancedFilterSectionProps> = ({
  cities,
  categories,
  selectedCityId,
  selectedCategoryId,
  lang,
  onCityChange,
  onCategoryChange
}) => {
  return (
    <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Categories Row */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            {lang === 'en' ? 'Categories' : 'الفئات'}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onCategoryChange(null)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[100px] ${
                !selectedCategoryId 
                  ? 'bg-white shadow-lg scale-110 transform' 
                  : 'bg-white/80 hover:bg-white hover:scale-105'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-2xl mb-2">
                🌟
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {lang === 'en' ? 'All' : 'الكل'}
              </span>
            </button>
            
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[100px] ${
                  selectedCategoryId === category.id 
                    ? 'bg-white shadow-lg scale-110 transform' 
                    : 'bg-white/80 hover:bg-white hover:scale-105'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-2xl mb-2">
                  {categoryIcons[category.id.toLowerCase()] || '📅'}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {category.name[lang]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cities Row */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            {lang === 'en' ? 'Cities' : 'المدن'}
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onCityChange(null)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[120px] ${
                !selectedCityId 
                  ? 'bg-white shadow-lg scale-110 transform' 
                  : 'bg-white/80 hover:bg-white hover:scale-105'
              }`}
            >
              <div className="text-3xl mb-2">🌍</div>
              <span className="text-sm font-semibold text-gray-800">
                {lang === 'en' ? 'All Cities' : 'كل المدن'}
              </span>
            </button>
            
            {cities.map(city => (
              <button
                key={city.id}
                onClick={() => onCityChange(city.id)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[120px] ${
                  selectedCityId === city.id 
                    ? 'bg-white shadow-lg scale-110 transform' 
                    : 'bg-white/80 hover:bg-white hover:scale-105'
                }`}
              >
                <div className="text-3xl mb-2">
                  {cityLandmarks[city.id.toLowerCase()] || '🏙️'}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {city.name[lang]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};