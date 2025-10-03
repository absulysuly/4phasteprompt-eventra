"use client";

import React from 'react';
import { useLanguage } from '../components/LanguageProvider';

interface MonthFilterBarProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthCounts: Record<string, number>;
}

const MONTHS = [
  { id: 'all', name: 'All Months', nameAr: 'كل الأشهر', nameKu: 'هەموو مانگەکان', icon: '📅' },
  { id: '01', name: 'January', nameAr: 'يناير', nameKu: 'كانوني دووەم', icon: '🗓️' },
  { id: '02', name: 'February', nameAr: 'فبراير', nameKu: 'شوبات', icon: '🗓️' },
  { id: '03', name: 'March', nameAr: 'مارس', nameKu: 'ئازار', icon: '🗓️' },
  { id: '04', name: 'April', nameAr: 'أبريل', nameKu: 'نیسان', icon: '🗓️' },
  { id: '05', name: 'May', nameAr: 'مايو', nameKu: 'ئایار', icon: '🗓️' },
  { id: '06', name: 'June', nameAr: 'يونيو', nameKu: 'حوزەیران', icon: '🗓️' },
  { id: '07', name: 'July', nameAr: 'يوليو', nameKu: 'تەمموز', icon: '🗓️' },
  { id: '08', name: 'August', nameAr: 'أغسطس', nameKu: 'ئاب', icon: '🗓️' },
  { id: '09', name: 'September', nameAr: 'سبتمبر', nameKu: 'ئەیلول', icon: '🗓️' },
  { id: '10', name: 'October', nameAr: 'أكتوبر', nameKu: 'تشرینی یەكەم', icon: '🗓️' },
  { id: '11', name: 'November', nameAr: 'نوفمبر', nameKu: 'تشرینی دووەم', icon: '🗓️' },
  { id: '12', name: 'December', nameAr: 'ديسمبر', nameKu: 'كانوني یەكەم', icon: '🗓️' }
];

export default function MonthFilterBar({ selectedMonth, onMonthChange, monthCounts }: MonthFilterBarProps) {
  const { language, isRTL } = useLanguage();

  const getMonthName = (month: typeof MONTHS[0]) => {
    if (language === 'ar') return month.nameAr;
    if (language === 'ku') return month.nameKu;
    return month.name;
  };

  const getCount = (monthId: string) => {
    if (monthId === 'all') {
      return Object.values(monthCounts).reduce((sum, count) => sum + count, 0);
    }
    return monthCounts[monthId] || 0;
  };

  return (
    <div className="relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-cyan-900/10 rounded-2xl"></div>
      
      {/* Scrollable Container */}
      <div 
        className={`relative overflow-x-auto scrollbar-hide ${isRTL ? 'rtl' : 'ltr'}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 p-4 min-w-min">
          {MONTHS.map((month) => {
            const isActive = selectedMonth === month.id;
            const count = getCount(month.id);
            
            return (
              <button
                key={month.id}
                onClick={() => onMonthChange(month.id)}
                className={`relative group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                )}
                
                {/* Icon */}
                <span className={`text-lg transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {isActive ? '📅' : month.icon}
                </span>
                
                {/* Month Name */}
                <span className="text-sm font-semibold">
                  {getMonthName(month)}
                </span>
                
                {/* Count Badge */}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scroll Hints */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  );
}
