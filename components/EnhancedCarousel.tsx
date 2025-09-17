import React, { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import type { Event, City, Category, Language, User } from '@/types';

interface EnhancedCarouselProps {
  events: Event[];
  cities: City[];
  categories: Category[];
  lang: Language;
  onEventClick: (event: Event) => void;
  currentUser: User | null;
  title: string;
}

export const EnhancedCarousel: React.FC<EnhancedCarouselProps> = ({
  events,
  cities,
  categories,
  lang,
  onEventClick,
  currentUser,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const totalPages = Math.ceil(events.length / itemsPerPage);

  // Update items per page based on screen size
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // Tablet: 2 items
      } else {
        setItemsPerPage(3); // Desktop: 3 items
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalPages <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalPages, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (events.length === 0) {
    return null;
  }

  const currentEvents = events.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div 
      className="py-12 bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">{title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 touch-target"
                aria-label="Previous events"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 touch-target"
                aria-label="Next events"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Events Grid - Mobile Optimized */}
          <div className="overflow-hidden rounded-2xl mobile-carousel">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {Array.from({ length: totalPages }, (_, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4 mobile-carousel-item"
                >
                  {events
                    .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                    .map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className="transform transition-all duration-500 hover:scale-105"
                      style={{
                        animationDelay: `${eventIndex * 0.1}s`
                      }}
                    >
                      <EventCard
                        event={event}
                        city={cities.find(c => c.id === event.cityId)}
                        category={categories.find(c => c.id === event.categoryId)}
                        lang={lang}
                        onClick={() => onEventClick(event)}
                        isLoggedIn={!!currentUser}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-white shadow-lg'
                      : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {isAutoPlaying && totalPages > 1 && (
            <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-100 ease-linear"
                style={{ 
                  width: `${((currentIndex + 1) / totalPages) * 100}%`,
                  animation: 'progress 4s linear infinite'
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};