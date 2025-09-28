"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { useTranslations } from '../hooks/useTranslations';
import EventImage from './EventImage';
import ResponsiveButton from './ResponsiveButton';

// Types for our modular system
interface UserIntent {
  type: 'tourist' | 'local' | 'business' | 'explorer';
  confidence: number;
  indicators: string[];
}

interface ContentModule {
  id: string;
  type: 'events' | 'hotels' | 'restaurants' | 'tourism' | 'trending' | 'recommendations';
  priority: number;
  content: any;
  timeRelevant?: boolean;
  locationRelevant?: boolean;
}

interface AdaptiveContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    backgroundType: string;
  };
  modules: ContentModule[];
}

interface TimeContext {
  hour: number;
  isWeekend: boolean;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

interface LocationContext {
  city?: string;
  isLocal: boolean;
  nearbyCategories?: string[];
}

export default function AdaptiveHomepage() {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();
  
  // State for adaptive content
  const [userIntent, setUserIntent] = useState<UserIntent>({
    type: 'explorer',
    confidence: 0.7,
    indicators: []
  });
  const [timeContext, setTimeContext] = useState<TimeContext>({
    hour: new Date().getHours(),
    isWeekend: [0, 6].includes(new Date().getDay()),
    season: getCurrentSeason()
  });
  const [locationContext, setLocationContext] = useState<LocationContext>({
    isLocal: false
  });

  // Initialize time and location context
  useEffect(() => {
    const now = new Date();
    setTimeContext({
      hour: now.getHours(),
      isWeekend: [0, 6].includes(now.getDay()),
      season: getCurrentSeason()
    });

    // Detect location context (simplified - in production, use geolocation/IP)
    detectLocationContext();
  }, []);

  // User intent detection based on behavior patterns
  useEffect(() => {
    const detectUserIntent = () => {
      const indicators: string[] = [];
      let intentType: UserIntent['type'] = 'explorer';
      let confidence = 0.5;

      // Time-based indicators
      const hour = timeContext.hour;
      if (hour >= 9 && hour <= 17) {
        indicators.push('business-hours');
        if (timeContext.isWeekend) {
          intentType = 'tourist';
          confidence += 0.2;
        } else {
          intentType = 'business';
          confidence += 0.15;
        }
      } else if (hour >= 18 && hour <= 23) {
        indicators.push('evening-entertainment');
        intentType = 'local';
        confidence += 0.25;
      }

      // Location-based indicators
      if (locationContext.isLocal) {
        indicators.push('local-user');
        intentType = intentType === 'explorer' ? 'local' : intentType;
        confidence += 0.2;
      } else {
        indicators.push('visitor');
        intentType = 'tourist';
        confidence += 0.3;
      }

      // Browser/session indicators (simplified)
      const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
      if (!hasVisitedBefore) {
        indicators.push('first-visit');
        intentType = 'tourist';
        confidence += 0.15;
        localStorage.setItem('hasVisitedBefore', 'true');
      }

      setUserIntent({
        type: intentType,
        confidence: Math.min(confidence, 1),
        indicators
      });
    };

    detectUserIntent();
  }, [timeContext, locationContext]);

  // Generate adaptive content based on user intent
  const adaptiveContent = useMemo(() => {
    return generateAdaptiveContent(userIntent, timeContext, locationContext, t, language);
  }, [userIntent, timeContext, locationContext, t, language]);

  return (
    <div className={`min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Adaptive Hero Section */}
      <AdaptiveHero content={adaptiveContent.hero} intent={userIntent} />
      
      {/* Modular Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ModularContentGrid modules={adaptiveContent.modules} intent={userIntent} />
      </div>

      {/* Quick Actions Bar */}
      <QuickActionsBar intent={userIntent} timeContext={timeContext} />
      
      {/* Trending & Recommendations */}
      <TrendingSection intent={userIntent} />
      
      {/* City Explorer */}
      <CityExplorerSection intent={userIntent} />
    </div>
  );
}

// Adaptive Hero Component
function AdaptiveHero({ content, intent }: { content: any; intent: UserIntent }) {
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();

  const getHeroBackground = () => {
    switch (intent.type) {
      case 'tourist':
        return 'from-emerald-600 via-teal-500 to-cyan-500';
      case 'business':
        return 'from-slate-600 via-gray-700 to-blue-800';
      case 'local':
        return 'from-purple-600 via-pink-500 to-red-500';
      default:
        return 'from-blue-600 via-indigo-600 to-purple-700';
    }
  };

  return (
    <div className={`relative py-20 bg-gradient-to-r ${getHeroBackground()}`}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Intent Indicator */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">
            {getIntentMessage(intent, t)}
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          {content.title}
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
          {content.subtitle}
        </p>

        {/* Adaptive CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <AdaptiveCTAButtons intent={intent} />
        </div>

        {/* Quick Stats */}
        <QuickStats intent={intent} />
      </div>
    </div>
  );
}

// Modular Content Grid
function ModularContentGrid({ modules, intent }: { modules: ContentModule[]; intent: UserIntent }) {
  const sortedModules = useMemo(() => {
    return modules
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6); // Show top 6 modules
  }, [modules]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedModules.map((module) => (
        <ContentModuleCard key={module.id} module={module} intent={intent} />
      ))}
    </div>
  );
}

// Individual Content Module Card
function ContentModuleCard({ module, intent }: { module: ContentModule; intent: UserIntent }) {
  const { t } = useTranslations();

  const getModuleIcon = (type: string) => {
    const icons = {
      events: '🎉',
      hotels: '🏨',
      restaurants: '🍽️',
      tourism: '🏛️',
      trending: '🔥',
      recommendations: '⭐'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  const getModuleColor = (type: string) => {
    const colors = {
      events: 'from-purple-500 to-pink-500',
      hotels: 'from-blue-500 to-cyan-500',
      restaurants: 'from-orange-500 to-red-500',
      tourism: 'from-green-500 to-teal-500',
      trending: 'from-yellow-500 to-orange-500',
      recommendations: 'from-indigo-500 to-purple-500'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Module Header */}
      <div className={`p-4 bg-gradient-to-r ${getModuleColor(module.type)}`}>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getModuleIcon(module.type)}</span>
            <h3 className="font-bold text-lg">
              {t(`modules.${module.type}.title`)}
            </h3>
          </div>
          {module.priority > 8 && (
            <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
              {t('common.trending')}
            </span>
          )}
        </div>
      </div>

      {/* Module Content */}
      <div className="p-6">
        <ModuleContent module={module} intent={intent} />
      </div>

      {/* Module Action */}
      <div className="p-4 border-t border-gray-100">
        <Link
          href={getModuleLink(module.type)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          {t(`modules.${module.type}.viewAll`)}
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

// Module Content Renderer
function ModuleContent({ module, intent }: { module: ContentModule; intent: UserIntent }) {
  const { t } = useTranslations();

  switch (module.type) {
    case 'events':
      return <EventsModuleContent content={module.content} intent={intent} />;
    case 'hotels':
      return <HotelsModuleContent content={module.content} intent={intent} />;
    case 'restaurants':
      return <RestaurantsModuleContent content={module.content} intent={intent} />;
    case 'tourism':
      return <TourismModuleContent content={module.content} intent={intent} />;
    case 'trending':
      return <TrendingModuleContent content={module.content} intent={intent} />;
    case 'recommendations':
      return <RecommendationsModuleContent content={module.content} intent={intent} />;
    default:
      return <div className="text-gray-500">{t('common.comingSoon')}</div>;
  }
}

// Quick Actions Bar
function QuickActionsBar({ intent, timeContext }: { intent: UserIntent; timeContext: TimeContext }) {
  const { t, language } = useTranslations();

  const getTimeBasedActions = () => {
    const hour = timeContext.hour;
    
    if (hour >= 6 && hour < 12) {
      return ['breakfast-spots', 'morning-events', 'hotels-checkin'];
    } else if (hour >= 12 && hour < 17) {
      return ['lunch-restaurants', 'afternoon-activities', 'tourist-attractions'];
    } else {
      return ['dinner-restaurants', 'evening-events', 'nightlife'];
    }
  };

  const actions = getTimeBasedActions();

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4">
          {actions.map((action) => (
            <button
              key={action}
              className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300"
            >
              <span>{getActionIcon(action)}</span>
              <span className="font-medium text-gray-800">
                {t(`quickActions.${action}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function detectLocationContext() {
  // Simplified location detection
  // In production, use geolocation API or IP-based location
}

function generateAdaptiveContent(
  intent: UserIntent, 
  timeContext: TimeContext, 
  locationContext: LocationContext, 
  t: any, 
  language: string
): AdaptiveContent {
  
  const hero = generateHeroContent(intent, timeContext, t);
  const modules = generateContentModules(intent, timeContext, locationContext, t);

  return { hero, modules };
}

function generateHeroContent(intent: UserIntent, timeContext: TimeContext, t: any) {
  switch (intent.type) {
    case 'tourist':
      return {
        title: t('adaptive.hero.tourist.title'),
        subtitle: t('adaptive.hero.tourist.subtitle'),
        cta: t('adaptive.hero.tourist.cta'),
        backgroundType: 'tourist'
      };
    case 'business':
      return {
        title: t('adaptive.hero.business.title'),
        subtitle: t('adaptive.hero.business.subtitle'),
        cta: t('adaptive.hero.business.cta'),
        backgroundType: 'business'
      };
    case 'local':
      return {
        title: t('adaptive.hero.local.title'),
        subtitle: t('adaptive.hero.local.subtitle'),
        cta: t('adaptive.hero.local.cta'),
        backgroundType: 'local'
      };
    default:
      return {
        title: t('adaptive.hero.explorer.title'),
        subtitle: t('adaptive.hero.explorer.subtitle'),
        cta: t('adaptive.hero.explorer.cta'),
        backgroundType: 'explorer'
      };
  }
}

function generateContentModules(
  intent: UserIntent, 
  timeContext: TimeContext, 
  locationContext: LocationContext, 
  t: any
): ContentModule[] {
  const baseModules: ContentModule[] = [
    {
      id: 'events',
      type: 'events',
      priority: 7,
      content: { type: 'upcoming', count: 3 }
    },
    {
      id: 'hotels',
      type: 'hotels',
      priority: 6,
      content: { type: 'available', count: 3 }
    },
    {
      id: 'restaurants',
      type: 'restaurants',
      priority: 8,
      content: { type: 'popular', count: 3 }
    },
    {
      id: 'tourism',
      type: 'tourism',
      priority: 5,
      content: { type: 'attractions', count: 3 }
    }
  ];

  // Adjust priorities based on intent
  baseModules.forEach(module => {
    switch (intent.type) {
      case 'tourist':
        if (module.type === 'tourism') module.priority += 3;
        if (module.type === 'hotels') module.priority += 2;
        break;
      case 'business':
        if (module.type === 'hotels') module.priority += 3;
        if (module.type === 'events') module.priority += 2;
        break;
      case 'local':
        if (module.type === 'restaurants') module.priority += 3;
        if (module.type === 'events') module.priority += 2;
        break;
    }
  });

  // Add time-based modules
  if (timeContext.hour >= 11 && timeContext.hour <= 14) {
    baseModules.find(m => m.type === 'restaurants')!.priority += 2;
  }

  if (timeContext.hour >= 18) {
    baseModules.find(m => m.type === 'events')!.priority += 1;
  }

  return baseModules;
}

// Additional component implementations...
function getIntentMessage(intent: UserIntent, t: any): string {
  return t(`adaptive.intent.${intent.type}`);
}

function AdaptiveCTAButtons({ intent }: { intent: UserIntent }) {
  const { t } = useTranslations();
  
  switch (intent.type) {
    case 'tourist':
      return (
        <>
          <ResponsiveButton href="/tourism" variant="primary" size="lg">
            {t('adaptive.cta.explorePlaces')}
          </ResponsiveButton>
          <ResponsiveButton href="/hotels" variant="secondary" size="lg">
            {t('adaptive.cta.findHotels')}
          </ResponsiveButton>
        </>
      );
    case 'business':
      return (
        <>
          <ResponsiveButton href="/events?category=business" variant="primary" size="lg">
            {t('adaptive.cta.businessEvents')}
          </ResponsiveButton>
          <ResponsiveButton href="/hotels?type=business" variant="secondary" size="lg">
            {t('adaptive.cta.businessHotels')}
          </ResponsiveButton>
        </>
      );
    case 'local':
      return (
        <>
          <ResponsiveButton href="/restaurants" variant="primary" size="lg">
            {t('adaptive.cta.findDining')}
          </ResponsiveButton>
          <ResponsiveButton href="/events" variant="secondary" size="lg">
            {t('adaptive.cta.localEvents')}
          </ResponsiveButton>
        </>
      );
    default:
      return (
        <>
          <ResponsiveButton href="/explore" variant="primary" size="lg">
            {t('adaptive.cta.startExploring')}
          </ResponsiveButton>
          <ResponsiveButton href="/events" variant="secondary" size="lg">
            {t('adaptive.cta.browseEvents')}
          </ResponsiveButton>
        </>
      );
  }
}

function QuickStats({ intent }: { intent: UserIntent }) {
  const { t } = useTranslations();
  
  // Mock data - in production, fetch from API
  const stats = {
    tourist: [
      { label: t('stats.attractions'), value: '200+' },
      { label: t('stats.hotels'), value: '150+' },
      { label: t('stats.experiences'), value: '500+' }
    ],
    business: [
      { label: t('stats.venues'), value: '300+' },
      { label: t('stats.events'), value: '1,200+' },
      { label: t('stats.companies'), value: '800+' }
    ],
    local: [
      { label: t('stats.restaurants'), value: '400+' },
      { label: t('stats.events'), value: '1,200+' },
      { label: t('stats.communities'), value: '50+' }
    ]
  };

  const relevantStats = stats[intent.type as keyof typeof stats] || stats.tourist;

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-8">
      {relevantStats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-white">{stat.value}</div>
          <div className="text-white/80 text-sm">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Placeholder components for specific module content
function EventsModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">Upcoming events tailored for {intent.type}</div>;
}

function HotelsModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">Hotels with availability</div>;
}

function RestaurantsModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">Popular restaurants nearby</div>;
}

function TourismModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">Must-visit attractions</div>;
}

function TrendingModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">What's trending now</div>;
}

function RecommendationsModuleContent({ content, intent }: { content: any; intent: UserIntent }) {
  return <div className="text-sm text-gray-600">Personalized recommendations</div>;
}

function TrendingSection({ intent }: { intent: UserIntent }) {
  const { t } = useTranslations();
  
  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          🔥 {t('sections.trending.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trending content will be populated here */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="text-white">Trending content placeholder</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CityExplorerSection({ intent }: { intent: UserIntent }) {
  const { t } = useTranslations();
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          🏙️ {t('sections.cities.title')}
        </h2>
        {/* City explorer content */}
      </div>
    </div>
  );
}

function getModuleLink(type: string): string {
  const links = {
    events: '/events',
    hotels: '/hotels',
    restaurants: '/restaurants',
    tourism: '/tourism',
    trending: '/trending',
    recommendations: '/recommendations'
  };
  return links[type as keyof typeof links] || '/';
}

function getActionIcon(action: string): string {
  const icons = {
    'breakfast-spots': '🥐',
    'morning-events': '🌅',
    'hotels-checkin': '🏨',
    'lunch-restaurants': '🍽️',
    'afternoon-activities': '🎯',
    'tourist-attractions': '🏛️',
    'dinner-restaurants': '🍷',
    'evening-events': '🌃',
    'nightlife': '🎭'
  };
  return icons[action as keyof typeof icons] || '📍';
}