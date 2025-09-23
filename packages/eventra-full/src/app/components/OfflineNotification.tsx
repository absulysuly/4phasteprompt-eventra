"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '../hooks/useTranslations';

export default function OfflineNotification() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 mx-auto max-w-md`}>
      <div className={`
        p-4 rounded-lg shadow-xl border-2 backdrop-blur-md
        ${isOnline 
          ? 'bg-green-500 border-green-400 text-white' 
          : 'bg-amber-500 border-amber-400 text-white'
        }
        transform transition-all duration-300 animate-slide-down
      `}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {isOnline ? '🌐' : '📱'}
          </div>
          <div className="flex-1">
            <h4 className="font-bold">
              {isOnline 
                ? t('offline.backOnline', 'Back Online!') 
                : t('offline.offlineMode', 'Offline Mode')
              }
            </h4>
            <p className="text-sm opacity-90">
              {isOnline 
                ? t('offline.syncingData', 'Syncing latest data...')
                : t('offline.useOffline', 'App works offline! Browse saved events.')
              }
            </p>
          </div>
          {isOnline && (
            <button
              onClick={() => setShowNotification(false)}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}