"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";
import ResponsiveButton from "./ResponsiveButton";

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslations();
  
  const showTopBanner = (process.env.NEXT_PUBLIC_SHOW_TOP_BANNER === 'true');
  
  // Auto-open mobile menu on initial load for mobile screens to avoid CSS conflicts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768; // md breakpoint
      if (isMobile) {
        setIsMenuOpen(true);
      }
    }
  }, []);
  
  return (
    <>
      {/* Top Notification Bar (hidden in production by default) */}
      {showTopBanner && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 text-center text-sm font-medium">
          🎉 {t('navigation.aiRecommendations')} 
          <Link href="/register" className="underline ml-2 font-semibold hover:text-yellow-300">
            {t('navigation.tryItFree')} {isRTL ? '←' : '→'}
          </Link>
        </div>
      )}
      
      {/* Main Navigation */}
      <nav className="neon-nav events-glow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href={language === 'en' ? '/' : `/${language}`} className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-var(--events-color) via-var(--tourism-color) to-var(--hotels-color) rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 events-glow">
                <span className="text-white font-bold text-lg">🇮🇶</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white neon-glow" style={{ color: 'var(--text-primary)', textShadow: '0 0 10px var(--events-color)' }}>
                  IraqGuide
                </span>
                <div className="text-xs font-medium -mt-1" style={{ color: 'var(--text-secondary)' }}>{t('navigation.eventPlatform')}</div>
              </div>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href={language === 'en' ? '/' : `/${language}`} className="font-medium transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                {t('navigation.home')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--events-color)', boxShadow: '0 0 5px var(--events-color)' }}></span>
              </Link>
              <Link href={language === 'en' ? '/events' : `/${language}/events`} className="font-medium transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                {t('navigation.events')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--events-color)', boxShadow: '0 0 5px var(--events-color)' }}></span>
              </Link>
              <Link href={language === 'en' ? '/hotels' : `/${language}/hotels`} className="font-medium transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                Hotels
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--hotels-color)', boxShadow: '0 0 5px var(--hotels-color)' }}></span>
              </Link>
              <Link href={language === 'en' ? '/restaurants' : `/${language}/restaurants`} className="font-medium transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                Restaurants
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--restaurants-color)', boxShadow: '0 0 5px var(--restaurants-color)' }}></span>
              </Link>
              <Link href={language === 'en' ? '/tourism' : `/${language}/tourism`} className="font-medium transition-colors relative group" style={{ color: 'var(--text-primary)' }}>
                Tourism
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: 'var(--tourism-color)', boxShadow: '0 0 5px var(--tourism-color)' }}></span>
              </Link>
            </div>
            
            {/* User Menu */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Language Switcher */}
              <div className="relative group hidden sm:block" data-testid="language-switcher">
                <button className="flex items-center gap-2 px-3 py-2 font-medium transition-colors rounded-full" style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">🌐</span>
                  <span className="text-sm">
                    {language === 'en' ? 'English' : language === 'ar' ? 'العربية' : 'کوردی'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7 7-7" />
                  </svg>
                </button>
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 rounded-lg min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50`} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--events-color)' }}>
                  <button 
                    onClick={() => setLanguage('en' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors rounded-lg`}
                    style={{ color: language === 'en' ? 'var(--events-color)' : 'var(--text-primary)' }}
                  >
                    🇺🇸 English
                  </button>
                  <button 
                    onClick={() => setLanguage('ar' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors rounded-lg`}
                    style={{ color: language === 'ar' ? 'var(--events-color)' : 'var(--text-primary)' }}
                  >
                    🇮🇶 العربية
                  </button>
                  <button 
                    onClick={() => setLanguage('ku' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors rounded-lg`}
                    style={{ color: language === 'ku' ? 'var(--events-color)' : 'var(--text-primary)' }}
                  >
                    🇮🇶 کوردی
                  </button>
                </div>
              </div>
              
{/* Create Event Link styled as text pill (not a button) */}
              <Link 
                href={session ? (language === 'en' ? '/dashboard' : `/${language}/dashboard`) : (language === 'en' ? '/register' : `/${language}/register`)}
                className="neon-button tourism tourism-glow"
                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              >
                <span>+</span>
                {t('navigation.createEvent')}
              </Link>
              
              {session ? (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">
                        {session.user?.name || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>
<Link 
                    href={language === 'en' ? '/dashboard' : `/${language}/dashboard`} 
                    className="inline-block px-3 py-1.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {t('navigation.dashboard')}
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-red-600 font-medium transition-colors hidden md:block"
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
<Link 
                    href={language === 'en' ? '/login' : `/${language}/login`} 
                    className="inline-block px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    {t('navigation.login')}
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-purple-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <div className={`md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md ${isMenuOpen ? 'block' : 'hidden'}`}>
            <div className="flex flex-col gap-4">
              <Link href={language === 'en' ? '/' : `/${language}`} className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.home')}
                </Link>
                <Link href={language === 'en' ? '/events' : `/${language}/events`} className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.events')}
                </Link>
                <Link href={language === 'en' ? '/categories' : `/${language}/categories`} className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.categories')}
                </Link>
                <Link href={language === 'en' ? '/about' : `/${language}/about`} className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.about')}
                </Link>
                {!session && (
                  <div className="flex gap-3 pt-2">
                    <Link href={language === 'en' ? '/login' : `/${language}/login`} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
                      <span>🔑</span>
                      {t('navigation.login')}
                    </Link>
                  </div>
                )}
                
                {/* Mobile Language Switcher */}
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <div className="text-sm text-gray-600 mb-2">{t('navigation.language')}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setLanguage('en' as any)}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        language === 'en' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🇺🇸 EN
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </nav>
    </>
  );
}
