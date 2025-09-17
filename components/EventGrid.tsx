
import React from 'react';
import { EventCard } from './EventCard';
import type { Event, City, Category, Language, User } from '@/types';

interface EventGridProps {
  events: Event[];
  cities: City[];
  categories: Category[];
  lang: Language;
  onEventClick: (event: Event) => void;
  currentUser: User | null;
}

export const EventGrid: React.FC<EventGridProps> = ({ events, cities, categories, lang, onEventClick, currentUser }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-scroll-container">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">All Events</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {events.map(event => (
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
      ) : (
        <div className="text-center py-12 sm:py-16">
          <p className="text-gray-500 text-sm sm:text-base">
            {lang === 'en' ? 'No events found matching your criteria.' : 
             lang === 'ar' ? 'لم يتم العثور على أحداث تطابق معاييرك.' : 
             'هیچ بۆنەیەک نەدۆزرایەوە کە لەگەڵ پێوەرەکانتدا بگونجێت.'}
          </p>
        </div>
      )}
    </div>
  );
};
