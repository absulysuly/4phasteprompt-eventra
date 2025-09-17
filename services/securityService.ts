export interface SecurityConfig {
  twoFactorEnabled: boolean;
  rateLimitingEnabled: boolean;
  securityMonitoringEnabled: boolean;
  passwordPolicy: PasswordPolicy;
  sessionSettings: SessionSettings;
  threatDetection: ThreatDetectionSettings;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  passwordHistoryCount: number;
  expirationDays?: number;
}

export interface SessionSettings {
  maxSessionDuration: number; // minutes
  idleTimeout: number; // minutes
  maxConcurrentSessions: number;
  requireReauthForSensitive: boolean;
  secureSessionCookies: boolean;
}

export interface ThreatDetectionSettings {
  enabled: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  suspiciousActivityThreshold: number;
  geoLocationTracking: boolean;
  deviceFingerprinting: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  customMessage?: string;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  isEnabled: boolean;
  method: '2fa_app' | 'sms' | 'email';
}

export interface SecurityAlert {
  id: string;
  type: 'login_failed' | 'suspicious_activity' | 'password_changed' | 'device_new' | 'location_new' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp: number;
  resolved: boolean;
  details: Record<string, any>;
}

export interface LoginAttempt {
  id: string;
  userId?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  timestamp: number;
  location?: string;
  deviceFingerprint?: string;
  twoFactorUsed: boolean;
  failureReason?: string;
}

export interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  blockedAttempts: number;
  activeThreats: number;
  twoFactorAdoption: number;
  averageSessionDuration: number;
  suspiciousActivities: number;
  securityAlertsToday: number;
}

class SecurityService {
  private static instance: SecurityService;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, Array<{ timestamp: number; count: number }>> = new Map();
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private securityAlerts: SecurityAlert[] = [];
  private activeThreats: Set<string> = new Set();
  private deviceFingerprints: Map<string, Set<string>> = new Map();

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  constructor() {
    this.config = this.getDefaultConfig();
    this.loadSecurityData();
    this.loadAuditLogs();
    this.startSecurityMonitoring();
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      twoFactorEnabled: true,
      rateLimitingEnabled: true,
      securityMonitoringEnabled: true,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventCommonPasswords: true,
        passwordHistoryCount: 5,
        expirationDays: 90
      },
      sessionSettings: {
        maxSessionDuration: 8 * 60, // 8 hours
        idleTimeout: 30, // 30 minutes
        maxConcurrentSessions: 3,
        requireReauthForSensitive: true,
        secureSessionCookies: true
      },
      threatDetection: {
        enabled: true,
        maxFailedAttempts: 5,
        lockoutDuration: 30,
        suspiciousActivityThreshold: 10,
        geoLocationTracking: true,
        deviceFingerprinting: true
      }
    };
  }

  private loadSecurityData(): void {
    try {
      const savedConfig = localStorage.getItem('eventra-security-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      const savedAlerts = localStorage.getItem('eventra-security-alerts');
      if (savedAlerts) {
        this.securityAlerts = JSON.parse(savedAlerts);
      }

      const savedAttempts = localStorage.getItem('eventra-login-attempts');
      if (savedAttempts) {
        const attempts = JSON.parse(savedAttempts);
        this.loginAttempts = new Map(Object.entries(attempts));
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  }

  private saveSecurityData(): void {
    try {
      localStorage.setItem('eventra-security-config', JSON.stringify(this.config));
      localStorage.setItem('eventra-security-alerts', JSON.stringify(this.securityAlerts));
      
      const attemptsObj = Object.fromEntries(this.loginAttempts);
      localStorage.setItem('eventra-login-attempts', JSON.stringify(attemptsObj));
    } catch (error) {
      console.error('Error saving security data:', error);
    }
  }

  // Two-Factor Authentication
  async setupTwoFactor(userId: string): Promise<TwoFactorSetup> {
    const secret = this.generateTwoFactorSecret();
    const qrCodeUrl = this.generateQRCodeUrl(userId, secret);
    const backupCodes = this.generateBackupCodes();

    const setup: TwoFactorSetup = {
      secret,
      qrCodeUrl,
      backupCodes,
      isEnabled: false,
      method: '2fa_app'
    };

    // Store setup temporarily
    localStorage.setItem(`2fa-setup-${userId}`, JSON.stringify(setup));
    
    return setup;
  }

  async enableTwoFactor(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const setupData = localStorage.getItem(`2fa-setup-${userId}`);
      if (!setupData) {
        throw new Error('Two-factor setup not found');
      }

      const setup: TwoFactorSetup = JSON.parse(setupData);
      
      if (this.verifyTwoFactorCode(setup.secret, verificationCode)) {
        setup.isEnabled = true;
        localStorage.setItem(`2fa-enabled-${userId}`, JSON.stringify(setup));
        localStorage.removeItem(`2fa-setup-${userId}`);

        this.createSecurityAlert({
          type: 'password_changed',
          severity: 'medium',
          message: 'Two-factor authentication enabled',
          userId,
          details: { action: '2fa_enabled' }
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  }

  async disableTwoFactor(userId: string, password: string, verificationCode?: string): Promise<boolean> {
    try {
      const twoFactorData = localStorage.getItem(`2fa-enabled-${userId}`);
      if (!twoFactorData) {
        return true; // Already disabled
      }

      const setup: TwoFactorSetup = JSON.parse(twoFactorData);
      
      // Verify either 2FA code or backup code
      if (verificationCode && (this.verifyTwoFactorCode(setup.secret, verificationCode) || 
          setup.backupCodes.includes(verificationCode))) {
        localStorage.removeItem(`2fa-enabled-${userId}`);
        
        this.createSecurityAlert({
          type: 'password_changed',
          severity: 'high',
          message: 'Two-factor authentication disabled',
          userId,
          details: { action: '2fa_disabled' }
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  }

  verifyTwoFactorCode(secret: string, code: string): boolean {
    // Simulate TOTP verification (in real app, use authenticator library)
    const timeWindow = Math.floor(Date.now() / 30000);
    const expectedCode = this.generateTOTP(secret, timeWindow);
    return code === expectedCode;
  }

  private generateTwoFactorSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateQRCodeUrl(userId: string, secret: string): string {
    const issuer = 'Eventra';
    const label = `${issuer}:${userId}`;
    const qrString = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return codes;
  }

  private generateTOTP(secret: string, timeWindow: number): string {
    // Simplified TOTP generation (use proper crypto library in production)
    const hash = this.simpleHash(secret + timeWindow.toString());
    return (hash % 1000000).toString().padStart(6, '0');
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Rate Limiting
  checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    if (!this.rateLimitStore.has(identifier)) {
      this.rateLimitStore.set(identifier, []);
    }
    
    const attempts = this.rateLimitStore.get(identifier)!;
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
    
    // Count total requests in the window
    const totalRequests = recentAttempts.reduce((sum, attempt) => sum + attempt.count, 0);
    
    if (totalRequests >= config.maxRequests) {
      this.createSecurityAlert({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        message: `Rate limit exceeded for ${identifier}`,
        details: { 
          identifier, 
          requests: totalRequests, 
          limit: config.maxRequests,
          windowMs: config.windowMs 
        }
      });
      return false;
    }
    
    // Add current attempt
    recentAttempts.push({ timestamp: now, count: 1 });
    this.rateLimitStore.set(identifier, recentAttempts);
    
    return true;
  }

  // Password Validation
  validatePassword(password: string, userId?: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (policy.preventCommonPasswords && this.isCommonPassword(password)) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
      'admin', 'letmein', 'welcome', '12345678', 'iloveyou', '123123'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  // Login Tracking and Threat Detection
  recordLoginAttempt(attempt: Omit<LoginAttempt, 'id' | 'timestamp'>): void {
    const loginAttempt: LoginAttempt = {
      ...attempt,
      id: this.generateId(),
      timestamp: Date.now()
    };

    const userAttempts = this.loginAttempts.get(attempt.email) || [];
    userAttempts.push(loginAttempt);
    
    // Keep only recent attempts (last 24 hours)
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentAttempts = userAttempts.filter(a => a.timestamp > oneDayAgo);
    
    this.loginAttempts.set(attempt.email, recentAttempts);

    if (!attempt.success) {
      this.handleFailedLogin(attempt.email, loginAttempt);
    } else {
      this.handleSuccessfulLogin(attempt.email, loginAttempt);
    }

    this.saveSecurityData();
  }

  private handleFailedLogin(email: string, attempt: LoginAttempt): void {
    const recentAttempts = this.loginAttempts.get(email) || [];
    const failedAttempts = recentAttempts.filter(a => !a.success);

    if (failedAttempts.length >= this.config.threatDetection.maxFailedAttempts) {
      this.lockAccount(email);
      
      this.createSecurityAlert({
        type: 'login_failed',
        severity: 'high',
        message: `Account locked due to multiple failed login attempts`,
        userId: attempt.userId,
        ipAddress: attempt.ipAddress,
        details: { 
          email, 
          failedAttempts: failedAttempts.length,
          lockoutDuration: this.config.threatDetection.lockoutDuration 
        }
      });
    }
  }

  private handleSuccessfulLogin(email: string, attempt: LoginAttempt): void {
    // Check for suspicious activity
    if (this.detectSuspiciousActivity(email, attempt)) {
      this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: 'medium',
        message: 'Suspicious login activity detected',
        userId: attempt.userId,
        ipAddress: attempt.ipAddress,
        details: {
          email,
          newLocation: this.isNewLocation(email, attempt.location),
          newDevice: this.isNewDevice(email, attempt.deviceFingerprint)
        }
      });
    }

    // Track device fingerprint
    if (attempt.deviceFingerprint && attempt.userId) {
      if (!this.deviceFingerprints.has(attempt.userId)) {
        this.deviceFingerprints.set(attempt.userId, new Set());
      }
      this.deviceFingerprints.get(attempt.userId)!.add(attempt.deviceFingerprint);
    }
  }

  private detectSuspiciousActivity(email: string, attempt: LoginAttempt): boolean {
    const recentAttempts = this.loginAttempts.get(email) || [];
    
    // Check for new location
    if (this.config.threatDetection.geoLocationTracking && attempt.location) {
      const isNewLoc = this.isNewLocation(email, attempt.location);
      if (isNewLoc) return true;
    }

    // Check for new device
    if (this.config.threatDetection.deviceFingerprinting && attempt.deviceFingerprint) {
      const isNewDevice = this.isNewDevice(email, attempt.deviceFingerprint);
      if (isNewDevice) return true;
    }

    // Check for unusual timing patterns
    if (recentAttempts.length > 1) {
      const lastAttempt = recentAttempts[recentAttempts.length - 2];
      const timeDiff = attempt.timestamp - lastAttempt.timestamp;
      
      // Too many logins in a short period
      if (timeDiff < 60000 && recentAttempts.filter(a => 
        a.timestamp > attempt.timestamp - 300000).length > 5) {
        return true;
      }
    }

    return false;
  }

  private isNewLocation(email: string, location?: string): boolean {
    if (!location) return false;
    
    const userAttempts = this.loginAttempts.get(email) || [];
    const knownLocations = new Set(
      userAttempts
        .filter(a => a.success && a.location)
        .map(a => a.location)
    );
    
    return !knownLocations.has(location);
  }

  private isNewDevice(email: string, fingerprint?: string): boolean {
    if (!fingerprint) return false;
    
    const userAttempts = this.loginAttempts.get(email) || [];
    const knownFingerprints = new Set(
      userAttempts
        .filter(a => a.success && a.deviceFingerprint)
        .map(a => a.deviceFingerprint)
    );
    
    return !knownFingerprints.has(fingerprint);
  }

  private lockAccount(email: string): void {
    const lockoutEnd = Date.now() + (this.config.threatDetection.lockoutDuration * 60 * 1000);
    localStorage.setItem(`account-locked-${email}`, lockoutEnd.toString());
  }

  isAccountLocked(email: string): boolean {
    const lockoutEnd = localStorage.getItem(`account-locked-${email}`);
    if (!lockoutEnd) return false;
    
    const lockoutTime = parseInt(lockoutEnd);
    const now = Date.now();
    
    if (now > lockoutTime) {
      localStorage.removeItem(`account-locked-${email}`);
      return false;
    }
    
    return true;
  }

  // Security Alerts Management
  private createSecurityAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const alert: SecurityAlert = {
      ...alertData,
      id: this.generateId(),
      timestamp: Date.now(),
      resolved: false
    };

    this.securityAlerts.unshift(alert);
    
    // Keep only last 1000 alerts
    if (this.securityAlerts.length > 1000) {
      this.securityAlerts = this.securityAlerts.slice(0, 1000);
    }

    this.saveSecurityData();
    console.warn('Security Alert:', alert);
  }

  getSecurityAlerts(limit?: number, severity?: string): SecurityAlert[] {
    let alerts = this.securityAlerts;
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    return limit ? alerts.slice(0, limit) : alerts;
  }

  resolveSecurityAlert(alertId: string): boolean {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveSecurityData();
      return true;
    }
    return false;
  }

  // Security Monitoring
  private startSecurityMonitoring(): void {
    if (!this.config.securityMonitoringEnabled) return;

    // Clean up old data periodically
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Every hour

    // Monitor for active threats
    setInterval(() => {
      this.analyzeThreats();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupOldData(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Clean up rate limiting data
    for (const [key, attempts] of this.rateLimitStore.entries()) {
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneDayAgo);
      if (recentAttempts.length === 0) {
        this.rateLimitStore.delete(key);
      } else {
        this.rateLimitStore.set(key, recentAttempts);
      }
    }

    // Clean up old login attempts
    for (const [email, attempts] of this.loginAttempts.entries()) {
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneWeekAgo);
      if (recentAttempts.length === 0) {
        this.loginAttempts.delete(email);
      } else {
        this.loginAttempts.set(email, recentAttempts);
      }
    }

    // Clean up resolved alerts older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.securityAlerts = this.securityAlerts.filter(
      alert => !alert.resolved || alert.timestamp > thirtyDaysAgo
    );

    this.saveSecurityData();
  }

  private analyzeThreats(): void {
    this.activeThreats.clear();

    // Analyze recent failed login patterns
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    for (const [email, attempts] of this.loginAttempts.entries()) {
      const recentFailures = attempts.filter(
        a => !a.success && a.timestamp > oneHourAgo
      );

      if (recentFailures.length > 3) {
        this.activeThreats.add(`brute_force_${email}`);
      }

      // Check for distributed attacks (same IP, multiple accounts)
      const ipGroups = new Map<string, number>();
      recentFailures.forEach(attempt => {
        const count = ipGroups.get(attempt.ipAddress) || 0;
        ipGroups.set(attempt.ipAddress, count + 1);
      });

      for (const [ip, count] of ipGroups.entries()) {
        if (count > 5) {
          this.activeThreats.add(`distributed_attack_${ip}`);
        }
      }
    }
  }

  // Security Metrics
  getSecurityMetrics(): SecurityMetrics {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    let totalLogins = 0;
    let failedLogins = 0;
    let twoFactorUsers = 0;
    let totalUsers = 0;
    let totalSessionDuration = 0;

    for (const attempts of this.loginAttempts.values()) {
      const recentAttempts = attempts.filter(a => a.timestamp > oneDayAgo);
      totalLogins += recentAttempts.filter(a => a.success).length;
      failedLogins += recentAttempts.filter(a => !a.success).length;
      
      const user2FA = recentAttempts.some(a => a.success && a.twoFactorUsed);
      if (user2FA) twoFactorUsers++;
      if (recentAttempts.length > 0) totalUsers++;
    }

    const todayAlerts = this.securityAlerts.filter(a => a.timestamp > oneDayAgo).length;
    const suspiciousActivities = this.securityAlerts.filter(
      a => a.type === 'suspicious_activity' && a.timestamp > oneDayAgo
    ).length;

    return {
      totalLogins,
      failedLogins,
      blockedAttempts: failedLogins, // Simplified
      activeThreats: this.activeThreats.size,
      twoFactorAdoption: totalUsers > 0 ? (twoFactorUsers / totalUsers) * 100 : 0,
      averageSessionDuration: this.config.sessionSettings.maxSessionDuration, // Simplified
      suspiciousActivities,
      securityAlertsToday: todayAlerts
    };
  }

  // Configuration Management
  updateSecurityConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveSecurityData();
  }

  getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Session Management
  validateSession(sessionToken: string, userId: string): boolean {
    const sessionData = localStorage.getItem(`session-${sessionToken}`);
    if (!sessionData) return false;

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check expiration
      if (session.expiresAt < now) {
        localStorage.removeItem(`session-${sessionToken}`);
        return false;
      }

      // Check idle timeout
      if (session.lastActivity + (this.config.sessionSettings.idleTimeout * 60 * 1000) < now) {
        localStorage.removeItem(`session-${sessionToken}`);
        return false;
      }

      // Update last activity
      session.lastActivity = now;
      localStorage.setItem(`session-${sessionToken}`, JSON.stringify(session));
      
      return session.userId === userId;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  createSession(userId: string): string {
    const sessionToken = this.generateId();
    const now = Date.now();
    const session = {
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + (this.config.sessionSettings.maxSessionDuration * 60 * 1000)
    };

    localStorage.setItem(`session-${sessionToken}`, JSON.stringify(session));
    return sessionToken;
  }

  // Utility Methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Device Fingerprinting
  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      plugins: Array.from(navigator.plugins).map(p => p.name).join(',')
    };

    return btoa(JSON.stringify(fingerprint)).substr(0, 32);
  }

  // Get user's approximate location (for demo purposes)
  async getUserLocation(): Promise<string> {
    try {
      // In a real app, use proper geolocation or IP-based location service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return `${data.city}, ${data.country_name}`;
    } catch (error) {
      return 'Unknown Location';
    }
  }
  // Advanced DDoS Protection
  detectDDoSAttack(ipAddress: string, userAgent?: string): boolean {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Check requests from this IP in the last 5 minutes
    let requestsFromIP = 0;
    for (const [identifier, attempts] of this.rateLimitStore.entries()) {
      if (identifier.includes(ipAddress)) {
        const recentAttempts = attempts.filter(attempt => attempt.timestamp > fiveMinutesAgo);
        requestsFromIP += recentAttempts.reduce((sum, attempt) => sum + attempt.count, 0);
      }
    }

    // Threshold for potential DDoS
    if (requestsFromIP > 1000) {
      this.createSecurityAlert({
        type: 'rate_limit_exceeded',
        severity: 'critical',
        message: `Potential DDoS attack detected from IP: ${ipAddress}`,
        ipAddress,
        userAgent,
        details: {
          requestsInFiveMinutes: requestsFromIP,
          threshold: 1000,
          attackType: 'ddos_suspected'
        }
      });
      
      this.blockIP(ipAddress, 24 * 60); // Block for 24 hours
      return true;
    }
    
    return false;
  }

  // IP Blocking System
  blockIP(ipAddress: string, durationMinutes: number): void {
    const blockUntil = Date.now() + (durationMinutes * 60 * 1000);
    localStorage.setItem(`ip-blocked-${ipAddress}`, blockUntil.toString());
    
    this.createSecurityAlert({
      type: 'suspicious_activity',
      severity: 'high',
      message: `IP address blocked: ${ipAddress}`,
      ipAddress,
      details: {
        blockDurationMinutes: durationMinutes,
        blockUntil,
        reason: 'security_policy_violation'
      }
    });
  }

  isIPBlocked(ipAddress: string): boolean {
    const blockUntil = localStorage.getItem(`ip-blocked-${ipAddress}`);
    if (!blockUntil) return false;
    
    const blockTime = parseInt(blockUntil);
    const now = Date.now();
    
    if (now > blockTime) {
      localStorage.removeItem(`ip-blocked-${ipAddress}`);
      return false;
    }
    
    return true;
  }

  // Advanced User Verification
  initiateUserVerification(userId: string, verificationType: 'identity' | 'phone' | 'email' | 'document'): string {
    const verificationId = this.generateId();
    const verification = {
      id: verificationId,
      userId,
      type: verificationType,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      attempts: 0,
      maxAttempts: 3
    };
    
    localStorage.setItem(`verification-${verificationId}`, JSON.stringify(verification));
    
    this.createSecurityAlert({
      type: 'suspicious_activity',
      severity: 'low',
      message: `User verification initiated: ${verificationType}`,
      userId,
      details: {
        verificationType,
        verificationId,
        expiresAt: verification.expiresAt
      }
    });
    
    return verificationId;
  }

  completeUserVerification(verificationId: string, verificationCode: string): boolean {
    const verificationData = localStorage.getItem(`verification-${verificationId}`);
    if (!verificationData) return false;
    
    try {
      const verification = JSON.parse(verificationData);
      
      // Check expiration
      if (Date.now() > verification.expiresAt) {
        localStorage.removeItem(`verification-${verificationId}`);
        return false;
      }
      
      // Check max attempts
      if (verification.attempts >= verification.maxAttempts) {
        localStorage.removeItem(`verification-${verificationId}`);
        return false;
      }
      
      verification.attempts++;
      
      // Simulate verification check (in real app, validate with external service)
      const expectedCode = this.generateVerificationCode(verificationId);
      if (verificationCode === expectedCode) {
        verification.status = 'completed';
        verification.completedAt = Date.now();
        localStorage.setItem(`verification-${verificationId}`, JSON.stringify(verification));
        
        this.createSecurityAlert({
          type: 'password_changed',
          severity: 'low',
          message: `User verification completed: ${verification.type}`,
          userId: verification.userId,
          details: {
            verificationType: verification.type,
            verificationId,
            completedAt: verification.completedAt
          }
        });
        
        return true;
      }
      
      localStorage.setItem(`verification-${verificationId}`, JSON.stringify(verification));
      return false;
    } catch (error) {
      console.error('Verification completion error:', error);
      return false;
    }
  }

  private generateVerificationCode(verificationId: string): string {
    // Simulate verification code generation (use proper service in production)
    const hash = this.simpleHash(verificationId + Date.now().toString());
    return (hash % 1000000).toString().padStart(6, '0');
  }

  // Comprehensive Audit Logging
  private auditLogs: Array<{
    id: string;
    userId?: string;
    action: string;
    resource: string;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    details: Record<string, any>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> = [];

  logAuditEvent(
    action: string,
    resource: string,
    success: boolean,
    options: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
      riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): void {
    const auditLog = {
      id: this.generateId(),
      userId: options.userId,
      action,
      resource,
      timestamp: Date.now(),
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success,
      details: options.details || {},
      riskLevel: options.riskLevel || 'low'
    };

    this.auditLogs.push(auditLog);
    
    // Keep only last 10000 audit logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    // Create security alert for high-risk actions
    if (auditLog.riskLevel === 'high' || auditLog.riskLevel === 'critical') {
      this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: auditLog.riskLevel === 'critical' ? 'critical' : 'high',
        message: `High-risk action performed: ${action} on ${resource}`,
        userId: options.userId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        details: {
          action,
          resource,
          success,
          riskLevel: auditLog.riskLevel,
          auditLogId: auditLog.id
        }
      });
    }

    // Store audit logs periodically
    try {
      localStorage.setItem('eventra-audit-logs', JSON.stringify(this.auditLogs.slice(-1000)));
    } catch (error) {
      console.error('Failed to store audit logs:', error);
    }
  }

  getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    riskLevel?: string;
    startDate?: number;
    endDate?: number;
    limit?: number;
  } = {}): typeof this.auditLogs {
    let logs = this.auditLogs;

    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }
    
    if (filters.action) {
      logs = logs.filter(log => log.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    
    if (filters.resource) {
      logs = logs.filter(log => log.resource.toLowerCase().includes(filters.resource!.toLowerCase()));
    }
    
    if (filters.riskLevel) {
      logs = logs.filter(log => log.riskLevel === filters.riskLevel);
    }
    
    if (filters.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }
    
    if (filters.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }

    // Sort by timestamp descending
    logs.sort((a, b) => b.timestamp - a.timestamp);
    
    return filters.limit ? logs.slice(0, filters.limit) : logs;
  }

  // End-to-End Encryption Support
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    // Simulate key generation (use Web Crypto API in production)
    const publicKey = btoa(Math.random().toString(36).substr(2, 128));
    const privateKey = btoa(Math.random().toString(36).substr(2, 128));
    
    return { publicKey, privateKey };
  }

  async encryptData(data: string, publicKey: string): Promise<string> {
    // Simulate encryption (use proper crypto library in production)
    const encrypted = btoa(JSON.stringify({ data, key: publicKey.substr(0, 16) }));
    return encrypted;
  }

  async decryptData(encryptedData: string, privateKey: string): Promise<string> {
    // Simulate decryption (use proper crypto library in production)
    try {
      const decoded = JSON.parse(atob(encryptedData));
      return decoded.data;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  // Advanced Security Compliance
  getComplianceReport(): {
    gdprCompliant: boolean;
    iso27001Compliant: boolean;
    soc2Compliant: boolean;
    hipaaCompliant: boolean;
    pciCompliant: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let gdprCompliant = true;
    let iso27001Compliant = true;
    let soc2Compliant = true;
    let hipaaCompliant = true;
    let pciCompliant = true;

    // Check password policy compliance
    if (this.config.passwordPolicy.minLength < 8) {
      recommendations.push('Increase minimum password length to 8+ characters for compliance');
      iso27001Compliant = false;
      soc2Compliant = false;
    }

    // Check 2FA enforcement
    if (!this.config.twoFactorEnabled) {
      recommendations.push('Enable mandatory two-factor authentication for compliance');
      iso27001Compliant = false;
      soc2Compliant = false;
      hipaaCompliant = false;
    }

    // Check session timeout
    if (this.config.sessionSettings.idleTimeout > 30) {
      recommendations.push('Reduce idle timeout to 30 minutes or less for compliance');
      hipaaCompliant = false;
      pciCompliant = false;
    }

    // Check security monitoring
    if (!this.config.securityMonitoringEnabled) {
      recommendations.push('Enable security monitoring for compliance');
      iso27001Compliant = false;
      soc2Compliant = false;
    }

    // Check audit logging
    if (this.auditLogs.length === 0) {
      recommendations.push('Implement comprehensive audit logging for compliance');
      iso27001Compliant = false;
      soc2Compliant = false;
      hipaaCompliant = false;
      pciCompliant = false;
    }

    return {
      gdprCompliant,
      iso27001Compliant,
      soc2Compliant,
      hipaaCompliant,
      pciCompliant,
      recommendations
    };
  }

  // Real-time Security Monitoring
  getSecurityDashboardData(): {
    activeThreats: number;
    blockedIPs: number;
    failedLogins24h: number;
    suspiciousActivities: number;
    complianceScore: number;
    criticalAlerts: number;
    recentAuditLogs: typeof this.auditLogs;
  } {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Count blocked IPs
    let blockedIPs = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ip-blocked-')) {
        const blockUntil = localStorage.getItem(key);
        if (blockUntil && parseInt(blockUntil) > now) {
          blockedIPs++;
        }
      }
    }

    // Count failed logins in last 24h
    let failedLogins24h = 0;
    for (const attempts of this.loginAttempts.values()) {
      failedLogins24h += attempts.filter(a => !a.success && a.timestamp > oneDayAgo).length;
    }

    // Count suspicious activities
    const suspiciousActivities = this.securityAlerts.filter(
      alert => alert.type === 'suspicious_activity' && alert.timestamp > oneDayAgo
    ).length;

    // Count critical alerts
    const criticalAlerts = this.securityAlerts.filter(
      alert => alert.severity === 'critical' && !alert.resolved
    ).length;

    // Calculate compliance score
    const compliance = this.getComplianceReport();
    const complianceCount = Object.values(compliance).filter(val => val === true).length - 1; // -1 for recommendations array
    const complianceScore = (complianceCount / 5) * 100; // 5 compliance standards

    return {
      activeThreats: this.activeThreats.size,
      blockedIPs,
      failedLogins24h,
      suspiciousActivities,
      complianceScore,
      criticalAlerts,
      recentAuditLogs: this.getAuditLogs({ limit: 10 })
    };
  }

  // Load audit logs from storage on initialization
  private loadAuditLogs(): void {
    try {
      const savedLogs = localStorage.getItem('eventra-audit-logs');
      if (savedLogs) {
        this.auditLogs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  }
}

export const securityService = SecurityService.getInstance();
