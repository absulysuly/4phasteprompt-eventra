
import React from 'react';
import type { City, Category, Language } from '@/types';

interface DiscoveryBarProps {
  cities: City[];
  categories: Category[];
  selectedCity: string | null;
  selectedCategory: string | null;
  onCityChange: (cityId: string | null) => void;
  onCategoryChange: (categoryId: string | null) => void;
  lang: Language;
}

export const DiscoveryBar: React.FC<DiscoveryBarProps> = ({
  cities,
  categories,
  selectedCity,
  selectedCategory,
  onCityChange,
  onCategoryChange,
  lang,
}) => {
  return (
    <div className="bg-white py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* City Filter */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Filter by City</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCityChange(null)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCity === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Cities
              </button>
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => onCityChange(city.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCity === city.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {city.name[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onCategoryChange(null)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === null ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${selectedCategory === category.id ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {category.name[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
