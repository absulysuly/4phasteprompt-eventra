"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

interface LanguageSwitcherProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇮🇶" },
  { code: "ku", name: "Kurdish", nativeName: "کوردی", flag: "🏴" },
] as const;

export default function LanguageSwitcher({ 
  variant = "desktop", 
  className = "" 
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, switchLanguage, isRTL } = useLanguage();
  const { t } = useTranslations();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = async (langCode: string) => {
    try {
      await switchLanguage(langCode as any, true);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to switch language:", error);
    }
  };

  if (variant === "mobile") {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-gray-600 mb-3 font-medium">
          {t('navigation.language')}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              data-testid={`lang-${lang.code}-mobile`}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200
                ${language === lang.code 
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' 
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-gray-700'
                }
              `}
            >
              <span className="text-2xl mb-1">{lang.flag}</span>
              <span className="text-xs font-medium">{lang.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        data-testid="language-switcher"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-gray-700 hover:text-purple-600 hover:bg-purple-50
          font-medium transition-all duration-200
          ${isOpen ? 'bg-purple-50 text-purple-600' : ''}
        `}
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span className="text-sm hidden sm:inline">
          {currentLanguage?.nativeName}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`
          absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1
          bg-white border border-gray-200 rounded-xl shadow-xl
          min-w-[200px] z-50
          transition-all duration-200 transform origin-top
          ${isOpen 
            ? 'opacity-100 visible scale-100 translate-y-0' 
            : 'opacity-0 invisible scale-95 -translate-y-1'
          }
        `}
      >
        <div className="py-1">
          {languages.map((lang, index) => (
            <button
              key={lang.code}
              data-testid={`lang-${lang.code}-option`}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full px-4 py-3 text-left transition-colors duration-150
                flex items-center gap-3
                ${language === lang.code 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === languages.length - 1 ? 'rounded-b-xl' : ''}
              `}
            >
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-gray-500">{lang.name}</span>
              </div>
              {language === lang.code && (
                <svg className="w-4 h-4 ml-auto text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}