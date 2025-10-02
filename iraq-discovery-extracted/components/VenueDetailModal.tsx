import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getVenueDetails } from '../api/GeminiController';

// --- Interfaces ---
type VenueType = 'EVENT' | 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE';

interface VenueDetail {
  id: string;
  publicId: string;
  type: VenueType;
  imageUrl: string;
  galleryUrls: string[];
  title: string;
  description: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  whatsappPhone?: string;
  website?: string;
  eventDate?: string;
  amenities?: string[];
}

interface VenueDetailModalProps {
  isOpen: boolean;
  venueId: string | null;
  onClose: () => void;
  locale: 'en' | 'ar' | 'ku';
}

// --- Helper: Image Carousel ---
const ImageCarousel: React.FC<{ images: string[], title: string }> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      prevSlide();
    }
  };

  const nextSlide = () => setCurrentIndex(prev => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex(prev => (prev - 1 + images.length) % images.length);

  return (
    <div 
      className="relative w-full h-64 md:h-80 bg-gray-700 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt={`${title} gallery image ${index + 1}`}
          className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
          style={{ opacity: index === currentIndex ? 1 : 0 }}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
      {images.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 z-10">
            &#10094;
          </button>
          <button onClick={nextSlide} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 z-10">
            &#10095;
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};


// --- Main Component ---
const VenueDetailModal: React.FC<VenueDetailModalProps> = ({ isOpen, venueId, onClose, locale }) => {
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!venueId) return;
      setLoading(true);
      setVenue(null);
      const details = await getVenueDetails(venueId, locale);
      setVenue(details);
      setLoading(false);
    };
    if (isOpen) {
      fetchDetails();
    }
  }, [isOpen, venueId, locale]);

  // Handle closing modal
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleClose]);
  
  // Focus trapping
  useEffect(() => {
    if (isOpen && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        firstElement?.focus();
        modalRef.current.addEventListener('keydown', handleTabKey);

        return () => {
          modalRef.current?.removeEventListener('keydown', handleTabKey);
        }
    }
  }, [isOpen, venue]);


  if (!isOpen) {
    return null;
  }

  const images = venue?.galleryUrls?.length ? [venue.imageUrl, ...venue.galleryUrls] : [venue?.imageUrl || ''];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="venue-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-gray-800 text-white w-full h-full md:max-w-2xl md:max-h-[90vh] md:rounded-lg shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-700">
          <button onClick={handleClose} className="text-2xl hover:text-pink-400">&times;</button>
          <h2 id="venue-title" className="sr-only">{venue?.title || 'Venue Details'}</h2>
          <div className="flex items-center gap-4">
             {/* Share/Save buttons can be implemented here */}
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {loading && <div className="p-8 text-center">Loading details...</div>}
          {!loading && !venue && <div className="p-8 text-center">Could not find venue details.</div>}
          {venue && (
            <>
              <ImageCarousel images={images} title={venue.title} />
              <div className="p-4 md:p-6 space-y-4">
                 <h3 className="text-2xl font-bold text-pink-400">{venue.title}</h3>
                 
                 {/* Location Section */}
                 <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-300 mb-1">📍 Location</h4>
                    <p>{venue.location}, {venue.city}</p>
                    {/* Map Link */}
                 </div>

                 {/* Date & Time (for events) */}
                 {venue.type === 'EVENT' && venue.eventDate && (
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-semibold text-gray-300 mb-1">📅 Date & Time</h4>
                        <p>{new Date(venue.eventDate).toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' })}</p>
                    </div>
                 )}

                 {/* Price Range */}
                 {venue.priceRange && (
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-semibold text-gray-300 mb-1">💰 Price Range</h4>
                        <p>{venue.priceRange}</p>
                    </div>
                 )}

                 {/* Description */}
                 <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-300 mb-1">📝 Description</h4>
                    <p className="text-gray-400 whitespace-pre-wrap">{venue.description}</p>
                 </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {venue && (
            <footer className="flex-shrink-0 flex items-center justify-around p-3 border-t border-gray-700 bg-gray-900/50">
                {/* Action buttons like WhatsApp, Website, etc. */}
            </footer>
        )}
      </div>
    </div>
  );
};

export default VenueDetailModal;