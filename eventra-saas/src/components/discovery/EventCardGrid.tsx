'use client';

import React, { useEffect, useRef, useState } from 'react';
import EventCard, { EventCardData } from './EventCard';
import { Loader2, AlertCircle, Calendar } from 'lucide-react';

interface EventCardGridProps {
  events: EventCardData[];
  locale?: 'en' | 'ar' | 'ku';
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  showPrice?: boolean;
  showCapacity?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

const translations = {
  noEvents: {
    en: 'No events found',
    ar: 'لم يتم العثور على فعاليات',
    ku: 'هیچ ڕووداوێک نەدۆزرایەوە'
  },
  noEventsDesc: {
    en: 'Try adjusting your filters or check back later',
    ar: 'حاول تعديل الفلاتر أو تحقق مرة أخرى لاحقاً',
    ku: 'هەوڵبدە فلتەرەکانت بگۆڕیت یان دواتر بگەڕێوە'
  },
  loading: {
    en: 'Loading events...',
    ar: 'جارٍ تحميل الفعاليات...',
    ku: 'بارکردنی ڕووداوەکان...'
  },
  loadMore: {
    en: 'Loading more...',
    ar: 'جارٍ تحميل المزيد...',
    ku: 'بارکردنی زیاتر...'
  },
  errorTitle: {
    en: 'Error loading events',
    ar: 'خطأ في تحميل الفعاليات',
    ku: 'هەڵە لە بارکردنی ڕووداوەکان'
  }
};

export default function EventCardGrid({
  events,
  locale = 'en',
  loading = false,
  error = null,
  emptyMessage,
  showPrice = true,
  showCapacity = true,
  onLoadMore,
  hasMore = false,
  variant = 'default'
}: EventCardGridProps) {
  const isRTL = locale === 'ar' || locale === 'ku';
  const observerTarget = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite scroll observer
  useEffect(() => {
    if (!onLoadMore || !hasMore || loading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          onLoadMore();
          // Reset loading state after a delay
          setTimeout(() => setIsLoadingMore(false), 1000);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [onLoadMore, hasMore, loading, isLoadingMore]);

  // Initial Loading State
  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium">{translations.loading[locale]}</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-20 px-4 bg-red-50 rounded-2xl border-2 border-red-200"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-2">
          {translations.errorTitle[locale]}
        </h3>
        <p className="text-red-700 text-center max-w-md">{error}</p>
      </div>
    );
  }

  // Empty State
  if (events.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-20 px-4"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <Calendar className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {translations.noEvents[locale]}
        </h3>
        <p className="text-gray-600 text-center max-w-md">
          {emptyMessage || translations.noEventsDesc[locale]}
        </p>
      </div>
    );
  }

  // Grid Layout
  return (
    <div className="space-y-6">
      {/* Responsive Grid */}
      <div 
        className={`
          grid gap-6
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4
          ${variant === 'compact' ? '2xl:grid-cols-5' : ''}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            locale={locale}
            variant={variant}
            showPrice={showPrice}
            showCapacity={showCapacity}
          />
        ))}
      </div>

      {/* Load More Trigger (Infinite Scroll) */}
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center gap-3 text-primary-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-medium">{translations.loadMore[locale]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
