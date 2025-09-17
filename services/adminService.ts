import { realtimeService } from './realtimeService';
import { notificationService } from './notificationService';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  ipAddress: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'permission_denied' | 'data_export' | 'user_action' | 'system_alert';
  userId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  whitelistedIPs: string[];
}

export interface ContentModerationRule {
  id: string;
  name: string;
  pattern: RegExp;
  action: 'flag' | 'auto_remove' | 'require_approval';
  severity: 'low' | 'medium' | 'high';
  enabled: boolean;
}

class AdminService {
  private static instance: AdminService;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private moderationRules: ContentModerationRule[] = [];
  private adminSessions: Map<string, AdminUser> = new Map();

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize default moderation rules
      this.initializeDefaultModerationRules();
      
      // Set up real-time monitoring
      this.setupRealTimeMonitoring();
      
      console.log('Admin service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize admin service:', error);
      return false;
    }
  }

  // User Management
  async getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: any[]; total: number }> {
    // Simulate API call with advanced filtering
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockUsers = [
      {
        id: '1',
        name: 'Ahmad Hassan',
        email: 'ahmad.hassan@example.com',
        role: 'organizer',
        status: 'verified',
        verificationStatus: 'verified',
        loginAttempts: 0,
        lastLoginIp: '192.168.1.100',
        twoFactorEnabled: true,
        subscriptionTier: 'premium',
        totalSpent: 1250.00,
        riskScore: 2,
        eventsCreated: 12,
        eventsAttended: 45,
        reportCount: 0,
        joinDate: '2024-01-15',
        lastActive: '2024-12-15',
        notes: ['Excellent organizer', 'Verified identity']
      },
      {
        id: '2',
        name: 'Sara Mohammed',
        email: 'sara.mohammed@example.com',
        role: 'user',
        status: 'active',
        verificationStatus: 'verified',
        loginAttempts: 0,
        lastLoginIp: '10.0.0.25',
        twoFactorEnabled: false,
        subscriptionTier: 'free',
        totalSpent: 150.00,
        riskScore: 1,
        eventsCreated: 0,
        eventsAttended: 8,
        reportCount: 1,
        joinDate: '2024-03-20',
        lastActive: '2024-12-14',
        notes: ['Regular user', 'Minor content report']
      }
    ];

    return {
      users: mockUsers,
      total: mockUsers.length
    };
  }

  async updateUser(userId: string, updates: any): Promise<boolean> {
    try {
      // Log the action
      await this.logSecurityEvent({
        type: 'user_action',
        description: `Updated user ${userId}`,
        severity: 'medium'
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  }

  async suspendUser(userId: string, reason: string, duration?: number): Promise<boolean> {
    try {
      // Log the action
      await this.logSecurityEvent({
        type: 'user_action',
        description: `Suspended user ${userId}: ${reason}`,
        severity: 'high'
      });

      // Send notification to affected user
      await notificationService.sendNotification({
        id: `suspend-${userId}`,
        title: 'Account Suspended',
        body: `Your account has been suspended. Reason: ${reason}`,
        timestamp: Date.now(),
        data: {
          type: 'system_update',
          action: 'account_suspended'
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to suspend user:', error);
      return false;
    }
  }

  // Content Moderation
  async moderateContent(content: string, type: 'event' | 'comment' | 'profile'): Promise<{
    approved: boolean;
    flags: string[];
    confidence: number;
  }> {
    const flags: string[] = [];
    let confidence = 1.0;

    for (const rule of this.moderationRules) {
      if (!rule.enabled) continue;

      if (rule.pattern.test(content)) {
        flags.push(rule.name);
        confidence *= 0.8; // Reduce confidence for each flag
      }
    }

    const approved = flags.length === 0 || confidence > 0.5;

    // Log moderation result
    if (!approved) {
      await this.logSecurityEvent({
        type: 'system_alert',
        description: `Content flagged by moderation: ${flags.join(', ')}`,
        severity: flags.length > 2 ? 'high' : 'medium'
      });
    }

    return {
      approved,
      flags,
      confidence
    };
  }

  private initializeDefaultModerationRules(): void {
    this.moderationRules = [
      {
        id: '1',
        name: 'Spam Detection',
        pattern: /\b(buy now|click here|limited time|act fast|free money)\b/gi,
        action: 'flag',
        severity: 'medium',
        enabled: true
      },
      {
        id: '2',
        name: 'Profanity Filter',
        pattern: /\b(damn|hell|crap|stupid|idiot)\b/gi, // Mild profanity for demo
        action: 'require_approval',
        severity: 'low',
        enabled: true
      },
      {
        id: '3',
        name: 'Harassment Detection',
        pattern: /\b(hate|kill|die|stupid|loser)\b/gi,
        action: 'auto_remove',
        severity: 'high',
        enabled: true
      },
      {
        id: '4',
        name: 'Personal Info Detection',
        pattern: /\b\d{3}-\d{2}-\d{4}\b|\b\d{16}\b/g, // SSN or credit card patterns
        action: 'auto_remove',
        severity: 'high',
        enabled: true
      }
    ];
  }

  // Rate Limiting & Security
  async checkRateLimit(identifier: string, config: RateLimitConfig): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const key = identifier;
    
    // Check if IP is whitelisted
    if (config.whitelistedIPs.includes(identifier)) {
      return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs };
    }

    const record = this.rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
    }

    if (record.count >= config.maxRequests) {
      // Rate limit exceeded
      await this.logSecurityEvent({
        type: 'system_alert',
        description: `Rate limit exceeded for ${identifier}`,
        severity: 'medium'
      });

      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment counter
    record.count++;
    this.rateLimitStore.set(key, record);

    return { 
      allowed: true, 
      remaining: config.maxRequests - record.count, 
      resetTime: record.resetTime 
    };
  }

  async detectAnomalousActivity(userId: string, activity: {
    type: string;
    ipAddress: string;
    userAgent: string;
    timestamp: number;
  }): Promise<{ suspicious: boolean; riskScore: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for unusual IP patterns
    if (this.isUnusualIP(activity.ipAddress, userId)) {
      reasons.push('Unusual IP address');
      riskScore += 3;
    }

    // Check for rapid requests
    if (this.hasRapidRequests(userId)) {
      reasons.push('Rapid sequential requests');
      riskScore += 2;
    }

    // Check for bot-like user agent
    if (this.isBotUserAgent(activity.userAgent)) {
      reasons.push('Bot-like user agent');
      riskScore += 4;
    }

    const suspicious = riskScore >= 5;

    if (suspicious) {
      await this.logSecurityEvent({
        type: 'system_alert',
        description: `Suspicious activity detected for user ${userId}: ${reasons.join(', ')}`,
        severity: riskScore >= 7 ? 'critical' : 'high'
      });
    }

    return { suspicious, riskScore, reasons };
  }

  private isUnusualIP(ipAddress: string, userId: string): boolean {
    // Simple check - in real implementation, this would check against user's IP history
    const knownIPs = ['192.168.1.100', '10.0.0.25', '172.16.0.1'];
    return !knownIPs.includes(ipAddress);
  }

  private hasRapidRequests(userId: string): boolean {
    // Simple simulation - in real implementation, track request timestamps
    return Math.random() < 0.1; // 10% chance for demo
  }

  private isBotUserAgent(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  // Analytics & Reporting
  async generateSecurityReport(timeRange: { start: Date; end: Date }): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topThreats: string[];
    recommendations: string[];
  }> {
    const events = this.securityEvents.filter(event => 
      event.timestamp >= timeRange.start.getTime() && 
      event.timestamp <= timeRange.end.getTime()
    );

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};

    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
    });

    const topThreats = Object.entries(eventsByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);

    const recommendations = this.generateSecurityRecommendations(eventsBySeverity);

    return {
      totalEvents: events.length,
      eventsByType,
      eventsBySeverity,
      topThreats,
      recommendations
    };
  }

  private generateSecurityRecommendations(eventsBySeverity: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (eventsBySeverity.critical > 0) {
      recommendations.push('Immediately review critical security events');
    }

    if (eventsBySeverity.high > 5) {
      recommendations.push('Consider implementing additional security measures');
    }

    if (eventsBySeverity.failed_login > 10) {
      recommendations.push('Review account security and consider mandatory 2FA');
    }

    return recommendations;
  }

  // Real-time Monitoring
  private setupRealTimeMonitoring(): void {
    // Set up real-time updates every 30 seconds
    setInterval(() => {
      this.publishSystemHealthUpdate();
    }, 30000);

    // Set up security event monitoring
    setInterval(() => {
      this.monitorSecurityEvents();
    }, 10000);
  }

  private async publishSystemHealthUpdate(): Promise<void> {
    const healthData = {
      timestamp: Date.now(),
      cpuUsage: Math.random() * 60 + 20,
      memoryUsage: Math.random() * 40 + 40,
      activeUsers: Math.floor(Math.random() * 1000 + 500),
      securityThreats: this.securityEvents.filter(e => 
        e.severity === 'critical' && !e.resolved
      ).length
    };

    // Emit to connected admin clients
    realtimeService.sendMessage({
      id: `health_${Date.now()}`,
      type: 'system_alert',
      data: {
        type: 'health_update',
        ...healthData
      },
      timestamp: Date.now()
    });
  }

  private async monitorSecurityEvents(): Promise<void> {
    const recentEvents = this.securityEvents
      .filter(event => Date.now() - event.timestamp < 60000) // Last minute
      .filter(event => event.severity === 'critical' || event.severity === 'high');

    if (recentEvents.length > 3) {
      // High frequency of security events - potential attack
      await this.logSecurityEvent({
        type: 'system_alert',
        description: `High frequency of security events detected: ${recentEvents.length} events in the last minute`,
        severity: 'critical'
      });

      // Send immediate notification to admins
      await notificationService.sendNotification({
        id: `security_alert_${Date.now()}`,
        title: 'Security Alert',
        body: 'High frequency of security events detected. Immediate attention required.',
        requireInteraction: true,
        timestamp: Date.now(),
        data: {
          type: 'system_update',
          action: 'security_alert'
        }
      });
    }
  }

  // Utility Methods
  private async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: event.type || 'system_alert',
      userId: event.userId || 'system',
      description: event.description || 'Security event',
      ipAddress: event.ipAddress || '127.0.0.1',
      userAgent: event.userAgent || 'Internal System',
      timestamp: event.timestamp || Date.now(),
      severity: event.severity || 'medium',
      resolved: false
    };

    this.securityEvents.unshift(securityEvent);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(0, 1000);
    }

    console.log(`Security Event: ${securityEvent.type} - ${securityEvent.description}`);
  }

  async getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    return this.securityEvents.slice(0, limit);
  }

  async resolveSecurityEvent(eventId: string): Promise<boolean> {
    const event = this.securityEvents.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      return true;
    }
    return false;
  }

  // Data Export & Compliance
  async exportUserData(userId: string, format: 'json' | 'csv'): Promise<{
    data: any;
    filename: string;
  }> {
    await this.logSecurityEvent({
      type: 'data_export',
      description: `User data exported for user ${userId}`,
      severity: 'medium'
    });

    // Simulate user data compilation
    const userData = {
      userId,
      exportDate: new Date().toISOString(),
      profile: {
        name: 'User Name',
        email: 'user@example.com',
        joinDate: '2024-01-01'
      },
      events: [],
      activities: []
    };

    const filename = `user_data_${userId}_${Date.now()}.${format}`;

    return {
      data: format === 'json' ? JSON.stringify(userData, null, 2) : this.convertToCSV([userData]),
      filename
    };
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  // Cleanup
  cleanup(): void {
    this.rateLimitStore.clear();
    this.securityEvents = [];
    this.adminSessions.clear();
    console.log('Admin service cleaned up');
  }
}

export const adminService = AdminService.getInstance();