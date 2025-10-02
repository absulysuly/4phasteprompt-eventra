'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const IRAQI_LANDMARKS = [
  '/images/baghdad-skyline.jpg',
  '/images/erbil-citadel.jpg',
  '/images/basra-canals.jpg',
  '/images/najaf-shrine.jpg',
];

interface Stats {
  total: number;
  byType: {
    EVENT?: number;
    HOTEL?: number;
    RESTAURANT?: number;
    ACTIVITY?: number;
  };
}

export default function HeroSection() {
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % IRAQI_LANDMARKS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/venues/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLocalizedText = () => {
    switch (locale) {
      case 'ar':
        return {
          title: 'اكتشف العراق',
          subtitle: 'الفعاليات والفنادق والمطاعم',
          cta: 'استكشف الآن',
          events: 'فعالية حية',
          hotels: 'فندق',
          restaurants: 'مطعم',
          activities: 'نشاط',
        };
      case 'ku':
        return {
          title: 'عێراق بدۆزەرەوە',
          subtitle: 'ڕووداو، هوتێل و چێشتخانە',
          cta: 'ئێستا بگەڕێ',
          events: 'ڕووداو',
          hotels: 'هوتێل',
          restaurants: 'چێشتخانە',
          activities: 'چالاکی',
        };
      default:
        return {
          title: 'Discover Iraq',
          subtitle: 'Events, Hotels & Restaurants',
          cta: 'Explore Now',
          events: 'Live Events',
          hotels: 'Hotels',
          restaurants: 'Restaurants',
          activities: 'Activities',
        };
    }
  };

  const text = getLocalizedText();

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-[200px] md:h-[280px] overflow-hidden">
        {/* Background Images with Fade Transition */}
        <div className="absolute inset-0">
          {IRAQI_LANDMARKS.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={image}
                alt="Iraqi Landmark"
                fill
                className="object-cover"
                priority={index === 0}
                quality={85}
              />
            </div>
          ))}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
          <h1 className="text-[clamp(28px,5vw,48px)] font-bold text-white mb-2 tracking-tight drop-shadow-2xl">
            {text.title}
          </h1>
          <p className="text-[clamp(16px,3vw,20px)] font-medium text-white/90 mb-6">
            {text.subtitle}
          </p>
          <Link
            href="/venues/list"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-150 hover:shadow-xl hover:-translate-y-0.5"
          >
            {text.cta} →
          </Link>
        </div>
      </div>

      {/* Live Stats Ticker */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center gap-8 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <span className="text-lg">🎉</span>
                <span>{stats?.byType?.EVENT || 0} {text.events}</span>
              </div>
              <div className="hidden md:block text-slate-300">|</div>
              <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <span className="text-lg">🏨</span>
                <span>{stats?.byType?.HOTEL || 0} {text.hotels}</span>
              </div>
              <div className="hidden md:block text-slate-300">|</div>
              <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <span className="text-lg">🍽️</span>
                <span>{stats?.byType?.RESTAURANT || 0} {text.restaurants}</span>
              </div>
              <div className="hidden md:block text-slate-300">|</div>
              <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                <span className="text-lg">🎯</span>
                <span>{stats?.byType?.ACTIVITY || 0} {text.activities}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
