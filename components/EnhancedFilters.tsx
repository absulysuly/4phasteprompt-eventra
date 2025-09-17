import React, { useState } from 'react';
import type { Language, Category, City } from '../types';

interface EnhancedFiltersProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  categories: Category[];
  cities: City[];
  selectedCategory: string | null;
  selectedCity: string | null;
  selectedMonth: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onCityChange: (cityId: string | null) => void;
  onMonthChange: (month: string | null) => void;
}

export const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  lang,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  categories,
  cities,
  selectedCategory,
  selectedCity,
  selectedMonth,
  onCategoryChange,
  onCityChange,
  onMonthChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);


  const months = [
    { value: 'january', label: { en: 'January', ar: 'يناير', ku: 'کانوونی دووەم' }},
    { value: 'february', label: { en: 'February', ar: 'فبراير', ku: 'شوبات' }},
    { value: 'march', label: { en: 'March', ar: 'مارس', ku: 'ئازار' }},
    { value: 'april', label: { en: 'April', ar: 'أبريل', ku: 'نیسان' }},
    { value: 'may', label: { en: 'May', ar: 'مايو', ku: 'ئایار' }},
    { value: 'june', label: { en: 'June', ar: 'يونيو', ku: 'حەزیران' }},
    { value: 'july', label: { en: 'July', ar: 'يوليو', ku: 'تەممووز' }},
    { value: 'august', label: { en: 'August', ar: 'أغسطس', ku: 'ئاب' }},
    { value: 'september', label: { en: 'September', ar: 'سبتمبر', ku: 'ئەیلوول' }},
    { value: 'october', label: { en: 'October', ar: 'أكتوبر', ku: 'تشرینی یەکەم' }},
    { value: 'november', label: { en: 'November', ar: 'نوفمبر', ku: 'تشرینی دووەم' }},
    { value: 'december', label: { en: 'December', ar: 'ديسمبر', ku: 'کانوونی یەکەم' }}
  ];

  return (
    <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 py-6 relative">
      <div className="container mx-auto px-4">
        {/* Main Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'en' ? 'Search events by title, description, or venue...' : lang === 'ar' ? 'البحث في الأحداث بالعنوان أو الوصف أو المكان...' : 'گەڕان لە بۆنەکان بەپێی ناونیشان، باسکردن یان شوێن...'}
              className="w-full px-6 py-4 rounded-full border-0 shadow-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 bg-white/95 text-lg"
              style={{
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
              }}
              onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
            />
            <button
              onClick={onSearchSubmit}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Filters Row - Mobile Optimized */}
        <div className="flex flex-wrap gap-3 justify-center mb-6 md:gap-4">
          {/* Mobile: Stack filters vertically on small screens */}
          <div className="mobile-filter-grid w-full sm:contents">
          {/* Categories Filter */}
          <select 
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="px-6 py-3 rounded-full bg-white/95 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? '📂 All Categories' : lang === 'ar' ? '📂 كل الفئات' : '📂 هەموو جۆرەکان'}
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name[lang]}
              </option>
            ))}
          </select>

          {/* Cities Filter */}
          <select 
            value={selectedCity || ''}
            onChange={(e) => onCityChange(e.target.value || null)}
            className="px-6 py-3 rounded-full bg-white/95 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? '🏙️ All Cities' : lang === 'ar' ? '🏙️ كل المدن' : '🏙️ هەموو شارەکان'}
            </option>
            {cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.name[lang]}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select 
            value={selectedMonth || ''}
            onChange={(e) => onMonthChange(e.target.value || null)}
            className="px-6 py-3 rounded-full bg-white/95 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? '📅 All Months' : lang === 'ar' ? '📅 كل الشهور' : '📅 هەموو مانگەکان'}
            </option>
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label[lang]}
              </option>
            ))}
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              onCategoryChange(null);
              onCityChange(null);
              onMonthChange(null);
              onSearchChange('');
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 touch-target"
          >
            <span className="flex items-center gap-2">
              <span>{lang === 'en' ? 'Clear All' : lang === 'ar' ? 'مسح الكل' : 'پاککردنەوەی هەموو'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
          </button>
          </div>
        </div>

      </div>
    </div>
  );
};