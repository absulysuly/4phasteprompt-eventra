import React from 'react';
import type { User, Event, Language } from '../types';
import { EventCard } from './EventCard';
import { ProfileHeader } from './ProfileHeader';

interface UserProfileModalProps {
  user: User | null;
  events: Event[];
  onClose: () => void;
  onSelectEvent: (event: Event) => void;
  lang: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, events, onClose, onSelectEvent, lang }) => {
  if (!user) return null;

  const userEvents = events.filter(event => event.organizerId === user.id);
  
  const t = {
    eventsBy: { en: 'Events organized by', ar: 'فعاليات من تنظيم', ku: 'ڕووداوەکانی ڕێکخراوی' },
    noEvents: { en: 'This user has not organized any events yet.', ar: 'لم يقم هذا المستخدم بتنظيم أي فعاليات بعد.', ku: 'ئەم بەکارهێنەرە هێشتا هیچ ڕووداوێکی ڕێکنەخستووە.' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="bg-neutral-container text-neutral-text rounded-lg shadow-xl w-full max-w-4xl my-8 border border-neutral-border">
        <div className="relative p-6">
            <button onClick={onClose} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-neutral/80 text-neutral-text-soft rounded-full p-1 leading-none text-2xl hover:bg-neutral-border">&times;</button>
            <ProfileHeader user={user} onBack={onClose} lang={lang} />
        </div>
        
        <div className="px-6 pb-6">
            <h3 className="text-2xl font-bold text-neutral-text mb-4">{t.eventsBy[lang]} {user.name}</h3>
            {userEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userEvents.map(event => (
                        <EventCard key={event.id} event={event} lang={lang} onSelect={onSelectEvent} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-neutral rounded-lg border border-neutral-border">
                    <p className="text-xl text-neutral-text-soft">{t.noEvents[lang]}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
