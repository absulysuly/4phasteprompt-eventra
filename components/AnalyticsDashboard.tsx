import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/i18n';

interface AnalyticsData {
  totalEvents: number;
  totalUsers: number;
  totalRevenue: number;
  eventViews: number;
  registrations: number;
  conversionRate: number;
  popularCategories: { name: string; count: number; percentage: number }[];
  monthlyData: { month: string; events: number; users: number; revenue: number }[];
  userEngagement: {
    avgSessionDuration: string;
    bounceRate: number;
    returnUserRate: number;
    dailyActiveUsers: number;
  };
  eventPerformance: {
    topEvents: { name: string; views: number; registrations: number }[];
    avgTicketPrice: number;
    totalTicketsSold: number;
  };
  geographicData: { city: string; users: number; events: number }[];
  realTimeMetrics: {
    currentActiveUsers: number;
    todayRegistrations: number;
    todayRevenue: number;
  };
}

export function AnalyticsDashboard() {
  const { t, language } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    // Simulate API call with realistic data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      totalEvents: 1247,
      totalUsers: 8456,
      totalRevenue: 125670,
      eventViews: 45623,
      registrations: 3421,
      conversionRate: 7.5,
      popularCategories: [
        { name: 'Music', count: 342, percentage: 27.4 },
        { name: 'Technology', count: 289, percentage: 23.2 },
        { name: 'Sports', count: 198, percentage: 15.9 },
        { name: 'Food', count: 156, percentage: 12.5 },
        { name: 'Arts', count: 123, percentage: 9.9 },
        { name: 'Education', count: 89, percentage: 7.1 },
        { name: 'Other', count: 50, percentage: 4.0 }
      ],
      monthlyData: [
        { month: 'Jan', events: 89, users: 567, revenue: 8450 },
        { month: 'Feb', events: 125, users: 743, revenue: 11230 },
        { month: 'Mar', events: 156, users: 892, revenue: 13450 },
        { month: 'Apr', events: 134, users: 1021, revenue: 15670 },
        { month: 'May', events: 167, users: 1156, revenue: 17890 },
        { month: 'Jun', events: 189, users: 1298, revenue: 19450 }
      ],
      userEngagement: {
        avgSessionDuration: '4m 32s',
        bounceRate: 23.4,
        returnUserRate: 68.2,
        dailyActiveUsers: 1234
      },
      eventPerformance: {
        topEvents: [
          { name: 'Tech Summit 2024', views: 2345, registrations: 456 },
          { name: 'Music Festival', views: 1987, registrations: 389 },
          { name: 'Food & Wine Expo', views: 1654, registrations: 321 },
          { name: 'Art Gallery Opening', views: 1234, registrations: 267 },
          { name: 'Sports Championship', views: 1098, registrations: 245 }
        ],
        avgTicketPrice: 36.75,
        totalTicketsSold: 3421
      },
      geographicData: [
        { city: 'Erbil', users: 2456, events: 456 },
        { city: 'Sulaymaniyah', users: 1987, events: 342 },
        { city: 'Duhok', users: 1456, events: 289 },
        { city: 'Baghdad', users: 1234, events: 198 },
        { city: 'Basra', users: 987, events: 156 }
      ],
      realTimeMetrics: {
        currentActiveUsers: 156,
        todayRegistrations: 23,
        todayRevenue: 890
      }
    };

    setAnalyticsData(mockData);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
                  <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            {t('analytics.dashboard')}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">{t('analytics.last7Days')}</option>
              <option value="30d">{t('analytics.last30Days')}</option>
              <option value="90d">{t('analytics.last90Days')}</option>
              <option value="1y">{t('analytics.lastYear')}</option>
            </select>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">{t('analytics.overview')}</option>
              <option value="events">{t('analytics.events')}</option>
              <option value="users">{t('analytics.users')}</option>
              <option value="revenue">{t('analytics.revenue')}</option>
            </select>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-4">{t('analytics.realTime')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{analyticsData.realTimeMetrics.currentActiveUsers}</div>
              <div className="text-blue-100">{t('analytics.activeUsers')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{analyticsData.realTimeMetrics.todayRegistrations}</div>
              <div className="text-blue-100">{t('analytics.todayRegistrations')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{formatCurrency(analyticsData.realTimeMetrics.todayRevenue)}</div>
              <div className="text-blue-100">{t('analytics.todayRevenue')}</div>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('analytics.totalEvents')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(analyticsData.totalEvents)}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              +12% {t('analytics.fromLastMonth')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('analytics.totalUsers')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(analyticsData.totalUsers)}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              +23% {t('analytics.fromLastMonth')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('analytics.totalRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(analyticsData.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              +18% {t('analytics.fromLastMonth')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{t('analytics.conversionRate')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.conversionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              +5% {t('analytics.fromLastMonth')}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trends Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.monthlyTrends')}
            </h3>
            <div className="h-64 relative">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {analyticsData.monthlyData.map((data, index) => (
                  <g key={data.month}>
                    <rect
                      x={index * 60 + 20}
                      y={200 - (data.events / Math.max(...analyticsData.monthlyData.map(d => d.events)) * 160)}
                      width={40}
                      height={(data.events / Math.max(...analyticsData.monthlyData.map(d => d.events)) * 160)}
                      fill="url(#gradient)"
                    />
                    <text
                      x={index * 60 + 40}
                      y={190}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 dark:fill-gray-400"
                    >
                      {data.month}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.popularCategories')}
            </h3>
            <div className="space-y-3">
              {analyticsData.popularCategories.map((category, index) => (
                <div key={category.name} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                    {t(`categories.${category.name.toLowerCase()}`)}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {category.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Engagement */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.userEngagement')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analyticsData.userEngagement.avgSessionDuration}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('analytics.avgSessionDuration')}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analyticsData.userEngagement.returnUserRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('analytics.returnUserRate')}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {analyticsData.userEngagement.bounceRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('analytics.bounceRate')}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(analyticsData.userEngagement.dailyActiveUsers)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('analytics.dailyActiveUsers')}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Events */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.topEvents')}
            </h3>
            <div className="space-y-3">
              {analyticsData.eventPerformance.topEvents.map((event, index) => (
                <div key={event.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{event.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatNumber(event.views)} {t('analytics.views')} • {formatNumber(event.registrations)} {t('analytics.registrations')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {((event.registrations / event.views) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('analytics.conversionRate')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Data */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.geographicDistribution')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.geographicData.map((location) => (
              <div key={location.city} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{location.city}</h4>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {((location.users / analyticsData.totalUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatNumber(location.users)} {t('analytics.users')} • {formatNumber(location.events)} {t('analytics.events')}
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(location.users / Math.max(...analyticsData.geographicData.map(l => l.users))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export & Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('analytics.exportData')}
          </h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('analytics.exportPDF')}
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {t('analytics.exportExcel')}
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              {t('analytics.scheduleReport')}
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              {t('analytics.shareReport')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}