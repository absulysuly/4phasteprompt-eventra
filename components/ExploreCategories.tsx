import React from 'react';
import type { Category, Language } from '@/types';

interface ExploreCategoriesProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  lang: Language;
}

// Category icon mapping with background images
const getCategoryIcon = (categoryId: string) => {
  const icons = {
    'festivals': '🎉',
    'livemusic': '🎵',
    'sports': '⚽',
    'arts': '🎨',
    'education': '📚',
    'business': '💼',
    'spiritual': '🙏',
    'community': '🤝',
    'lifestyle': '✨',
    'government': '🏢'
  };
  return icons[categoryId as keyof typeof icons] || '📅';
};

const getCategoryImage = (categoryId: string) => {
  const images = {
    'festivals': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=300',
    'livemusic': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300',
    'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=300',
    'arts': 'https://images.unsplash.com/photo-1531578499233-3e3c63a5680a?q=80&w=300',
    'education': 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=300',
    'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300',
    'spiritual': 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=300',
    'community': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=300',
    'lifestyle': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=300',
    'government': 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?q=80&w=300'
  };
  return images[categoryId as keyof typeof images] || 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=300';
};

export const ExploreCategories: React.FC<ExploreCategoriesProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  lang
}) => {
  return (
    <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {lang === 'en' ? 'Find by Category' : lang === 'ar' ? 'البحث بالفئة' : 'گەڕان بەپێی پۆل'}
        </h2>
        
        {/* Scrollable Categories Container */}
        <div className="relative">
          <div 
            className="flex overflow-x-auto scrollbar-hide gap-6 pb-2 snap-x snap-mandatory" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* All Events Button */}
            <button
              onClick={() => onCategorySelect(null)}
              className="flex flex-col items-center group flex-shrink-0 snap-center"
            >
              <div 
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 transform hover:scale-110 ${
                  !selectedCategoryId 
                    ? 'bg-gray-800 text-white shadow-2xl shadow-gray-800/50 scale-110' 
                    : 'bg-white/90 hover:bg-white hover:shadow-xl shadow-lg backdrop-blur-sm'
                }`}
                style={{
                  boxShadow: !selectedCategoryId
                    ? '0 15px 35px -5px rgba(0, 0, 0, 0.3), 0 5px 15px -3px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
                    : '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                }}
              >
                🌟
              </div>
              <span className={`text-xs font-medium mt-3 transition-all duration-300 text-center whitespace-nowrap ${
                !selectedCategoryId ? 'text-gray-800 font-bold' : 'text-gray-700'
              }`}>
                {lang === 'en' ? 'All Events' : lang === 'ar' ? 'كل الأحداث' : 'هەموو بۆنەکان'}
              </span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className="flex flex-col items-center group flex-shrink-0 snap-center"
              >
                <div 
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl transition-all duration-300 relative overflow-hidden transform hover:scale-110 ${
                    selectedCategoryId === category.id
                      ? 'shadow-2xl scale-110 ring-4 ring-gray-800' 
                      : 'hover:shadow-xl shadow-lg'
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getCategoryImage(category.id)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: selectedCategoryId === category.id
                      ? '0 15px 35px -5px rgba(0, 0, 0, 0.4), 0 5px 15px -3px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                      : '0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 3px 10px -3px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <span className="text-white text-2xl drop-shadow-2xl filter brightness-110">
                    {getCategoryIcon(category.id)}
                  </span>
                </div>
                <span className={`text-xs font-medium mt-3 transition-all duration-300 text-center max-w-[90px] leading-tight whitespace-nowrap ${
                  selectedCategoryId === category.id ? 'text-gray-800 font-bold' : 'text-gray-700'
                }`}>
                  {category.name[lang]}
                </span>
              </button>
            ))}
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-yellow-400 to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-300 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};