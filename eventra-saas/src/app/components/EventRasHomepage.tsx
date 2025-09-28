"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { useTranslations } from '../hooks/useTranslations';

interface VenueCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface City {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  nameKu: string;
  image: string;
  venueCount: number;
  featured: boolean;
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export default function EventRasHomepage() {
  const { language, setLanguage, isRTL } = useLanguage();
  const { t } = useTranslations();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Language options
  const languages = [
    { code: 'ku', name: 'کوردی', flag: '🏴' },
    { code: 'ar', name: 'العربية', flag: '🇮🇶' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  // Venue categories
  const categories: VenueCategory[] = [
    { id: 'all', name: 'All', icon: '🌟', color: 'from-purple-500 to-pink-500', count: 1250 },
    { id: 'events', name: 'Events', icon: '🎉', color: 'from-blue-500 to-purple-500', count: 320 },
    { id: 'hotels', name: 'Hotels', icon: '🏨', color: 'from-green-500 to-blue-500', count: 180 },
    { id: 'cafes', name: 'Cafes', icon: '☕', color: 'from-orange-500 to-red-500', count: 420 },
    { id: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'from-red-500 to-pink-500', count: 280 },
    { id: 'tourism', name: 'Tourism', icon: '🏛️', color: 'from-teal-500 to-green-500', count: 150 }
  ];

  // Iraqi and Kurdistan cities
  const cities: City[] = [
    { 
      id: 'baghdad', 
      name: 'Baghdad', 
      nameEn: 'Baghdad', 
      nameAr: 'بغداد', 
      nameKu: 'بەغدا', 
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      venueCount: 420,
      featured: true 
    },
    { 
      id: 'erbil', 
      name: 'Erbil', 
      nameEn: 'Erbil', 
      nameAr: 'أربيل', 
      nameKu: 'هەولێر', 
      image: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=800&h=600&fit=crop',
      venueCount: 280,
      featured: true 
    },
    { 
      id: 'basra', 
      name: 'Basra', 
      nameEn: 'Basra', 
      nameAr: 'البصرة', 
      nameKu: 'بەسرە', 
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d60d2b?w=800&h=600&fit=crop',
      venueCount: 190,
      featured: true 
    },
    { 
      id: 'sulaymaniyah', 
      name: 'Sulaymaniyah', 
      nameEn: 'Sulaymaniyah', 
      nameAr: 'السليمانية', 
      nameKu: 'سلێمانی', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      venueCount: 150,
      featured: false 
    },
    { 
      id: 'mosul', 
      name: 'Mosul', 
      nameEn: 'Mosul', 
      nameAr: 'الموصل', 
      nameKu: 'موسڵ', 
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
      venueCount: 120,
      featured: false 
    },
    { 
      id: 'duhok', 
      name: 'Duhok', 
      nameEn: 'Duhok', 
      nameAr: 'دهوك', 
      nameKu: 'دهۆک', 
      image: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=600&fit=crop',
      venueCount: 90,
      featured: false 
    }
  ];

  // Sponsor data
  const sponsors: Sponsor[] = [
    { id: '1', name: 'Kurdistan Bank', logo: '🏦', website: '#', tier: 'platinum' },
    { id: '2', name: 'Zain Iraq', logo: '📱', website: '#', tier: 'platinum' },
    { id: '3', name: 'Iraqi Airways', logo: '✈️', website: '#', tier: 'gold' },
    { id: '4', name: 'Pepsi Iraq', logo: '🥤', website: '#', tier: 'gold' },
    { id: '5', name: 'Local Business', logo: '🏪', website: '#', tier: 'silver' },
    { id: '6', name: 'Tech Company', logo: '💻', website: '#', tier: 'silver' },
    { id: '7', name: 'Restaurant Chain', logo: '🍔', website: '#', tier: 'bronze' },
    { id: '8', name: 'Coffee Brand', logo: '☕', website: '#', tier: 'bronze' }
  ];

  const getCityName = (city: City) => {
    switch (language) {
      case 'ar': return city.nameAr;
      case 'ku': return city.nameKu;
      default: return city.nameEn;
    }
  };

  const getSponsorSize = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'w-32 h-20';
      case 'gold': return 'w-28 h-16';
      case 'silver': return 'w-24 h-14';
      default: return 'w-20 h-12';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header with Language Switcher */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">ER</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EventRas SAS
                </h1>
                <p className="text-sm text-gray-600">Discover • Connect • Experience</p>
              </div>
            </div>

            {/* Language Switcher Row */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 ${
                    language === lang.code
                      ? 'bg-white text-blue-600 shadow-md font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {language === 'ar' ? 'اكتشف العراق وكردستان' : 
             language === 'ku' ? 'عێراق و کوردستان دۆزینەوە' :
             'Discover Iraq & Kurdistan'}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {language === 'ar' ? 'منصة شاملة للفعاليات والفنادق والمقاهي والمطاعم والسياحة' :
             language === 'ku' ? 'پلاتفۆرمێکی گشتگیر بۆ چالاکی، ئۆتێل، قاوەخانە، چێشتخانە و گەشتیاری' :
             'Your comprehensive platform for events, hotels, cafes, restaurants, and tourism'}
          </p>

          {/* Category Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:shadow-lg hover:scale-105'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="text-lg">{category.name}</div>
                  <div className="text-sm opacity-80">{category.count}+</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">
            {language === 'ar' ? 'استكشف المدن' :
             language === 'ku' ? 'شارەکان بگەڕێ' :
             'Explore Cities'}
          </h3>
          <p className="text-lg text-gray-600 text-center mb-12">
            {language === 'ar' ? 'اختر مدينتك واكتشف أفضل الأماكن' :
             language === 'ku' ? 'شارەکەت هەڵبژێرە و باشترین شوێنەکان دۆزینەوە' :
             'Choose your city and discover the best places'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city) => (
              <div
                key={city.id}
                className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                  city.featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
                onClick={() => setSelectedCity(city.id)}
              >
                {/* City Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                  <img
                    src={city.image}
                    alt={getCityName(city)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {city.featured && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>

                {/* City Info */}
                <div className="p-6">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {getCityName(city)}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold">
                      {city.venueCount}+ Venues
                    </span>
                    <div className="flex gap-2">
                      {categories.slice(1).map((category) => (
                        <span key={category.id} className="text-lg">
                          {category.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-purple-600">🎉</div>
                      <div className="text-sm text-gray-600">Events</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-600">🏨</div>
                      <div className="text-sm text-gray-600">Hotels</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-orange-600">☕</div>
                      <div className="text-sm text-gray-600">Cafes</div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            {language === 'ar' ? 'التنقل السريع' :
             language === 'ku' ? 'خێرا بگەڕێ' :
             'Quick Navigation'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.slice(1).map((category) => (
              <Link
                key={category.id}
                href={`/${category.id}`}
                className={`group p-6 bg-gradient-to-br ${category.color} rounded-2xl text-white text-center hover:scale-105 transition-all duration-300 shadow-lg`}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <div className="font-semibold text-lg">{category.name}</div>
                <div className="text-sm opacity-90 mt-1">{category.count}+</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">
            {language === 'ar' ? 'شركاؤنا' :
             language === 'ku' ? 'هاوبەشەکانمان' :
             'Our Partners'}
          </h3>
          <p className="text-gray-600 text-center mb-12">
            {language === 'ar' ? 'نفتخر بشراكتنا مع هذه الشركات الرائدة' :
             language === 'ku' ? 'شانازی بە هاوبەشی لەگەڵ ئەم کۆمپانیا سەرەکیانە دەکەین' :
             'Proud to partner with these leading organizations'}
          </p>

          {/* Sponsor Tiers */}
          <div className="space-y-8">
            {/* Platinum Sponsors */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Platinum Partners</h4>
              <div className="flex justify-center items-center gap-8 flex-wrap">
                {sponsors.filter(s => s.tier === 'platinum').map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`${getSponsorSize(sponsor.tier)} bg-white rounded-lg shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{sponsor.logo}</div>
                      <div className="text-sm font-semibold text-gray-700">{sponsor.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold Sponsors */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-600 mb-4">Gold Partners</h4>
              <div className="flex justify-center items-center gap-6 flex-wrap">
                {sponsors.filter(s => s.tier === 'gold').map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`${getSponsorSize(sponsor.tier)} bg-white rounded-lg shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-300 cursor-pointer`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">{sponsor.logo}</div>
                      <div className="text-xs font-medium text-gray-600">{sponsor.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Silver & Bronze */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-500 mb-4">Supporting Partners</h4>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                {sponsors.filter(s => s.tier === 'silver' || s.tier === 'bronze').map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className={`${getSponsorSize(sponsor.tier)} bg-white rounded-lg shadow-sm flex items-center justify-center hover:shadow-md transition-all duration-300 cursor-pointer`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{sponsor.logo}</div>
                      <div className="text-xs text-gray-500">{sponsor.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sponsor CTA */}
          <div className="text-center mt-12">
            <Link
              href="/sponsor"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
            >
              <span>🤝</span>
              {language === 'ar' ? 'انضم كشريك' :
               language === 'ku' ? 'وەکو هاوبەش پەیوەندی بکە' :
               'Become a Partner'}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">ER</span>
              </div>
              <h3 className="text-2xl font-bold">EventRas SAS</h3>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {language === 'ar' ? 'منصتكم الشاملة لاكتشاف أفضل الفعاليات والأماكن في العراق وكردستان' :
               language === 'ku' ? 'پلاتفۆرمی تەواوی ئێوە بۆ دۆزینەوەی باشترین چالاکی و شوێنەکان لە عێراق و کوردستان' :
               'Your comprehensive platform for discovering the best events and places in Iraq and Kurdistan'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/events" className="block hover:text-white transition-colors">Events</Link>
                <Link href="/hotels" className="block hover:text-white transition-colors">Hotels</Link>
                <Link href="/restaurants" className="block hover:text-white transition-colors">Restaurants</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cities</h4>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">Baghdad</div>
                <div className="hover:text-white transition-colors cursor-pointer">Erbil</div>
                <div className="hover:text-white transition-colors cursor-pointer">Basra</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <div>info@eventras.com</div>
                <div>+964 XXX XXX XXXX</div>
                <div>Iraq & Kurdistan</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              © 2024 EventRas SAS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}