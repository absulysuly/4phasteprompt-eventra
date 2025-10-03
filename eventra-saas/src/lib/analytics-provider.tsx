'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { initializeAnalytics, getAnalytics, AnalyticsConfig, trackEvent, trackClick, trackPageView, trackError } from './analytics';
import type { EventType } from '@prisma/client';

interface AnalyticsContextType {
  trackEvent: (eventType: EventType, eventName: string, options?: any) => void;
  trackClick: (elementId: string, component?: string, properties?: Record<string, any>) => void;
  trackPageView: (page?: string) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  setUserId: (userId: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  config?: AnalyticsConfig;
  userId?: string;
}

export function AnalyticsProvider({ children, config, userId }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const lastPathRef = useRef<string>('');

  useEffect(() => {
    if (!initializedRef.current) {
      initializeAnalytics(config);
      initializedRef.current = true;
    }

    // Set user ID if provided
    if (userId) {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.setUserId(userId);
      }
    }
  }, [config, userId]);

  // Track route changes
  useEffect(() => {
    if (pathname && pathname !== lastPathRef.current) {
      // Avoid tracking the initial page load again
      if (lastPathRef.current !== '') {
        trackPageView(pathname);
      }
      lastPathRef.current = pathname;
    }
  }, [pathname]);

  const contextValue: AnalyticsContextType = {
    trackEvent,
    trackClick,
    trackPageView,
    trackError,
    setUserId: useCallback((newUserId: string) => {
      const analytics = getAnalytics();
      if (analytics) {
        analytics.setUserId(newUserId);
      }
    }, []),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Hook for tracking page views
export function usePageTracking(page?: string) {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView(page);
  }, [trackPageView, page]);
}

// Hook for tracking clicks with automatic element ID detection
export function useClickTracking() {
  const { trackClick } = useAnalytics();
  
  return useCallback((event: React.MouseEvent<HTMLElement>, component?: string, properties?: Record<string, any>) => {
    const target = event.currentTarget;
    const elementId = target.id || target.dataset.trackingId || `${target.tagName.toLowerCase()}-${Date.now()}`;
    trackClick(elementId, component, properties);
  }, [trackClick]);
}

// Hook for tracking form submissions
export function useFormTracking() {
  const { trackEvent } = useAnalytics();
  
  return useCallback((formName: string, success: boolean, errorMessage?: string) => {
    trackEvent('FORM_SUBMIT', 'form_submission', {
      component: formName,
      properties: {
        success,
        errorMessage,
      },
    });
  }, [trackEvent]);
}

// Hook for tracking errors with automatic error boundary integration
export function useErrorTracking() {
  const { trackError } = useAnalytics();
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled_error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      trackError(error, {
        type: 'unhandled_promise_rejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return trackError;
}

// Hook for tracking scroll events
export function useScrollTracking(threshold: number = 25) {
  const { trackEvent } = useAnalytics();
  const trackedPercentages = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = Math.round((scrollTop / docHeight) * 100);
          
          // Track at specific milestones
          const milestones = [25, 50, 75, 90, 100];
          
          for (const milestone of milestones) {
            if (scrollPercent >= milestone && !trackedPercentages.current.has(milestone)) {
              trackedPercentages.current.add(milestone);
              trackEvent('SCROLL', 'page_scroll', {
                value: milestone,
                properties: { scrollPercentage: milestone },
              });
              break; // Only track one milestone at a time
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackEvent]);
}

// Higher-order component for automatic analytics tracking
export function withAnalytics<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    trackMount?: boolean;
    trackUnmount?: boolean;
    componentName?: string;
  } = {}
) {
  const { trackMount = true, trackUnmount = false, componentName } = options;
  
  return function AnalyticsWrappedComponent(props: P) {
    const { trackEvent } = useAnalytics();
    const name = componentName || Component.displayName || Component.name || 'UnknownComponent';
    
    useEffect(() => {
      if (trackMount) {
        trackEvent('PAGE_VIEW', 'component_mount', {
          component: name,
        });
      }
      
      return () => {
        if (trackUnmount) {
          trackEvent('PAGE_VIEW', 'component_unmount', {
            component: name,
          });
        }
      };
    }, [trackEvent, name]);
    
    return <Component {...props} />;
  };
}