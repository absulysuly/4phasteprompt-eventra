
import React from 'react';
import { EventCard } from './EventCard';
import type { Event, City, Category, Language, User } from '@/types';

interface TopEventsCarouselProps {
  events: Event[];
  cities: City[];
  categories: Category[];
  lang: Language;
  onEventClick: (event: Event) => void;
  currentUser: User | null;
}

export const TopEventsCarousel: React.FC<TopEventsCarouselProps> = ({ events, cities, categories, lang, onEventClick, currentUser }) => {
  const topEvents = events.filter(e => e.isTop);

  if (topEvents.length === 0) {
    return null;
  }
  
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              city={cities.find(c => c.id === event.cityId)}
              category={categories.find(c => c.id === event.categoryId)}
              lang={lang}
              onClick={() => onEventClick(event)}
              isLoggedIn={!!currentUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
