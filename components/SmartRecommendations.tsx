import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/i18n';
import { recommendationEngine, RecommendationRequest, EventRecommendation, UserPreferences, UserBehavior } from '../services/recommendationEngine';
import { EventCard } from './EventCard';

export function SmartRecommendations() {
  const { t, language } = useLanguage();
  const [recommendations, setRecommendations] = useState<EventRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    initializeRecommendations();
  }, []);

  useEffect(() => {
    if (userPreferences) {
      fetchRecommendations();
    }
  }, [selectedCategory, userPreferences]);

  const initializeRecommendations = async () => {
    await recommendationEngine.initialize();
    
    // Load or create user preferences
    const savedPreferences = loadUserPreferences();
    setUserPreferences(savedPreferences);
    
    await fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    
    try {
      const request: RecommendationRequest = {
        userId: 'demo-user',
        userPreferences: userPreferences || undefined,
        userBehavior: generateMockUserBehavior(),
        location: { latitude: 36.1911, longitude: 44.0093 }, // Erbil coordinates
        contextualFactors: {
          currentTime: new Date(),
          weather: 'sunny',
          socialContext: 'leisure'
        },
        limit: selectedCategory === 'all' ? 12 : 8,
        includeReasonings: true
      };

      const response = await recommendationEngine.getRecommendations(request);
      
      let filteredRecommendations = response.recommendations;
      
      if (selectedCategory !== 'all') {
        filteredRecommendations = response.recommendations.filter(
          rec => rec.category === selectedCategory
        );
      }
      
      setRecommendations(filteredRecommendations);
      setInsights(response.insights);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Show fallback recommendations
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = (): UserPreferences => {
    const saved = localStorage.getItem('user-preferences');
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }
    
    // Default preferences
    const defaultPreferences: UserPreferences = {
      categories: ['Technology', 'Music', 'Food'],
      priceRange: { min: 0, max: 100 },
      preferredTimes: ['evening', 'afternoon'],
      preferredDays: ['weekend'],
      locations: ['Erbil', 'Sulaymaniyah'],
      languages: ['English', 'Kurdish'],
      groupSize: 'couple',
      interests: ['innovation', 'culture', 'networking']
    };
    
    localStorage.setItem('user-preferences', JSON.stringify(defaultPreferences));
    return defaultPreferences;
  };

  const generateMockUserBehavior = (): UserBehavior => {
    return {
      viewedEvents: ['1', '3', '5', '7', '9'],
      registeredEvents: ['2', '6'],
      searchQueries: ['tech conference', 'music festival', 'food event'],
      favoriteCategories: [
        { category: 'Technology', score: 0.8 },
        { category: 'Music', score: 0.6 },
        { category: 'Food', score: 0.4 },
        { category: 'Arts', score: 0.3 }
      ],
      averageEventDuration: 3,
      preferredEventSize: 'medium',
      seasonalPreferences: [
        { season: 'summer', categories: ['Music', 'Outdoor'] },
        { season: 'winter', categories: ['Technology', 'Indoor'] }
      ],
      timeOfDayPreferences: [
        { time: 'evening', weight: 0.8 },
        { time: 'afternoon', weight: 0.6 }
      ]
    };
  };

  const updateUserPreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...newPreferences } as UserPreferences;
    setUserPreferences(updated);
    localStorage.setItem('user-preferences', JSON.stringify(updated));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'perfect_match':
        return '🎯';
      case 'similar_interests':
        return '👥';
      case 'trending':
        return '🔥';
      case 'seasonal':
        return '🌟';
      case 'location_based':
        return '📍';
      case 'time_sensitive':
        return '⏰';
      case 'discovery':
        return '🔍';
      default:
        return '✨';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'perfect_match':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'similar_interests':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'trending':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'seasonal':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'location_based':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'time_sensitive':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'discovery':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('recommendations.analyzing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('recommendations.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('recommendations.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('recommendations.all')}</option>
            <option value="perfect_match">{t('recommendations.perfectMatch')}</option>
            <option value="similar_interests">{t('recommendations.similarInterests')}</option>
            <option value="trending">{t('recommendations.trending')}</option>
            <option value="discovery">{t('recommendations.discovery')}</option>
            <option value="time_sensitive">{t('recommendations.timeSensitive')}</option>
          </select>
          
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showInsights ? t('common.hideInsights') : t('common.showInsights')}
          </button>
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && insights && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('recommendations.insights')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                {t('recommendations.dominantCategories')}
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-400">
                {insights.dominantCategories.join(', ')}
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                {t('recommendations.suggestedNew')}
              </h4>
              <div className="text-sm text-green-700 dark:text-green-400">
                {insights.suggestedNewCategories.join(', ')}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">
                {t('recommendations.locationInsights')}
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400">
                {insights.locationInsights.join(', ')}
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-2">
                {t('recommendations.behavioralPattern')}
              </h4>
              <div className="text-sm text-orange-700 dark:text-orange-400">
                {insights.behavioralPattern}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation, index) => (
            <div key={recommendation.event.id} className="relative group">
              {/* Recommendation Badge */}
              <div className="absolute top-2 left-2 z-10 flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(recommendation.category)}`}>
                  {getCategoryIcon(recommendation.category)} {t(`recommendations.category.${recommendation.category}`)}
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {Math.round(recommendation.score * 100)}%
                </span>
              </div>
              
              {/* Event Card */}
              <EventCard event={recommendation.event} />
              
              {/* Reasoning */}
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{t('recommendations.why')}</span> {recommendation.reasoning}
                </p>
                
                {/* Confidence Score */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{t('recommendations.confidence')}: {Math.round(recommendation.confidence * 100)}%</span>
                  <div className="flex gap-2">
                    <span title={t('recommendations.factors.category')}>{Math.round(recommendation.factors.categoryMatch * 100)}%</span>
                    <span title={t('recommendations.factors.location')}>{Math.round(recommendation.factors.locationProximity * 100)}%</span>
                    <span title={t('recommendations.factors.time')}>{Math.round(recommendation.factors.timePreference * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('recommendations.noResults')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('recommendations.noResultsDesc')}
          </p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('recommendations.showAll')}
          </button>
        </div>
      )}

      {/* Preference Tuning */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('recommendations.tunePreferences')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('recommendations.priceRange')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={userPreferences?.priceRange.min || 0}
                onChange={(e) => updateUserPreferences({
                  priceRange: { ...userPreferences!.priceRange, min: parseInt(e.target.value) || 0 }
                })}
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
              <span className="text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                value={userPreferences?.priceRange.max || 100}
                onChange={(e) => updateUserPreferences({
                  priceRange: { ...userPreferences!.priceRange, max: parseInt(e.target.value) || 100 }
                })}
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
            </div>
          </div>
          
          {/* Group Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('recommendations.groupSize')}
            </label>
            <select
              value={userPreferences?.groupSize || 'couple'}
              onChange={(e) => updateUserPreferences({ groupSize: e.target.value as any })}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="solo">{t('recommendations.solo')}</option>
              <option value="couple">{t('recommendations.couple')}</option>
              <option value="family">{t('recommendations.family')}</option>
              <option value="group">{t('recommendations.group')}</option>
            </select>
          </div>
          
          {/* Preferred Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('recommendations.preferredTimes')}
            </label>
            <div className="flex flex-wrap gap-2">
              {['morning', 'afternoon', 'evening', 'night'].map(time => (
                <label key={time} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userPreferences?.preferredTimes.includes(time) || false}
                    onChange={(e) => {
                      const times = userPreferences?.preferredTimes || [];
                      if (e.target.checked) {
                        updateUserPreferences({ preferredTimes: [...times, time] });
                      } else {
                        updateUserPreferences({ preferredTimes: times.filter(t => t !== time) });
                      }
                    }}
                    className="mr-1 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t(`recommendations.time.${time}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('common.loading') : t('recommendations.refresh')}
        </button>
      </div>
    </div>
  );
}