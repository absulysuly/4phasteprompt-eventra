import React, { useState, useEffect } from 'react';
import { getEventCountsByMonth } from '../api/events';

interface MonthFilterBarProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthFilterBar: React.FC<MonthFilterBarProps> = ({ locale, selectedCity, selectedMonth, onMonthChange }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      const data = await getEventCountsByMonth(selectedCity);
      setCounts(data);
      setLoading(false);
    };
    
    fetchCounts();
  }, [selectedCity]);

  // Generate month options for next 12 months
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString(locale, { 
        month: 'long', 
        year: 'numeric' 
      });
      const count = counts[yearMonth] || 0;
      
      months.push({
        value: yearMonth,
        label: monthName,
        count,
        disabled: count === 0 && !loading
      });
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="sticky top-[176px] z-20 h-14 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 backdrop-blur-md border-y border-amber-500/20 shadow-xl">
      <div className="flex h-full items-center overflow-x-auto gap-2 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {monthOptions.map((month) => {
          const isActive = selectedMonth === month.value;
          return (
            <button
              key={month.value}
              onClick={() => onMonthChange(month.value)}
              disabled={month.disabled}
              className={`group relative flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/50'
                  : month.disabled
                  ? 'text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-amber-500/50'
              }`}
            >
              {/* Icon */}
              <span className="text-lg">
                {isActive ? '📅' : '🗓️'}
              </span>
              
              {/* Label */}
              <span className={isActive ? 'font-bold' : ''}>{month.label}</span>
              
              {/* Count Badge */}
              {!loading && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white/25 text-white' 
                    : 'bg-gray-800/80 text-amber-400 group-hover:bg-amber-500/20'
                }`}>
                  {month.count}
                </span>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthFilterBar;