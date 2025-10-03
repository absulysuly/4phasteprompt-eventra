import React from 'react';
import type { Language, User } from '../../types';
import type { DashboardScreen } from '../SponsorshipDashboard';

interface DashboardOverviewProps {
  lang: Language;
  currentUser: User;
  onNavigate: (screen: DashboardScreen) => void;
}

interface CampaignSummary {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  budgetSpent: number;
  budgetTotal: number;
  startDate: string;
  endDate: string;
}

// Mock data for demo
const mockCampaigns: CampaignSummary[] = [
  {
    id: '1',
    name: 'Baghdad Food Festival Promotion',
    status: 'active',
    impressions: 15420,
    clicks: 892,
    budgetSpent: 45.80,
    budgetTotal: 100.00,
    startDate: '2025-09-15',
    endDate: '2025-10-15'
  },
  {
    id: '2',
    name: 'Tech Conference Sponsorship',
    status: 'active',
    impressions: 8934,
    clicks: 456,
    budgetSpent: 78.50,
    budgetTotal: 150.00,
    startDate: '2025-09-20',
    endDate: '2025-10-20'
  },
  {
    id: '3',
    name: 'Cultural Event Spotlight',
    status: 'completed',
    impressions: 22100,
    clicks: 1340,
    budgetSpent: 200.00,
    budgetTotal: 200.00,
    startDate: '2025-08-01',
    endDate: '2025-09-01'
  }
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  lang,
  currentUser,
  onNavigate,
}) => {
  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
  const totalImpressions = mockCampaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = mockCampaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.budgetSpent, 0);
  const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budgetTotal, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      active: { en: 'Active', ar: 'نشط', ku: 'چالاک' },
      paused: { en: 'Paused', ar: 'متوقف', ku: 'وەستاو' },
      completed: { en: 'Completed', ar: 'مكتمل', ku: 'تەواو' }
    };
    return statusMap[status as keyof typeof statusMap]?.[lang] || status;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'en' ? `Welcome back, ${currentUser.name}!` : 
             lang === 'ar' ? `مرحباً بعودتك، ${currentUser.name}!` : 
             `بەخێربێیتەوە، ${currentUser.name}!`}
          </h2>
          <p className="text-gray-600">
            {lang === 'en' ? "Here's an overview of your sponsorship campaigns" : 
             lang === 'ar' ? 'إليك نظرة عامة على حملات الرعاية الخاصة بك' : 
             'ئەمە پوختەیەکە لە کەمپەینە پشتگیریکراوەکانت'}
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {lang === 'en' ? 'Active Campaigns' : 
                   lang === 'ar' ? 'الحملات النشطة' : 
                   'کەمپەینە چالاکەکان'}
                </p>
                <p className="text-3xl font-bold text-blue-600">{activeCampaigns.length}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {lang === 'en' ? 'Total Impressions' : 
                   lang === 'ar' ? 'إجمالي المشاهدات' : 
                   'کۆی بینینەکان'}
                </p>
                <p className="text-3xl font-bold text-green-600">{totalImpressions.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {lang === 'en' ? 'Total Clicks' : 
                   lang === 'ar' ? 'إجمالي النقرات' : 
                   'کۆی کلیکەکان'}
                </p>
                <p className="text-3xl font-bold text-purple-600">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {lang === 'en' ? 'Budget Spent' : 
                   lang === 'ar' ? 'الميزانية المستخدمة' : 
                   'بودجەی خەرجکراو'}
                </p>
                <p className="text-3xl font-bold text-orange-600">${totalSpent.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {lang === 'en' ? `of $${totalBudget.toFixed(2)}` : 
                   lang === 'ar' ? `من $${totalBudget.toFixed(2)}` : 
                   `لە $${totalBudget.toFixed(2)}`}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {lang === 'en' ? 'Quick Actions' : 
             lang === 'ar' ? 'إجراءات سريعة' : 
             'کردەوە خێراکان'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('create-campaign')}
              className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <div className="text-left">
                <div className="font-semibold">
                  {lang === 'en' ? 'Create New Campaign' : 
                   lang === 'ar' ? 'إنشاء حملة جديدة' : 
                   'کەمپەینی نوێ دروستبکە'}
                </div>
                <div className="text-sm text-blue-100">
                  {lang === 'en' ? 'Start promoting your events' : 
                   lang === 'ar' ? 'ابدأ في الترويج لأحداثك' : 
                   'دەست بە پڕۆمۆتکردنی بۆنەکانت بکە'}
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('manage-campaigns')}
              className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-left">
                <div className="font-semibold">
                  {lang === 'en' ? 'View Reports' : 
                   lang === 'ar' ? 'عرض التقارير' : 
                   'ڕاپۆرتەکان ببینە'}
                </div>
                <div className="text-sm text-green-100">
                  {lang === 'en' ? 'Analyze campaign performance' : 
                   lang === 'ar' ? 'تحليل أداء الحملة' : 
                   'شیکردنەوەی ئەدای کەمپەین'}
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('manage-campaigns')}
              className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="text-left">
                <div className="font-semibold">
                  {lang === 'en' ? 'Manage Posts' : 
                   lang === 'ar' ? 'إدارة المنشورات' : 
                   'بەڕێوەبردنی پۆست'}
                </div>
                <div className="text-sm text-purple-100">
                  {lang === 'en' ? 'Edit and optimize campaigns' : 
                   lang === 'ar' ? 'تحرير وتحسين الحملات' : 
                   'دەستکاری و باشترکردنی کەمپەین'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {lang === 'en' ? 'Recent Campaigns' : 
               lang === 'ar' ? 'الحملات الأخيرة' : 
               'کەمپەینە نوێکان'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Campaign' : lang === 'ar' ? 'الحملة' : 'کەمپەین'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Status' : lang === 'ar' ? 'الحالة' : 'دۆخ'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Impressions' : lang === 'ar' ? 'المشاهدات' : 'بینین'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Clicks' : lang === 'ar' ? 'النقرات' : 'کلیک'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {lang === 'en' ? 'Budget' : lang === 'ar' ? 'الميزانية' : 'بودجە'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockCampaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${campaign.budgetSpent.toFixed(2)} / ${campaign.budgetTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {lang === 'en' ? 'Pro Tip' : lang === 'ar' ? 'نصيحة احترافية' : 'ئامۆژگاری پیشەیی'}
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                {lang === 'en' 
                  ? 'Your campaigns are performing well! Consider increasing your budget for the Baghdad Food Festival to reach even more people.'
                  : lang === 'ar' 
                  ? 'حملاتك تعمل بشكل جيد! فكر في زيادة ميزانيتك لمهرجان بغداد للطعام للوصول إلى المزيد من الناس.'
                  : 'کەمپەینەکانت زۆر باشن! بیر لە زیادکردنی بودجەکەت بکەرەوە بۆ فێستیڤاڵی خواردنی بەغداد بۆ گەیشتن بە زیاتر کەس.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};