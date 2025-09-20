"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";
import ResponsiveButton from "./ResponsiveButton";

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslations();
  
  const showTopBanner = (process.env.NEXT_PUBLIC_SHOW_TOP_BANNER === 'true');
  
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
      <nav className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 via-blue-600 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-lg">🇮🇶</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-red-500 bg-clip-text text-transparent">
                  IraqEvents
                </span>
                <div className="text-xs text-gray-500 font-medium -mt-1">{t('navigation.eventPlatform')}</div>
              </div>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors relative group">
                {t('navigation.home')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors relative group">
                {t('navigation.events')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-purple-600 font-medium transition-colors relative group">
                {t('navigation.categories')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors relative group">
                {t('navigation.about')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            
            {/* User Menu */}
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Language Switcher */}
              <div className="relative group hidden sm:block" data-testid="language-switcher">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors rounded-full hover:bg-gray-50">
                  <span className="text-lg">🌐</span>
                  <span className="text-sm">
                    {language === 'en' ? 'EN' : language === 'ar' ? 'العربية' : 'کوردی'}
                  </span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50`}>
                  <button 
                    onClick={() => setLanguage('en' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors ${
                      language === 'en' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    🇺🇸 English
                  </button>
                  <button 
                    onClick={() => setLanguage('ar' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors ${
                      language === 'ar' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    🇮🇶 العربية
                  </button>
                  <button 
                    onClick={() => setLanguage('ku' as any)}
                    className={`w-full px-4 py-2 text-left transition-colors rounded-b-lg ${
                      language === 'ku' ? 'bg-purple-100 text-purple-700' : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    🏴 کوردی
                  </button>
                </div>
              </div>
              
{/* Create Event Link styled as text pill (not a button) */}
              <Link 
                href={session ? "/dashboard" : "/register"}
                className="inline-block px-4 py-1.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
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
                    href="/dashboard" 
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
                    href="/login" 
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
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md">
              <div className="flex flex-col gap-4">
                <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.home')}
                </Link>
                <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.events')}
                </Link>
                <Link href="/categories" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.categories')}
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                  {t('navigation.about')}
                </Link>
                {!session && (
                  <div className="flex gap-3 pt-2">
                    <Link href="/login" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
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
                    <button 
                      onClick={() => setLanguage('ar' as any)}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        language === 'ar' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🇮🇶 AR
                    </button>
                    <button 
                      onClick={() => setLanguage('ku' as any)}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        language === 'ku' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      🏴 KU
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
