"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { useLanguage } from "../../../components/LanguageProvider";
import { useTranslations } from "../../../hooks/useTranslations";
import ResponsiveButton from "../../../components/ResponsiveButton";


interface Event {
  id: string;
  publicId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category?: string;
  price?: number;
  isFree?: boolean;
  imageUrl?: string;
  user?: {
    name?: string;
    email: string;
  };
}

interface EventPageProps {
  params: Promise<{ locale: string; publicId: string }>;
}

export default function PublicEventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<string>("en");
  const [publicId, setPublicId] = useState<string>("");
  
  const { language, isRTL, setLanguage } = useLanguage();
  const { t } = useTranslations();

  // Get params and fetch event
  useEffect(() => {
    const getEventData = async () => {
      try {
        const resolvedParams = await params;
        setLocale(resolvedParams.locale);
        setPublicId(resolvedParams.publicId);
        
        // Update language context to match the URL locale
        if (['en', 'ar', 'ku'].includes(resolvedParams.locale)) {
          setLanguage(resolvedParams.locale as 'en' | 'ar' | 'ku');
        }

        const eventData = await getEvent(resolvedParams.publicId, resolvedParams.locale);
        if (!eventData) {
          notFound();
        }
        setEvent(eventData);
      } catch (error) {
        console.error('Error loading event:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    getEventData();
  }, [params, setLanguage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('homepage.loading')}</h2>
          <p className="text-gray-600">{t('events.subtitle')}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-IQ' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link 
            href={`/${locale}/events`} 
            className={`inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('common.backToEvents')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
          <div className={`flex flex-wrap items-center gap-4 text-white/90 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-yellow-400">📅</span>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-red-400">📍</span>
              <span>{event.location}</span>
            </div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-green-400">👤</span>
              <span>{t('events.byOrganizer', { name: event.user?.name || event.user?.email || t('common.anonymous') })}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Event Image */}
          {event.imageUrl ? (
            <div className="h-64 bg-gray-100 relative">
              <Image 
                src={event.imageUrl} 
                alt={event.title} 
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
                priority
              />
            </div>
          ) : (
            <div className="h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-lg opacity-80">{t('events.eventImage')}</p>
              </div>
            </div>
          )}
          
          <div className="p-8">
            {/* Map Embed (if coordinates available) */}
            {typeof (event as any).latitude === 'number' && typeof (event as any).longitude === 'number' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{t('events.location')}</h2>
                <div className="w-full h-64 rounded-xl overflow-hidden border">
                  {/* OpenStreetMap embed */}
                  {(() => {
                    const lat = (event as any).latitude as number;
                    const lon = (event as any).longitude as number;
                    const delta = 0.005;
                    const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
                    const marker = `${lat}%2C${lon}`;
                    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
                    return (
                      <iframe
                        title="map"
                        className="w-full h-full"
                        src={src}
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    );
                  })()}
                </div>
                <div className={`mt-2 flex gap-3 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${(event as any).latitude}&mlon=${(event as any).longitude}#map=16/${(event as any).latitude}/${(event as any).longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Open in OpenStreetMap
                  </a>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent((event as any).latitude + ',' + (event as any).longitude)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('events.eventDetails')}</h2>
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">📅</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="font-semibold text-gray-900">{t('events.dateTime')}</div>
                      <div className="text-gray-600">{formatDate(event.date)}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">📍</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="font-semibold text-gray-900">{t('events.location')}</div>
                      <div className="text-gray-600">{event.location}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">🏷️</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="font-semibold text-gray-900">{t('events.category')}</div>
                      <div className="text-gray-600">{event.category || t('common.general')}</div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-2xl">💰</span>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <div className="font-semibold text-gray-900">{t('events.price')}</div>
                      <div className={`font-bold ${
                        event.isFree || event.price === 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {event.isFree || event.price === 0 ? t('events.free') : `$${event.price}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('events.aboutEvent')}</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description || t('events.noDescription')}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <ResponsiveButton
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🎟️ {t('events.registerForEvent')}
                  </ResponsiveButton>
                  <ResponsiveButton
                    variant="secondary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    📱 {t('events.shareEvent')}
                  </ResponsiveButton>
                </div>
              </div>
            </div>
            
            {/* Organizer Info */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('events.organizer')}</h2>
              <div className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {event.user?.name?.charAt(0) || event.user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <div className="font-bold text-gray-900">{event.user?.name || t('events.anonymousOrganizer')}</div>
                  <div className="text-gray-600">{event.user?.email || t('events.noContactInfo')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getEvent(publicId: string, lang: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/events/public/${publicId}?lang=${lang}`, {
      cache: "no-store"
    });
    if (!res.ok) {
      console.error(`Failed to fetch event: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}