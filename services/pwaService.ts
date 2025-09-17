export interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOfflineReady: boolean;
  supportsNotifications: boolean;
  supportsBackgroundSync: boolean;
  supportsWebShare: boolean;
  supportsFullscreen: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

export interface OfflineEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  city: string;
  price: string;
  image: string;
  organizer: string;
  cachedAt: number;
}

export interface SyncRequest {
  id: string;
  type: 'event_registration' | 'event_favorite' | 'user_update' | 'search_query';
  data: any;
  timestamp: number;
  retryCount: number;
}

class PWAService {
  private static instance: PWAService;
  private deferredPrompt: any = null;
  private registration: ServiceWorkerRegistration | null = null;
  private db: IDBDatabase | null = null;
  
  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.initializeIndexedDB();
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupOfflineHandlers();
      this.setupOrientationHandlers();
      this.setupFullscreenHandlers();
      
      console.log('PWA service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PWA service:', error);
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EventraDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id' });
          eventsStore.createIndex('category', 'category', { unique: false });
          eventsStore.createIndex('city', 'city', { unique: false });
          eventsStore.createIndex('date', 'date', { unique: false });
        }
        
        // Sync requests store
        if (!db.objectStoreNames.contains('syncRequests')) {
          db.createObjectStore('syncRequests', { keyPath: 'id' });
        }
        
        // User data store
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'key' });
        }
        
        // Cache store
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered:', this.registration);
        
        // Handle service worker updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.showUpdateAvailableNotification();
              }
            });
          }
        });
        
        // Setup background sync
        if ('sync' in this.registration) {
          this.setupBackgroundSync();
        }
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.deferredPrompt = null;
      this.hideInstallBanner();
    });
  }

  private setupOfflineHandlers(): void {
    window.addEventListener('online', () => {
      console.log('Back online');
      this.syncPendingRequests();
      this.showConnectivityStatus('online');
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      this.showConnectivityStatus('offline');
    });
  }

  private setupOrientationHandlers(): void {
    if ('orientation' in screen) {
      screen.orientation.addEventListener('change', () => {
        const orientation = screen.orientation.angle === 0 || screen.orientation.angle === 180 
          ? 'portrait' : 'landscape';
        this.handleOrientationChange(orientation);
      });
    }
  }

  private setupFullscreenHandlers(): void {
    if ('requestFullscreen' in document.documentElement) {
      document.addEventListener('fullscreenchange', () => {
        const isFullscreen = !!document.fullscreenElement;
        this.handleFullscreenChange(isFullscreen);
      });
    }
  }

  // Installation methods
  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted PWA installation');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('Error prompting PWA installation:', error);
      return false;
    }
  }

  private showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold">Install Eventra</h4>
          <p class="text-sm opacity-90">Get the full app experience</p>
        </div>
        <div class="flex gap-2">
          <button id="pwa-install-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
            Install
          </button>
          <button id="pwa-dismiss-btn" class="text-white opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn')?.addEventListener('click', () => {
      this.promptInstall();
      this.hideInstallBanner();
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner(): void {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Offline functionality
  async cacheEvent(event: OfflineEvent): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['events'], 'readwrite');
    const store = transaction.objectStore('events');
    
    const offlineEvent = {
      ...event,
      cachedAt: Date.now()
    };
    
    await store.put(offlineEvent);
  }

  async getCachedEvents(): Promise<OfflineEvent[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['events'], 'readonly');
    const store = transaction.objectStore('events');
    
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async searchCachedEvents(query: string, filters?: any): Promise<OfflineEvent[]> {
    const cachedEvents = await this.getCachedEvents();
    
    return cachedEvents.filter(event => {
      const matchesQuery = !query || 
        event.title.toLowerCase().includes(query.toLowerCase()) ||
        event.description.toLowerCase().includes(query.toLowerCase()) ||
        event.category.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilters = !filters || (
        (!filters.category || event.category === filters.category) &&
        (!filters.city || event.city === filters.city)
      );
      
      return matchesQuery && matchesFilters;
    });
  }

  // Background sync
  private setupBackgroundSync(): void {
    if (!this.registration) return;

    // Register for background sync
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('background-sync');
    }).catch(error => {
      console.error('Background sync registration failed:', error);
    });
  }

  async addSyncRequest(request: Omit<SyncRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) return;

    const syncRequest: SyncRequest = {
      ...request,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    const transaction = this.db.transaction(['syncRequests'], 'readwrite');
    const store = transaction.objectStore('syncRequests');
    await store.add(syncRequest);

    // Trigger background sync if online
    if (navigator.onLine && this.registration) {
      this.registration.sync.register('background-sync');
    }
  }

  async syncPendingRequests(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['syncRequests'], 'readwrite');
    const store = transaction.objectStore('syncRequests');
    
    const requests = await new Promise<SyncRequest[]>((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    for (const request of requests) {
      try {
        await this.processSyncRequest(request);
        await store.delete(request.id);
        console.log('Synced request:', request.id);
      } catch (error) {
        console.error('Failed to sync request:', request.id, error);
        
        // Increment retry count
        request.retryCount++;
        if (request.retryCount < 3) {
          await store.put(request);
        } else {
          // Remove after 3 failed attempts
          await store.delete(request.id);
        }
      }
    }
  }

  private async processSyncRequest(request: SyncRequest): Promise<void> {
    switch (request.type) {
      case 'event_registration':
        await fetch('/api/events/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        break;
        
      case 'event_favorite':
        await fetch('/api/events/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        break;
        
      case 'user_update':
        await fetch('/api/user/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        break;
        
      case 'search_query':
        // Analytics tracking for offline searches
        await fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request.data)
        });
        break;
    }
  }

  // Device capabilities
  getCapabilities(): PWACapabilities {
    return {
      isInstallable: !!this.deferredPrompt,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOfflineReady: 'serviceWorker' in navigator && !!this.registration,
      supportsNotifications: 'Notification' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in (this.registration || {}),
      supportsWebShare: 'share' in navigator,
      supportsFullscreen: 'requestFullscreen' in document.documentElement,
      deviceType: this.getDeviceType(),
      orientation: this.getOrientation()
    };
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  // Share functionality
  async shareContent(data: { title: string; text: string; url: string }): Promise<boolean> {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Web Share failed:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      return this.copyToClipboard(data.url);
    }
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard write failed:', error);
      return false;
    }
  }

  // Fullscreen functionality
  async requestFullscreen(): Promise<boolean> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return false;
      } else {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
      return false;
    }
  }

  // Event handlers
  private handleOrientationChange(orientation: 'portrait' | 'landscape'): void {
    // Adjust UI for orientation change
    document.body.classList.toggle('landscape', orientation === 'landscape');
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-orientation-change', { 
      detail: { orientation } 
    }));
  }

  private handleFullscreenChange(isFullscreen: boolean): void {
    document.body.classList.toggle('fullscreen', isFullscreen);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-fullscreen-change', { 
      detail: { isFullscreen } 
    }));
  }

  private showConnectivityStatus(status: 'online' | 'offline'): void {
    const statusBar = document.getElementById('connectivity-status') || this.createConnectivityStatusBar();
    
    statusBar.className = `fixed top-0 left-0 right-0 text-center py-2 text-sm font-medium z-50 transition-colors ${
      status === 'online' 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`;
    
    statusBar.textContent = status === 'online' 
      ? 'Back online - syncing data...' 
      : 'You\'re offline - some features may be limited';
    
    statusBar.style.display = 'block';
    
    // Auto hide after 3 seconds for online status
    if (status === 'online') {
      setTimeout(() => {
        statusBar.style.display = 'none';
      }, 3000);
    }
  }

  private createConnectivityStatusBar(): HTMLElement {
    const statusBar = document.createElement('div');
    statusBar.id = 'connectivity-status';
    statusBar.style.display = 'none';
    document.body.appendChild(statusBar);
    return statusBar;
  }

  private showUpdateAvailableNotification(): void {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div>
          <h4 class="font-semibold">Update Available</h4>
          <p class="text-sm opacity-90">A new version is ready</p>
        </div>
        <button id="update-app-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    document.getElementById('update-app-btn')?.addEventListener('click', () => {
      window.location.reload();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      notification.remove();
    }, 10000);
  }

  // Storage management
  async clearCache(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['events', 'cache'], 'readwrite');
    
    await transaction.objectStore('events').clear();
    await transaction.objectStore('cache').clear();
    
    console.log('PWA cache cleared');
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }

  // Lifecycle methods
  cleanup(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const pwaService = PWAService.getInstance();