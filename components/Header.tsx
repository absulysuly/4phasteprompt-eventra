
import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { SparklesIcon } from './icons';
import type { Language, User } from '@/types';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onCreateEventClick: () => void;
  onProfileClick: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  currentUser,
  onLoginClick,
  onLogout,
  onCreateEventClick,
  onProfileClick
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-primary">Eventara</h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLang={lang} onLangChange={setLang} />
            <button
              onClick={onCreateEventClick}
              className="hidden sm:flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-all"
            >
              <SparklesIcon className="w-5 h-5 mr-2" />
              Create Event
            </button>
            {currentUser ? (
              <UserMenu user={currentUser} onLogout={onLogout} onProfileClick={() => onProfileClick(currentUser)} />
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
              >
                Log in / Sign up
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
