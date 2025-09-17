export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'calendar' | 'social' | 'payment' | 'email' | 'crm' | 'analytics';
  enabled: boolean;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  lastSync?: number;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  errorMessage?: string;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple' | 'ics';
  calendarId: string;
  syncEnabled: boolean;
  autoCreateEvents: boolean;
  reminderSettings: {
    enabled: boolean;
    minutesBefore: number[];
  };
}

export interface SocialMediaIntegration {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  autoPost: boolean;
  postTemplate: string;
  hashtags: string[];
  scheduledPosts: boolean;
  analytics: boolean;
}

export interface PaymentIntegration {
  provider: 'stripe' | 'paypal' | 'square' | 'apple_pay' | 'google_pay';
  merchantId: string;
  currency: string;
  feeStructure: {
    percentage: number;
    fixedFee: number;
  };
  refundPolicy: {
    enabled: boolean;
    cutoffHours: number;
    feeRetained: number;
  };
}

export interface EmailIntegration {
  provider: 'mailchimp' | 'sendgrid' | 'constant_contact' | 'campaign_monitor';
  apiKey: string;
  listId?: string;
  templates: {
    welcome: string;
    eventReminder: string;
    eventCancellation: string;
    newsletter: string;
  };
  automationEnabled: boolean;
}

export interface CRMIntegration {
  provider: 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho';
  syncContacts: boolean;
  leadCreation: boolean;
  eventTracking: boolean;
  customFields: Record<string, string>;
}

export interface AnalyticsIntegration {
  provider: 'google_analytics' | 'facebook_pixel' | 'mixpanel' | 'amplitude';
  trackingId: string;
  eventTracking: {
    pageViews: boolean;
    eventRegistrations: boolean;
    searchQueries: boolean;
    userEngagement: boolean;
  };
  customEvents: Array<{
    name: string;
    parameters: Record<string, any>;
  }>;
}

export interface SyncResult {
  integration: string;
  success: boolean;
  itemsSynced: number;
  errors: string[];
  timestamp: number;
  duration: number;
}

class IntegrationService {
  private static instance: IntegrationService;
  private integrations: Map<string, IntegrationConfig> = new Map();
  private syncQueue: Array<{ integrationId: string; action: string; data: any }> = [];
  private isSyncing = false;
  
  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadIntegrations();
      this.startSyncWorker();
      console.log('Integration service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize integration service:', error);
    }
  }

  private async loadIntegrations(): Promise<void> {
    // Load saved integrations from localStorage
    const saved = localStorage.getItem('eventra-integrations');
    
    if (saved) {
      try {
        const integrations = JSON.parse(saved);
        Object.entries(integrations).forEach(([id, config]) => {
          this.integrations.set(id, config as IntegrationConfig);
        });
      } catch (error) {
        console.error('Error loading integrations:', error);
      }
    }

    // Initialize default integrations
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations(): void {
    const defaultIntegrations: IntegrationConfig[] = [
      {
        id: 'google_calendar',
        name: 'Google Calendar',
        type: 'calendar',
        enabled: false,
        credentials: {},
        settings: {
          autoCreateEvents: true,
          reminderMinutes: [60, 24 * 60],
          calendarId: 'primary'
        },
        status: 'disconnected'
      },
      {
        id: 'facebook_integration',
        name: 'Facebook',
        type: 'social',
        enabled: false,
        credentials: {},
        settings: {
          autoPost: false,
          postTemplate: 'Join me at {{eventTitle}} on {{eventDate}}! {{eventUrl}}',
          hashtags: ['#event', '#eventra'],
          pageId: ''
        },
        status: 'disconnected'
      },
      {
        id: 'stripe_payments',
        name: 'Stripe',
        type: 'payment',
        enabled: false,
        credentials: {},
        settings: {
          currency: 'USD',
          feePercentage: 2.9,
          fixedFee: 0.30,
          refundsEnabled: true
        },
        status: 'disconnected'
      },
      {
        id: 'mailchimp_email',
        name: 'Mailchimp',
        type: 'email',
        enabled: false,
        credentials: {},
        settings: {
          listId: '',
          automationEnabled: true,
          segmentUsers: true
        },
        status: 'disconnected'
      },
      {
        id: 'google_analytics',
        name: 'Google Analytics',
        type: 'analytics',
        enabled: false,
        credentials: {},
        settings: {
          trackingId: '',
          trackPageViews: true,
          trackEvents: true,
          trackConversions: true
        },
        status: 'disconnected'
      }
    ];

    defaultIntegrations.forEach(integration => {
      if (!this.integrations.has(integration.id)) {
        this.integrations.set(integration.id, integration);
      }
    });
  }

  // Calendar Integration Methods
  async connectCalendar(provider: 'google' | 'outlook' | 'apple', credentials: any): Promise<boolean> {
    try {
      const integrationId = `${provider}_calendar`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      // Simulate OAuth flow
      await this.simulateOAuthFlow(provider);
      
      integration.credentials = credentials;
      integration.enabled = true;
      integration.status = 'connected';
      integration.lastSync = Date.now();

      this.integrations.set(integrationId, integration);
      await this.saveIntegrations();

      console.log(`Connected to ${provider} calendar successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to connect ${provider} calendar:`, error);
      return false;
    }
  }

  async syncEventToCalendar(eventId: string, eventData: any): Promise<boolean> {
    try {
      const calendarIntegrations = Array.from(this.integrations.values()).filter(
        integration => integration.type === 'calendar' && integration.enabled
      );

      for (const integration of calendarIntegrations) {
        await this.createCalendarEvent(integration.id, eventData);
      }

      return true;
    } catch (error) {
      console.error('Failed to sync event to calendar:', error);
      return false;
    }
  }

  private async createCalendarEvent(integrationId: string, eventData: any): Promise<void> {
    // Simulate calendar event creation
    console.log(`Creating calendar event in ${integrationId}:`, eventData);
    
    // In a real implementation, this would call the calendar API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update sync timestamp
    const integration = this.integrations.get(integrationId);
    if (integration) {
      integration.lastSync = Date.now();
      this.integrations.set(integrationId, integration);
    }
  }

  // Social Media Integration Methods
  async connectSocialMedia(platform: string, credentials: any): Promise<boolean> {
    try {
      const integrationId = `${platform}_integration`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      // Simulate OAuth flow
      await this.simulateOAuthFlow(platform);
      
      integration.credentials = credentials;
      integration.enabled = true;
      integration.status = 'connected';

      this.integrations.set(integrationId, integration);
      await this.saveIntegrations();

      console.log(`Connected to ${platform} successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
      return false;
    }
  }

  async postToSocialMedia(platform: string, content: string, media?: string[]): Promise<boolean> {
    try {
      const integrationId = `${platform}_integration`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration || !integration.enabled) {
        throw new Error(`${platform} integration not enabled`);
      }

      // Simulate social media post
      console.log(`Posting to ${platform}:`, { content, media });
      await new Promise(resolve => setTimeout(resolve, 1500));

      return true;
    } catch (error) {
      console.error(`Failed to post to ${platform}:`, error);
      return false;
    }
  }

  async scheduleEventPost(eventData: any, scheduledTime: number): Promise<boolean> {
    try {
      const socialIntegrations = Array.from(this.integrations.values()).filter(
        integration => integration.type === 'social' && integration.enabled
      );

      for (const integration of socialIntegrations) {
        const postContent = this.generateSocialMediaPost(eventData, integration.settings);
        
        // Add to sync queue for scheduled posting
        this.syncQueue.push({
          integrationId: integration.id,
          action: 'schedule_post',
          data: {
            content: postContent,
            scheduledTime,
            eventId: eventData.id
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule event post:', error);
      return false;
    }
  }

  private generateSocialMediaPost(eventData: any, settings: any): string {
    let template = settings.postTemplate || 'Join me at {{eventTitle}} on {{eventDate}}! {{eventUrl}}';
    
    template = template.replace('{{eventTitle}}', eventData.title);
    template = template.replace('{{eventDate}}', new Date(eventData.date).toLocaleDateString());
    template = template.replace('{{eventUrl}}', `https://eventra.app/events/${eventData.id}`);
    
    if (settings.hashtags && Array.isArray(settings.hashtags)) {
      template += '\n' + settings.hashtags.join(' ');
    }

    return template;
  }

  // Payment Integration Methods
  async connectPaymentProvider(provider: string, credentials: any): Promise<boolean> {
    try {
      const integrationId = `${provider}_payments`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration) {
        // Create new payment integration
        const newIntegration: IntegrationConfig = {
          id: integrationId,
          name: provider.charAt(0).toUpperCase() + provider.slice(1),
          type: 'payment',
          enabled: true,
          credentials: credentials,
          settings: {
            currency: 'USD',
            feePercentage: 2.9,
            fixedFee: 0.30
          },
          status: 'connected'
        };
        this.integrations.set(integrationId, newIntegration);
      } else {
        integration.credentials = credentials;
        integration.enabled = true;
        integration.status = 'connected';
        this.integrations.set(integrationId, integration);
      }

      await this.saveIntegrations();
      console.log(`Connected to ${provider} payments successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to connect ${provider} payments:`, error);
      return false;
    }
  }

  async processPayment(paymentData: any): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const paymentIntegrations = Array.from(this.integrations.values()).filter(
        integration => integration.type === 'payment' && integration.enabled
      );

      if (paymentIntegrations.length === 0) {
        throw new Error('No payment integrations available');
      }

      // Use the first available payment integration
      const integration = paymentIntegrations[0];
      
      // Simulate payment processing
      console.log(`Processing payment via ${integration.name}:`, paymentData);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        transactionId
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Email Marketing Integration Methods
  async connectEmailProvider(provider: string, credentials: any): Promise<boolean> {
    try {
      const integrationId = `${provider}_email`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      integration.credentials = credentials;
      integration.enabled = true;
      integration.status = 'connected';

      this.integrations.set(integrationId, integration);
      await this.saveIntegrations();

      console.log(`Connected to ${provider} email service successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to connect ${provider} email service:`, error);
      return false;
    }
  }

  async syncContactToEmailList(contactData: any): Promise<boolean> {
    try {
      const emailIntegrations = Array.from(this.integrations.values()).filter(
        integration => integration.type === 'email' && integration.enabled
      );

      for (const integration of emailIntegrations) {
        await this.addContactToEmailList(integration.id, contactData);
      }

      return true;
    } catch (error) {
      console.error('Failed to sync contact to email list:', error);
      return false;
    }
  }

  private async addContactToEmailList(integrationId: string, contactData: any): Promise<void> {
    console.log(`Adding contact to ${integrationId}:`, contactData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  async sendEventEmail(eventData: any, recipients: string[], template: string): Promise<boolean> {
    try {
      const emailIntegrations = Array.from(this.integrations.values()).filter(
        integration => integration.type === 'email' && integration.enabled
      );

      if (emailIntegrations.length === 0) {
        throw new Error('No email integrations available');
      }

      const integration = emailIntegrations[0];
      console.log(`Sending event email via ${integration.name}:`, { eventData, recipients, template });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return true;
    } catch (error) {
      console.error('Failed to send event email:', error);
      return false;
    }
  }

  // Analytics Integration Methods
  async connectAnalytics(provider: string, credentials: any): Promise<boolean> {
    try {
      const integrationId = `${provider}_analytics`;
      const integration = this.integrations.get(integrationId);
      
      if (!integration) {
        throw new Error(`Integration ${integrationId} not found`);
      }

      integration.credentials = credentials;
      integration.enabled = true;
      integration.status = 'connected';

      this.integrations.set(integrationId, integration);
      await this.saveIntegrations();

      console.log(`Connected to ${provider} analytics successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to connect ${provider} analytics:`, error);
      return false;
    }
  }

  async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    const analyticsIntegrations = Array.from(this.integrations.values()).filter(
      integration => integration.type === 'analytics' && integration.enabled
    );

    for (const integration of analyticsIntegrations) {
      this.sendAnalyticsEvent(integration.id, eventName, properties);
    }
  }

  private sendAnalyticsEvent(integrationId: string, eventName: string, properties: Record<string, any>): void {
    console.log(`Tracking ${eventName} in ${integrationId}:`, properties);
    
    // Simulate analytics tracking
    // In a real implementation, this would call the analytics API
  }

  // General Integration Management
  getIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  async updateIntegrationSettings(id: string, settings: Record<string, any>): Promise<boolean> {
    try {
      const integration = this.integrations.get(id);
      
      if (!integration) {
        throw new Error(`Integration ${id} not found`);
      }

      integration.settings = { ...integration.settings, ...settings };
      this.integrations.set(id, integration);
      
      await this.saveIntegrations();
      return true;
    } catch (error) {
      console.error(`Failed to update integration ${id}:`, error);
      return false;
    }
  }

  async disconnectIntegration(id: string): Promise<boolean> {
    try {
      const integration = this.integrations.get(id);
      
      if (!integration) {
        throw new Error(`Integration ${id} not found`);
      }

      integration.enabled = false;
      integration.status = 'disconnected';
      integration.credentials = {};
      
      this.integrations.set(id, integration);
      await this.saveIntegrations();
      
      console.log(`Disconnected integration ${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to disconnect integration ${id}:`, error);
      return false;
    }
  }

  // Sync Management
  private startSyncWorker(): void {
    setInterval(() => {
      if (!this.isSyncing && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // Process sync queue every 30 seconds
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    
    try {
      while (this.syncQueue.length > 0) {
        const syncItem = this.syncQueue.shift();
        if (syncItem) {
          await this.processSyncItem(syncItem);
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async processSyncItem(item: { integrationId: string; action: string; data: any }): Promise<void> {
    try {
      console.log(`Processing sync item:`, item);
      
      switch (item.action) {
        case 'schedule_post':
          if (item.data.scheduledTime <= Date.now()) {
            await this.postToSocialMedia(
              item.integrationId.replace('_integration', ''),
              item.data.content
            );
          } else {
            // Re-queue for later
            this.syncQueue.push(item);
          }
          break;
          
        case 'sync_contact':
          await this.addContactToEmailList(item.integrationId, item.data);
          break;
          
        case 'track_event':
          this.sendAnalyticsEvent(item.integrationId, item.data.eventName, item.data.properties);
          break;
          
        default:
          console.warn(`Unknown sync action: ${item.action}`);
      }
    } catch (error) {
      console.error(`Failed to process sync item:`, error);
    }
  }

  async syncAllIntegrations(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const enabledIntegrations = Array.from(this.integrations.values()).filter(
      integration => integration.enabled
    );

    for (const integration of enabledIntegrations) {
      const startTime = Date.now();
      
      try {
        integration.status = 'syncing';
        
        // Simulate sync process
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const itemsSynced = Math.floor(Math.random() * 50) + 1;
        
        integration.status = 'connected';
        integration.lastSync = Date.now();
        
        results.push({
          integration: integration.id,
          success: true,
          itemsSynced,
          errors: [],
          timestamp: Date.now(),
          duration: Date.now() - startTime
        });
        
      } catch (error) {
        integration.status = 'error';
        integration.errorMessage = error instanceof Error ? error.message : 'Sync failed';
        
        results.push({
          integration: integration.id,
          success: false,
          itemsSynced: 0,
          errors: [integration.errorMessage],
          timestamp: Date.now(),
          duration: Date.now() - startTime
        });
      }
      
      this.integrations.set(integration.id, integration);
    }

    await this.saveIntegrations();
    return results;
  }

  // Utility Methods
  private async simulateOAuthFlow(provider: string): Promise<void> {
    console.log(`Starting OAuth flow for ${provider}...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`OAuth flow for ${provider} completed successfully`);
  }

  private async saveIntegrations(): Promise<void> {
    try {
      const integrationsData = Object.fromEntries(this.integrations);
      localStorage.setItem('eventra-integrations', JSON.stringify(integrationsData));
    } catch (error) {
      console.error('Failed to save integrations:', error);
    }
  }

  // Export/Import Configuration
  exportIntegrationsConfig(): string {
    const exportData = Array.from(this.integrations.values()).map(integration => ({
      ...integration,
      credentials: {} // Remove sensitive data for export
    }));
    
    return JSON.stringify(exportData, null, 2);
  }

  async importIntegrationsConfig(configJson: string): Promise<boolean> {
    try {
      const importData = JSON.parse(configJson);
      
      for (const integration of importData) {
        integration.credentials = {}; // Clear credentials for security
        integration.status = 'disconnected';
        integration.enabled = false;
        
        this.integrations.set(integration.id, integration);
      }
      
      await this.saveIntegrations();
      return true;
    } catch (error) {
      console.error('Failed to import integrations config:', error);
      return false;
    }
  }
}

export const integrationService = IntegrationService.getInstance();