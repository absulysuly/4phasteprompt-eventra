import React, { useState, useEffect } from 'react';
import type { Language } from '@/types';

interface FloatingInstallButtonProps {
  lang: Language;
}

export const FloatingInstallButton: React.FC<FloatingInstallButtonProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Show floating button after banner is dismissed or 10 seconds delay
    const showFloatingButton = () => {
      // Only show if banner was dismissed or after delay
      if (sessionStorage.getItem('pwa-banner-dismissed') || window.innerWidth < 768) {
        setTimeout(() => setShowButton(true), 5000); // Show after 5 seconds
      } else {
        setTimeout(() => setShowButton(true), 15000); // Show after 15 seconds if banner not dismissed
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      showFloatingButton();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setShowButton(false);
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
          console.log('🎉 User installed the PWA from floating button');
        }
        
        setDeferredPrompt(null);
        setShowButton(false);
      } catch (error) {
        console.error('Error installing PWA:', error);
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    // Remember dismissed for longer period
    localStorage.setItem('floating-install-dismissed', Date.now().toString());
  };

  // Don't show if dismissed recently (within 24 hours)
  const dismissedTime = localStorage.getItem('floating-install-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showButton || !deferredPrompt) {
    return null;
  }

  const getTexts = () => {
    switch (lang) {
      case 'ar':
        return {
          install: 'حمّل الآن',
          tooltip: 'حمّل تطبيق إيفنترا المجاني'
        };
      case 'ku':
        return {
          install: 'دابەزێنە',
          tooltip: 'ئەپی ئیڤینترای خۆڕایی دابەزێنە'
        };
      default:
        return {
          install: 'Install',
          tooltip: 'Download free Eventra app'
        };
    }
  };

  const texts = getTexts();

  return (
    <div className="fixed bottom-6 right-6 z-40 group">
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          {texts.tooltip}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Main Install Button */}
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="relative bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
        style={{
          background: isInstalling 
            ? 'linear-gradient(45deg, #6366f1, #8b5cf6)' 
            : 'linear-gradient(45deg, #4f46e5, #ec4899)',
          minWidth: '64px',
          minHeight: '64px'
        }}
      >
        {isInstalling ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">📱</span>
            <span className="text-xs font-bold">{texts.install}</span>
          </div>
        )}

        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 animate-ping"></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 blur-lg transform scale-110"></div>
      </button>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -left-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors duration-200 opacity-70 hover:opacity-100"
      >
        ✕
      </button>

      {/* Bouncing animation keyframe */}
      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        .group:hover {
          animation: bounce-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};