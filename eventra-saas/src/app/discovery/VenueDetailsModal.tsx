"use client";

import React, { useState, useEffect } from 'react';
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
  galleryUrls?: string[];
  eventDate?: string;
  amenities?: string[];
  features?: string[];
  whatsappPhone?: string;
  website?: string;
  bookingUrl?: string;
  featured: boolean;
  verified: boolean;
}

interface VenueDetailsModalProps {
  venue: Venue;
  onClose: () => void;
  language: string;
  isRTL: boolean;
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

const formatDateTime = (dateString: string, language: string = 'en') => {
  const date = new Date(dateString);
  const locale = language === 'ar' ? 'ar-IQ' : language === 'ku' ? 'ckb-IQ' : 'en-US';
  return {
    date: date.toLocaleDateString(locale, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

export default function VenueDetailsModal({ venue, onClose, language, isRTL }: VenueDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Create image gallery array
  const images = [
    venue.imageUrl,
    ...(venue.galleryUrls || [])
  ].filter(Boolean) as string[];

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    setAutoPlay(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setAutoPlay(false);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setAutoPlay(false);
  };

  const handleShare = async () => {
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
        console.log('URL copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const openWhatsApp = () => {
    if (venue.whatsappPhone) {
      const message = encodeURIComponent(`Hi! I'm interested in ${venue.title}`);
      window.open(`https://wa.me/${venue.whatsappPhone}?text=${message}`, '_blank');
    }
  };

  const openWebsite = () => {
    if (venue.website) {
      window.open(venue.website, '_blank');
    }
  };

  const openBooking = () => {
    if (venue.bookingUrl) {
      window.open(venue.bookingUrl, '_blank');
    }
  };

  const dateTime = venue.eventDate ? formatDateTime(venue.eventDate, language) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50 animate-slide-in ${
          isRTL ? 'rtl' : 'ltr'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-all transform hover:scale-110 hover:rotate-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image Gallery */}
          <div className="lg:w-1/2 relative">
            {images.length > 0 ? (
              <div className="relative h-64 lg:h-full group">
                <EventImage
                  src={images[currentImageIndex]}
                  alt={venue.title}
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  category={venue.type.toLowerCase()}
                  onLoad={() => setIsImageLoaded(true)}
                />

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Dot Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index 
                            ? 'bg-amber-400 scale-125' 
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {venue.featured && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      ⭐ FEATURED
                    </div>
                  )}
                  
                  {venue.verified && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      VERIFIED
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 lg:h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
                <span className="text-6xl opacity-50">{getTypeIcon(venue.type)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getTypeIcon(venue.type)}</span>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {venue.type}
                </span>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                {venue.title}
              </h2>
              
              <div className="flex items-center gap-2 text-amber-400 font-medium">
                <span>📍</span>
                <span>{venue.location}</span>
                <span>•</span>
                <span>{venue.city}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📋</span>
                <h3 className="text-lg font-semibold text-white">Description</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {venue.description}
              </p>
            </div>

            {/* Event Date (for events) */}
            {dateTime && (
              <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <h3 className="text-lg font-semibold text-purple-300">Event Date & Time</h3>
                </div>
                <div className="text-purple-200">
                  <div className="font-semibold">{dateTime.date}</div>
                  <div className="text-sm opacity-90">{dateTime.time}</div>
                </div>
              </div>
            )}

            {/* Price Range */}
            {venue.priceRange && (
              <div className="mb-6 bg-gradient-to-r from-green-900/30 to-emerald-800/30 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💰</span>
                  <h3 className="text-lg font-semibold text-green-300">Price Range</h3>
                </div>
                <div className="text-green-200 font-semibold">
                  {venue.priceRange}
                </div>
              </div>
            )}

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✨</span>
                  <h3 className="text-lg font-semibold text-white">Amenities</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/20"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-700/50">
              {venue.whatsappPhone && (
                <button
                  onClick={openWhatsApp}
                  className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>📱</span>
                  WhatsApp
                </button>
              )}
              
              {venue.website && (
                <button
                  onClick={openWebsite}
                  className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🌐</span>
                  Website
                </button>
              )}
              
              {venue.bookingUrl && (
                <button
                  onClick={openBooking}
                  className="flex-1 min-w-[120px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🎫</span>
                  Book Now
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}