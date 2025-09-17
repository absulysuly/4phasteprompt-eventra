import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { loggingService } from './services/loggingService';
import { emailService } from './services/emailService';
import { Header } from './components/Header';
import { IntelligentSearchBar } from './components/IntelligentSearchBar';
import { DiscoveryBar } from './components/DiscoveryBar';
import { FilterTags } from './components/FilterTags';
import { HeroCarousel } from './components/HeroCarousel';
import { ExploreCities } from './components/ExploreCities';
import { ExploreCategories } from './components/ExploreCategories';
import { CompactFilters } from './components/CompactFilters';
import { EnhancedFilters } from './components/EnhancedFilters';
import { EnhancedCarousel } from './components/EnhancedCarousel';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { TopEventsCarousel } from './components/TopEventsCarousel';
import { EventGrid } from './components/EventGrid';
import { Pagination } from './components/Pagination';
import { EventDetailModal } from './components/EventDetailModal';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { EnhancedAuthModal } from './components/EnhancedAuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { EmailVerificationNotice } from './components/EmailVerificationNotice';
// import { PWAInstallBanner } from './components/PWAInstallBanner';
// import { FloatingInstallButton } from './components/FloatingInstallButton';
import type { Event, City, Category, User, Language, AuthMode, PricingTier } from './types';
import { config } from './config';

function App() {
  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // UI State
  const [lang, setLang] = useState<Language>('en');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  
  // Filtering and searching state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Additional filter state
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  
  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [citiesData, categoriesData, eventsData] = await Promise.all([
          api.getCities(),
          api.getCategories(),
          api.getEvents(),
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
        setEvents(eventsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        loggingService.logError(error as Error, { context: 'Initial data fetch' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Event handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    loggingService.trackEvent('login_success', { userId: user.id });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    loggingService.trackEvent('logout');
  };

  const handleOpenAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };
  
  const handleVerificationNeeded = (email: string) => {
    setIsAuthModalOpen(false);
    setVerificationEmail(email);
  }

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    try {
      const result = await emailService.resendVerificationEmail(verificationEmail, lang);
      if (result.success) {
        console.log('Verification Code for testing:', result.verificationCode);
        loggingService.trackEvent('resend_verification_success', { email: verificationEmail });
      } else {
        console.error('Failed to resend verification email:', result.message);
        loggingService.trackEvent('resend_verification_failed', { email: verificationEmail });
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      loggingService.logError(error as Error, { context: 'Resend verification' });
    }
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    loggingService.trackEvent('view_event_details', { eventId: event.id });
  };

  const handleAddReview = async (eventId: string, reviewData: { rating: number; comment: string }, userId: string) => {
    try {
      const updatedEvent = await api.addReview(eventId, reviewData, userId);
      setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? updatedEvent : e));
      setSelectedEvent(updatedEvent); // Update the opened modal as well
      loggingService.trackEvent('add_review', { eventId, userId });
    } catch (error) {
      loggingService.logError(error as Error, { context: 'Add review failed' });
    }
  };

  const handleCreateEventClick = () => {
    if (currentUser) {
      setEventToEdit(null);
      setIsCreateEventModalOpen(true);
    } else {
      handleOpenAuthModal();
    }
  };
  
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(null);
    setEventToEdit(event);
    setIsCreateEventModalOpen(true);
  }

  const handleSaveEvent = (savedEvent: Event) => {
    if(eventToEdit) { // it was an edit
      setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else { // it was a new event
      setEvents(prev => [savedEvent, ...prev]);
    }
    setIsCreateEventModalOpen(false);
    setEventToEdit(null);
  };
  
  const handleUpdateProfile = (userData: Partial<User>) => {
      if(currentUser) {
          const updatedUser = {...currentUser, ...userData};
          setCurrentUser(updatedUser);
          // In a real app, you would also call an API to persist this
          loggingService.trackEvent('profile_update', {userId: currentUser.id});
          console.log("Profile updated (mock):", updatedUser);
      }
  }

  // Filtering logic
  const filteredEvents = useMemo(() => {
    setCurrentPage(1); // Reset to first page on filter change
    return events.filter(event => {
      const matchesCity = !selectedCity || event.cityId === selectedCity;
      const matchesCategory = !selectedCategory || event.categoryId === selectedCategory;
      const matchesSearch = !activeSearchQuery ||
        event.title[lang].toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
        event.description[lang].toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(activeSearchQuery.toLowerCase());
      
      return matchesCity && matchesCategory && matchesSearch;
    });
  }, [events, selectedCity, selectedCategory, activeSearchQuery, lang]);
  
  const handleSearch = () => {
      setActiveSearchQuery(searchQuery);
  }

  // Pagination logic
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * config.EVENTS_PER_PAGE;
    const endIndex = startIndex + config.EVENTS_PER_PAGE;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / config.EVENTS_PER_PAGE);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading Eventara...</p></div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* PWA Install Notification Banner - Temporarily disabled */}
      {/* <PWAInstallBanner lang={lang} /> */}
      
      <Header
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onLoginClick={() => handleOpenAuthModal('login')}
        onLogout={handleLogout}
        onCreateEventClick={handleCreateEventClick}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      <main style={{ paddingTop: '0px' }} className="relative">
        {/* Add spacing for the install banner if it appears */}
        <div className="h-0 md:h-0" id="banner-spacer"></div>
        {/* 1. Hero Carousel for Sponsors/Promotions */}
        <HeroCarousel 
          banners={[
            {
              id: '1',
              title: lang === 'en' ? 'Baghdad Music Nights' : lang === 'ar' ? 'ليالي بغداد الموسيقية' : 'شەوانی مۆسیقای بەغداد',
              subtitle: lang === 'en' ? 'Thursday, October 2, 2025 at Al-Rasheed Hotel, Baghdad' : lang === 'ar' ? 'الخميس، 2 أكتوبر 2025 في فندق الرشيد، بغداد' : 'پێنجشەممە، ٢ی تشرینی یەکەمی ٢٠٢٥ لە هوتێلی ڕەشید، بەغداد',
              imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200',
              buttonText: lang === 'en' ? 'View Event' : lang === 'ar' ? 'عرض الحدث' : 'بینینی بۆنەکە'
            },
            {
              id: '2', 
              title: lang === 'en' ? 'Tech Summit 2025' : lang === 'ar' ? 'قمة التكنولوجيا 2025' : 'کۆنگرەی تەکنەلۆژیا ٢٠٢٥',
              subtitle: lang === 'en' ? 'Join the biggest tech event in the region' : lang === 'ar' ? 'انضم إلى أكبر حدث تقني في المنطقة' : 'بەشداری لە گەورەترین بۆنەی تەکنەلۆژیا لە هەرێمەکەدا بکە',
              imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200',
              buttonText: lang === 'en' ? 'Register Now' : lang === 'ar' ? 'سجل الآن' : 'ئێستا تۆمار بکە'
            }
          ]}
        />

        {/* 2. Explore by City */}
        <ExploreCities
          cities={cities}
          selectedCityId={selectedCity}
          onCitySelect={setSelectedCity}
          lang={lang}
        />

        {/* 3. Explore by Category */}
        <ExploreCategories
          categories={categories}
          selectedCategoryId={selectedCategory}
          onCategorySelect={setSelectedCategory}
          lang={lang}
        />

        {/* 4. Enhanced Filters */}
        <EnhancedFilters
          lang={lang}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          categories={categories}
          cities={cities}
          selectedCategory={selectedCategory}
          selectedCity={selectedCity}
          selectedMonth={selectedMonth}
          onCategoryChange={setSelectedCategory}
          onCityChange={setSelectedCity}
          onMonthChange={setSelectedMonth}
        />
        
        {/* 5. Featured/Sponsored Events */}
        <div className="py-12 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                ✨ {lang === 'en' ? 'SPONSORED' : lang === 'ar' ? 'برعاية' : 'پشتگیریکراو'}
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {lang === 'en' ? 'Featured Events' : lang === 'ar' ? 'الأحداث المميزة' : 'بۆنە تایبەتەکان'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
            </div>
            
            <EnhancedCarousel
              events={events.filter(e => e.isFeatured).slice(0, 6)}
              cities={cities}
              categories={categories}
              lang={lang}
              onEventClick={handleEventClick}
              currentUser={currentUser}
              title=""
            />
          </div>
        </div>

        {/* 6. Events Feed - General Listing */}
        <div className="py-12 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                {lang === 'en' ? '🎆 Upcoming Events' : lang === 'ar' ? '🎆 الأحداث القادمة' : '🎆 بۆنە داهاتووەکان'}
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto rounded-full"></div>
            </div>
            
            <EventGrid
              events={paginatedEvents}
              cities={cities}
              categories={categories}
              lang={lang}
              onEventClick={handleEventClick}
              currentUser={currentUser}
            />

            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          city={cities.find(c => c.id === selectedEvent.cityId)}
          category={categories.find(c => c.id === selectedEvent.categoryId)}
          lang={lang}
          onClose={() => setSelectedEvent(null)}
          currentUser={currentUser}
          onAddReview={handleAddReview}
          onEdit={handleEditEvent}
        />
      )}

      {isCreateEventModalOpen && currentUser && (
        <CreateEventModal
          eventToEdit={eventToEdit}
          onClose={() => {setIsCreateEventModalOpen(false); setEventToEdit(null);}}
          onSave={handleSaveEvent}
          cities={cities}
          categories={categories}
          currentUser={currentUser}
        />
      )}

      {isAuthModalOpen && (
        <EnhancedAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authMode}
          lang={lang}
          onVerificationNeeded={handleVerificationNeeded}
        />
      )}
      
      {verificationEmail && (
          <EmailVerificationNotice 
            email={verificationEmail}
            onClose={() => setVerificationEmail(null)}
            onResend={handleResendVerification}
          />
      )}
      
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
            user={currentUser}
            userEvents={events.filter(e => e.organizerId === currentUser.id)}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateProfile={handleUpdateProfile}
        />
      )}
      
      {/* Floating Install Button - Temporarily disabled */}
      {/* <FloatingInstallButton lang={lang} /> */}

    </div>
  );
}

export default App;
