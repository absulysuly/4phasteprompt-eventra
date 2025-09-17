export interface NotificationData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: number;
  data?: {
    eventId?: string;
    userId?: string;
    type: 'event_reminder' | 'new_event' | 'event_update' | 'registration_confirmed' | 'event_cancelled' | 'system_update' | 'promotion';
    action?: string;
    url?: string;
  };
}

export interface SubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId?: string;
  preferences: {
    eventReminders: boolean;
    newEvents: boolean;
    eventUpdates: boolean;
    promotions: boolean;
    systemNotifications: boolean;
  };
}

class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey = 'BJ6wnVVL_R8dBsIVIKg8JKT0qn3T9Z5K6Nw4Q7gY8X6-2LF4_8P3vN9cQ5tR7U9W2Y4e6I8o0U2W4Y6E8i0O2q4w';
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      await navigator.serviceWorker.ready;
      this.registration = registration;

      console.log('Notification service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribe(userId?: string, preferences?: Partial<SubscriptionData['preferences']>): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      this.subscription = subscription;

      // Send subscription to server
      await this.sendSubscriptionToServer({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        },
        userId,
        preferences: {
          eventReminders: true,
          newEvents: true,
          eventUpdates: true,
          promotions: false,
          systemNotifications: true,
          ...preferences
        }
      });

      console.log('Successfully subscribed to push notifications');
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription) {
        console.warn('No active subscription to unsubscribe');
        return true;
      }

      await this.subscription.unsubscribe();
      this.subscription = null;

      // Notify server about unsubscription
      await this.removeSubscriptionFromServer();

      console.log('Successfully unsubscribed from push notifications');
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const permission = Notification.permission;
      
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // For local notifications (when app is open)
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/logo192.png',
        badge: data.badge || '/logo192.png',
        image: data.image,
        tag: data.tag,
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        timestamp: data.timestamp,
        data: data.data
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(data);
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return true;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return false;
    }
  }

  async scheduleEventReminder(eventId: string, eventTitle: string, eventDate: Date, reminderMinutes: number = 60): Promise<boolean> {
    try {
      const reminderTime = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
      const now = new Date();

      if (reminderTime <= now) {
        console.warn('Reminder time is in the past');
        return false;
      }

      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      // Schedule local reminder
      setTimeout(async () => {
        await this.sendNotification({
          id: `reminder-${eventId}`,
          title: 'Event Reminder',
          body: `${eventTitle} starts in ${reminderMinutes} minutes!`,
          icon: '/logo192.png',
          tag: `reminder-${eventId}`,
          requireInteraction: true,
          timestamp: Date.now(),
          data: {
            eventId,
            type: 'event_reminder',
            action: 'view_event',
            url: `/events/${eventId}`
          }
        });
      }, timeUntilReminder);

      // Also send to server for push notification
      await this.scheduleServerNotification({
        eventId,
        eventTitle,
        reminderTime: reminderTime.toISOString(),
        type: 'event_reminder'
      });

      console.log(`Event reminder scheduled for ${reminderTime}`);
      return true;
    } catch (error) {
      console.error('Failed to schedule event reminder:', error);
      return false;
    }
  }

  async updateNotificationPreferences(preferences: Partial<SubscriptionData['preferences']>): Promise<boolean> {
    try {
      if (!this.subscription) {
        console.warn('No active subscription to update');
        return false;
      }

      await this.sendSubscriptionToServer({
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
        },
        preferences: {
          eventReminders: true,
          newEvents: true,
          eventUpdates: true,
          promotions: false,
          systemNotifications: true,
          ...preferences
        }
      });

      console.log('Notification preferences updated');
      return true;
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      return false;
    }
  }

  getSubscriptionStatus(): {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    subscription: PushSubscription | null;
  } {
    return {
      isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
      permission: Notification?.permission || 'default',
      isSubscribed: !!this.subscription,
      subscription: this.subscription
    };
  }

  private handleNotificationClick(data: NotificationData): void {
    // Close notification
    if (self.registration) {
      self.registration.getNotifications().then(notifications => {
        notifications.forEach(notification => {
          if (notification.tag === data.tag) {
            notification.close();
          }
        });
      });
    }

    // Handle different actions
    if (data.data?.url) {
      window.open(data.data.url, '_blank');
    } else if (data.data?.eventId) {
      window.open(`/events/${data.data.eventId}`, '_blank');
    } else {
      window.focus();
    }
  }

  private async sendSubscriptionToServer(subscription: SubscriptionData): Promise<void> {
    try {
      // In a real app, this would send to your backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      // Store in localStorage as fallback
      localStorage.setItem('push-subscription', JSON.stringify(subscription));
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      // Fallback: store locally
      localStorage.setItem('push-subscription', JSON.stringify(subscription));
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: this.subscription?.endpoint })
      });

      if (!response.ok) {
        console.warn('Failed to remove subscription from server');
      }

      localStorage.removeItem('push-subscription');
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      localStorage.removeItem('push-subscription');
    }
  }

  private async scheduleServerNotification(data: any): Promise<void> {
    try {
      await fetch('/api/notifications/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to schedule server notification:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return window.btoa(binary);
  }
}

export const notificationService = NotificationService.getInstance();