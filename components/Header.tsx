import React from 'react';
import type { Language, User, AuthMode } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { LogoIcon } from './icons/LogoIcon';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenCreateModal: () => void;
  onOpenAIAssistant: () => void;
  currentUser: User | null;
  onAuthClick: (mode: AuthMode) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLangChange, onOpenCreateModal, onOpenAIAssistant, currentUser, onAuthClick, onLogout }) => {
  const t = {
    login: { en: 'Login', ar: 'تسجيل الدخول', ku: 'چوونەژوورەوە' },
    createEvent: { en: 'Create Event', ar: 'إنشاء فعالية', ku: 'ڕووداو دروستبکە' },
    createWithAI: { en: 'Create with AI', ar: 'إنشاء بالذكاء الاصطناعي', ku: 'دروستکردن بە زیرەکی دەستکرد' },
  };

  return (
    <header className="bg-neutral/90 backdrop-blur-md sticky top-0 z-40 border-b border-neutral-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold text-neutral-text tracking-tight">
              {lang === 'en' ? 'Eventara' : (lang === 'ku' ? 'ئیڤێنتارا' : 'إيفينتارا')}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <LanguageSwitcher currentLang={lang} onLangChange={onLangChange} />
            {currentUser ? (
              <>
                <UserMenu user={currentUser} onLogout={onLogout} />
                <button 
                  onClick={onOpenAIAssistant}
                  className="hidden lg:flex items-center gap-2 text-sm font-bold text-dark-text bg-accent rounded-full px-4 py-2 hover:bg-accent/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✨ <span className="hidden md:inline">{t.createWithAI[lang]}</span>
                </button>
                <button 
                  onClick={onOpenCreateModal}
                  className="text-sm font-bold text-white bg-primary rounded-full px-4 py-2 hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t.createEvent[lang]}
                </button>
              </>
            ) : (
              <button onClick={() => onAuthClick('login')} className="text-sm font-bold text-white bg-primary rounded-full px-6 py-2 hover:bg-primary/90 transition-colors">
                  {t.login[lang]}
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};