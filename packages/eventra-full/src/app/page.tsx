"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ImagePlaceholder from "./components/ImagePlaceholder";
import LazyImage from "./components/LazyImage";
import LoadingScreen from "./components/LoadingScreen";
import SearchSuggest from "./components/SearchSuggest";
import EventImage from "./components/EventImage";
import ResponsiveButton from "./components/ResponsiveButton";
import { useNetworkStatus, useImagePreloader, usePerformanceMonitor } from "./hooks/usePerformance";
import { useTranslations } from "./hooks/useTranslations";
import { useLanguage } from "./components/LanguageProvider";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  
  // Performance and network hooks
  const { isOnline, connectionSpeed } = useNetworkStatus();
  const { preloadImages, isImageLoaded } = useImagePreloader();
  const performanceMetrics = usePerformanceMonitor();
  
  // Translation and language hooks
  const { t } = useTranslations();
  const { language, isRTL } = useLanguage();

  // Use translated cities and categories
  const cities = [
    t('common.allCities'),
    t('cities.baghdad'), 
    t('cities.basra'), 
    t('cities.mosul'), 
    t('cities.erbil'), 
    t('cities.sulaymaniyah'), 
    t('cities.duhok'), 
    t('cities.kirkuk'), 
    t('cities.anbar'), 
    t('cities.najaf'), 
    t('cities.karbala')
  ];
  
  const categories = [
    { name: t('common.allCategories'), icon: "🎉" },
    { name: t('categories.music'), icon: "🎵" },
    { name: t('categories.sports'), icon: "⚽" },
    { name: t('categories.food'), icon: "🍽️" },
    { name: t('categories.business'), icon: "💼" },
    { name: t('categories.tech'), icon: "💻" },
    { name: t('categories.art'), icon: "🎨" },
    { name: t('categories.health'), icon: "🏥" },
    { name: t('categories.community'), icon: "👥" }
  ];

  const heroSlides = [
    {
      id: 1,
      title: t('heroSlides.slide1.title'),
      subtitle: t('heroSlides.slide1.subtitle'),
      description: t('heroSlides.slide1.description'),
      gradient: "from-purple-900 via-blue-900 to-cyan-900",
      buttonText: t('hero.registerNow'),
      buttonColor: "from-yellow-400 via-orange-500 to-red-500",
      stats: [{ label: t('heroSlides.attendees'), value: "5K+", color: "text-yellow-400" }, { label: t('heroSlides.sessions'), value: "100+", color: "text-cyan-400" }, { label: t('heroSlides.days'), value: "3", color: "text-purple-400" }],
      backgroundImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80",
      category: "tech"
    },
    {
      id: 2,
      title: t('heroSlides.slide2.title'),
      subtitle: t('heroSlides.slide2.subtitle'),
      description: t('heroSlides.slide2.description'),
      gradient: "from-pink-900 via-purple-900 to-indigo-900",
      buttonText: t('hero.getTickets'),
      buttonColor: "from-pink-500 via-purple-500 to-indigo-500",
      stats: [{ label: t('heroSlides.artists'), value: "50+", color: "text-pink-400" }, { label: t('heroSlides.stages'), value: "5", color: "text-purple-400" }, { label: t('heroSlides.hours'), value: "72", color: "text-indigo-400" }],
      backgroundImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80",
      category: "music"
    },
    {
      id: 3,
      title: t('heroSlides.slide3.title'),
      subtitle: t('heroSlides.slide3.subtitle'),
      description: t('heroSlides.slide3.description'),
      gradient: "from-emerald-900 via-teal-900 to-cyan-900",
      buttonText: t('heroSlides.joinSummit'),
      buttonColor: "from-emerald-500 via-teal-500 to-cyan-500",
      stats: [{ label: t('heroSlides.leaders'), value: "200+", color: "text-emerald-400" }, { label: t('heroSlides.companies'), value: "150+", color: "text-teal-400" }, { label: t('heroSlides.workshops'), value: "25", color: "text-cyan-400" }],
      backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80",
      category: "business"
    },
    {
      id: 4,
      title: t('heroSlides.slide4.title'),
      subtitle: t('heroSlides.slide4.subtitle'),
      description: t('heroSlides.slide4.description'),
      gradient: "from-orange-900 via-red-900 to-pink-900",
      buttonText: t('heroSlides.exploreArt'),
      buttonColor: "from-orange-500 via-red-500 to-pink-500",
      stats: [{ label: t('heroSlides.artists'), value: "300+", color: "text-orange-400" }, { label: t('heroSlides.artworks'), value: "1K+", color: "text-red-400" }, { label: t('heroSlides.galleries'), value: "15", color: "text-pink-400" }],
      backgroundImage: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1920&h=1080&fit=crop&crop=center&auto=format&q=80",
      category: "art"
    }
  ];

  // Initialize loading sequence
  useEffect(() => {
    // Simulate initial app loading (DOM ready, critical resources)
    const initTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5 seconds minimum loading time

    return () => clearTimeout(initTimer);
  }, []);

  // Handle loading completion
  const handleLoadingComplete = () => {
    // LoadingScreen handles its own completion, just make sure content is visible
    setShowMainContent(true);
  };

  // Preload critical images on fast connections
  useEffect(() => {
    if (connectionSpeed === 'fast' && isOnline) {
      // Preload hero carousel images (placeholder for now since we don't have real images)
      // In production, you would preload actual image URLs here
      const criticalImages: string[] = [
        // '/images/hero/tech-summit.jpg',
        // '/images/hero/music-festival.jpg',
        // etc...
      ];
      if (criticalImages.length > 0) {
        preloadImages(criticalImages);
      }
    }
  }, [connectionSpeed, isOnline, preloadImages]);

  // Auto-scroll carousel
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-IQ' : 'ckb-IQ';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'tech': '💻',
      'technology': '💻',
      'music': '🎵',
      'business': '💼',
      'art': '🎨',
      'arts': '🎨',
      'sports': '⚽',
      'food': '🍽️',
      'health': '🏥',
      'community': '👥',
      'other': '🎪'
    };
    return icons[category?.toLowerCase()] || '🎪';
  };

  const getEventImageCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'tech': 'tech',
      'technology': 'tech', 
      'music': 'music',
      'business': 'business',
      'art': 'art',
      'arts': 'art',
      'sports': 'sports',
      'food': 'food',
      'health': 'health',
      'community': 'community',
      'other': 'other'
    };
    return categoryMap[category?.toLowerCase()] || 'other';
  };

  // Load events localized; fallback to localized demo if none
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(`/api/events?type=public&lang=${language}`);
        if (response.ok) {
          const eventsData = await response.json();
          if (Array.isArray(eventsData) && eventsData.length > 0) {
            setEvents(eventsData.slice(0, 8));
            return;
          }
        }
      } catch (error) {
        console.log('Events not available, showing sample cards');
      }
      // Fallback: localized demo events using hero slide titles
      const fallback: any[] = [
        {
          id: "d1",
          publicId: "ai-summit-demo",
          title: t('heroSlides.slide1.title'),
          description: t('heroSlides.slide1.description'),
          date: new Date().toISOString(),
          location: t('cities.erbil'),
          category: "technology",
          price: 0,
          isFree: true,
          imageUrl: undefined,
          user: { name: "IraqEvents", email: "demo@iraqevents.com" }
        },
        {
          id: "d2",
          publicId: "music-festival-demo",
          title: t('heroSlides.slide2.title'),
          description: t('heroSlides.slide2.description'),
          date: new Date().toISOString(),
          location: t('cities.baghdad'),
          category: "music",
          price: 0,
          isFree: true,
          imageUrl: undefined,
          user: { name: "IraqEvents", email: "demo@iraqevents.com" }
        },
        {
          id: "d3",
          publicId: "business-workshop-demo",
          title: t('heroSlides.slide3.title'),
          description: t('heroSlides.slide3.description'),
          date: new Date().toISOString(),
          location: t('cities.basra'),
          category: "business",
          price: 25,
          isFree: false,
          imageUrl: undefined,
          user: { name: "IraqEvents", email: "demo@iraqevents.com" }
        },
        {
          id: "d4",
          publicId: "art-exhibition-demo",
          title: t('heroSlides.slide4.title'),
          description: t('heroSlides.slide4.description'),
          date: new Date().toISOString(),
          location: t('cities.mosul'),
          category: "art",
          price: 10,
          isFree: false,
          imageUrl: undefined,
          user: { name: "IraqEvents", email: "demo@iraqevents.com" }
        }
      ];
      setEvents(fallback);
    };
    
    loadEvents();
  }, [language, t]);

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen 
        isLoading={isLoading} 
        onComplete={handleLoadingComplete}
        minDisplayTime={1500}
      />
      
      {/* Main Content */}
      <div className="min-h-screen">
      {/* Performance & Network Status (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-sm">
          <div className="mb-2 font-bold">Dev Status</div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${connectionSpeed === 'fast' ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {connectionSpeed === 'fast' ? '⚡ Fast' : '🐌 Slow'}
            </span>
          </div>
          {performanceMetrics.firstContentfulPaint > 0 && (
            <div className="text-gray-300">
              FCP: {Math.round(performanceMetrics.firstContentfulPaint)}ms
            </div>
          )}
          {performanceMetrics.largestContentfulPaint > 0 && (
            <div className="text-gray-300">
              LCP: {Math.round(performanceMetrics.largestContentfulPaint)}ms
            </div>
          )}
        </div>
      )}
      
      {/* Hero Carousel Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Carousel Container */}
        <div 
          className="flex transition-transform duration-700 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`relative flex-shrink-0 w-full min-w-full h-full overflow-hidden`}
            >
              {/* Background Layer (gradient + image with fallback) */}
              <div className="absolute inset-0">
                {/* Base gradient to avoid black screens even if image fails */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`}></div>
                <EventImage
                  src={slide.backgroundImage}
                  alt={slide.title}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover"
                  category={slide.category}
                  fallbackType={slide.category as any}
                  priority={index === 0}
                />
                {/* Soft overlay */}
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-lg animate-float" style={{animationDelay: `${index * 0.5}s`}}></div>
                <div className="absolute top-32 right-32 w-16 h-16 bg-white/20 rounded-lg animate-float" style={{animationDelay: `${index * 0.5 + 2}s`}}></div>
                <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-white/20 rounded-lg animate-float" style={{animationDelay: `${index * 0.5 + 1}s`}}></div>
                <div className="absolute bottom-20 right-20 w-18 h-18 bg-white/20 rounded-lg animate-float" style={{animationDelay: `${index * 0.5 + 3}s`}}></div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30"></div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                <div className={`max-w-4xl mx-auto transition-all duration-1000 ${currentSlide === index ? 'animate-fadeInScale' : 'opacity-50'}`}>
                  <div className="mb-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-white/90 text-sm font-medium">{t('hero.liveEventPlatform')}</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent animate-shimmer">
                      {slide.title}
                    </span>
                  </h1>
                  
                  <p className="text-2xl text-white/90 mb-4 font-light">
                    {slide.subtitle}
                  </p>
                  <p className="text-lg text-white/70 mb-12 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
<Link
                      href="/register"
                      className="relative inline-flex items-center justify-center p-[2px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 hover:via-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-[0_8px_20px_0_rgba(168,85,247,0.35)] hover:shadow-[0_10px_24px_0_rgba(236,72,153,0.35)] hover:scale-105"
                    >
                      <span className="px-10 py-5 md:px-12 md:py-6 rounded-full bg-gray-900 text-white text-xl font-bold tracking-wide">
                        {t(`hero.${slide.id === 1 ? 'registerNow' : slide.id === 2 ? 'getTickets' : slide.id === 3 ? 'joinSummit' : 'exploreArt'}`)} <span className="opacity-80">{isRTL ? '←' : '→'}</span>
                      </span>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-white/80">
                      {slide.stats.map((stat, statIndex) => (
                        <React.Fragment key={statIndex}>
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${stat.color} animate-pulse`}>{stat.value}</div>
                            <div className="text-sm">{stat.label}</div>
                          </div>
                          {statIndex < slide.stats.length - 1 && <div className="w-px h-12 bg-white/30"></div>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Countdown Timer - only show on first slide */}
                  {index === 0 && (
                    <div className="mt-12 flex justify-center">
                      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                        <div className="text-white/60 text-sm mb-2 text-center">{t('hero.eventStartsIn')}</div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">127</div>
                            <div className="text-xs text-white/60">{t('hero.days')}</div>
                          </div>
                          <div className="text-white/40">:</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">14</div>
                            <div className="text-xs text-white/60">{t('hero.hours')}</div>
                          </div>
                          <div className="text-white/40">:</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">35</div>
                            <div className="text-xs text-white/60">{t('hero.minutes')}</div>
                          </div>
                          <div className="text-white/40">:</div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-pink-400 animate-pulse">22</div>
                            <div className="text-xs text-white/60">{t('hero.seconds')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/40 hover:bg-white/60 hover:scale-110'
              }`}
            />
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Scrolling Cities Section */}
      <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 py-16 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-orange-500/50"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">🏙️ {t('homepage.exploreCities')}</h2>
            <p className="text-gray-800 text-center text-lg">{t('homepage.exploreCitiesSubtitle')}</p>
          </div>
          
          {/* Cities Scrolling Row (Left to Right) */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-right gap-6 py-4">
              {[...cities, ...cities, ...cities].map((city, index) => (
                <button
                  key={`city-${index}`}
                  onClick={() => setSelectedCity(city)}
                  className={`flex-shrink-0 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    selectedCity === city
                      ? "bg-gray-900 text-white shadow-2xl transform scale-105"
                      : "bg-white text-gray-800 shadow-lg hover:bg-gray-50"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Categories Section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 py-16 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 text-center">🎯 {t('homepage.exploreCategories')}</h2>
            <p className="text-white/90 text-center text-lg">{t('homepage.exploreCategoriesSubtitle')}</p>
          </div>
          
          {/* Categories Scrolling Row (Right to Left) */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-left gap-6 py-4">
              {[...categories, ...categories, ...categories].map((category, index) => (
                <button
                  key={`category-${index}`}
                  className="flex-shrink-0 bg-white/90 backdrop-blur-md rounded-2xl p-6 hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl group min-w-[200px]"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <div className="text-gray-900 font-bold text-lg text-center">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">🔍 {t('homepage.findPerfectEvent')}</h2>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-4">
          <div className="relative">
              <SearchSuggest
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t('events.searchPlaceholder')}
              />
              <button className="absolute right-2 top-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
                🔍
              </button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <option className="text-gray-800">{t('common.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat.name} className="text-gray-800">{cat.name}</option>
              ))}
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <option className="text-gray-800">{t('common.allCities')}</option>
              {cities.map(city => (
                <option key={city} className="text-gray-800">{city}</option>
              ))}
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
              <option className="text-gray-800">{t('common.allMonths')}</option>
              <option className="text-gray-800">{t('months.january')}</option>
              <option className="text-gray-800">{t('months.february')}</option>
              <option className="text-gray-800">{t('months.march')}</option>
            </select>
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium">
              {t('events.clearAllFilters')}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-4 shadow-lg">
            ⭐ {t('homepage.featuredEvents')}
          </div>
          <h2 className="text-4xl font-bold text-white mb-12">{t('homepage.featuredEvents')}</h2>
          
          {/* Placeholder for event carousel */}
          <div className="bg-white/10 rounded-lg p-8 mb-8">
            <p className="text-white/80 text-lg">{t('homepage.featuredCarousel')}</p>
          </div>
          
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            📅 {t('homepage.upcomingEvents')}
          </h2>
          
          <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">{t('homepage.allEvents')}</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/80 mt-4">{t('homepage.loading')}</p>
              </div>
            ) : events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {events.slice(0, 8).map((event) => (
                    <Link
                      key={event.id}
                      href={`/${language}/event/${event.publicId}`}
                      className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                    >
                    <div className="relative">
                      <EventImage
                        src={event.imageUrl}
                        alt={event.title}
                        width={400}
                        height={200}
                        className="h-48 w-full object-cover"
                        category={getEventImageCategory(event.category || "")}
                      />
                      <div className="absolute top-3 right-3">
{event.isFree || event.price === 0 ? (
                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {t('events.free')}
                          </span>
                        ) : (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ${event.price}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          {getCategoryIcon(event.category || "")} {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-purple-600 transition-colors line-clamp-2">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                        <span>📅</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                        <span>📍</span>
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${
                          event.isFree || event.price === 0 ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {event.isFree || event.price === 0 ? t('events.free') : `$${event.price}`}
                        </span>
<span className="text-purple-600 group-hover:text-purple-800 text-sm font-medium">
                          {t('events.viewDetails')} {isRTL ? '←' : '→'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sample Event Cards for demo */}
                <Link
                  href="/events"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <div className="relative">
                    <EventImage
                      alt="AI Innovation Summit"
                      width={400}
                      height={200}
                      className="h-48 w-full"
                      fallbackType="tech"
                    />
<div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {t('common.paid')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">AI Innovation Summit</h4>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <span>📅</span>
                      <span>March 15, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                      <span>📍</span>
                      <span>Baghdad Tech Center</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-semibold">$50</span>
<span className="text-blue-600 group-hover:text-blue-800 text-sm font-medium">
                        {t('homepage.exploreEvents')} {isRTL ? '←' : '→'}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/events"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <div className="relative">
                    <EventImage
                      alt="Music Festival"
                      width={400}
                      height={200}
                      className="h-48 w-full"
                      fallbackType="music"
                    />
<div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {t('events.free')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-purple-600 transition-colors">Music Festival</h4>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <span>📅</span>
                      <span>March 20, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                      <span>📍</span>
                      <span>Central Park, Erbil</span>
                    </div>
                    <div className="flex items-center justify-between">
<span className="text-green-600 font-semibold">{t('events.free')}</span>
                      <span className="text-purple-600 group-hover:text-purple-800 text-sm font-medium">
                        Explore Events →
                      </span>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/events"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <div className="relative">
                    <EventImage
                      alt="Business Workshop"
                      width={400}
                      height={200}
                      className="h-48 w-full"
                      fallbackType="business"
                    />
<div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {t('common.paid')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-teal-600 transition-colors">Business Workshop</h4>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <span>📅</span>
                      <span>March 25, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                      <span>📍</span>
                      <span>Business District, Basra</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-teal-600 font-semibold">$75</span>
<span className="text-teal-600 group-hover:text-teal-800 text-sm font-medium">
                        {t('homepage.exploreEvents')} {isRTL ? '←' : '→'}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/events"
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <div className="relative">
                    <EventImage
                      alt="Art Exhibition"
                      width={400}
                      height={200}
                      className="h-48 w-full"
                      fallbackType="art"
                    />
<div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {t('events.soldOut')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-purple-600 transition-colors">Art Exhibition</h4>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                      <span>📅</span>
                      <span>April 1, 2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm mb-4">
                      <span>📍</span>
                      <span>Culture Center, Mosul</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-semibold line-through">$30</span>
<span className="text-purple-600 group-hover:text-purple-800 text-sm font-medium">
                        {t('homepage.exploreEvents')} {isRTL ? '←' : '→'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
