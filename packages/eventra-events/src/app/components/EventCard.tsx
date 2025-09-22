"use client";

import Link from "next/link";
import { useState } from "react";
import EventImage from "./EventImage";
import ResponsiveButton from "./ResponsiveButton";
import { useLanguage } from "./LanguageProvider";
import { useTranslations } from "../hooks/useTranslations";

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

interface EventCardProps {
  event: Event;
  onViewDetails?: (event: Event, e: React.MouseEvent) => void;
  showQuickPreview?: boolean;
  className?: string;
}

const getCategoryIcon = (categoryName: string) => {
  const icons: { [key: string]: string } = {
    "Music & Concerts": "🎵",
    "Sports & Fitness": "⚽",
    "Food & Drink": "🍽️",
    "Business": "💼",
    "Technology & Innovation": "💻",
    "Arts & Culture": "🎨",
    "Health & Wellness": "🏥",
    "Community & Social": "👥",
    "Technology": "💻",
    "Music": "🎵",
    "Art": "🎨",
    "Sports": "⚽",
    "Food": "🍽️",
    "Health": "🏥",
    "Community": "👥",
  };
  return icons[categoryName] || "🎉";
};

const getEventImageCategory = (category: string) => {
  const mapping: { [key: string]: string } = {
    "Music & Concerts": "music",
    "Sports & Fitness": "sports",
    "Food & Drink": "food",
    "Business": "business",
    "Technology & Innovation": "tech",
    "Arts & Culture": "art",
    "Health & Wellness": "health",
    "Community & Social": "community",
    "Technology": "tech",
    "Music": "music",
    "Art": "art",
    "Sports": "sports",
    "Food": "food",
    "Health": "health",
    "Community": "community",
  };
  return mapping[category] || "community";
};

export default function EventCard({ 
  event, 
  onViewDetails, 
  showQuickPreview = true, 
  className = "" 
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ckb-IQ' : 'en-US';
    
    // Format date parts separately for better control
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    const dateStr = date.toLocaleDateString(locale, dateOptions);
    const timeStr = date.toLocaleDateString(locale, timeOptions);
    
    return { dateStr, timeStr, fullDate: date };
  };

  const { dateStr, timeStr, fullDate } = formatDate(event.date);
  const isUpcoming = fullDate > new Date();
  const isPast = fullDate < new Date();

  return (
    <div 
      className={`
        group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
        transition-all duration-500 hover:scale-105 cursor-pointer 
        border border-gray-100 hover:border-purple-200
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${language}/event/${event.publicId}`} className="block">
        <div className="relative overflow-hidden">
          {/* Event Image */}
          <div className="relative h-64 bg-gradient-to-br from-purple-100 to-blue-100">
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 animate-pulse" />
            )}
            <EventImage
              src={event.imageUrl}
              alt={event.title}
              width={400}
              height={256}
              className={`
                h-full w-full object-cover transition-all duration-500
                ${isHovered ? 'scale-110' : 'scale-100'}
                ${imageLoading ? 'opacity-0' : 'opacity-100'}
              `}
              category={getEventImageCategory(event.category || "")}
              onLoad={() => setImageLoading(false)}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Status Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* Price Badge */}
              {event.isFree || event.price === 0 ? (
                <span className="bg-green-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  {t('events.free')}
                </span>
              ) : (
                <span className="bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  ${event.price}
                </span>
              )}

              {/* Status Badge */}
              {isPast && (
                <span className="bg-gray-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {t('events.ended') || 'Ended'}
                </span>
              )}
              {isUpcoming && (
                <span className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {t('events.upcoming') || 'Upcoming'}
                </span>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                {getCategoryIcon(event.category || "")} {event.category}
              </span>
            </div>

            {/* Quick Preview Overlay */}
            {showQuickPreview && isHovered && (
              <div 
                className={`
                  absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                  flex items-end justify-center p-6 transition-all duration-300
                  ${isRTL ? 'text-right' : 'text-left'}
                `}
              >
                <div className="w-full">
                  <p className="text-white text-sm leading-relaxed line-clamp-3 mb-4">
                    {event.description}
                  </p>
                  {onViewDetails && (
                    <button
                      onClick={(e) => onViewDetails(event, e)}
                      className="
                        w-full bg-white/20 backdrop-blur-sm border border-white/30 
                        text-white py-2 px-4 rounded-lg font-medium
                        hover:bg-white/30 transition-all duration-200
                      "
                    >
                      {t('events.viewDetails')} {isRTL ? '←' : '→'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Event Content */}
          <div className="p-6">
            {/* Event Title */}
            <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
            
            {/* Event Description */}
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
              {event.description}
            </p>

            {/* Event Details */}
            <div className="space-y-3 mb-6">
              {/* Date and Time */}
              <div className={`flex items-center gap-3 text-gray-700 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">📅</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{dateStr}</div>
                  <div className="text-xs text-gray-500">{timeStr}</div>
                </div>
              </div>
              
              {/* Location */}
              <div className={`flex items-center gap-3 text-gray-700 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-sm">📍</span>
                </div>
                <span className="line-clamp-1 flex-1">{event.location}</span>
              </div>
              
              {/* Organizer */}
              {event.user && (
                <div className={`flex items-center gap-3 text-gray-600 text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-sm">👤</span>
                  </div>
                  <span className="line-clamp-1 flex-1">
                    {t('events.byOrganizer', { 
                      name: event.user.name || event.user.email.split('@')[0] 
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-4 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`text-lg font-bold ${event.isFree || event.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                {event.isFree || event.price === 0 ? t('events.free') : `$${event.price}`}
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {isPast ? (t('events.ended') || 'Ended') : (t('events.upcoming') || 'Upcoming')}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}