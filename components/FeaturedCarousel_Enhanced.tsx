import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Event, Language } from '../types';

interface FeaturedCarouselProps {
  events: Event[];
  lang: Language;
  onSelectEvent: (event: Event) => void;
  autoScrollInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ 
  events, 
  lang, 
  onSelectEvent,
  autoScrollInterval = 6000,
  showControls = true,
  showIndicators = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const carouselRef = useRef<HTMLDivElement>(null);

  const t = {
    viewEvent: { en: 'View Event', ar: 'عرض الفعالية', ku: 'بینینی ڕووداو' },
    nextSlide: { en: 'Next slide', ar: 'الشريحة التالية', ku: 'سلایدی داهاتوو' },
    previousSlide: { en: 'Previous slide', ar: 'الشريحة السابقة', ku: 'سلایدی پێشوو' },
    playCarousel: { en: 'Play carousel', ar: 'تشغيل العرض', ku: 'کارکردنی کارۆسێل' },
    pauseCarousel: { en: 'Pause carousel', ar: 'إيقاف العرض', ku: 'وەستاندنی کارۆسێل' },
    featuredEvents: { en: 'Featured Events', ar: 'الفعاليات المميزة', ku: 'ڕووداوە تایبەتەکان' },
    eventCount: { en: 'events', ar: 'فعالية', ku: 'ڕووداو' },
    organizerBy: { en: 'Organized by', ar: 'نظمها', ku: 'ڕێکخراو لەلایەن' }
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isPlaying || events.length <= 1) return;
    
    timeoutRef.current = setTimeout(() => {
      goToNext();
    }, autoScrollInterval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isPlaying, events.length, autoScrollInterval]);

  // Preload images
  useEffect(() => {
    events.forEach(event => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => ({ ...prev, [event.id]: true }));
      };
      img.onerror = () => {
        setImageErrors(prev => ({ ...prev, [event.id]: true }));
      };
      img.src = event.imageUrl;
    });
  }, [events]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    const nextIndex = currentIndex === events.length - 1 ? 0 : currentIndex + 1;
    goToSlide(nextIndex);
  }, [currentIndex, events.length, goToSlide]);

  const goToPrevious = useCallback(() => {
    const prevIndex = currentIndex === 0 ? events.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  }, [currentIndex, events.length, goToSlide]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          goToSlide(events.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, goToSlide, events.length]);

  if (!events || events.length === 0) {
    return (
      <div className="relative w-full h-[75vh] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {lang === 'en' ? 'No Featured Events' : lang === 'ar' ? 'لا توجد فعاليات مميزة' : 'هیچ ڕووداوی تایبەت نیە'}
          </h3>
          <p className="text-gray-500">
            {lang === 'en' ? 'Check back later for featured events.' : 
             lang === 'ar' ? 'تحقق لاحقاً من الفعاليات المميزة.' : 
             'دواتر بۆ ڕووداوە تایبەتەکان بگەڕێوە.'}
          </p>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentIndex];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(
      lang === 'ku' ? 'ku-IQ' : lang === 'ar' ? 'ar-IQ' : 'en-US', 
      options
    );
  };

  return (
    <div 
      ref={carouselRef}
      className="relative w-full h-[80vh] overflow-hidden bg-black group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      role="region"
      aria-label={t.featuredEvents[lang]}
      tabIndex={0}
    >
      {/* Background Images */}
      {events.map((event, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === (currentIndex - 1 + events.length) % events.length;
        const isNext = index === (currentIndex + 1) % events.length;
        
        return (
          <div
            key={event.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
              isActive 
                ? 'opacity-100 scale-100 z-20' 
                : isPrev 
                ? 'opacity-0 scale-110 -translate-x-full z-10'
                : isNext
                ? 'opacity-0 scale-110 translate-x-full z-10'
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            {!imageErrors[event.id] && loadedImages[event.id] ? (
              <img 
                src={event.imageUrl} 
                alt={event.title[lang]} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-3xl font-bold">{event.title[lang]}</h3>
                </div>
              </div>
            )}
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          </div>
        );
      })}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-30 flex flex-col justify-end">
        <div className="p-8 md:p-12 lg:p-16">
          <div className="max-w-4xl">
            {/* Event Metadata */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                ⭐ Featured
              </span>
              {currentEvent.isFeatured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black">
                  🏆 Top Event
                </span>
              )}
              <span className="text-gray-300 text-sm">
                {currentIndex + 1} / {events.length} {t.eventCount[lang]}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight animate-fade-in">
              {currentEvent.title[lang]}
            </h1>

            {/* Description Preview */}
            <p className="text-lg md:text-xl text-gray-200 mb-6 max-w-3xl leading-relaxed line-clamp-3">
              {currentEvent.description[lang]}
            </p>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">{formatDate(currentEvent.date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">{currentEvent.venue}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">{t.organizerBy[lang]}</p>
                  <p className="text-white font-semibold">{currentEvent.organizerName}</p>
                </div>
              </div>

              {currentEvent.ticketInfo && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h12v1a1 1 0 01-1 1H6a1 1 0 01-1-1zm1-4a1 1 0 00-1 1v1h12v-1a1 1 0 00-1-1H5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Tickets</p>
                    <p className="text-white font-semibold">{currentEvent.ticketInfo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button 
              onClick={() => onSelectEvent(currentEvent)} 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {t.viewEvent[lang]}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && events.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={t.previousSlide[lang]}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={t.nextSlide[lang]}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="absolute top-6 right-6 z-40 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label={isPlaying ? t.pauseCarousel[lang] : t.playCarousel[lang]}
          >
            {isPlaying ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {showIndicators && events.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex space-x-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`${lang === 'en' ? 'Go to slide' : lang === 'ar' ? 'انتقل إلى الشريحة' : 'بڕۆ بۆ سلایدی'} ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30 z-40">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all ease-linear"
            style={{ 
              width: `${((Date.now() % autoScrollInterval) / autoScrollInterval) * 100}%`,
              animation: `progress ${autoScrollInterval}ms linear infinite`
            }}
          />
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};