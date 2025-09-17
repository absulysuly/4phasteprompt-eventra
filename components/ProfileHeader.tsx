
import React from 'react';
import type { User, Language } from '../types';

interface ProfileHeaderProps {
  user: User;
  onBack: () => void;
  lang: Language;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onBack, lang }) => {
  const t = {
    back: { en: 'Back to all events', ar: 'العودة إلى كل الفعاليات', ku: 'گەڕانەوە بۆ هەموو ڕووداوەکان' },
    organizer: { en: 'Event Organizer', ar: 'منظم فعاليات', ku: 'ڕێکخەری ڕووداو' },
    contact: { en: 'Contact Info', ar: 'معلومات الاتصال', ku: 'زانیاری پەیوەندی' },
  };

  return (
    <div className="bg-neutral-container border-b border-neutral-border">
        <div className="container mx-auto px-4 py-6">
            <button
                onClick={onBack}
                className="mb-6 text-sm font-semibold text-primary hover:underline flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.back[lang]}
            </button>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-secondary shadow-lg" />
                <div>
                    <h2 className="text-3xl font-bold text-neutral-text">{user.name}</h2>
                    <p className="text-md text-accent font-semibold">{t.organizer[lang]}</p>
                    <div className="mt-2 text-sm text-neutral-text-soft">
                        <span>{user.phone}</span>
                        <span className="mx-2">·</span>
                        <span>{user.email}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
