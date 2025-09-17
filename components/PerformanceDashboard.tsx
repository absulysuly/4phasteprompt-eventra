import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/i18n';
import { performanceService, PerformanceReport, PerformanceMetrics } from '../services/performanceService';

export function PerformanceDashboard() {
  const { t, language } = useLanguage();
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    initializePerformanceMonitoring();
    return () => {
      performanceService.cleanup();
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(generateNewReport, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const initializePerformanceMonitoring = () => {
    performanceService.initialize((newReport) => {
      setReport(newReport);
      setHistoricalData(prev => [...prev.slice(-19), newReport.metrics]); // Keep last 20 entries
    });
    
    setIsMonitoring(true);
    generateNewReport();
    
    // Start real-time monitoring
    performanceService.startRealTimeMonitoring();
    
    // Apply optimizations
    performanceService.optimizeImageLoading();
    performanceService.addResourceHints();
  };

  const generateNewReport = () => {
    const newReport = performanceService.generateReport();
    setReport(newReport);
    setHistoricalData(prev => [...prev.slice(-19), newReport.metrics]);
  };

  const getMetricColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value <= thresholds.good) return 'text-green-600 dark:text-green-400';
    if (value <= thresholds.fair) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!report) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
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
            {t('performance.dashboard')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('performance.subtitle')}
          </p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {t('performance.autoRefresh')}
            </span>
          </label>
          
          <button
            onClick={generateNewReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('performance.refresh')}
          </button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('performance.overallScore')}
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {report.score}
            </div>
            <div className={`w-12 h-12 ${getGradeColor(report.grade)} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
              {report.grade}
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              report.score >= 90 ? 'bg-green-500' :
              report.score >= 80 ? 'bg-blue-500' :
              report.score >= 70 ? 'bg-yellow-500' :
              report.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${report.score}%` }}
          ></div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('performance.lastUpdated')}: {new Date(report.metrics.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LCP */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('performance.lcp')}
            </h4>
            <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
              Core Web Vital
            </div>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(report.metrics.LCP || 0, { good: 2500, fair: 4000 })}`}>
            {report.metrics.LCP ? formatTime(report.metrics.LCP) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('performance.lcpDesc')}
          </div>
          <div className="mt-3 text-xs">
            <span className="text-green-600 dark:text-green-400">≤ 2.5s {t('performance.good')}</span> • 
            <span className="text-yellow-600 dark:text-yellow-400 ml-1">≤ 4.0s {t('performance.fair')}</span> • 
            <span className="text-red-600 dark:text-red-400 ml-1">> 4.0s {t('performance.poor')}</span>
          </div>
        </div>

        {/* FID */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('performance.fid')}
            </h4>
            <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
              Core Web Vital
            </div>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(report.metrics.FID || 0, { good: 100, fair: 300 })}`}>
            {report.metrics.FID ? `${report.metrics.FID.toFixed(0)}ms` : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('performance.fidDesc')}
          </div>
          <div className="mt-3 text-xs">
            <span className="text-green-600 dark:text-green-400">≤ 100ms {t('performance.good')}</span> • 
            <span className="text-yellow-600 dark:text-yellow-400 ml-1">≤ 300ms {t('performance.fair')}</span> • 
            <span className="text-red-600 dark:text-red-400 ml-1">> 300ms {t('performance.poor')}</span>
          </div>
        </div>

        {/* CLS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {t('performance.cls')}
            </h4>
            <div className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded">
              Core Web Vital
            </div>
          </div>
          <div className={`text-2xl font-bold ${getMetricColor(report.metrics.CLS || 0, { good: 0.1, fair: 0.25 })}`}>
            {report.metrics.CLS ? report.metrics.CLS.toFixed(3) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('performance.clsDesc')}
          </div>
          <div className="mt-3 text-xs">
            <span className="text-green-600 dark:text-green-400">≤ 0.1 {t('performance.good')}</span> • 
            <span className="text-yellow-600 dark:text-yellow-400 ml-1">≤ 0.25 {t('performance.fair')}</span> • 
            <span className="text-red-600 dark:text-red-400 ml-1">> 0.25 {t('performance.poor')}</span>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
            {t('performance.fcp')}
          </h5>
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {report.metrics.FCP ? formatTime(report.metrics.FCP) : 'N/A'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
            {t('performance.ttfb')}
          </h5>
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {report.metrics.TTFB ? formatTime(report.metrics.TTFB) : 'N/A'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
            {t('performance.jsSize')}
          </h5>
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {report.metrics.jsSize ? formatBytes(report.metrics.jsSize) : 'N/A'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
            {t('performance.memoryUsage')}
          </h5>
          <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
            {report.metrics.memoryUsage ? `${(report.metrics.memoryUsage * 100).toFixed(1)}%` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Performance History Chart */}
      {historicalData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('performance.history')}
          </h3>
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox="0 0 400 160">
              <defs>
                <linearGradient id="lcpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* LCP Line Chart */}
              <path
                d={`M ${historicalData.map((data, index) => {
                  const x = (index / (historicalData.length - 1)) * 380 + 10;
                  const y = 150 - ((data.LCP || 0) / 5000) * 140;
                  return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}`}
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
              />
              
              {/* Data points */}
              {historicalData.map((data, index) => {
                const x = (index / (historicalData.length - 1)) * 380 + 10;
                const y = 150 - ((data.LCP || 0) / 5000) * 140;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#3B82F6"
                  />
                );
              })}
              
              {/* Good/Fair/Poor thresholds */}
              <line x1="10" y1="108" x2="390" y2="108" stroke="#10B981" strokeDasharray="2,2" opacity="0.5"/>
              <line x1="10" y1="38" x2="390" y2="38" stroke="#F59E0B" strokeDasharray="2,2" opacity="0.5"/>
              
              <text x="395" y="112" className="text-xs fill-green-600 dark:fill-green-400">2.5s</text>
              <text x="395" y="42" className="text-xs fill-yellow-600 dark:fill-yellow-400">4.0s</text>
            </svg>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('performance.recommendations')}
          </h3>
          <div className="space-y-4">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rec.title}
                  </h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {t(`performance.impact.${rec.impact}`)}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                      {t(`performance.category.${rec.category}`)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {rec.description}
                </p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    {t('performance.implementationGuide')}
                  </summary>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4">
                    {rec.implementationGuide}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('performance.networkInfo')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('performance.connectionType')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {report.metrics.networkSpeed?.toUpperCase() || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('performance.onlineStatus')}</span>
              <span className={`font-medium ${report.metrics.isOffline ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {report.metrics.isOffline ? t('performance.offline') : t('performance.online')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('performance.optimizations')}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => performanceService.lazyLoadImages()}
              className="w-full text-left px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              {t('performance.enableLazyLoading')}
            </button>
            <button
              onClick={() => performanceService.preloadCriticalResources(['/api/events', '/api/users'])}
              className="w-full text-left px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              {t('performance.preloadCriticalResources')}
            </button>
            <button
              onClick={() => performanceService.setupServiceWorkerCache()}
              className="w-full text-left px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              {t('performance.enableCaching')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}