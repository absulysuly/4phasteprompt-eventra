import React from 'react';
import type { Language } from '@/types';

interface CompactFiltersProps {
  lang: Language;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  categories: { id: string; name: { en: string; ar: string; ku: string } }[];
  cities: { id: string; name: { en: string; ar: string; ku: string } }[];
  selectedCategory: string | null;
  selectedCity: string | null;
  selectedMonth: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onCityChange: (cityId: string | null) => void;
  onMonthChange: (month: string | null) => void;
}

export const CompactFilters: React.FC<CompactFiltersProps> = ({
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
  return (
    <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 py-6">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'en' ? 'Search events by title or description...' : lang === 'ar' ? 'البحث في الأحداث بالعنوان أو الوصف...' : 'گەڕان لە بۆنەکان بە ناونیشان یان وردەکاری...'}
              className="w-full px-6 py-3 rounded-full border-0 shadow-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-300 bg-white/90"
              onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit()}
            />
            <button
              onClick={onSearchSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Row - 3D Enhanced */}
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Categories Filter */}
          <select 
            value={selectedCategory || ''}
            onChange={(e) => onCategoryChange(e.target.value || null)}
            className="px-6 py-3 rounded-full bg-white/90 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? 'All Categories' : lang === 'ar' ? 'كل الفئات' : 'هەموو پۆلەکان'}
            </option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name[lang]}
              </option>
            ))}
          </select>

          {/* Cities Filter */}
          <select 
            value={selectedCity || ''}
            onChange={(e) => onCityChange(e.target.value || null)}
            className="px-6 py-3 rounded-full bg-white/90 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? 'All Cities' : lang === 'ar' ? 'كل المدن' : 'هەموو شارەکان'}
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
            className="px-6 py-3 rounded-full bg-white/90 border-0 text-gray-700 font-medium shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            }}
          >
            <option value="">
              {lang === 'en' ? 'All Months' : lang === 'ar' ? 'كل الشهور' : 'هەموو مانگەکان'}
            </option>
            <option value="january">{lang === 'en' ? 'January' : lang === 'ar' ? 'يناير' : 'کانونی دووەم'}</option>
            <option value="february">{lang === 'en' ? 'February' : lang === 'ar' ? 'فبراير' : 'شوبات'}</option>
            <option value="march">{lang === 'en' ? 'March' : lang === 'ar' ? 'مارس' : 'ئازار'}</option>
            <option value="april">{lang === 'en' ? 'April' : lang === 'ar' ? 'أبريل' : 'نیسان'}</option>
            <option value="may">{lang === 'en' ? 'May' : lang === 'ar' ? 'مايو' : 'ئایار'}</option>
            <option value="june">{lang === 'en' ? 'June' : lang === 'ar' ? 'يونيو' : 'حوزەیران'}</option>
            <option value="july">{lang === 'en' ? 'July' : lang === 'ar' ? 'يوليو' : 'تەموز'}</option>
            <option value="august">{lang === 'en' ? 'August' : lang === 'ar' ? 'أغسطس' : 'ئاب'}</option>
            <option value="september">{lang === 'en' ? 'September' : lang === 'ar' ? 'سبتمبر' : 'ئەیلوول'}</option>
            <option value="october">{lang === 'en' ? 'October' : lang === 'ar' ? 'أكتوبر' : 'تشرینی یەکەم'}</option>
            <option value="november">{lang === 'en' ? 'November' : lang === 'ar' ? 'نوفمبر' : 'تشرینی دووەم'}</option>
            <option value="december">{lang === 'en' ? 'December' : lang === 'ar' ? 'ديسمبر' : 'کانونی یەکەم'}</option>
          </select>
        </div>
      </div>
    </div>
  );
};