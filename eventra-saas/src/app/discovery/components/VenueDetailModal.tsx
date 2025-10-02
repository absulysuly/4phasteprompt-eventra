import React, { useState, useEffect, useRef } from 'react';
import { getVenueDetails } from '../api/events';

interface VenueDetailModalProps {
  isOpen: boolean;
  venueId: string | null;
  onClose: () => void;
  locale: 'en' | 'ar' | 'ku';
}

// Image Carousel Component
const ImageCarousel: React.FC<{ images: string[], title: string }> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [images.length]);
  
  return (
    <div className="relative w-full h-80 bg-gray-900 overflow-hidden group">
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`${title} - Image ${index + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
          loading={index === 0 ? 'eager' : 'lazy'}
        />
      ))}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      
      {images.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-amber-500' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Counter */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

const VenueDetailModal: React.FC<VenueDetailModalProps> = ({ isOpen, venueId, onClose, locale }) => {
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && venueId) {
      const fetchVenueDetails = async () => {
        setLoading(true);
        try {
          const data = await getVenueDetails(venueId, locale);
          setVenue(data);
        } catch (error) {
          console.error('Error fetching venue details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchVenueDetails();
    } else {
      setVenue(null);
    }
  }, [isOpen, venueId, locale]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl border-2 border-amber-500/30">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-700/50 backdrop-blur-sm bg-gray-900/50">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              {loading ? 'Loading...' : venue?.title || 'Venue Details'}
            </h2>
            {venue?.city && (
              <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                <span className="text-amber-500">📍</span> {venue.city}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 text-gray-400 hover:text-white rounded-xl hover:bg-red-500/20 hover:border-red-500 border-2 border-gray-700 transition-all duration-200 group"
          >
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : venue ? (
            <>
              {/* Image Carousel */}
              {venue.imageUrl && (
                <ImageCarousel 
                  images={venue.galleryUrls && venue.galleryUrls.length > 0 
                    ? [venue.imageUrl, ...venue.galleryUrls] 
                    : [venue.imageUrl]
                  } 
                  title={venue.title} 
                />
              )}
              
              <div className="p-6 space-y-6">
                {/* Description */}
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📝</span>
                    <h3 className="text-xl font-bold text-amber-400">Description</h3>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{venue.description}</p>
                </div>

                {/* Location */}
                {venue.location && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📍</span>
                      <h3 className="text-xl font-bold text-amber-400">Location</h3>
                    </div>
                    <p className="text-gray-300 font-medium">{venue.location}</p>
                    {venue.city && <p className="text-gray-400 text-sm mt-1">{venue.city}</p>}
                    
                    {/* Map Button */}
                    <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      View on Map
                    </button>
                  </div>
                )}

                {/* Event Date */}
                {venue.eventDate && (
                  <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-5 border border-purple-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📅</span>
                      <h3 className="text-xl font-bold text-purple-300">Date & Time</h3>
                    </div>
                    <p className="text-white font-semibold text-lg">
                      {new Date(venue.eventDate).toLocaleString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-purple-200 mt-1">
                      🕐 {new Date(venue.eventDate).toLocaleTimeString(locale, {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                )}

                {/* Price Range */}
                {venue.priceRange && (
                  <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl p-5 border border-green-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">💰</span>
                      <h3 className="text-xl font-bold text-green-300">Price Range</h3>
                    </div>
                    <p className="text-white font-bold text-2xl">{venue.priceRange}</p>
                  </div>
                )}

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">✨</span>
                      <h3 className="text-xl font-bold text-amber-400">Amenities</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-lg text-sm font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {venue.whatsappPhone && (
                    <a
                      href={`https://wa.me/${venue.whatsappPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                  
                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/50 transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-xl font-semibold text-white mb-2">Venue Not Found</h3>
              <p className="text-gray-400">The venue details could not be loaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueDetailModal;