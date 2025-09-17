// FIX: Created the `FilterTags` component to display currently active search and filter criteria, improving user experience by making the current selection obvious and easy to clear. This resolves the 'not a module' error for this file.
import React from 'react';
import { XIcon } from './icons';
import type { City, Category, Language } from '@/types';

interface FilterTagsProps {
  searchQuery?: string | null;
  selectedCityId?: string | null;
  selectedCategoryId?: string | null;
  cities: City[];
  categories: Category[];
  lang: Language;
  onClearSearch: () => void;
  onClearCity: () => void;
  onClearCategory: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  searchQuery,
  selectedCityId,
  selectedCategoryId,
  cities,
  categories,
  lang,
  onClearSearch,
  onClearCity,
  onClearCategory,
}) => {
  const selectedCity = cities.find(c => c.id === selectedCityId);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const hasFilters = searchQuery || selectedCity || selectedCategory;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-4">
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-600">Active Filters:</span>
        {searchQuery && (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-200 text-gray-800 rounded-full">
            "{searchQuery}"
            <button onClick={onClearSearch} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-gray-300">
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        )}
        {selectedCity && (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            {selectedCity.name[lang]}
            <button onClick={onClearCity} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-blue-200">
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        )}
        {selectedCategory && (
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-pink-100 text-pink-800 rounded-full">
            {selectedCategory.name[lang]}
            <button onClick={onClearCategory} className="ml-2 -mr-1 p-0.5 rounded-full hover:bg-pink-200">
              <XIcon className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
