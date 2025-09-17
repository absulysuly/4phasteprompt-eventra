import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { City, Category, Language, Event } from '../types';

interface SearchBarProps {
  cities: City[];
  categories: Category[];
  lang: Language;
  onFilterChange: (type: string, value: string) => void;
  currentFilters: {
    query: string;
    month: string;
    category: string | null;
    city: string | null;
  };
  events?: Event[]; // Optional for live suggestions
  onEventSelect?: (event: Event) => void;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'event' | 'category' | 'city';
  data: Event | Category | City;
}

const months = [
  { num: 0, names: { en: 'January', ar: 'يناير', ku: 'کانوونی دووەم' } },
  { num: 1, names: { en: 'February', ar: 'فبراير', ku: 'شوبات' } },
  { num: 2, names: { en: 'March', ar: 'مارس', ku: 'ئازار' } },
  { num: 3, names: { en: 'April', ar: 'أبريل', ku: 'نیسان' } },
  { num: 4, names: { en: 'May', ar: 'مايو', ku: 'ئایار' } },
  { num: 5, names: { en: 'June', ar: 'يونيو', ku: 'حوزەیران' } },
  { num: 6, names: { en: 'July', ar: 'يوليو', ku: 'تەمووز' } },
  { num: 7, names: { en: 'August', ar: 'أغسطس', ku: 'ئاب' } },
  { num: 8, names: { en: 'September', ar: 'سبتمبر', ku: 'ئەیلوول' } },
  { num: 9, names: { en: 'October', ar: 'أكتوبر', ku: 'تشرینی یەکەم' } },
  { num: 10, names: { en: 'November', ar: 'نوفمبر', ku: 'تشرینی دووەم' } },
  { num: 11, names: { en: 'December', ar: 'ديسمبر', ku: 'کانوونی یەکەم' } },
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  cities, categories, lang, onFilterChange, currentFilters, events = [], onEventSelect 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const t = {
    searchPlaceholder: { en: 'Search events by title or description...', ar: 'ابحث عن الفعاليات بالاسم أو الوصف...', ku: 'بگەڕێ بۆ ڕووداوەکان بە ناونیشان یان پێناسە...' },
    allMonths: { en: 'All Months', ar: 'كل الشهور', ku: 'هەموو مانگەکان' },
    allCategories: { en: 'All Categories', ar: 'كل التصنيفات', ku: 'هەموو پۆلەکان' },
    allCities: { en: 'All Cities', ar: 'كل المدن', ku: 'هەموو شارەکان' },
    clearAll: { en: 'Clear All', ar: 'مسح الكل', ku: 'سڕینەوەی هەمووی' },
    results: { en: 'results', ar: 'نتيجة', ku: 'ئەنجام' },
    noResults: { en: 'No suggestions found', ar: 'لم يتم العثور على اقتراحات', ku: 'هیچ پێشنیازێک نەدۆزرایەوە' },
    recentSearches: { en: 'Recent Searches', ar: 'عمليات البحث الأخيرة', ku: 'گەڕانەکانی دواییت' },
    popularEvents: { en: 'Popular Events', ar: 'الأحداث الشائعة', ku: 'ڕووداوە بەناوبانگەکان' },
    filters: { en: 'Filters', ar: 'المرشحات', ku: 'پاڵێوەرەکان' },
    showFilters: { en: 'Show Filters', ar: 'إظهار المرشحات', ku: 'پیشاندانی پاڵێوەرەکان' },
    hideFilters: { en: 'Hide Filters', ar: 'إخفاء المرشحات', ku: 'شاردنەوەی پاڵێوەرەکان' }
  };

  // Generate search suggestions
  const generateSuggestions = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const eventSuggestions: SearchSuggestion[] = events
      .filter(event => 
        event.title[lang].toLowerCase().includes(query.toLowerCase()) ||
        event.description[lang].toLowerCase().includes(query.toLowerCase()) ||
        event.venue.toLowerCase().includes(query.toLowerCase()) ||
        event.organizerName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map(event => ({
        id: `event-${event.id}`,
        title: event.title[lang],
        type: 'event' as const,
        data: event
      }));

    const categorySuggestions: SearchSuggestion[] = categories
      .filter(category => 
        category.id !== 'all' && 
        category.name[lang].toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(category => ({
        id: `category-${category.id}`,
        title: category.name[lang],
        type: 'category' as const,
        data: category
      }));

    const citySuggestions: SearchSuggestion[] = cities
      .filter(city => 
        city.name[lang].toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(city => ({
        id: `city-${city.id}`,
        title: city.name[lang],
        type: 'city' as const,
        data: city
      }));

    setSuggestions([...eventSuggestions, ...categorySuggestions, ...citySuggestions]);
  }, [events, categories, cities, lang]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSuggestions(currentFilters.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentFilters.query, generateSuggestions]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (currentFilters.query) count++;
    if (currentFilters.month) count++;
    if (currentFilters.category) count++;
    if (currentFilters.city) count++;
    setActiveFiltersCount(count);
  }, [currentFilters]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('eventSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearchChange = (value: string) => {
    onFilterChange('query', value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchSubmit = () => {
    if (currentFilters.query.trim()) {
      const newHistory = [currentFilters.query, ...searchHistory.filter(item => item !== currentFilters.query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('eventSearchHistory', JSON.stringify(newHistory));
    }
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'event' && onEventSelect) {
      onEventSelect(suggestion.data as Event);
    } else if (suggestion.type === 'category') {
      onFilterChange('category', (suggestion.data as Category).id);
    } else if (suggestion.type === 'city') {
      onFilterChange('city', (suggestion.data as City).id);
    }
    
    onFilterChange('query', suggestion.title);
    setShowSuggestions(false);
    handleSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        } else {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const clearAllFilters = () => {
    onFilterChange('query', '');
    onFilterChange('month', '');
    onFilterChange('category', '');
    onFilterChange('city', '');
    setShowSuggestions(false);
  };

  const clearFilter = (filterType: string) => {
    onFilterChange(filterType, '');
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'event':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
        );
      case 'city':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        {/* Main Search Input */}
        <div className="relative mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              className="block w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
              placeholder={t.searchPlaceholder[lang]}
              value={currentFilters.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
            />
            {currentFilters.query && (
              <button
                onClick={() => clearFilter('query')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {currentFilters.query === '' && searchHistory.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{t.recentSearches[lang]}</h3>
                  {searchHistory.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchChange(search)}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {search}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Search Suggestions */}
              {suggestions.length > 0 ? (
                <div className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center ${
                        index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">{suggestion.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{suggestion.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : currentFilters.query.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0120 12a8 8 0 10-8 8c1.4 0 2.704-.36 3.836-1.009L20 20l-5.164-.709z" />
                  </svg>
                  <p>{t.noResults[lang]}</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="font-medium">{isExpanded ? t.hideFilters[lang] : t.showFilters[lang]}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                {t.clearAll[lang]}
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
            <div className="relative">
              <select 
                value={currentFilters.month} 
                onChange={(e) => onFilterChange('month', e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 appearance-none"
              >
                <option value="">{t.allMonths[lang]}</option>
                {months.map(m => (
                  <option key={m.num} value={m.num.toString()}>
                    {m.names[lang]}
                  </option>
                ))}
              </select>
              {currentFilters.month && (
                <button
                  onClick={() => clearFilter('month')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={currentFilters.category || 'all'} 
                onChange={(e) => onFilterChange('category', e.target.value === 'all' ? '' : e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 appearance-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name[lang]}
                  </option>
                ))}
              </select>
              {currentFilters.category && (
                <button
                  onClick={() => clearFilter('category')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select 
                value={currentFilters.city || ''} 
                onChange={(e) => onFilterChange('city', e.target.value)}
                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 appearance-none"
              >
                <option value="">{t.allCities[lang]}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name[lang]}
                  </option>
                ))}
              </select>
              {currentFilters.city && (
                <button
                  onClick={() => clearFilter('city')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {currentFilters.query && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Search: {currentFilters.query}
                <button 
                  onClick={() => clearFilter('query')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentFilters.month && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {months.find(m => m.num.toString() === currentFilters.month)?.names[lang]}
                <button 
                  onClick={() => clearFilter('month')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentFilters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {categories.find(c => c.id === currentFilters.category)?.name[lang]}
                <button 
                  onClick={() => clearFilter('category')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentFilters.city && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                {cities.find(c => c.id === currentFilters.city)?.name[lang]}
                <button 
                  onClick={() => clearFilter('city')}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};