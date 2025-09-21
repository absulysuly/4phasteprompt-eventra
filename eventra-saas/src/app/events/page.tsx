"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import EventImage from "../components/EventImage";
import EventDetailsModal from "../components/EventDetailsModal";
import ResponsiveButton from "../components/ResponsiveButton";
import SearchSuggest from "../components/SearchSuggest";
import { useLanguage } from "../components/LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

interface Event {
  id: string;
  publicId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category?: string;
  price?: number;
  isFree?: boolean;
  imageUrl?: string;
  user?: {
    name?: string;
    email: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();

  // Use translated categories
  const categories = [
    { name: t('common.allCategories'), icon: "🎉", key: 'all' },
    { name: t('categories.musicConcerts'), icon: "🎵", key: 'musicConcerts' },
    { name: t('categories.sportsFitness'), icon: "⚽", key: 'sportsFitness' },
    { name: t('categories.foodDrink'), icon: "🍽️", key: 'foodDrink' },
    { name: t('categories.business'), icon: "💼", key: 'business' },
    { name: t('categories.technologyInnovation'), icon: "💻", key: 'technologyInnovation' },
    { name: t('categories.artsCulture'), icon: "🎨", key: 'artsCulture' },
    { name: t('categories.healthWellness'), icon: "🏥", key: 'healthWellness' },
    { name: t('categories.communitySocial'), icon: "👥", key: 'communitySocial' }
  ];

  // Use translated cities
  const cities = [
    t('common.allCities'),
    t('cities.baghdad'), 
    t('cities.basra'), 
    t('cities.mosul'), 
    t('cities.erbil'), 
    t('cities.sulaymaniyah'), 
    t('cities.duhok'), 
    t('cities.kirkuk'), 
    t('cities.anbar'), 
    t('cities.najaf'), 
    t('cities.karbala')
  ];
  
  // Use translated months (memoized to avoid changing deps endlessly)
  const months = React.useMemo(() => ([
    t('common.allMonths'),
    t('months.january'), t('months.february'), t('months.march'), 
    t('months.april'), t('months.may'), t('months.june'),
    t('months.july'), t('months.august'), t('months.september'), 
    t('months.october'), t('months.november'), t('months.december')
  ]), [language]);

  // Use translated price filters
  const priceFilters = [
    t('common.allPrices'),
    t('common.free'),
    t('common.paid'),
    t('common.under25'),
    t('common.price25to50'),
    t('common.price50to100'),
    t('common.over100')
  ];

  // Initialize filter states with translations when they're loaded
  useEffect(() => {
    if (t && selectedCategory === '') {
      setSelectedCategory(t('common.allCategories'));
      setSelectedCity(t('common.allCities'));
      setSelectedMonth(t('common.allMonths'));
      setSelectedPrice(t('common.allPrices'));
    }
  }, [t, selectedCategory, selectedCity, selectedMonth, selectedPrice]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/events?type=public&lang=${language}`);
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
          setFilteredEvents(eventsData);
        } else {
          console.error('Failed to fetch events');
          // Set some demo events for now
          setEvents(demoEvents);
          setFilteredEvents(demoEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Set some demo events for now
        setEvents(demoEvents);
        setFilteredEvents(demoEvents);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Demo events for when database is empty
  const demoEvents: Event[] = [
    {
      id: "1",
      publicId: "ai-summit-2025",
      title: "AI Innovation Summit",
      description: "Join us for a comprehensive exploration of artificial intelligence and machine learning technologies that are shaping the future.",
      date: "2025-03-15T10:00:00Z",
      location: "Baghdad Tech Center, Baghdad",
      category: "Technology & Innovation",
      price: 50,
      isFree: false,
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Tech Events Iraq", email: "tech@iraqevents.com" }
    },
    {
      id: "2", 
      publicId: "music-festival-erbil",
      title: "Kurdish Music Festival",
      description: "Experience the rich musical heritage of Kurdistan with traditional and contemporary Kurdish artists.",
      date: "2025-03-20T18:00:00Z",
      location: "Central Park, Erbil",
      category: "Music & Concerts",
      price: 0,
      isFree: true,
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Kurdistan Arts Council", email: "arts@kurdistan.org" }
    },
    {
      id: "3",
      publicId: "business-workshop-basra",
      title: "Business Leadership Workshop",
      description: "Learn essential leadership skills and networking strategies for business growth in the Middle East market.",
      date: "2025-03-25T09:00:00Z",
      location: "Business District, Basra",
      category: "Business",
      price: 75,
      isFree: false,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Business Development Iraq", email: "business@iraq.com" }
    },
    {
      id: "4",
      publicId: "art-exhibition-mosul",
      title: "Modern Art Exhibition",
      description: "Discover contemporary Iraqi and international art in this groundbreaking exhibition featuring 50+ artists.",
      date: "2025-04-01T14:00:00Z",
      location: "Culture Center, Mosul",
      category: "Arts & Culture",
      price: 30,
      isFree: false,
      imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Mosul Cultural Foundation", email: "culture@mosul.org" }
    },
    {
      id: "5",
      publicId: "food-festival-baghdad",
      title: "Iraqi Food Festival",
      description: "Taste authentic Iraqi cuisine from various regions, featuring traditional recipes and modern interpretations.",
      date: "2025-04-05T12:00:00Z",
      location: "Al-Zawra Park, Baghdad",
      category: "Food & Drink",
      price: 15,
      isFree: false,
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Baghdad Culinary Society", email: "food@baghdad.com" }
    },
    {
      id: "6",
      publicId: "sports-tournament-sulaymaniyah",
      title: "Football Championship",
      description: "Regional football tournament featuring teams from across Kurdistan and Iraq competing for the championship.",
      date: "2025-04-10T16:00:00Z",
      location: "Sulaymaniyah Stadium, Sulaymaniyah",
      category: "Sports & Fitness",
      price: 25,
      isFree: false,
      imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop&crop=center&auto=format&q=80",
      user: { name: "Kurdistan Football League", email: "sports@kurdistan.com" }
    }
  ];

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== t('common.allCategories')) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // City filter
    if (selectedCity !== t('common.allCities')) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Month filter
    if (selectedMonth !== t('common.allMonths')) {
      const monthIndex = months.indexOf(selectedMonth) - 1; // -1 because months array includes "All Months"
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === monthIndex;
      });
    }

    // Price filter
    if (selectedPrice !== t('common.allPrices')) {
      filtered = filtered.filter(event => {
        switch (selectedPrice) {
          case t('common.free'):
            return event.isFree || event.price === 0;
          case t('common.paid'):
            return !event.isFree && (event.price || 0) > 0;
          case t('common.under25'):
            return (event.price || 0) < 25;
          case t('common.price25to50'):
            return (event.price || 0) >= 25 && (event.price || 0) <= 50;
          case t('common.price50to100'):
            return (event.price || 0) > 50 && (event.price || 0) <= 100;
          case t('common.over100'):
            return (event.price || 0) > 100;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, selectedCity, selectedMonth, selectedPrice, t, language]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory(t('common.allCategories'));
    setSelectedCity(t('common.allCities'));
    setSelectedMonth(t('common.allMonths'));
    setSelectedPrice(t('common.allPrices'));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ckb-IQ' : 'en-US';
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (event: Event, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : "🎉";
  };

  const getEventImageCategory = (category: string) => {
    const mapping: { [key: string]: string } = {
      "Music & Concerts": "music",
      "Sports & Fitness": "sports",
      "Food & Drink": "food",
      "Business": "business",
      "Technology & Innovation": "tech",
      "Arts & Culture": "art",
      "Health & Wellness": "health",
      "Community & Social": "community"
    };
    return mapping[category] || "community";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('homepage.loading')}</h2>
          <p className="text-gray-600">{t('events.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-6">
              <span className="text-white font-semibold">📅 {t('homepage.allEvents')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {t('events.title')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t('events.subtitle')}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="relative">
              <SearchSuggest
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('events.searchPlaceholder')}
              />
              <button className="absolute right-2 top-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                🔍
              </button>
            </div>
          </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {cities.map(city => (
                  <option key={city} value={city}>📍 {city}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {months.map(month => (
                  <option key={month} value={month}>📅 {month}</option>
                ))}
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {priceFilters.map(price => (
                  <option key={price} value={price}>💰 {price}</option>
                ))}
              </select>

              <ResponsiveButton
                onClick={clearAllFilters}
                variant="secondary"
                size="md"
                className="bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 text-white hover:text-white"
              >
                {t('events.clearAllFilters')}
              </ResponsiveButton>
            </div>

            {/* Results Count */}
            <div className="text-center">
              <p className="text-white/80 text-lg">
                {filteredEvents.length === 0 ? t('events.noEventsFound') : t('events.foundEvents', { count: filteredEvents.length })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('events.noEventsFound')}</h3>
            <p className="text-gray-600 mb-6">{t('events.noEventsMessage')}</p>
            <ResponsiveButton
              onClick={clearAllFilters}
              variant="primary"
              size="lg"
            >
              {t('events.clearAllFilters')}
            </ResponsiveButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredEvents.map((event) => (
              <Link 
                key={event.id}
href={`/${language}/event/${event.publicId}`}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer block"
              >
                <div className="relative">
                  <EventImage
                    src={event.imageUrl}
                    alt={event.title}
                    width={400}
                    height={240}
                    className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    category={getEventImageCategory(event.category || "")}
                  />
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    {event.isFree || event.price === 0 ? (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        {t('events.free')}
                      </span>
                    ) : (
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                        ${event.price}
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {getCategoryIcon(event.category || "")} {event.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <span className="text-blue-600">📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <span className="text-red-600">📍</span>
                      <span>{event.location}</span>
                    </div>
                    {event.user && (
                      <div className="flex items-center gap-2 text-gray-600 text-xs">
                        <span className="text-purple-600">👤</span>
                        <span>{t('events.byOrganizer', { name: event.user.name || event.user.email })}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className={`text-lg font-semibold ${
                      event.isFree || event.price === 0 ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {event.isFree || event.price === 0 ? t('events.free') : `$${event.price}`}
                    </span>
                    <ResponsiveButton 
                      onClick={(e) => handleViewDetails(event, e!)}
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 group-hover:text-purple-800 hover:bg-purple-50"
                    >
                      {t('events.viewDetails')} {isRTL ? '←' : '→'}
                    </ResponsiveButton>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('events.createEventCta')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('events.createEventSubtitle')}
          </p>
          <ResponsiveButton
            href="/register"
            variant="secondary"
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            {t('events.createYourEvent')}
          </ResponsiveButton>
        </div>
      </div>
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}
