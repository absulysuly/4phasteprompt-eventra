import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [locale, setLocale] = useState<'en' | 'ar' | 'ku'>('en');
  const [selectedCity, setSelectedCity] = useState<string | null>('all');
  const [activeCategory, setActiveCategory] = useState<string>('events');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [modalVenueId, setModalVenueId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get('city');
    setSelectedCity(city || 'all');

    const savedLocale = localStorage.getItem('preferredLocale') as 'en' | 'ar' | 'ku' | null;
    if (savedLocale && LANGUAGES.some(l => l.code === savedLocale)) {
      setLocale(savedLocale);
    }
    
    setSelectedMonth(new Date().toISOString().substring(0, 7));
    
    // Check for a venue ID in the path on initial load
    const path = window.location.pathname;
    const venueMatch = path.match(/^\/v\/([a-zA-Z0-9_]+)/);
    if (venueMatch && venueMatch[1]) {
      setModalVenueId(venueMatch[1]);
    }

  }, []);
  
  useEffect(() => {
    document.documentElement.dir = (locale === 'ar' || locale === 'ku') ? 'rtl' : 'ltr';
    localStorage.setItem('preferredLocale', locale);
  }, [locale]);

  const handleOpenModal = (venueId: string) => {
    setModalVenueId(venueId);
    window.history.pushState({}, '', `/v/${venueId}`);
  };

  const handleCloseModal = () => {
    setModalVenueId(null);
    window.history.pushState({}, '', '/');
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const params = new URLSearchParams(window.location.search);
    if (cityId && cityId !== 'all') {
      params.set('city', cityId);
    } else {
      params.delete('city');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  };

  const PillLanguageSwitcher = () => (
    <div role="radiogroup" aria-label="Language selection" className="flex items-center space-x-1 rounded-full bg-gray-700/50 p-1">
      {LANGUAGES.map(({ code, label }) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            role="radio"
            aria-checked={isActive}
            onClick={() => setLocale(code)}
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
    <div className={`min-h-screen bg-gray-900 text-white font-sans ${modalVenueId ? 'overflow-hidden' : ''}`}>
      <Header>
        <PillLanguageSwitcher />
      </Header>

      <main className="relative z-10">
        <HeroSection locale={locale} />
        
        <GovernorateFilterBar 
          locale={locale} 
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
        />

        <CategoryTabsNavigation
          locale={locale}
          selectedCity={selectedCity}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {activeCategory === 'events' && selectedMonth && (
          <>
            <MonthFilterBar
              locale={locale}
              selectedCity={selectedCity}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <EventCardGrid
              locale={locale}
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
        locale={locale}
      />
    </div>
  );
};

export default App;