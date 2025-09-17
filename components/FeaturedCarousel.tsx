
import React from 'react';
import { EventCard } from './EventCard';
import type { Event, City, Category, Language, User } from '@/types';

interface FeaturedCarouselProps {
  events: Event[];
  cities: City[];
  categories: Category[];
  lang: Language;
  onEventClick: (event: Event) => void;
  currentUser: User | null;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ events, cities, categories, lang, onEventClick, currentUser }) => {
  const featuredEvents = events.filter(e => e.isFeatured);

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <div className="py-8 bg-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredEvents.map(event => (
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
