"use client";

import React from 'react';
import { useLanguage } from '../components/LanguageProvider';

interface GovernorateFilterProps {
  governorates: string[];
  selectedGovernorate: string;
  onGovernorateChange: (governorate: string) => void;
}

const GOVERNORATE_TRANSLATIONS: Record<string, { ar: string; ku: string }> = {
  'Baghdad': { ar: 'بغداد', ku: 'بەغدا' },
  'Basra': { ar: 'البصرة', ku: 'بەسرە' },
  'Nineveh': { ar: 'نينوى', ku: 'نەینەوا' },
  'Erbil': { ar: 'أربيل', ku: 'هەولێر' },
  'Sulaymaniyah': { ar: 'السليمانية', ku: 'سلێمانی' },
  'Duhok': { ar: 'دهوك', ku: 'دهۆك' },
  'Kirkuk': { ar: 'كركوك', ku: 'كەركوك' },
  'Anbar': { ar: 'الأنبار', ku: 'ئەنبار' },
  'Najaf': { ar: 'النجف', ku: 'نەجەف' },
  'Karbala': { ar: 'كربلاء', ku: 'كەربەلا' },
  'Diyala': { ar: 'ديالى', ku: 'دیالە' },
  'Wasit': { ar: 'واسط', ku: 'واسیت' },
  'Maysan': { ar: 'ميسان', ku: 'مەیسان' },
  'Dhi Qar': { ar: 'ذي قار', ku: 'زیقار' },
  'Muthanna': { ar: 'المثنى', ku: 'موسەننا' },
  'Qadisiyyah': { ar: 'القادسية', ku: 'قادسیە' },
  'Babil': { ar: 'بابل', ku: 'بابل' },
  'Saladin': { ar: 'صلاح الدين', ku: 'سەلاحەدین' },
  'Halabja': { ar: 'حلبجة', ku: 'هەڵەبجە' }
};

export default function GovernorateFilter({ governorates, selectedGovernorate, onGovernorateChange }: GovernorateFilterProps) {
  const { language, isRTL } = useLanguage();

  const getGovernorateName = (governorate: string) => {
    if (governorate === 'all') {
      return language === 'ar' ? 'جميع المحافظات' : language === 'ku' ? 'هەموو پارێزگاکان' : 'All Governorates';
    }
    
    if (language === 'ar' && GOVERNORATE_TRANSLATIONS[governorate]) {
      return GOVERNORATE_TRANSLATIONS[governorate].ar;
    }
    if (language === 'ku' && GOVERNORATE_TRANSLATIONS[governorate]) {
      return GOVERNORATE_TRANSLATIONS[governorate].ku;
    }
    return governorate;
  };

  const allGovernorates = ['all', ...governorates];

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent, governorate: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onGovernorateChange(governorate);
    }
  };

  return (
    <div className="relative">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🗺️</span>
        <h3 className="text-lg font-semibold text-white">
          {language === 'ar' ? 'المحافظات' : language === 'ku' ? 'پارێزگاکان' : 'Governorates'}
        </h3>
      </div>
      
      {/* Scrollable Container */}
      <div 
        className={`relative overflow-x-auto scrollbar-hide ${isRTL ? 'rtl' : 'ltr'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 pb-2">
          {allGovernorates.map((governorate) => {
            const isActive = selectedGovernorate === governorate;
            
            return (
              <button
                key={governorate}
                onClick={() => onGovernorateChange(governorate)}
                onKeyDown={(e) => handleKeyDown(e, governorate)}
                className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white border border-gray-700/50 hover:border-gray-600'
                }`}
                tabIndex={0}
                role="tab"
                aria-selected={isActive}
              >
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                )}
                
                {/* Governorate Name */}
                <span className="text-sm font-semibold">
                  {getGovernorateName(governorate)}
                </span>
                
                {/* Hover Glow Effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-orange-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
