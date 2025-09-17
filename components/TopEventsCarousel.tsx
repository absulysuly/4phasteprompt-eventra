import React, { useState } from 'react';
import type { Event, Language } from '../types';

interface TopEventsCarouselProps {
    events: Event[];
    lang: Language;
    onSelectEvent: (event: Event) => void;
}

export const TopEventsCarousel: React.FC<TopEventsCarouselProps> = ({ events, lang, onSelectEvent }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!events || events.length === 0) {
        return null;
    }
    
    const t = {
      topEvents: { en: 'Top Events', ar: 'أبرز الفعاليات', ku: 'ئاهەنگە دیارەکان' },
      seeDetails: { en: 'See Details', ar: 'انظر التفاصيل', ku: 'وردەکارییەکان ببینە' }
    }

    return (
        <div className="w-full flex flex-col items-center py-8 bg-neutral overflow-hidden border-b border-neutral-border">
            <h2 className="text-2xl font-bold text-neutral-text mb-6">{t.topEvents[lang]}</h2>
            
            <div className="text-center mb-8 h-48 flex flex-col items-center justify-center w-full">
                <div className="relative w-full h-full">
                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            className={`absolute inset-0 transition-opacity duration-300 ${index === selectedIndex ? 'opacity-100' : 'opacity-0'}`}
                            style={{ transform: `translateX(${(index - selectedIndex) * 100}%)`, transition: 'transform 0.5s ease, opacity 0.3s ease' }}
                        >
                            <div className="flex flex-col items-center">
                                <img src={event.imageUrl} alt={event.title[lang]} className="w-40 h-24 object-cover rounded-lg mx-auto mb-3 shadow-lg" />
                                <h3 className="text-lg font-bold text-neutral-text px-4">{event.title[lang]}</h3>
                                <p className="text-sm text-neutral-text-soft">{new Date(event.date).toLocaleDateString(lang, { month: 'long', day: 'numeric' })}</p>
                                <button onClick={() => onSelectEvent(event)} className="mt-2 px-4 py-1 text-xs font-bold bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                                    {t.seeDetails[lang]}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-2xl h-px bg-neutral-border relative flex justify-center items-center">
                <div className="flex items-center" style={{ columnGap: '80px' }}>
                    {events.map((event, index) => (
                        <button
                            key={event.id}
                            onClick={() => setSelectedIndex(index)}
                            className="relative flex flex-col items-center focus:outline-none"
                            aria-label={`View event ${event.title[lang]}`}
                        >
                            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${selectedIndex === index ? 'bg-secondary scale-150' : 'bg-neutral-border hover:bg-secondary/50'}`}></div>
                            <div className={`absolute -bottom-5 text-xs font-semibold transition-opacity duration-300 ${selectedIndex === index ? 'opacity-100 text-dark-text' : 'opacity-0'}`}>
                                {new Date(event.date).toLocaleDateString(lang, { month: 'short' })}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};