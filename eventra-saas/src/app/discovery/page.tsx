"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../components/LanguageProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import GovernorateFilterBar from './components/GovernorateFilterBar';
import CategoryTabsNavigation from './components/CategoryTabsNavigation';
import HeroSection from './components/HeroSection';
import MonthFilterBar from './components/MonthFilterBar';
import EventCardGrid from './components/EventCardGrid';
import VenueDetailModal from './components/VenueDetailModal';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'ku', label: 'کوردی' },
];

export default function DiscoveryPage() {
  const { language, setLanguage } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<string | null>('all');
  const [activeCategory, setActiveCategory] = useState<string>('events');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [modalVenueId, setModalVenueId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    setSelectedCity(city || 'all');
    
    setSelectedMonth(new Date().toISOString().substring(0, 7));
    
    // Check for a venue ID in the path on initial load
    const path = window.location.pathname;
    const venueMatch = path.match(/\/discovery\/v\/([a-zA-Z0-9_]+)/);
    if (venueMatch && venueMatch[1]) {
      setModalVenueId(venueMatch[1]);
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.dir = (language === 'ar' || language === 'ku') ? 'rtl' : 'ltr';
  }, [language]);

  const handleOpenModal = (venueId: string) => {
    setModalVenueId(venueId);
    window.history.pushState({}, '', `/discovery/v/${venueId}`);
  };

  const handleCloseModal = () => {
    setModalVenueId(null);
    window.history.pushState({}, '', '/discovery');
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const params = new URLSearchParams(window.location.search);
    if (cityId && cityId !== 'all') {
      params.set('city', cityId);
    } else {
      params.delete('city');
    }
    const newUrl = `/discovery?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  const PillLanguageSwitcher = () => (
    <div role="radiogroup" aria-label="Language selection" className="flex items-center space-x-1 rounded-full bg-gray-700/50 p-1">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={isActive}
            onClick={() => setLanguage(code as 'en' | 'ar' | 'ku')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-400 ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                : 'text-gray-300 hover:bg-gray-600/50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans ${modalVenueId ? 'overflow-hidden' : ''}`}>
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      
      <Header>
        <PillLanguageSwitcher />
      </Header>
      
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <main className="relative z-10">
        <HeroSection locale={language} />
        
        <GovernorateFilterBar 
          locale={language} 
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
        />

        <CategoryTabsNavigation
          locale={language}
          selectedCity={selectedCity}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {activeCategory === 'events' && selectedMonth && (
          <>
            <MonthFilterBar
              locale={language}
              selectedCity={selectedCity}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <EventCardGrid
              locale={language}
              selectedCity={selectedCity}
              selectedMonth={selectedMonth}
              onOpenModal={handleOpenModal}
            />
          </>
        )}

        {activeCategory !== 'events' && (
          <div className="w-full max-w-7xl mx-auto py-10 px-4 text-left">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">
              {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} in {selectedCity === 'all' ? 'All Governorates' : selectedCity}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 h-48 flex items-center justify-center text-xl text-gray-400 border border-gray-700">
                  {activeCategory} Card {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />

      <VenueDetailModal
        isOpen={!!modalVenueId}
        venueId={modalVenueId}
        onClose={handleCloseModal}
        locale={language}
      />
    </div>
  );
}