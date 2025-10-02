import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getEvents } from '../api/GeminiController';

// --- Interfaces ---

interface Event {
  id: string;
  publicId: string;
  imageUrl: string;
  eventDate: string;
  city: string;
  title: string;
  description: string;
  location: string;
}

interface EventCardGridProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  selectedMonth: string;
  onOpenModal: (venueId: string) => void;
}

// --- Helper Components ---

const SkeletonCard: React.FC = () => (
  <div className="animate-pulse w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
    <div className="w-full aspect-square bg-gray-700"></div>
    <div className="p-4">
      <div className="h-5 w-3/4 rounded bg-gray-700 mb-2"></div>
      <div className="h-4 w-1/2 rounded bg-gray-700 mb-3"></div>
      <div className="h-4 w-1/3 rounded bg-gray-700"></div>
    </div>
    <div className="px-4 pb-4 flex justify-between">
      <div className="h-8 w-1/3 rounded-lg bg-gray-700"></div>
      <div className="h-8 w-1/3 rounded-lg bg-gray-700"></div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: Event; locale: 'en' | 'ar' | 'ku'; onOpenModal: (venueId: string) => void; }> = ({ event, locale, onOpenModal }) => {
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent modal from opening
    const shareData = {
      title: event.title,
      text: event.description.substring(0, 100) + '...',
      url: `${window.location.origin}/v/${event.publicId}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (err) {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!'); // Replace with a proper toast notification
    }
  };

  const eventDate = new Date(event.eventDate);
  const day = eventDate.toLocaleDateString(locale, { day: '2-digit' });
  const month = eventDate.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
  const time = eventDate.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div 
      className="group bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 shadow-lg hover:shadow-pink-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpenModal(event.publicId)}
    >
      <div className="relative w-full aspect-square">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded-lg text-center leading-none">
          <span className="block text-xl font-bold">{day}</span>
          <span className="block text-xs font-semibold tracking-wider">{month}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-lg font-bold text-white truncate group-hover:text-pink-400 transition-colors">{event.title}</h3>
        <p className="text-sm text-gray-400 mt-1">📍 {event.location || event.city}</p>
        <p className="text-sm text-gray-400 mt-1">🕐 {time}</p>
      </div>
      <div className="px-4 pb-4 border-t border-gray-700/50 flex justify-between items-center mt-2 pt-3">
        <button onClick={handleShare} className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-sm z-10 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          Share
        </button>
        <span className="text-pink-400 font-bold hover:text-pink-300 transition-colors text-sm">
          Details →
        </span>
      </div>
    </div>
  );
};

// --- Main Component ---

const EventCardGrid: React.FC<EventCardGridProps> = ({ locale, selectedCity, selectedMonth, onOpenModal }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver>();
  const limit = 12;

  const lastEventElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchAndSetEvents = useCallback(async (reset = false) => {
    setLoading(true);
    const currentPage = reset ? 0 : page;
    const city = selectedCity === 'all' ? null : selectedCity;
    // FIX: The 'offset' property was missing. The object literal was passing 'currentPage * limit' as a value without a key.
    const response = await getEvents({ city, month: selectedMonth, limit, offset: currentPage * limit, locale });
    
    setEvents(prevEvents => reset ? response.events : [...prevEvents, ...response.events]);
    setHasMore(response.hasMore);
    setLoading(false);
  }, [page, selectedCity, selectedMonth, locale]);

  // Effect for fetching events when filters or page change
  useEffect(() => {
    if (page > 0) { // Fetch more on page change
        fetchAndSetEvents();
    }
  }, [page]);
  
  // Effect for re-fetching when filters change
  useEffect(() => {
    setEvents([]);
    setPage(0);
    setHasMore(true);
    fetchAndSetEvents(true);
  }, [selectedCity, selectedMonth, locale]);

  const isEmpty = !loading && events.length === 0;

  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-4">
      {isEmpty ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🏜️</p>
          <h3 className="text-xl font-semibold">No Events Found</h3>
          <p>Try selecting a different month or governorate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event, index) => {
            const card = <EventCard event={event} locale={locale} onOpenModal={onOpenModal} />;
            if (events.length === index + 1) {
              return <div ref={lastEventElementRef} key={event.id}>{card}</div>;
            } else {
              return <div key={event.id}>{card}</div>;
            }
          })}
          {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
        </div>
      )}
    </div>
  );
};

export default EventCardGrid;
