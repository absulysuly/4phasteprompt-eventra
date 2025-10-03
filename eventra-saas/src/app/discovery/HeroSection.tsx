"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';

interface VenueStats {
  totalVenues: number;
  totalEvents: number;
  activeCities: number;
  featuredVenues: number;
}

interface HeroSectionProps {
  stats: VenueStats;
}

const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&h=600&fit=crop&crop=center&auto=format&q=80',
    title: 'Ancient Babylon',
    subtitle: 'Discover Iraq\'s Historical Treasures'
  },
  {
    url: 'https://images.unsplash.com/photo-1544161513-0179fe61719d?w=1920&h=600&fit=crop&crop=center&auto=format&q=80',
    title: 'Baghdad Nights',
    subtitle: 'Experience Modern Iraqi Culture'
  },
  {
    url: 'https://images.unsplash.com/photo-1537726235470-8504e3beef77?w=1920&h=600&fit=crop&crop=center&auto=format&q=80',
    title: 'Kurdistan Mountains',
    subtitle: 'Explore Natural Beauty'
  },
  {
    url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1920&h=600&fit=crop&crop=center&auto=format&q=80',
    title: 'Basra Marshlands',
    subtitle: 'UNESCO World Heritage'
  }
];

export default function HeroSection({ stats }: HeroSectionProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslations();

  // Auto-rotate images with Ken Burns effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Preload images
  useEffect(() => {
    HERO_IMAGES.forEach((image) => {
      const img = new Image();
      img.src = image.url;
    });
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Images with Ken Burns Effect */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              currentImage === index 
                ? 'opacity-100 scale-110 animate-ken-burns' 
                : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-orange-900/40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl animate-float-slow"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-6 animate-slide-up">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white/90 text-sm font-medium">🔴 LIVE - Discover Iraq Now</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up-delayed">
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-red-300 bg-clip-text text-transparent animate-gradient-text">
                IRAQ DISCOVERY
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light animate-slide-up-delayed-2">
              {HERO_IMAGES[currentImage].subtitle}
            </p>
            
            <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto animate-slide-up-delayed-3">
              Explore the hidden gems, ancient wonders, and vibrant culture of Beautiful Iraq. 
              From historic Baghdad to the mountains of Kurdistan.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up-delayed-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-amber-500/25 transition-all transform hover:scale-105 hover:rotate-1">
                <span className="relative z-10">🏛️ Explore Venues</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              </button>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all transform hover:scale-105 hover:-rotate-1">
                📱 Download App
              </button>
            </div>

            {/* Stats Ticker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-slide-up-delayed-5">
              <div className="group bg-gradient-to-r from-purple-900/20 to-purple-800/20 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2 group-hover:scale-110 transition-transform">
                  {stats.totalVenues.toLocaleString()}+
                </div>
                <div className="text-purple-100/80 text-sm font-medium">Amazing Venues</div>
              </div>
              
              <div className="group bg-gradient-to-r from-blue-900/20 to-blue-800/20 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-blue-300 mb-2 group-hover:scale-110 transition-transform">
                  {stats.totalEvents.toLocaleString()}+
                </div>
                <div className="text-blue-100/80 text-sm font-medium">Live Events</div>
              </div>
              
              <div className="group bg-gradient-to-r from-amber-900/20 to-orange-800/20 backdrop-blur-md rounded-2xl p-6 border border-amber-500/20 hover:border-amber-400/40 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-amber-300 mb-2 group-hover:scale-110 transition-transform">
                  {stats.activeCities}
                </div>
                <div className="text-amber-100/80 text-sm font-medium">Iraqi Cities</div>
              </div>
              
              <div className="group bg-gradient-to-r from-green-900/20 to-emerald-800/20 backdrop-blur-md rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all hover:scale-105">
                <div className="text-3xl md:text-4xl font-bold text-green-300 mb-2 group-hover:scale-110 transition-transform">
                  {stats.featuredVenues}+
                </div>
                <div className="text-green-100/80 text-sm font-medium">Featured Places</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentImage === index
                ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50'
                : 'bg-white/40 hover:bg-white/60 hover:scale-110'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}