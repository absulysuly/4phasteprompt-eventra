import React, { useState, useEffect, useMemo } from 'react';
import { getEventCountsByMonth } from '../api/GeminiController';

interface MonthFilterProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthFilterBar: React.FC<MonthFilterProps> = ({ locale, selectedCity, selectedMonth, onMonthChange }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const isRTL = locale === 'ar' || locale === 'ku';

  const months = useMemo(() => {
    const monthArray = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      monthArray.push({
        value: date.toISOString().substring(0, 7), // "2025-01"
        label: date.toLocaleDateString(locale, { month: 'short', year: 'numeric' })
      });
    }
    return monthArray;
  }, [locale]);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsLoading(true);
      const city = selectedCity === 'all' ? null : selectedCity;
      const fetchedCounts = await getEventCountsByMonth(city);
      setCounts(fetchedCounts);
      setIsLoading(false);
    };
    fetchCounts();
  }, [selectedCity]);

  return (
    <div
      className="sticky top-[184px] z-20 h-[52px] bg-gray-800/50 backdrop-blur-sm border-b border-gray-700"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        role="tablist"
        aria-label="Filter by month"
        className="flex h-full items-center overflow-x-auto gap-2 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {months.map(month => {
          const isActive = selectedMonth === month.value;
          const count = counts[month.value] || 0;
          return (
            <button
              key={month.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onMonthChange(month.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-pink-400 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              <span>{month.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
              }`}>
                {isLoading ? '...' : count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthFilterBar;
