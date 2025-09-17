import React from 'react';
import type { City, Category, Language } from '../types';

interface DiscoveryBarProps {
  cities: City[];
  categories: Category[];
  onFilterChange: (type: 'city' | 'category', id: string) => void;
  activeFilters: { city: string | null; category: string | null };
  lang: Language;
}

const CityButton: React.FC<{ city: City; onClick: () => void; isActive: boolean; lang: Language; }> = ({ city, onClick, isActive, lang }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center flex-shrink-0 h-12 px-5 rounded-lg border-2 transition-all duration-200 whitespace-nowrap ${isActive ? 'bg-secondary border-secondary text-dark-text font-bold shadow-md' : 'bg-neutral-container border-neutral-border hover:border-secondary'}`}
    >
        <span className="text-sm font-semibold">{city.name[lang]}</span>
    </button>
);

const CategoryButton: React.FC<{ category: Category; onClick: () => void; isActive: boolean; lang: Language; }> = ({ category, onClick, isActive, lang }) => {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center flex-shrink-0 w-24 group"
        >
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 overflow-hidden ${isActive ? 'border-secondary shadow-lg shadow-secondary/40' : 'bg-neutral-container border-neutral-border group-hover:border-secondary'}`}>
                 <img src={category.image} alt={category.name[lang]} className={`w-full h-full object-cover transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            </div>
            <span className="mt-2 text-xs text-center text-neutral-text-soft group-hover:text-secondary transition-colors h-8">{category.name[lang]}</span>
        </button>
    );
};


export const DiscoveryBar: React.FC<DiscoveryBarProps> = ({ cities, categories, onFilterChange, activeFilters, lang }) => {
  const t = {
    cities: { en: 'Explore Cities', ar: 'استكشف المدن', ku: 'شارەکان بگەڕێ' },
    categories: { en: 'Find by Category', ar: 'البحث حسب الفئة', ku: 'بەپێی پۆلێن بدۆزەرەوە' },
  };

  return (
    <div className="py-4 bg-neutral">
      {/* Cities Section */}
      <section className="mb-4">
        <h3 className="font-bold text-lg text-neutral-text px-4 mb-2">{t.cities[lang]}</h3>
        <div className="relative flex overflow-x-hidden group">
            <div className="py-2 flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
              {[...cities, ...cities].map((city, index) => (
                <div className="mx-1.5" key={`${city.id}-${index}`}>
                    <CityButton
                        city={city}
                        onClick={() => onFilterChange('city', city.id)}
                        isActive={activeFilters.city === city.id}
                        lang={lang}
                    />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-neutral via-transparent to-neutral"></div>
        </div>
      </section>

      {/* Categories Section */}
      <section>
        <h3 className="font-bold text-lg text-neutral-text px-4 mb-2">{t.categories[lang]}</h3>
        <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-1 px-4">
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                category={cat}
                onClick={() => onFilterChange('category', cat.id === 'all' ? '' : cat.id)}
                isActive={activeFilters.category === cat.id || (cat.id === 'all' && !activeFilters.category)}
                lang={lang}
              />
            ))}
        </div>
      </section>
       <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
          }
      `}</style>
    </div>
  );
};