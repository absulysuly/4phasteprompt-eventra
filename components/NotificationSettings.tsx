import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/i18n';
import { notificationService, SubscriptionData } from '../services/notificationService';

interface NotificationPreferences {
  eventReminders: boolean;
  newEvents: boolean;
  eventUpdates: boolean;
  promotions: boolean;
  systemNotifications: boolean;
  reminderTiming: number; // minutes before event
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  weekendNotifications: boolean;
}

export function NotificationSettings() {
  const { t, language } = useLanguage();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    eventReminders: true,
    newEvents: true,
    eventUpdates: true,
    promotions: false,
    systemNotifications: true,
    reminderTiming: 60,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    weekendNotifications: true
  });

  const [notificationStatus, setNotificationStatus] = useState({
    isSupported: false,
    permission: 'default' as NotificationPermission,
    isSubscribed: false,
    subscription: null as PushSubscription | null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initializeNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    await notificationService.initialize();
    const status = notificationService.getSubscriptionStatus();
    setNotificationStatus(status);
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      try {
        const parsedPreferences = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsedPreferences }));
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      }
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      // Save locally
      localStorage.setItem('notification-preferences', JSON.stringify(preferences));

      // Update subscription preferences if subscribed
      if (notificationStatus.isSubscribed) {
        await notificationService.updateNotificationPreferences({
          eventReminders: preferences.eventReminders,
          newEvents: preferences.newEvents,
          eventUpdates: preferences.eventUpdates,
          promotions: preferences.promotions,
          systemNotifications: preferences.systemNotifications
        });
      }

      // Show success message
      showToast(t('notifications.preferencesSaved'), 'success');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showToast(t('notifications.preferencesError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const requestPermission = async () => {
    setLoading(true);
    try {
      const permission = await notificationService.requestPermission();
      
      if (permission === 'granted') {
        await subscribeToNotifications();
      } else {
        showToast(t('notifications.permissionDenied'), 'warning');
      }
      
      setNotificationStatus(notificationService.getSubscriptionStatus());
    } catch (error) {
      console.error('Error requesting permission:', error);
      showToast(t('notifications.permissionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = async () => {
    setLoading(true);
    try {
      const subscription = await notificationService.subscribe('user-123', {
        eventReminders: preferences.eventReminders,
        newEvents: preferences.newEvents,
        eventUpdates: preferences.eventUpdates,
        promotions: preferences.promotions,
        systemNotifications: preferences.systemNotifications
      });

      if (subscription) {
        showToast(t('notifications.subscribed'), 'success');
        setNotificationStatus(notificationService.getSubscriptionStatus());
      } else {
        showToast(t('notifications.subscriptionError'), 'error');
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      showToast(t('notifications.subscriptionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setLoading(true);
    try {
      const success = await notificationService.unsubscribe();
      
      if (success) {
        showToast(t('notifications.unsubscribed'), 'success');
        setNotificationStatus(notificationService.getSubscriptionStatus());
      } else {
        showToast(t('notifications.unsubscribeError'), 'error');
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      showToast(t('notifications.unsubscribeError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      const success = await notificationService.sendNotification({
        id: 'test-notification',
        title: t('notifications.testTitle'),
        body: t('notifications.testBody'),
        tag: 'test-notification',
        timestamp: Date.now(),
        data: {
          type: 'system_update',
          action: 'test'
        }
      });

      if (success) {
        showToast(t('notifications.testSent'), 'success');
      } else {
        showToast(t('notifications.testError'), 'error');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      showToast(t('notifications.testError'), 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleQuietHoursChange = (key: keyof NotificationPreferences['quietHours'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('notifications.settings')}
        </h2>
        <div className="flex gap-2">
          {notificationStatus.isSubscribed && (
            <button
              onClick={testNotification}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {t('notifications.testNotification')}
            </button>
          )}
        </div>
      </div>

      {/* Notification Support Check */}
      {!notificationStatus.isSupported && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-800 dark:text-yellow-200">
              {t('notifications.notSupported')}
            </span>
          </div>
        </div>
      )}

      {/* Permission Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          {t('notifications.permissionStatus')}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              notificationStatus.permission === 'granted' ? 'bg-green-500' :
              notificationStatus.permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t(`notifications.permission.${notificationStatus.permission}`)}
            </span>
          </div>
          
          <div className="flex gap-2">
            {notificationStatus.permission === 'default' && (
              <button
                onClick={requestPermission}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('common.loading') : t('notifications.enableNotifications')}
              </button>
            )}
            
            {notificationStatus.permission === 'granted' && !notificationStatus.isSubscribed && (
              <button
                onClick={subscribeToNotifications}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('common.loading') : t('notifications.subscribe')}
              </button>
            )}
            
            {notificationStatus.isSubscribed && (
              <button
                onClick={unsubscribeFromNotifications}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('common.loading') : t('notifications.unsubscribe')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('notifications.preferences')}
        </h3>

        {/* Basic Notification Types */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.eventReminders')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.eventRemindersDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.eventReminders}
                onChange={(e) => handlePreferenceChange('eventReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.newEvents')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.newEventsDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.newEvents}
                onChange={(e) => handlePreferenceChange('newEvents', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.eventUpdates')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.eventUpdatesDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.eventUpdates}
                onChange={(e) => handlePreferenceChange('eventUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.promotions')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.promotionsDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.promotions}
                onChange={(e) => handlePreferenceChange('promotions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.systemNotifications')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.systemNotificationsDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.systemNotifications}
                onChange={(e) => handlePreferenceChange('systemNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">
            {t('notifications.advancedSettings')}
          </h4>

          {/* Reminder Timing */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('notifications.reminderTiming')}
            </label>
            <select
              value={preferences.reminderTiming}
              onChange={(e) => handlePreferenceChange('reminderTiming', parseInt(e.target.value))}
              disabled={!preferences.eventReminders}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={15}>{t('notifications.15minutes')}</option>
              <option value={30}>{t('notifications.30minutes')}</option>
              <option value={60}>{t('notifications.1hour')}</option>
              <option value={120}>{t('notifications.2hours')}</option>
              <option value={1440}>{t('notifications.1day')}</option>
            </select>
          </div>

          {/* Quiet Hours */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                {t('notifications.quietHours')}
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {t('notifications.quietStart')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {t('notifications.quietEnd')}
                  </label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Weekend Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('notifications.weekendNotifications')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('notifications.weekendNotificationsDesc')}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weekendNotifications}
                onChange={(e) => handlePreferenceChange('weekendNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? t('common.saving') : t('notifications.savePreferences')}
          </button>
        </div>
      </div>
    </div>
  );
}