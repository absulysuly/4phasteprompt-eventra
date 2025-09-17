import React from 'react';
import { KurdistanFlag, IraqFlag, USFlag } from './icons/FlagIcons';
import type { Language } from '../types';

type LanguageOption = {
    code: Language;
    name: string;
    flag: React.ComponentType<{ className?: string }>;
};

const languageOptions: LanguageOption[] = [
    { code: 'ku', name: 'کوردی', flag: KurdistanFlag },
    { code: 'ar', name: 'عربي', flag: IraqFlag },
    { code: 'en', name: 'English', flag: USFlag },
];

interface LanguageSwitcherProps {
    currentLang: Language;
    onLangChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onLangChange }) => {
    return (
        <div className="flex items-center bg-neutral-container border border-neutral-border rounded-full p-1">
            {languageOptions.map((option) => (
                <button
                    key={option.code}
                    onClick={() => onLangChange(option.code)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 focus:outline-none ${
                        currentLang === option.code
                            ? 'bg-primary text-white font-bold shadow-md'
                            : 'text-neutral-text-soft hover:bg-primary/20 hover:text-neutral-text'
                    }`}
                >
                    <option.flag className="w-5 h-auto rounded-sm" />
                    <span className="hidden sm:inline">{option.name}</span>
                </button>
            ))}
        </div>
    );
};