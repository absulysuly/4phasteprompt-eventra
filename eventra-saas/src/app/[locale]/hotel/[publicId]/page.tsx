"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLanguage } from "../../../components/LanguageProvider";
import { useTranslations } from "../../../hooks/useTranslations";

interface Hotel {
  id: string;
  publicId: string;
  name: string;
  description?: string;
  city?: string;
  address?: string;
  imageUrl?: string;
  priceLevel?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  category?: string;
}

export default function HotelPage({ params }: { params: Promise<{ locale: string; publicId: string }> }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [locale, setLocale] = useState('en');
  const { isRTL, setLanguage } = useLanguage();
  const { t } = useTranslations();

  useEffect(() => {
    (async () => {
      const p = await params; setLocale(p.locale); if (["en","ar","ku"].includes(p.locale)) setLanguage(p.locale as any);
      try {
        const res = await fetch(`/data/hotels.json`, { cache: 'no-store' });
        if (res.ok) {
          const list: Hotel[] = await res.json();
          const item = list.find(h => h.publicId === p.publicId) || null;
          setHotel(item);
        }
      } catch {}
    })();
  }, [params, setLanguage]);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-2">🏨</div>
          <p className="text-gray-600">Hotel not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/${locale}/hotels`} className={`inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.back') || 'Back'}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{hotel.name}</h1>
          <div className={`flex flex-wrap items-center gap-4 text-white/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-red-400">📍</span>
              <span>{hotel.address || hotel.city}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-yellow-400">💵</span>
              <span>{hotel.priceLevel || '$$'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-64 bg-gray-100">
            <img src={hotel.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=630&fit=crop&crop=center&auto=format&q=80'} alt={hotel.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('events.aboutEvent') || 'About'}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{hotel.description || 'No description provided yet.'}</p>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {hotel.phone && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="font-semibold mb-1">Phone</div>
                  <a href={`tel:${hotel.phone}`} className="text-blue-600">{hotel.phone}</a>
                </div>
              )}
              {hotel.whatsapp && (
                <div className="p-4 rounded-lg bg-green-50">
                  <div className="font-semibold mb-1">WhatsApp</div>
                  <a href={`https://wa.me/${hotel.whatsapp.replace(/\D/g,'')}`} target="_blank" className="text-green-700">Message on WhatsApp</a>
                </div>
              )}
              {hotel.website && (
                <div className="p-4 rounded-lg bg-blue-50">
                  <div className="font-semibold mb-1">Website</div>
                  <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-700">Visit site</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}