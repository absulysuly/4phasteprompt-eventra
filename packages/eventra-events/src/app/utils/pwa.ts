export const isPWAInstalled = (): boolean => {
  // Check if running in standalone mode (PWA installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as typeof navigator & { standalone?: boolean }).standalone === true;
  
  return isStandalone || isIOSStandalone;
};

export const isPWASupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPWASupported()) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('ServiceWorker registration successful');
    
    // Update the service worker on reload
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, prompt user to refresh
            if (window.confirm('New version available! Click OK to refresh.')) {
              window.location.reload();
            }
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.log('ServiceWorker registration failed:', error);
    return null;
  }
};

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isPWASupported()) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    return true;
  } catch (error) {
    console.log('ServiceWorker unregistration failed:', error);
    return false;
  }
};

export const showInstallPromotion = (): boolean => {
  // Don't show if already installed
  if (isPWAInstalled()) {
    return false;
  }

  // Don't show if user dismissed it recently
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  if (dismissed) {
    const dismissTime = new Date(dismissed);
    const now = new Date();
    const daysSinceDismiss = (now.getTime() - dismissTime.getTime()) / (1000 * 3600 * 24);
    
    // Don't show again for 7 days
    if (daysSinceDismiss < 7) {
      return false;
    }
  }

  return true;
};

export const dismissInstallPromotion = (): void => {
  localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
};