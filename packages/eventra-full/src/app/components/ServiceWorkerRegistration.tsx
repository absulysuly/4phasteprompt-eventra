"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // DISABLED: Keep as web page for now, not PWA
    return;
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('✅ Service Worker registered successfully:', registration);
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, refresh to update
                  console.log('🔄 New content available, refreshing...');
                  window.location.reload();
                }
              });
            }
          });
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      });
    }
  }, []);

  return null; // This component doesn't render anything
}