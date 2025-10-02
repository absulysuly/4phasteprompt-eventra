import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

export interface EventCardData {
  id: string;
  title: string;
  titleAr?: string;
  titleKu?: string;
  slug: string;
  category: 'WEDDING' | 'CONFERENCE' | 'CONCERT' | 'EXHIBITION' | 'SPORT' | 'SOCIAL';
  imageUrl: string;
  venue: {
    name: string;
    nameAr?: string;
    nameKu?: string;
    governorate: string;
  };
  date: string; // ISO date string
  startTime?: string;
  endTime?: string;
  capacity?: number;
  currentAttendees?: number;
  priceFrom?: number;
  isFeatured?: boolean;
  isNew?: boolean;
}

interface EventCardProps {
  event: EventCardData;
  locale?: 'en' | 'ar' | 'ku';
  variant?: 'default' | 'compact' | 'featured';
  showPrice?: boolean;
  showCapacity?: boolean;
}

const categoryConfig = {
  WEDDING: {
    label: { en: 'Wedding', ar: 'حفل زفاف', ku: 'ئاهەنگی زەماوەند' },
    gradient: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    icon: '💍'
  },
  CONFERENCE: {
    label: { en: 'Conference', ar: 'مؤتمر', ku: 'کۆنفرانس' },
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '🎤'
  },
  CONCERT: {
    label: { en: 'Concert', ar: 'حفل موسيقي', ku: 'کۆنسێرت' },
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: '🎵'
  },
  EXHIBITION: {
    label: { en: 'Exhibition', ar: 'معرض', ku: 'پێشانگە' },
    gradient: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '🎨'
  },
  SPORT: {
    label: { en: 'Sport', ar: 'رياضة', ku: 'وەرزش' },
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: '⚽'
  },
  SOCIAL: {
    label: { en: 'Social', ar: 'اجتماعي', ku: 'کۆمەڵایەتی' },
    gradient: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: '🎉'
  }
};

const translations = {
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل', ku: 'بینینی وردەکاری' },
  bookNow: { en: 'Book Now', ar: 'احجز الآن', ku: 'ئێستا بکە بە نرخ' },
  spotsLeft: { en: 'spots left', ar: 'مقعد متبقي', ku: 'شوێن ماوە' },
  from: { en: 'From', ar: 'من', ku: 'لە' },
  iqd: { en: 'IQD', ar: 'د.ع', ku: 'د.ع' },
  new: { en: 'NEW', ar: 'جديد', ku: 'نوێ' },
  featured: { en: 'FEATURED', ar: 'مميز', ku: 'تایبەت' }
};

export default function EventCard({
  event,
  locale = 'en',
  variant = 'default',
  showPrice = true,
  showCapacity = true
}: EventCardProps) {
  const isRTL = locale === 'ar' || locale === 'ku';
  const categoryInfo = categoryConfig[event.category];
  
  // Get localized text
  const title = locale === 'ar' ? (event.titleAr || event.title) 
                : locale === 'ku' ? (event.titleKu || event.title)
                : event.title;
  
  const venueName = locale === 'ar' ? (event.venue.nameAr || event.venue.name)
                    : locale === 'ku' ? (event.venue.nameKu || event.venue.name)
                    : event.venue.name;

  // Format date
  const eventDate = new Date(event.date);
  const dateOptions: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  const formattedDate = eventDate.toLocaleDateString(
    locale === 'ar' ? 'ar-IQ' : locale === 'ku' ? 'en-US' : 'en-US',
    dateOptions
  );

  // Calculate spots left
  const spotsLeft = event.capacity && event.currentAttendees 
    ? event.capacity - event.currentAttendees 
    : null;
  const isAlmostFull = spotsLeft && spotsLeft < 20;

  const cardClasses = `
    group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl 
    transition-all duration-300 ease-out hover:-translate-y-2
    border border-gray-100 hover:border-primary-200
    ${variant === 'featured' ? 'ring-2 ring-primary-400 ring-offset-2' : ''}
  `;

  return (
    <div className={cardClasses} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Image Container */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100">
        <Image
          src={event.imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Category Badge */}
        <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
          <div className={`
            ${categoryInfo.bgColor} ${categoryInfo.textColor}
            px-3 py-1.5 rounded-full text-xs font-semibold
            backdrop-blur-sm bg-opacity-95 shadow-lg
            flex items-center gap-1.5
          `}>
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label[locale]}</span>
          </div>
        </div>

        {/* Featured/New Badge */}
        {(event.isFeatured || event.isNew) && (
          <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
            <div className={`
              ${event.isFeatured ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}
              text-white px-3 py-1.5 rounded-full text-xs font-bold
              shadow-lg animate-pulse
            `}>
              {event.isFeatured ? translations.featured[locale] : translations.new[locale]}
            </div>
          </div>
        )}

        {/* Capacity Warning (Almost Full) */}
        {isAlmostFull && showCapacity && (
          <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} z-10`}>
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{spotsLeft} {translations.spotsLeft[locale]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
          <Link href={`/events/${event.slug}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Venue */}
        <div className={`flex items-start gap-2 text-gray-600 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 text-primary-500 ${isRTL ? 'ml-1' : 'mr-1'}`} />
          <span className="text-sm font-medium line-clamp-1">{venueName}</span>
        </div>

        {/* Date & Time */}
        <div className={`flex items-center gap-4 text-gray-600 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-4 h-4 text-primary-500" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          
          {event.startTime && (
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Clock className="w-4 h-4 text-primary-500" />
              <span className="text-sm">{event.startTime}</span>
            </div>
          )}
        </div>

        {/* Price & CTA Row */}
        <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Price */}
          {showPrice && event.priceFrom && (
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-gray-500">{translations.from[locale]}</span>
              <span className="text-lg font-bold text-primary-600">
                {event.priceFrom.toLocaleString()} {translations.iqd[locale]}
              </span>
            </div>
          )}

          {/* CTA Button */}
          <Link
            href={`/events/${event.slug}`}
            className={`
              ${showPrice && event.priceFrom ? '' : 'w-full'}
              px-5 py-2.5 rounded-xl font-semibold text-sm
              bg-gradient-to-r ${categoryInfo.gradient}
              text-white shadow-md hover:shadow-xl
              transform transition-all duration-300 hover:scale-105
              flex items-center justify-center gap-2
              ${isRTL ? 'flex-row-reverse' : ''}
            `}
          >
            <span>{event.priceFrom ? translations.bookNow[locale] : translations.viewDetails[locale]}</span>
            <svg 
              className={`w-4 h-4 transition-transform group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
