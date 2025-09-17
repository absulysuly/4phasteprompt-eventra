// FIX: Implemented the main App component to structure the application and manage state.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from './services/api';
import { loggingService } from './services/loggingService';
import type { Language, User, City, Category, Event, Review } from './types';

import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DiscoveryBar } from './components/DiscoveryBar';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { TopEventsCarousel } from './components/TopEventsCarousel';
import { EventGrid } from './components/EventGrid';
import { Pagination } from './components/Pagination';
import { EventDetailModal } from './components/EventDetailModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CreateEventModal } from './components/CreateEventModal';
import { EmailVerificationNotice } from './components/EmailVerificationNotice';

const ITEMS_PER_PAGE = 8;

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [lang, setLang] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data state
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  // UI/Filter state
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isVerificationNoticeOpen, setIsVerificationNoticeOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [citiesData, categoriesData, eventsData] = await Promise.all([
          api.getCities(),
          api.getCategories(),
          api.getEvents()
        ]);
        setCities(citiesData);
        setCategories(categoriesData);
        setAllEvents(eventsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        loggingService.logError(error as Error, { context: 'Initial data load' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- DERIVED STATE & MEMOIZATION ---
  const filteredEvents = useMemo(() => {
    return allEvents
      .filter(event => selectedCity ? event.cityId === selectedCity : true)
      .filter(event => selectedCategory ? event.categoryId === selectedCategory : true)
      .filter(event =>
        searchQuery ?
        event.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description[lang].toLowerCase().includes(searchQuery.toLowerCase()) :
        true
      );
  }, [allEvents, selectedCity, selectedCategory, searchQuery, lang]);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  }, [filteredEvents]);

  // --- EVENT HANDLERS ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    loggingService.trackEvent('logout');
  };

  const handleEventSave = (savedEvent: Event) => {
    const isEditing = !!eventToEdit;
    if (isEditing) {
      setAllEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      setAllEvents(prev => [savedEvent, ...prev]);
    }
    setIsCreateModalOpen(false);
    setEventToEdit(null);
    setSelectedEvent(savedEvent); // Open detail view of the new/edited event
  };

  const handleAddReview = useCallback(async (eventId: string, reviewData: { rating: number; comment: string; }, userId: string) => {
    try {
      const updatedEvent = await api.addReview(eventId, reviewData, userId);
      setAllEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      setSelectedEvent(updatedEvent);
      loggingService.trackEvent('review_added', { eventId, userId });
    } catch (error) {
      loggingService.logError(error as Error, { context: 'Adding review' });
    }
  }, []);

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      setEventToEdit(null);
      setIsCreateModalOpen(true);
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(null);
    setEventToEdit(event);
    setIsCreateModalOpen(true);
  };
  
  const handleSwitchToVerify = (email: string) => {
    setIsAuthModalOpen(false);
    setVerificationEmail(email);
    setIsVerificationNoticeOpen(true);
  };

  const handleResendVerification = () => {
      // In a real app, this would trigger a backend API call.
      console.log(`Resending verification to ${verificationEmail}`);
      // Show a toast message for confirmation
  };

  // --- RENDER ---
  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCreateEventClick={handleOpenCreateModal}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={() => setCurrentPage(1)}
          />
        </div>
        <DiscoveryBar
          cities={cities}
          categories={categories}
          selectedCity={selectedCity}
          selectedCategory={selectedCategory}
          onCityChange={(id) => { setSelectedCity(id); setCurrentPage(1); }}
          onCategoryChange={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
          lang={lang}
        />
        {isLoading ? (
          <div className="text-center py-20">Loading events...</div>
        ) : (
          <>
            <FeaturedCarousel events={allEvents} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
            <TopEventsCarousel events={allEvents} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
            <EventGrid events={paginatedEvents} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </main>

      {/* --- MODALS --- */}
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
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToVerify={handleSwitchToVerify}
        />
      )}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal 
          user={currentUser}
          userEvents={allEvents.filter(e => e.organizerId === currentUser.id)}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateProfile={(data) => setCurrentUser(u => u ? {...u, ...data} : null)}
        />
      )}
      {isCreateModalOpen && currentUser && (
        <CreateEventModal
          eventToEdit={eventToEdit}
          onClose={() => { setIsCreateModalOpen(false); setEventToEdit(null); }}
          onSave={handleEventSave}
          cities={cities}
          categories={categories}
          currentUser={currentUser}
        />
      )}
      {isVerificationNoticeOpen && (
          <EmailVerificationNotice
            email={verificationEmail}
            onClose={() => setIsVerificationNoticeOpen(false)}
            onResend={handleResendVerification}
           />
      )}
    </div>
  );
};

export default App;
