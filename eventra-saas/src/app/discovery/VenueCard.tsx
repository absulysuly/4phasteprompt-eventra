"use client";

import React, { useState } from 'react';
import EventImage from '../components/EventImage';

interface Venue {
  id: string;
  publicId: string;
  type: string;
  title: string;
  description: string;
  location: string;
  city: string;
  category: string;
  priceRange: string;
  imageUrl?: string;
  eventDate?: string;
  featured: boolean;
  verified: boolean;
}

interface VenueCardProps {
  venue: Venue;
  onSelect: (venue: Venue) => void;
  language: string;
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    'EVENT': '🎪',
    'HOTEL': '🏨', 
    'RESTAURANT': '🍽️',
    'ACTIVITY': '🎯',
    'SERVICE': '⚙️'
  };
  return icons[type] || '🏛️';
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'EVENT': 'from-purple-500 to-pink-500',
    'HOTEL': 'from-blue-500 to-cyan-500',
    'RESTAURANT': 'from-orange-500 to-red-500', 
    'ACTIVITY': 'from-green-500 to-emerald-500',
    'SERVICE': 'from-gray-500 to-gray-600'
  };
  return colors[type] || 'from-amber-500 to-orange-500';
};

const formatDate = (dateString: string, language: string = 'en') => {
  const date = new Date(dateString);
  const locale = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ckb-IQ' : 'en-US';
  return date.toLocaleDateString(locale, { 
    day: 'numeric',
    month: 'short'
  });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export default function VenueCard({ venue, onSelect, language }: VenueCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareData = {
      title: venue.title,
      text: venue.description,
      url: `${window.location.origin}/discovery?venue=${venue.publicId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        // Could show toast notification here
        console.log('URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const isEvent = venue.type === 'EVENT';
  const hasEventDate = venue.eventDate && new Date(venue.eventDate) > new Date();

  return (
    <div 
      className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 cursor-pointer border border-gray-700/50 hover:border-amber-500/30"
      onClick={() => onSelect(venue)}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
      
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <EventImage
          src={venue.imageUrl}
          alt={venue.title}
          width={400}
          height={200}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          category={venue.type.toLowerCase()}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Loading placeholder */}
        {!isImageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse flex items-center justify-center">
            <span className="text-4xl opacity-50">{getTypeIcon(venue.type)}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Featured Badge */}
        {venue.featured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
            ⭐ FEATURED
          </div>
        )}

        {/* Verified Badge */}
        {venue.verified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* LIVE Indicator for Events */}
        {isEvent && hasEventDate && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE EVENT
          </div>
        )}

        {/* Date Badge for Events */}
        {isEvent && venue.eventDate && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm">
            <div className="text-center">
              <div className="font-bold">{formatDate(venue.eventDate, language)}</div>
              <div className="text-xs opacity-90">{formatTime(venue.eventDate)}</div>
            </div>
          </div>
        )}

        {/* Type Badge */}
        <div className={`absolute top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${getTypeColor(venue.type)} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm`}>
          <span className="mr-1">{getTypeIcon(venue.type)}</span>
          {venue.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative">
        {/* Title */}
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-amber-300 transition-colors">
          {venue.title}
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
          {venue.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <span>📍</span>
          <span className="truncate">{venue.location}</span>
          <span className="text-amber-400">•</span>
          <span className="text-amber-400 font-medium">{venue.city}</span>
        </div>

        {/* Price Range */}
        {venue.priceRange && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400">💰</span>
            <span className="text-green-400 font-semibold text-sm bg-green-900/20 px-2 py-1 rounded-full">
              {venue.priceRange}
            </span>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors group/share text-sm"
          >
            <svg className="w-4 h-4 group-hover/share:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
            </svg>
            Share
          </button>

          {/* View Details Button */}
          <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25">
            View Details →
          </button>
        </div>
      </div>

      {/* Hover Border Animation */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-amber-500/20 transition-all duration-500"></div>
    </div>
  );
}