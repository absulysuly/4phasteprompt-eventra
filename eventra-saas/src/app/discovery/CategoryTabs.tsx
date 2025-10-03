"use client";

import React from 'react';
import { useLanguage } from '../components/LanguageProvider';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  loading?: boolean;
}

const CATEGORY_TRANSLATIONS: Record<string, { ar: string; ku: string }> = {
  'All Venues': { ar: 'جميع الأماكن', ku: 'هەموو شوێنەکان' },
  'Events': { ar: 'الفعاليات', ku: 'بۆنەکان' },
  'Hotels': { ar: 'الفنادق', ku: 'هۆتێلەکان' },
  'Restaurants': { ar: 'المطاعم', ku: 'چێشتخانەکان' },
  'Activities': { ar: 'الأنشطة', ku: 'چالاکیەکان' },
  'Services': { ar: 'الخدمات', ku: 'خزمەتگوزاریەکان' }
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'all': 'from-purple-600 to-pink-600',
  'EVENT': 'from-purple-500 to-pink-500',
  'HOTEL': 'from-blue-500 to-cyan-500',
  'RESTAURANT': 'from-orange-500 to-red-500',
  'ACTIVITY': 'from-green-500 to-emerald-500',
  'SERVICE': 'from-gray-500 to-slate-600'
};

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange, loading = false }: CategoryTabsProps) {
  const { language, isRTL } = useLanguage();

  const getCategoryName = (name: string) => {
    if (language === 'ar' && CATEGORY_TRANSLATIONS[name]) {
      return CATEGORY_TRANSLATIONS[name].ar;
    }
    if (language === 'ku' && CATEGORY_TRANSLATIONS[name]) {
      return CATEGORY_TRANSLATIONS[name].ku;
    }
    return name;
  };

  const getGradient = (categoryId: string) => {
    return CATEGORY_GRADIENTS[categoryId] || CATEGORY_GRADIENTS['all'];
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 w-32 bg-gray-800/50 rounded-2xl"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <h3 className="text-lg font-semibold text-white">
          {language === 'ar' ? 'الفئات' : language === 'ku' ? 'جۆرەکان' : 'Categories'}
        </h3>
      </div>

      {/* Category Tabs */}
      <div 
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-4 pb-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category.id;
            const gradient = getGradient(category.id);
            const isDisabled = category.count === 0 && category.id !== 'all';
            
            return (
              <button
                key={category.id}
                onClick={() => !isDisabled && onCategoryChange(category.id)}
                disabled={isDisabled}
                className={`group relative flex flex-col items-center justify-center min-w-[120px] p-4 rounded-2xl transition-all duration-300 transform ${
                  isActive
                    ? `bg-gradient-to-br ${gradient} text-white shadow-2xl shadow-${gradient.split(' ')[1].replace('to-', '')}/25 scale-105`
                    : isDisabled
                    ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white hover:scale-105 border border-gray-700/50 hover:border-gray-600'
                }`}
                tabIndex={isDisabled ? -1 : 0}
              >
                {/* Glow Effect */}
                {isActive && (
                  <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-2xl opacity-30 blur-xl animate-pulse`}></div>
                )}
                
                {/* Content */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  {/* Icon */}
                  <span className={`text-3xl transition-transform ${
                    isActive ? 'scale-110 animate-bounce' : 'group-hover:scale-110'
                  }`}>
                    {category.icon}
                  </span>
                  
                  {/* Name */}
                  <span className="text-sm font-bold whitespace-nowrap">
                    {getCategoryName(category.name)}
                  </span>
                  
                  {/* Count Badge */}
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDisabled
                      ? 'bg-gray-700/30 text-gray-600'
                      : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-600/70 group-hover:text-white'
                  }`}>
                    <span>{category.count.toLocaleString()}</span>
                    <span className="opacity-60">
                      {language === 'ar' ? 'مكان' : language === 'ku' ? 'شوێن' : 'places'}
                    </span>
                  </div>
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scroll Hints */}
      <div className="absolute left-0 top-12 bottom-0 w-12 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-12 bottom-0 w-12 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  );
}
