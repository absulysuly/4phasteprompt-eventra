import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getEvents, type Event } from '../api/events';

interface EventCardGridProps {
  locale: 'en' | 'ar' | 'ku';
  selectedCity: string | null;
  selectedMonth: string;
  onOpenModal: (venueId: string) => void;
}

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
      url: `${window.location.origin}/discovery/v/${event.publicId}`
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (err) {
      navigator.clipboard.writeText(shareData.url);
      // You can replace this with a proper toast notification
      alert('Link copied to clipboard!');
    }
  };

  const eventDate = new Date(event.eventDate);
  const day = eventDate.toLocaleDateString(locale, { day: '2-digit' });
  const month = eventDate.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
  const time = eventDate.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div 
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border-2 border-gray-700 hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => onOpenModal(event.publicId)}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 via-orange-500/0 to-red-500/0 group-hover:from-amber-500/20 group-hover:via-orange-500/10 group-hover:to-red-500/5 transition-all duration-500 pointer-events-none" />
      
      <div className="relative w-full aspect-square overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          loading="lazy" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-all duration-500" />
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
          <span className="block text-2xl font-black leading-none">{day}</span>
          <span className="block text-[10px] font-bold tracking-wider uppercase mt-1">{month}</span>
        </div>
        
        {/* Live Badge */}
        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>
      
      <div className="p-5 relative z-10">
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors duration-300">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-amber-500 text-lg">📍</span>
            <p className="text-sm truncate">{event.location || event.city}</p>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-blue-400 text-lg">🕐</span>
            <p className="text-sm">{time}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium z-10 relative group/btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg font-bold text-sm text-white group-hover:from-amber-400 group-hover:to-orange-500 transition-all duration-200 shadow-lg">
            View Details
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCardGrid: React.FC<EventCardGridProps> = ({ locale, selectedCity, selectedMonth, onOpenModal }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const observer = useRef<IntersectionObserver>();
  const limit = 12;

  const lastEventElementRef = useCallback((node: any) => {
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
    
    const response = await getEvents({ 
      city, 
      month: selectedMonth, 
      limit, 
      offset: currentPage * limit, 
      locale 
    });
    
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