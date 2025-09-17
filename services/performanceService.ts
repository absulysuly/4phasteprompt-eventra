export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  
  // Custom metrics
  componentLoadTime?: number;
  apiResponseTime?: number;
  imageLoadTime?: number;
  routeChangeTime?: number;
  memoryUsage?: number;
  jsHeapUsedSize?: number;
  
  // User experience metrics
  userInteractionDelay?: number;
  scrollPerformance?: number;
  animationFrameDrops?: number;
  
  // Bundle size and asset metrics
  jsSize?: number;
  cssSize?: number;
  imageSize?: number;
  totalAssetSize?: number;
  
  // Network metrics
  networkSpeed?: 'slow-2g' | '2g' | '3g' | '4g';
  isOffline?: boolean;
  
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  recommendations: PerformanceRecommendation[];
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface PerformanceRecommendation {
  category: 'loading' | 'interactivity' | 'visual-stability' | 'bundle' | 'network';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  priority: number;
  implementationGuide: string;
}

class PerformanceService {
  private static instance: PerformanceService;
  private observer: PerformanceObserver | null = null;
  private metrics: Map<string, number> = new Map();
  private isMonitoring = false;
  private reportCallback?: (report: PerformanceReport) => void;
  
  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  initialize(callback?: (report: PerformanceReport) => void): void {
    this.reportCallback = callback;
    this.startMonitoring();
    this.setupWebVitals();
    this.monitorMemoryUsage();
    this.monitorNetworkConditions();
    this.measureBundleSizes();
    
    console.log('Performance monitoring initialized');
  }

  private startMonitoring(): void {
    if (this.isMonitoring || !window.PerformanceObserver) return;
    
    try {
      // Monitor paint metrics
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation', 'resource'] });
      this.isMonitoring = true;
    } catch (error) {
      console.error('Failed to initialize performance observer:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.set('FCP', entry.startTime);
        }
        break;
        
      case 'largest-contentful-paint':
        this.metrics.set('LCP', (entry as any).startTime);
        break;
        
      case 'first-input':
        this.metrics.set('FID', (entry as any).processingStart - entry.startTime);
        break;
        
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          const currentCLS = this.metrics.get('CLS') || 0;
          this.metrics.set('CLS', currentCLS + (entry as any).value);
        }
        break;
        
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.set('TTFB', navEntry.responseStart - navEntry.fetchStart);
        break;
        
      case 'resource':
        this.processResourceEntry(entry as PerformanceResourceTiming);
        break;
    }
  }

  private processResourceEntry(entry: PerformanceResourceTiming): void {
    const duration = entry.responseEnd - entry.requestStart;
    
    if (entry.name.includes('/api/')) {
      this.metrics.set('apiResponseTime', duration);
    } else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      this.metrics.set('imageLoadTime', duration);
    }
  }

  private setupWebVitals(): void {
    // Custom LCP measurement
    if ('LargestContentfulPaint' in window) {
      let lcpValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        const lastEntry = entries[entries.length - 1];
        lcpValue = lastEntry.startTime;
        this.metrics.set('LCP', lcpValue);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }

    // Custom FID measurement
    let fidValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (entry.name === 'first-input-delay') {
          fidValue = entry.value;
          this.metrics.set('FID', fidValue);
        }
      }
    });
    
    if ('PerformanceEventTiming' in window) {
      observer.observe({ type: 'first-input', buffered: true });
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        this.metrics.set('jsHeapUsedSize', memory.usedJSHeapSize);
        this.metrics.set('memoryUsage', memory.usedJSHeapSize / memory.jsHeapSizeLimit);
      };

      updateMemoryUsage();
      setInterval(updateMemoryUsage, 10000); // Update every 10 seconds
    }
  }

  private monitorNetworkConditions(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateNetworkInfo = () => {
        this.metrics.set('networkSpeed', connection.effectiveType || 'unknown');
        this.metrics.set('isOffline', !navigator.onLine ? 1 : 0);
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
      window.addEventListener('online', updateNetworkInfo);
      window.addEventListener('offline', updateNetworkInfo);
    }
  }

  private measureBundleSizes(): void {
    // Measure JavaScript bundle sizes
    const jsEntries = performance.getEntriesByType('resource').filter(
      entry => entry.name.endsWith('.js')
    ) as PerformanceResourceTiming[];

    const cssEntries = performance.getEntriesByType('resource').filter(
      entry => entry.name.endsWith('.css')
    ) as PerformanceResourceTiming[];

    const jsSize = jsEntries.reduce((total, entry) => total + (entry.transferSize || 0), 0);
    const cssSize = cssEntries.reduce((total, entry) => total + (entry.transferSize || 0), 0);

    this.metrics.set('jsSize', jsSize);
    this.metrics.set('cssSize', cssSize);
    this.metrics.set('totalAssetSize', jsSize + cssSize);
  }

  measureComponentLoadTime(componentName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.metrics.set(`${componentName}LoadTime`, loadTime);
    console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  measureRouteChange(routeName: string, startTime: number): void {
    const changeTime = performance.now() - startTime;
    this.metrics.set('routeChangeTime', changeTime);
    console.log(`Route change to ${routeName} took ${changeTime.toFixed(2)}ms`);
  }

  measureUserInteraction(interactionType: string, startTime: number): void {
    const delay = performance.now() - startTime;
    this.metrics.set('userInteractionDelay', delay);
    
    if (delay > 100) {
      console.warn(`Slow ${interactionType} interaction: ${delay.toFixed(2)}ms`);
    }
  }

  generateReport(): PerformanceReport {
    const currentMetrics: PerformanceMetrics = {
      LCP: this.metrics.get('LCP'),
      FID: this.metrics.get('FID'),
      CLS: this.metrics.get('CLS'),
      FCP: this.metrics.get('FCP'),
      TTFB: this.metrics.get('TTFB'),
      componentLoadTime: this.metrics.get('componentLoadTime'),
      apiResponseTime: this.metrics.get('apiResponseTime'),
      imageLoadTime: this.metrics.get('imageLoadTime'),
      routeChangeTime: this.metrics.get('routeChangeTime'),
      memoryUsage: this.metrics.get('memoryUsage'),
      jsHeapUsedSize: this.metrics.get('jsHeapUsedSize'),
      userInteractionDelay: this.metrics.get('userInteractionDelay'),
      jsSize: this.metrics.get('jsSize'),
      cssSize: this.metrics.get('cssSize'),
      totalAssetSize: this.metrics.get('totalAssetSize'),
      networkSpeed: this.metrics.get('networkSpeed') as any,
      isOffline: Boolean(this.metrics.get('isOffline')),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const recommendations = this.generateRecommendations(currentMetrics);
    const score = this.calculateScore(currentMetrics);
    const grade = this.getGrade(score);

    const report: PerformanceReport = {
      metrics: currentMetrics,
      recommendations,
      score,
      grade
    };

    if (this.reportCallback) {
      this.reportCallback(report);
    }

    return report;
  }

  private generateRecommendations(metrics: PerformanceMetrics): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    // LCP recommendations
    if (metrics.LCP && metrics.LCP > 2500) {
      recommendations.push({
        category: 'loading',
        title: 'Improve Largest Contentful Paint',
        description: `LCP is ${(metrics.LCP / 1000).toFixed(2)}s, should be under 2.5s`,
        impact: 'high',
        priority: 1,
        implementationGuide: 'Optimize images, implement lazy loading, use CDN, preload critical resources'
      });
    }

    // FID recommendations
    if (metrics.FID && metrics.FID > 100) {
      recommendations.push({
        category: 'interactivity',
        title: 'Reduce First Input Delay',
        description: `FID is ${metrics.FID.toFixed(2)}ms, should be under 100ms`,
        impact: 'high',
        priority: 2,
        implementationGuide: 'Reduce JavaScript execution time, code splitting, optimize event handlers'
      });
    }

    // CLS recommendations
    if (metrics.CLS && metrics.CLS > 0.1) {
      recommendations.push({
        category: 'visual-stability',
        title: 'Improve Cumulative Layout Shift',
        description: `CLS is ${metrics.CLS.toFixed(3)}, should be under 0.1`,
        impact: 'medium',
        priority: 3,
        implementationGuide: 'Set dimensions for images/videos, avoid dynamic content insertion, use CSS aspect-ratio'
      });
    }

    // Bundle size recommendations
    if (metrics.jsSize && metrics.jsSize > 500000) { // 500KB
      recommendations.push({
        category: 'bundle',
        title: 'Reduce JavaScript Bundle Size',
        description: `JS bundle is ${(metrics.jsSize / 1024).toFixed(0)}KB, consider optimization`,
        impact: 'medium',
        priority: 4,
        implementationGuide: 'Enable tree shaking, code splitting, remove unused dependencies'
      });
    }

    // Memory usage recommendations
    if (metrics.memoryUsage && metrics.memoryUsage > 0.8) {
      recommendations.push({
        category: 'bundle',
        title: 'Optimize Memory Usage',
        description: `Memory usage is at ${(metrics.memoryUsage * 100).toFixed(1)}%`,
        impact: 'medium',
        priority: 5,
        implementationGuide: 'Fix memory leaks, optimize data structures, implement virtual scrolling'
      });
    }

    // Network recommendations
    if (metrics.networkSpeed === 'slow-2g' || metrics.networkSpeed === '2g') {
      recommendations.push({
        category: 'network',
        title: 'Optimize for Slow Networks',
        description: 'User is on a slow network connection',
        impact: 'high',
        priority: 1,
        implementationGuide: 'Implement progressive loading, reduce asset sizes, add offline support'
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private calculateScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // LCP scoring (40% weight)
    if (metrics.LCP) {
      if (metrics.LCP > 4000) score -= 40;
      else if (metrics.LCP > 2500) score -= 20;
      else if (metrics.LCP > 2000) score -= 10;
    }

    // FID scoring (30% weight)
    if (metrics.FID) {
      if (metrics.FID > 300) score -= 30;
      else if (metrics.FID > 100) score -= 15;
      else if (metrics.FID > 50) score -= 5;
    }

    // CLS scoring (30% weight)
    if (metrics.CLS) {
      if (metrics.CLS > 0.25) score -= 30;
      else if (metrics.CLS > 0.1) score -= 15;
      else if (metrics.CLS > 0.05) score -= 5;
    }

    return Math.max(0, score);
  }

  private getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Optimization utilities
  preloadCriticalResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.endsWith('.js')) link.as = 'script';
      else if (url.endsWith('.css')) link.as = 'style';
      else if (url.match(/\.(jpg|jpeg|png|webp|gif)$/)) link.as = 'image';
      
      document.head.appendChild(link);
    });
  }

  lazyLoadImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for older browsers
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src!;
        image.removeAttribute('data-src');
      });
    }
  }

  optimizeImageLoading(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" if not present
      if (!img.hasAttribute('loading')) {
        img.loading = 'lazy';
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.decoding = 'async';
      }
    });
  }

  // Cache management
  setupServiceWorkerCache(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Send cache commands to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: 'CACHE_URLS',
              urls: [
                '/',
                '/static/css/main.css',
                '/static/js/main.js',
                '/api/events'
              ]
            });
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  // Real-time monitoring
  startRealTimeMonitoring(): void {
    // Monitor for performance issues every 30 seconds
    setInterval(() => {
      const report = this.generateReport();
      
      if (report.score < 70) {
        console.warn('Performance degraded:', report);
        
        // Send to analytics or monitoring service
        this.sendPerformanceData(report);
      }
    }, 30000);
  }

  private sendPerformanceData(report: PerformanceReport): void {
    // In a real app, this would send to your analytics service
    try {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      }).catch(error => {
        console.error('Failed to send performance data:', error);
      });
    } catch (error) {
      console.error('Error sending performance data:', error);
    }
  }

  // Resource hints
  addResourceHints(): void {
    const head = document.head;
    
    // DNS prefetch for external domains
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = '//fonts.googleapis.com';
    head.appendChild(dnsPrefetch);
    
    // Preconnect to critical origins
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://api.example.com';
    head.appendChild(preconnect);
    
    // Module preload for critical JavaScript
    const modulePreload = document.createElement('link');
    modulePreload.rel = 'modulepreload';
    modulePreload.href = '/static/js/critical.js';
    head.appendChild(modulePreload);
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
    this.metrics.clear();
  }
}

export const performanceService = PerformanceService.getInstance();