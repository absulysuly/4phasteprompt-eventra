import React from 'react';
import type { City, Category, Language } from '../types';

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

export const SearchBar: React.FC<SearchBarProps> = ({ cities, categories, lang, onFilterChange, currentFilters }) => {
    
    const t = {
        searchPlaceholder: { en: 'Search events by title or description...', ar: 'ابحث عن الفعاليات بالاسم أو الوصف...', ku: 'بگەڕێ بۆ ڕووداوەکان بە ناونیشان یان پێناسە...' },
        allMonths: { en: 'All Months', ar: 'كل الشهور', ku: 'هەموو مانگەکان' },
        allCategories: { en: 'All Categories', ar: 'كل التصنيفات', ku: 'هەموو پۆلەکان' },
        allCities: { en: 'All Cities', ar: 'كل المدن', ku: 'هەموو شارەکان' },
    };

    const selectClasses = "w-full bg-neutral-container border border-neutral-border text-neutral-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5";

    return (
        <div className="bg-neutral p-4 border-y border-neutral-border">
            <div className="container mx-auto">
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-neutral-text-soft" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input
                        type="search"
                        id="event-search"
                        className="block w-full p-4 ps-10 text-sm text-neutral-text border border-neutral-border rounded-lg bg-neutral-container focus:ring-primary focus:border-primary"
                        placeholder={t.searchPlaceholder[lang]}
                        value={currentFilters.query}
                        onChange={(e) => onFilterChange('query', e.target.value)}
                        aria-label={t.searchPlaceholder[lang]}
                    />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
                    <select id="month-filter" className={selectClasses} value={currentFilters.month} onChange={(e) => onFilterChange('month', e.target.value)} aria-label="Filter by month">
                        <option value="">{t.allMonths[lang]}</option>
                        {months.map(m => <option key={m.num} value={m.num.toString()}>{m.names[lang]}</option>)}
                    </select>
                    <select id="category-filter" className={selectClasses} value={currentFilters.category || 'all'} onChange={(e) => onFilterChange('category', e.target.value === 'all' ? '' : e.target.value)} aria-label="Filter by category">
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
                    </select>
                    <select id="city-filter" className={selectClasses} value={currentFilters.city || ''} onChange={(e) => onFilterChange('city', e.target.value)} aria-label="Filter by city">
                        <option value="">{t.allCities[lang]}</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.name[lang]}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};