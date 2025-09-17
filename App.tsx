import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { loggingService } from './services/loggingService';
import { Header } from './components/Header';
import { IntelligentSearchBar } from './components/IntelligentSearchBar';
import { DiscoveryBar } from './components/DiscoveryBar';
import { FilterTags } from './components/FilterTags';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { TopEventsCarousel } from './components/TopEventsCarousel';
import { EventGrid } from './components/EventGrid';
import { Pagination } from './components/Pagination';
import { EventDetailModal } from './components/EventDetailModal';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { EmailVerificationNotice } from './components/EmailVerificationNotice';
import type { Event, City, Category, User, Language, AuthMode } from './types';
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

  const handleResendVerification = () => {
    // In a real app, this would call an API endpoint
    console.log(`Resending verification to ${verificationEmail}`);
    loggingService.trackEvent('resend_verification', { email: verificationEmail });
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
    <div className="bg-neutral-50 min-h-screen">
      <Header
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onLoginClick={() => handleOpenAuthModal('login')}
        onLogout={handleLogout}
        onCreateEventClick={handleCreateEventClick}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      <main>
        <IntelligentSearchBar 
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={handleSearch}
            lang={lang}
        />
        <FilterTags 
            searchQuery={activeSearchQuery}
            selectedCityId={selectedCity}
            selectedCategoryId={selectedCategory}
            cities={cities}
            categories={categories}
            lang={lang}
            onClearSearch={() => { setSearchQuery(''); setActiveSearchQuery(''); }}
            onClearCity={() => setSelectedCity(null)}
            onClearCategory={() => setSelectedCategory(null)}
        />
        <DiscoveryBar
          cities={cities}
          categories={categories}
          selectedCity={selectedCity}
          selectedCategory={selectedCategory}
          onCityChange={setSelectedCity}
          onCategoryChange={setSelectedCategory}
          lang={lang}
        />
        
        <FeaturedCarousel
          events={events}
          cities={cities}
          categories={categories}
          lang={lang}
          onEventClick={handleEventClick}
          currentUser={currentUser}
        />

        <TopEventsCarousel
          events={events}
          cities={cities}
          categories={categories}
          lang={lang}
          onEventClick={handleEventClick}
          currentUser={currentUser}
        />

        <EventGrid
          events={paginatedEvents}
          cities={cities}
          categories={categories}
          lang={lang}
          onEventClick={handleEventClick}
          currentUser={currentUser}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
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
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          initialMode={authMode}
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

    </div>
  );
}

export default App;
