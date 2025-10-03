import React, { useState } from 'react';
import { DashboardOverview } from './sponsorship/DashboardOverview';
import { CreateCampaign } from './sponsorship/CreateCampaign';
import { ManageCampaigns } from './sponsorship/ManageCampaigns';
import type { Language, User } from '../types';

interface SponsorshipDashboardProps {
  lang: Language;
  currentUser: User;
  onClose: () => void;
}

export type DashboardScreen = 'overview' | 'create-campaign' | 'manage-campaigns';

export const SponsorshipDashboard: React.FC<SponsorshipDashboardProps> = ({
  lang,
  currentUser,
  onClose,
}) => {
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen>('overview');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'overview':
        return (
          <DashboardOverview
            lang={lang}
            currentUser={currentUser}
            onNavigate={setCurrentScreen}
          />
        );
      case 'create-campaign':
        return (
          <CreateCampaign
            lang={lang}
            currentUser={currentUser}
            onBack={() => setCurrentScreen('overview')}
            onComplete={() => setCurrentScreen('manage-campaigns')}
          />
        );
      case 'manage-campaigns':
        return (
          <ManageCampaigns
            lang={lang}
            currentUser={currentUser}
            onBack={() => setCurrentScreen('overview')}
            onCreateNew={() => setCurrentScreen('create-campaign')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {lang === 'en' ? 'Sponsorship Dashboard' : 
               lang === 'ar' ? 'لوحة الرعاية' : 
               'داشبۆردی پشتگیری'}
            </h1>
            <p className="text-blue-100">
              {lang === 'en' ? 'Manage your sponsored posts and campaigns' : 
               lang === 'ar' ? 'إدارة المنشورات والحملات المدعومة' : 
               'بەڕێوەبردنی پۆست و کەمپەینە پشتگیریکراوەکانت'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Pills */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex space-x-4">
            {[
              { key: 'overview', label: { en: 'Overview', ar: 'نظرة عامة', ku: 'سەرەتا' } },
              { key: 'create-campaign', label: { en: 'Create Campaign', ar: 'إنشاء حملة', ku: 'کەمپەین دروستبکە' } },
              { key: 'manage-campaigns', label: { en: 'Manage Campaigns', ar: 'إدارة الحملات', ku: 'بەڕێوەبردنی کەمپەین' } },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setCurrentScreen(tab.key as DashboardScreen)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentScreen === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:text-blue-600 border border-gray-200'
                }`}
              >
                {tab.label[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-hidden">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
};