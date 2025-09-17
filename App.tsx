import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './services/api';
import { loggingService } from './services/loggingService';
import { config } from './config';
import type { Language, City, Category, Event, User } from './types';

// Components
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DiscoveryBar } from './components/DiscoveryBar';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { TopEventsCarousel } from './components/TopEventsCarousel';
import { EventGrid } from './components/EventGrid';
import { Pagination } from './components/Pagination';
import { EventDetailModal } from './components/EventDetailModal';
import { CreateEventModal } from './components/CreateEventModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { EmailVerificationNotice } from './components/EmailVerificationNotice';

const App: React.FC = () => {
  // Data State
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [lang, setLang] = useState<Language>(config.DEFAULT_LANG as Language);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVerificationNoticeOpen, setIsVerificationNoticeOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data Fetching
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [citiesData, categoriesData, eventsData] = await Promise.all([
        api.getCities(),
        api.getCategories(),
        api.getEvents(),
      ]);
      setCities(citiesData);
      setCategories(categoriesData);
      setEvents(eventsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      loggingService.logError(error as Error, { context: 'Initial data fetch failed' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event Handlers
  const handleSaveEvent = (savedEvent: Event) => {
    if (eventToEdit) {
      setEvents(events.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      setEvents([savedEvent, ...events]);
    }
    setIsCreateModalOpen(false);
    setEventToEdit(null);
  };
  
  const handleEditEvent = (event: Event) => {
      setSelectedEvent(null);
      setEventToEdit(event);
      setIsCreateModalOpen(true);
  }

  const handleAddReview = async (eventId: string, reviewData: { rating: number; comment: string }, userId: string) => {
    try {
        const updatedEvent = await api.addReview(eventId, reviewData, userId);
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        if (selectedEvent?.id === updatedEvent.id) {
            setSelectedEvent(updatedEvent);
        }
    } catch (error) {
        loggingService.logError(error as Error, { eventId, userId });
    }
  };

  const handleAuthSuccess = (user: User) => {
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      loggingService.trackEvent('login_success', { userId: user.id });
  };
  
  const handleVerificationNeeded = (email: string) => {
      setVerificationEmail(email);
      setIsAuthModalOpen(false);
      setIsVerificationNoticeOpen(true);
  }
  
  const handleLogout = () => {
      setCurrentUser(null);
      loggingService.trackEvent('logout');
  }

  // Filtering and Pagination Logic
  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const matchesCity = !selectedCity || event.cityId === selectedCity;
        const matchesCategory = !selectedCategory || event.categoryId === selectedCategory;
        const matchesQuery = !searchQuery || 
          event.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCity && matchesCategory && matchesQuery;
      })
      .filter(e => !e.isFeatured && !e.isTop); // Exclude featured/top from main grid
  }, [events, selectedCity, selectedCategory, searchQuery, lang]);

  const totalPages = Math.ceil(filteredEvents.length / config.EVENTS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * config.EVENTS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + config.EVENTS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const userEvents = useMemo(() => {
      return currentUser ? events.filter(e => e.organizerId === currentUser.id) : [];
  }, [events, currentUser]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCreateEventClick={() => {
            if (currentUser) {
              setEventToEdit(null);
              setIsCreateModalOpen(true)
            } else {
              setIsAuthModalOpen(true)
            }
        }}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      <main>
        <SearchBar query={searchQuery} onQueryChange={setSearchQuery} onSearch={() => setCurrentPage(1)} />
        <DiscoveryBar
          cities={cities}
          categories={categories}
          selectedCity={selectedCity}
          selectedCategory={selectedCategory}
          onCityChange={(id) => { setSelectedCity(id); setCurrentPage(1); }}
          onCategoryChange={(id) => { setSelectedCategory(id); setCurrentPage(1); }}
          lang={lang}
        />
        <FeaturedCarousel events={events} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
        <TopEventsCarousel events={events} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
        <EventGrid events={paginatedEvents} cities={cities} categories={categories} lang={lang} onEventClick={setSelectedEvent} currentUser={currentUser} />
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
      {isCreateModalOpen && currentUser && (
        <CreateEventModal
          eventToEdit={eventToEdit}
          onClose={() => { setIsCreateModalOpen(false); setEventToEdit(null); }}
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
            onVerificationNeeded={handleVerificationNeeded}
          />
      )}
      {isProfileModalOpen && currentUser && (
          <UserProfileModal 
            user={currentUser} 
            userEvents={userEvents}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdateProfile={(data) => console.log("Update profile:", data)} // Placeholder
          />
      )}
      {isVerificationNoticeOpen && (
          <EmailVerificationNotice 
            email={verificationEmail}
            onClose={() => setIsVerificationNoticeOpen(false)}
            onResend={() => console.log('Resend verification for', verificationEmail)} // Placeholder
          />
      )}
    </div>
  );
};

export default App;
