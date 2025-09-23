'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from "../../hooks/useTranslations";
import { useContentOverride } from "../../hooks/useContent";
import { useLanguage } from "../../components/LanguageProvider";

interface CategoriesPageProps {
  params: Promise<{ locale: string }>;
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const { t } = useTranslations();
  const { language, isRTL } = useLanguage();
  const categoriesSubtitle = useContentOverride('categoriesPage.subtitle');
  
  // Update language context based on URL locale
  React.useEffect(() => {
    const updateLocale = async () => {
      const resolvedParams = await params;
      // This ensures the language context matches the URL
    };
    updateLocale();
  }, [params]);

  const categories = [
    { name: t('homepage.allEvents'), key: 'all', icon: '🎉', description: t('categoryDescriptions.all'), color: 'from-purple-500 to-pink-500' },
    { name: t('categories.technologyInnovation'), key: 'technologyInnovation', icon: '💻', description: t('categoryDescriptions.technologyInnovation'), color: 'from-indigo-500 to-purple-500' },
    { name: t('categories.businessNetworking'), key: 'businessNetworking', icon: '💼', description: t('categoryDescriptions.businessNetworking'), color: 'from-blue-500 to-cyan-500' },
    { name: t('categories.musicConcerts'), key: 'musicConcerts', icon: '🎵', description: t('categoryDescriptions.musicConcerts'), color: 'from-pink-500 to-red-500' },
    { name: t('categories.artsCulture'), key: 'artsCulture', icon: '🎨', description: t('categoryDescriptions.artsCulture'), color: 'from-teal-500 to-blue-500' },
    { name: t('categories.sportsFitness'), key: 'sportsFitness', icon: '⚽', description: t('categoryDescriptions.sportsFitness'), color: 'from-green-500 to-emerald-500' },
    { name: t('categories.foodDrink'), key: 'foodDrink', icon: '🍽️', description: t('categoryDescriptions.foodDrink'), color: 'from-yellow-500 to-orange-500' },
    { name: t('categories.learningDevelopment'), key: 'learningDevelopment', icon: '📚', description: t('categoryDescriptions.learningDevelopment'), color: 'from-violet-500 to-purple-500' },
    { name: t('categories.healthWellness'), key: 'healthWellness', icon: '🏥', description: t('categoryDescriptions.healthWellness'), color: 'from-emerald-500 to-teal-500' },
    { name: t('categories.communitySocial'), key: 'communitySocial', icon: '👥', description: t('categoryDescriptions.communitySocial'), color: 'from-orange-500 to-red-500' },
    { name: t('categories.gamingEsports'), key: 'gamingEsports', icon: '🎮', description: t('categoryDescriptions.gamingEsports'), color: 'from-red-500 to-pink-500' },
    { name: t('categories.spiritualReligious'), key: 'spiritualReligious', icon: '🕌', description: t('categoryDescriptions.spiritualReligious'), color: 'from-amber-500 to-yellow-500' },
    { name: t('categories.familyKids'), key: 'familyKids', icon: '👨‍👩‍👧‍👦', description: t('categoryDescriptions.familyKids'), color: 'from-sky-500 to-blue-500' },
    { name: t('categories.outdoorAdventure'), key: 'outdoorAdventure', icon: '🏔️', description: t('categoryDescriptions.outdoorAdventure'), color: 'from-lime-500 to-green-500' },
    { name: t('categories.virtualEvents'), key: 'virtualEvents', icon: '💻', description: t('categoryDescriptions.virtualEvents'), color: 'from-slate-500 to-gray-500' },
    { name: t('categories.academicConferences'), key: 'academicConferences', icon: '🎓', description: t('categoryDescriptions.academicConferences'), color: 'from-rose-500 to-red-500' }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">{t('categoriesPage.title')}</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {categoriesSubtitle?.value || t('categoriesPage.subtitle')}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div 
              key={category.name}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                {category.name}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {category.description}
              </p>
              
              <Link 
                href={language === 'en' ? `/events?category=${encodeURIComponent(category.key)}` : `/${language}/events?category=${encodeURIComponent(category.key)}`}
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${category.color} text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <span>{t('homepage.exploreEvents')}</span>
                <span>{isRTL ? '←' : '→'}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('categoriesPage.ctaTitle')}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t('categoriesPage.ctaSubtitle')}
          </p>
          <Link 
            href={language === 'en' ? '/register' : `/${language}/register`}
            className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
          >
            <span className="text-2xl">🎆</span>
            {t('events.createYourEvent')}
          </Link>
        </div>
      </div>
    </div>
  );
}