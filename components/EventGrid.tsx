import React from 'react';
import type { Event } from '../types';
import type { Language } from '../types';
import { EventCard } from './EventCard';

interface EventGridProps {
  events: Event[];
  lang: Language;
  onSelectEvent: (event: Event) => void;
  title: string;
}

export const EventGrid: React.FC<EventGridProps> = ({ events, lang, onSelectEvent, title }) => {
  const t = {
    noEvents: { en: 'No events match your criteria.', ar: 'لا توجد فعاليات تطابق بحثك.' , ku: 'هیچ ڕووداوێک لەگەڵ پێوەرەکانی تۆ ناگونجێت.'},
  };

  if (events.length === 0) {
     return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-neutral-text mb-6">{title}</h2>
            <div className="text-center py-16 bg-neutral-container rounded-lg border border-neutral-border">
                <p className="text-xl text-neutral-text-soft">{t.noEvents[lang]}</p>
            </div>
        </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-neutral-text mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} lang={lang} onSelect={onSelectEvent} />
          ))}
        </div>
    </div>
  );
};