"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

interface CityScrollerProps {
  onCitySelect?: (city: string) => void;
  className?: string;
}

interface City {
  id: string;
  key: string;
  icon: string;
  translationKey: string;
}

export default function CityScroller({ onCitySelect, className = "" }: CityScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCity, setActiveCity] = useState<string>("all");
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();

  const cities: City[] = [
    { id: "all", key: "all", icon: "🏙️", translationKey: "common.allCities" },
    { id: "baghdad", key: "baghdad", icon: "🕌", translationKey: "cities.baghdad" },
    { id: "basra", key: "basra", icon: "🏛️", translationKey: "cities.basra" },
    { id: "mosul", key: "mosul", icon: "🏰", translationKey: "cities.mosul" },
    { id: "erbil", key: "erbil", icon: "🏔️", translationKey: "cities.erbil" },
    { id: "sulaymaniyah", key: "sulaymaniyah", icon: "🌳", translationKey: "cities.sulaymaniyah" },
    { id: "duhok", key: "duhok", icon: "⛰️", translationKey: "cities.duhok" },
    { id: "kirkuk", key: "kirkuk", icon: "🏜️", translationKey: "cities.kirkuk" },
    { id: "anbar", key: "anbar", icon: "🌅", translationKey: "cities.anbar" },
    { id: "najaf", key: "najaf", icon: "✨", translationKey: "cities.najaf" },
    { id: "karbala", key: "karbala", icon: "🕊️", translationKey: "cities.karbala" }
  ];

  const handleCityClick = (city: City) => {
    setActiveCity(city.id);
    onCitySelect?.(city.key);
    
    // Emit tracking event
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('CityScrollerSelect', {
        city: city.key,
        cityName: t(city.translationKey),
        language,
        timestamp: new Date().toISOString()
      });
    }
  };

  const scrollToCity = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const itemWidth = 180; // Approximate width of each city item
    const scrollAmount = isRTL 
      ? (direction === 'left' ? itemWidth : -itemWidth)
      : (direction === 'left' ? -itemWidth : itemWidth);
    
    container.scrollBy({ 
      left: scrollAmount, 
      behavior: 'smooth' 
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, city: City) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCityClick(city);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = cities.findIndex(c => c.id === city.id);
      let nextIndex;
      
      if (isRTL) {
        nextIndex = e.key === 'ArrowLeft' 
          ? Math.min(currentIndex + 1, cities.length - 1)
          : Math.max(currentIndex - 1, 0);
      } else {
        nextIndex = e.key === 'ArrowRight' 
          ? Math.min(currentIndex + 1, cities.length - 1)
          : Math.max(currentIndex - 1, 0);
      }
      
      const nextCity = cities[nextIndex];
      const nextButton = document.querySelector(`[data-city="${nextCity.id}"]`) as HTMLButtonElement;
      if (nextButton) {
        nextButton.focus();
      }
    }
  };

  // Emit impression event when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('CityScrollerImpression', {
        visibleCities: cities.slice(0, 4).map(c => c.key),
        language,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Handle scroll snap events
  const handleScroll = () => {
    if (typeof window !== 'undefined' && window.trackEvent) {
      window.trackEvent('CityScrollerSnap', {
        scrollPosition: scrollContainerRef.current?.scrollLeft || 0,
        language,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className={`relative ${className}`} role="region" aria-label={t('common.citySelection')}>
      {/* Scroll Buttons */}
      <button
        onClick={() => scrollToCity('left')}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 border border-gray-200 hover:border-gray-300"
        aria-label={isRTL ? t('common.scrollRight') : t('common.scrollLeft')}
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
        </svg>
      </button>

      <button
        onClick={() => scrollToCity('right')}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 border border-gray-200 hover:border-gray-300"
        aria-label={isRTL ? t('common.scrollLeft') : t('common.scrollRight')}
        style={{ minWidth: '40px', minHeight: '40px' }}
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
        </svg>
      </button>

      {/* City Scroller */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-12 py-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
        onScroll={handleScroll}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {cities.map((city) => (
          <button
            key={city.id}
            data-city={city.id}
            onClick={() => handleCityClick(city)}
            onKeyDown={(e) => handleKeyDown(e, city)}
            className={`
              flex-shrink-0 snap-center flex flex-col items-center justify-center
              w-40 h-24 rounded-xl border-2 transition-all duration-300 cursor-pointer
              hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${activeCity === city.id
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
            role="tab"
            aria-selected={activeCity === city.id}
            aria-label={`${t('common.selectCity')} ${t(city.translationKey)}`}
            tabIndex={activeCity === city.id ? 0 : -1}
            style={{ minWidth: '160px', minHeight: '96px' }}
          >
            <span className="text-2xl mb-1" role="img" aria-hidden="true">
              {city.icon}
            </span>
            <span className={`text-sm font-medium text-center leading-tight ${
              activeCity === city.id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {t(city.translationKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}