'use client';

import React, { createContext, useContext } from 'react';

// Simple translation data
const translations: Record<string, string> = {
  // Navigation
  'navigation.home': 'Home',
  'navigation.events': 'Events',
  'navigation.register': 'Register',
  'navigation.login': 'Login',
  
  // Common
  'common.allCities': 'All Cities',
  'common.allCategories': 'All Categories',
  
  // Cities
  'cities.baghdad': 'Baghdad',
  'cities.basra': 'Basra',
  'cities.mosul': 'Mosul',
  'cities.erbil': 'Erbil',
  'cities.sulaymaniyah': 'Sulaymaniyah',
  'cities.duhok': 'Duhok',
  'cities.kirkuk': 'Kirkuk',
  'cities.anbar': 'Anbar',
  'cities.najaf': 'Najaf',
  'cities.karbala': 'Karbala',
  
  // Categories
  'categories.technologyInnovation': 'Technology & Innovation',
  'categories.businessNetworking': 'Business & Networking',
  'categories.musicConcerts': 'Music & Concerts',
  'categories.artsCulture': 'Arts & Culture',
  'categories.sportsFitness': 'Sports & Fitness',
  'categories.foodDrink': 'Food & Drink',
  'categories.learningDevelopment': 'Learning & Development',
  'categories.healthWellness': 'Health & Wellness',
  'categories.communitySocial': 'Community & Social',
  'categories.gamingEsports': 'Gaming & Esports',
  'categories.spiritualReligious': 'Spiritual & Religious',
  'categories.familyKids': 'Family & Kids',
  'categories.outdoorAdventure': 'Outdoor & Adventure',
  'categories.virtualEvents': 'Virtual Events',
  'categories.academicConferences': 'Academic & Conferences',
  
  // Hero slides
  'heroSlides.slide1.title': 'Iraq Tech Summit 2024',
  'heroSlides.slide1.subtitle': 'Shaping the Future of Technology',
  'heroSlides.slide1.description': 'Join industry leaders and innovators',
  'heroSlides.slide2.title': 'Baghdad Music Festival',
  'heroSlides.slide2.subtitle': 'Three Days of Amazing Music',
  'heroSlides.slide2.description': 'Experience the best of Iraqi and international music',
  'heroSlides.slide3.title': 'Kurdistan Business Summit',
  'heroSlides.slide3.subtitle': 'Building Tomorrow Together',
  'heroSlides.slide3.description': 'Network with business leaders and entrepreneurs',
  'heroSlides.slide4.title': 'Mesopotamian Arts Exhibition',
  'heroSlides.slide4.subtitle': 'Ancient Heritage, Modern Expression',
  'heroSlides.slide4.description': 'Discover the rich artistic traditions of Iraq',
  
  // Hero actions
  'hero.registerNow': 'Register Now',
  'hero.getTickets': 'Get Tickets',
  'heroSlides.joinSummit': 'Join Summit',
  'heroSlides.exploreArt': 'Explore Art',
  
  // Hero stats
  'heroSlides.attendees': 'Attendees',
  'heroSlides.sessions': 'Sessions',
  'heroSlides.days': 'Days',
  'heroSlides.artists': 'Artists',
  'heroSlides.stages': 'Stages',
  'heroSlides.hours': 'Hours',
  'heroSlides.leaders': 'Leaders',
  'heroSlides.companies': 'Companies',
  'heroSlides.workshops': 'Workshops',
  'heroSlides.artworks': 'Artworks',
  'heroSlides.galleries': 'Galleries',
};

const SimpleLanguageContext = createContext({
  language: 'en',
  setLanguage: (lang: string) => {},
  t: (key: string) => translations[key] || key,
  isRTL: false,
});

export function SimpleLanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <SimpleLanguageContext.Provider value={{
      language: 'en',
      setLanguage: () => {},
      t: (key) => translations[key] || key,
      isRTL: false,
    }}>
      {children}
    </SimpleLanguageContext.Provider>
  );
}

export const useSimpleLanguage = () => useContext(SimpleLanguageContext);

// Also export as useLanguage for backward compatibility
export const useLanguage = () => {
  const context = useContext(SimpleLanguageContext);
  return {
    language: context.language,
    isRTL: context.isRTL,
    setLanguage: context.setLanguage
  };
};
