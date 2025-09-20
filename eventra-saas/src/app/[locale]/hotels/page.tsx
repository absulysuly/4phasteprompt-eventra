"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { useTranslations } from "../../hooks/useTranslations";

interface Hotel {
  id: string;
  publicId: string;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  imageUrl?: string;
  priceLevel?: string; // $, $$, $$$
  phone?: string;
  whatsapp?: string;
  website?: string;
  category?: string; // e.g., "Hotel", "Resort", "Hostel"
}

export default function HotelsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filtered, setFiltered] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [locale, setLocale] = useState("en");

  const { language, isRTL, setLanguage } = useLanguage();
  const { t } = useTranslations();

  const categories = [
    { key: 'all', name: t('common.allCategories'), icon: '🏨' },
    { key: 'hotel', name: 'Hotel', icon: '🏨' },
    { key: 'resort', name: 'Resort', icon: '🏝️' },
    { key: 'hostel', name: 'Hostel', icon: '🛌' },
    { key: 'apartment', name: 'Apartment', icon: '🏢' },
  ];

  const cities = [
    t('common.allCities'),
    t('cities.baghdad'), t('cities.basra'), t('cities.mosul'), t('cities.erbil'), t('cities.sulaymaniyah'), t('cities.duhok'), t('cities.kirkuk')
  ];

  useEffect(() => {
    (async () => {
      const p = await params; setLocale(p.locale);
      if (["en","ar","ku"].includes(p.locale)) setLanguage(p.locale as any);
    })();
  }, [params, setLanguage]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/data/hotels.json`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setHotels(Array.isArray(data) ? data : []);
          setFiltered(Array.isArray(data) ? data : []);
        } else {
          setHotels(demoHotels);
          setFiltered(demoHotels);
        }
      } catch {
        setHotels(demoHotels);
        setFiltered(demoHotels);
      } finally {
        setLoading(false);
      }
    })();
  }, [locale]);

  const demoHotels: Hotel[] = [
    { id: 'h1', publicId: 'royal-baghdad', name: 'Royal Baghdad Hotel', city: t('cities.baghdad'), address: 'Central Baghdad', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&crop=center&auto=format&q=80', category: 'Hotel', priceLevel: '$$' },
    { id: 'h2', publicId: 'erbil-resort', name: 'Erbil Hills Resort', city: t('cities.erbil'), address: 'Erbil Hills', imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764b8a?w=800&h=600&fit=crop&crop=center&auto=format&q=80', category: 'Resort', priceLevel: '$$$' },
  ];

  useEffect(() => {
    let f = hotels;
    if (search) {
      f = f.filter(h => `${h.name} ${h.city} ${h.address}`.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCity && selectedCity !== t('common.allCities')) {
      f = f.filter(h => (h.city || '').toLowerCase().includes(selectedCity.toLowerCase()));
    }
    if (selectedCategory && selectedCategory !== t('common.allCategories')) {
      f = f.filter(h => (h.category || '').toLowerCase() === selectedCategory.toLowerCase());
    }
    setFiltered(f);
  }, [hotels, search, selectedCity, selectedCategory, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('homepage.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-14">
        <div className="max-w-7xl mx-auto px-4 text-white">
          <h1 className="text-5xl font-bold mb-3">{t('navigation.hotels') || 'Hotels'}</h1>
          <p className="text-white/90">Find places to stay across Iraq</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Search + Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('events.searchPlaceholder')}
            className="px-4 py-3 rounded-lg border border-gray-300 bg-white"
          />
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-3 rounded-lg border border-gray-300 bg-white">
            {cities.map(c => (<option key={c}>{c}</option>))}
          </select>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-3 rounded-lg border border-gray-300 bg-white">
            {categories.map(c => (<option key={c.key} value={c.key}>{c.icon} {c.name}</option>))}
          </select>
          <button onClick={() => { setSearch(''); setSelectedCity(''); setSelectedCategory(''); }} className="px-4 py-3 rounded-lg bg-red-500 text-white font-semibold">{t('events.clearAllFilters')}</button>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-3">🏨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No hotels yet</h3>
            <p className="text-gray-600">Add data and we will import it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map(h => (
              <Link key={h.id} href={`/${locale}/hotel/${h.publicId}`} className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="h-56 bg-gray-100">
                  <img src={h.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop&crop=center&auto=format&q=80'} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-purple-600">{h.name}</h3>
                  <p className="text-gray-600 line-clamp-2 mb-2">{h.address || h.city}</p>
                  <div className="text-sm text-gray-500">{h.category || 'Hotel'} • {h.priceLevel || '$$'}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Categories at the bottom */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="mt-16 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.filter(c => c.key !== 'all').map(cat => (
              <button key={cat.key} onClick={() => setSelectedCategory(cat.key)} className="group w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="font-medium text-gray-900 group-hover:text-blue-600 text-sm line-clamp-2">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}