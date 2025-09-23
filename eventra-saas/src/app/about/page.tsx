"use client";

import Link from "next/link";
import React from "react";
import EventImage from "../components/EventImage";

import { useTranslations } from "../hooks/useTranslations";
import { useContentOverride } from "../hooks/useContent";

export default function AboutPage() {
  const { t } = useTranslations();
  const override = useContentOverride('about.subtitle');
  const features = [
    {
      icon: "🎉",
      title: t('about.features.eventDiscovery.title'),
      description: t('about.features.eventDiscovery.description')
    },
    {
      icon: "🚀",
      title: t('about.features.easyEventCreation.title'),
      description: t('about.features.easyEventCreation.description')
    },
    {
      icon: "🌐",
      title: t('about.features.multiLanguageSupport.title'),
      description: t('about.features.multiLanguageSupport.description')
    },
    {
      icon: "📱",
      title: t('about.features.mobileFriendly.title'),
      description: t('about.features.mobileFriendly.description')
    },
    {
      icon: "💳",
      title: t('about.features.flexibleTicketing.title'),
      description: t('about.features.flexibleTicketing.description')
    },
    {
      icon: "🤝",
      title: t('about.features.communityFocused.title'),
      description: t('about.features.communityFocused.description')
    }
  ];

  const stats = [
    { number: "10K+", label: t('about.stats.eventsCreated'), color: "text-blue-600" },
    { number: "50K+", label: t('about.stats.happyUsers'), color: "text-purple-600" },
    { number: "15+", label: t('about.stats.citiesCovered'), color: "text-green-600" },
    { number: "3", label: t('about.stats.languagesSupported'), color: "text-red-600" }
  ];

  const teamMembers = [
    {
      name: t('about.team.items.devTeam.name'),
      role: t('about.team.items.devTeam.role'),
      description: t('about.team.items.devTeam.description'),
      image: "tech"
    },
    {
      name: t('about.team.items.communityTeam.name'),
      role: t('about.team.items.communityTeam.role'),
      description: t('about.team.items.communityTeam.description'),
      image: "community"
    },
    {
      name: t('about.team.items.localPartners.name'),
      role: t('about.team.items.localPartners.role'),
      description: t('about.team.items.localPartners.description'),
      image: "business"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 mb-8">
              <span className="text-white font-semibold">ℹ️ {t('about.title')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 lg:mb-8">
              {t('about.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-8 lg:mb-12 px-4">
              {override?.value || t('about.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link
                href="/events"
                className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 w-full sm:w-auto text-center"
              >
                {t('homepage.exploreEvents')}
              </Link>
              <Link
                href="/register"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-white hover:text-purple-600 transform hover:scale-105 w-full sm:w-auto text-center"
              >
                {t('register.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm sm:text-base font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 lg:mb-8">
                {t('about.mission.title')}
              </h2>
              <div className="space-y-6 text-gray-600 text-base sm:text-lg">
                <p>{t('about.mission.p1')}</p>
                <p>{t('about.mission.p2')}</p>
                <p>{t('about.mission.p3')}</p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-12 lg:aspect-h-16 rounded-2xl overflow-hidden shadow-xl">
                <EventImage
                  alt="Community event in Iraq"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                  category="community"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-2xl">🎉</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('about.whyChoose.title')}
            </h2>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
              {t('about.whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 lg:p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <div className="text-4xl lg:text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('about.team.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="aspect-w-1 aspect-h-1 w-32 h-32 lg:w-40 lg:h-40 mx-auto rounded-full overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <EventImage
                      alt={member.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      category={member.image}
                    />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-purple-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm sm:text-base">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t('about.values.title')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.communityFirst.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.communityFirst.description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.trustSafety.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.trustSafety.description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🌟</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.excellence.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.excellence.description')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🌍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.culturalDiversity.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.culturalDiversity.description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.innovation.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.innovation.description')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.values.items.accessibility.title')}</h3>
                  <p className="text-gray-600">{t('about.values.items.accessibility.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8">
            {t('about.cta.title')}
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 lg:mb-12">
            {t('about.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-md mx-auto">
            <Link
              href="/events"
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-gray-100 hover:shadow-lg transform hover:scale-105 w-full sm:w-auto text-center"
>
              {t('homepage.exploreEvents')}
            </Link>
            <Link
              href="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-white hover:text-purple-600 transform hover:scale-105 w-full sm:w-auto text-center"
>
              {t('dashboard.createEvent')}
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {t('about.contact.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('about.contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.contact.emailSupport')}</h3>
              <p className="text-gray-600">support@iraqevents.com</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.contact.liveChat')}</h3>
              <p className="text-gray-600">{t('about.contact.liveChatAvailability')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.contact.whatsapp')}</h3>
              <p className="text-gray-600">+964 XXX XXX XXXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}