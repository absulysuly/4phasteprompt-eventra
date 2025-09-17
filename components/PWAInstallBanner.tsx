import React, { useState, useEffect } from 'react';
import type { Language } from '@/types';

interface PWAInstallBannerProps {
  lang: Language;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone;
    setIsIOS(iOS && !isInStandaloneMode);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner for iOS after 2 seconds
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => setShowBanner(true), 2000);
    }

    // Hide banner if app is already installed
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('🎉 User installed the PWA');
        } else {
          console.log('❌ User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowBanner(false);
      } catch (error) {
        console.error('Error installing PWA:', error);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember user dismissed it for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if dismissed this session or already installed
  if (!showBanner || sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  const getTexts = () => {
    switch (lang) {
      case 'ar':
        return {
          title: '📱 حمّل تطبيق إيفنترا!',
          subtitle: 'احصل على تجربة أفضل مع التطبيق المجاني',
          installButton: isInstalling ? 'جاري التحميل...' : 'تحميل التطبيق',
          iosInstructions: 'انقر على زر المشاركة ↗️ ثم "إضافة إلى الشاشة الرئيسية"',
          benefits: 'عمل بدون إنترنت • تحميل سريع • تنبيهات فورية',
          dismiss: 'إغلاق'
        };
      case 'ku':
        return {
          title: '📱 ئەپی ئیڤینترا دابەزێنە!',
          subtitle: 'ئەزموونێکی باشتر بەدەست بهێنە بە ئەپە خۆڕاییەکە',
          installButton: isInstalling ? 'دابەزاندن...' : 'دابەزاندنی ئەپ',
          iosInstructions: 'کلیک لە دوگمەی هاوبەشکردن بکە ↗️ پاشان "زیادکردن بۆ سکرینی سەرەکی"',
          benefits: 'کارکردن بەبێ ئینتەرنێت • خێراتر • ئاگاداری خێرا',
          dismiss: 'داخستن'
        };
      default:
        return {
          title: '📱 Download Eventra App!',
          subtitle: 'Get the best experience with our free app',
          installButton: isInstalling ? 'Installing...' : 'Download App',
          iosInstructions: 'Tap the Share button ↗️ then "Add to Home Screen"',
          benefits: 'Works Offline • Faster Loading • Instant Notifications',
          dismiss: 'Dismiss'
        };
    }
  };

  const texts = getTexts();

  if (isIOS) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg animate-fade-in">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">📱</div>
            <div>
              <div className="font-bold text-lg">{texts.title}</div>
              <div className="text-blue-100 text-sm">{texts.iosInstructions}</div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white text-xl font-bold p-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left Content */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="text-4xl animate-pulse">📱</div>
            <div className="flex-1">
              <div className="font-bold text-xl mb-1">{texts.title}</div>
              <div className="text-indigo-100 text-sm mb-2">{texts.subtitle}</div>
              <div className="text-xs text-indigo-200 flex items-center space-x-1">
                <span>✨</span>
                <span>{texts.benefits}</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isInstalling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                  <span>{texts.installButton}</span>
                </>
              ) : (
                <>
                  <span>⬇️</span>
                  <span>{texts.installButton}</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-indigo-200 hover:text-white text-xl font-bold p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="mt-3 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div className="h-full bg-white bg-opacity-40 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Mobile responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          .flex-wrap {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};