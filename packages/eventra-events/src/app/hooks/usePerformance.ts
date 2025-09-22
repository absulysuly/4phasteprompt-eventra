'use client';

import { useState, useEffect, useCallback } from 'react';

// Network connection status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast'>('fast');

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof navigator === 'undefined') return;

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    // Network connection listener
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Connection speed detection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const updateConnectionSpeed = () => {
        const speed = connection.effectiveType;
        setConnectionSpeed(speed === 'slow-2g' || speed === '2g' || speed === '3g' ? 'slow' : 'fast');
      };
      
      connection.addEventListener('change', updateConnectionSpeed);
      updateConnectionSpeed(); // Initial check

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
        connection.removeEventListener('change', updateConnectionSpeed);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return { isOnline, connectionSpeed };
}

// Image preloader hook
export function useImagePreloader() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(src)) {
        resolve(src);
        return;
      }

      if (loadingImages.has(src)) {
        // If already loading, wait for it
        const checkLoaded = () => {
          if (loadedImages.has(src)) {
            resolve(src);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      setLoadingImages(prev => new Set([...prev, src]));

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, src]));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        resolve(src);
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(src);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }, [loadedImages, loadingImages]);

  const preloadImages = useCallback(async (srcs: string[]) => {
    const promises = srcs.map(src => preloadImage(src).catch(() => null));
    return Promise.allSettled(promises);
  }, [preloadImage]);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageLoading = useCallback((src: string) => {
    return loadingImages.has(src);
  }, [loadingImages]);

  return {
    preloadImage,
    preloadImages,
    isImageLoaded,
    isImageLoading,
    loadedImages: Array.from(loadedImages),
    loadingImages: Array.from(loadingImages)
  };
}

// Performance observer hook for monitoring loading performance
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Monitor navigation timing
    const updateNavigationMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        }));
      }
    };

    // Monitor paint timing
    const updatePaintMetrics = () => {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({
            ...prev,
            firstContentfulPaint: entry.startTime
          }));
        }
      });
    };

    const observers: PerformanceObserver[] = [];
    
    // Monitor LCP
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime
        }));
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observers.push(lcpObserver);

      // Monitor CLS
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value || 0;
          }
        }
        setMetrics(prev => ({
          ...prev,
          cumulativeLayoutShift: prev.cumulativeLayoutShift + clsValue
        }));
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observers.push(clsObserver);

      // Monitor FID
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & { processingStart?: number };
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: (fidEntry.processingStart || 0) - entry.startTime
          }));
        });
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      observers.push(fidObserver);
    }

    // Initial metrics
    updateNavigationMetrics();
    updatePaintMetrics();

    // Update metrics when load completes
    const handleLoad = () => {
      setTimeout(() => {
        updateNavigationMetrics();
        updatePaintMetrics();
      }, 0);
    };
    
    window.addEventListener('load', handleLoad);

    return () => {
      observers.forEach(observer => observer.disconnect());
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return metrics;
}