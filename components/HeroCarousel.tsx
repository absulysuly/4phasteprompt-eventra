import React, { useState, useEffect } from 'react';

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText?: string;
  buttonAction?: () => void;
}

interface HeroCarouselProps {
  banners: HeroBanner[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentBanner.imageUrl})`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {currentBanner.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow">
            {currentBanner.subtitle}
          </p>
          {currentBanner.buttonText && (
            <button 
              onClick={currentBanner.buttonAction}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {currentBanner.buttonText}
            </button>
          )}
        </div>
      </div>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};