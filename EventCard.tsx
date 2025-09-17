import React from 'react';
import type { Event, City, Category, Language } from '@/types';
// FIX: Corrected import path for icons from './icons' to './components/icons' since this file is at the root.
import { MapPinIcon, CalendarIcon } from './components/icons';

interface EventCardProps {
  event: Event;
  city?: City;
  category?: Category;
  lang: Language;
  onClick: () => void;
  isLoggedIn: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, city, lang, onClick }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer group"
    >
      <div className="relative">
        <img className="w-full h-48 object-cover" src={event.imageUrl} alt={event.title[lang]} />
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 m-2 rounded">
          {city?.name[lang]}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">{event.title[lang]}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description[lang]}</p>
        <div className="flex items-center text-sm text-gray-600 mt-4">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <MapPinIcon className="w-4 h-4 mr-2" />
          <span>{event.venue}</span>
        </div>
      </div>
    </div>
  );
};
