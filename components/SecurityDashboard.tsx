import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Unlock,
  Smartphone,
  Globe,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Bell,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  securityService, 
  SecurityConfig, 
  TwoFactorSetup, 
  SecurityAlert, 
  SecurityMetrics,
  LoginAttempt
} from '../services/securityService';

interface SecurityDashboardProps {
  className?: string;
  userId: string;
}

const SecurityStatusCard = ({ 
  title, 
  value, 
  status, 
  icon: Icon, 
  onClick 
}: {
  title: string;
  value: string | number;
  status: 'good' | 'warning' | 'danger';
  icon: React.ComponentType<any>;
  onClick?: () => void;
}) => {
  const statusColors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    danger: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div 
      className={`p-4 rounded-lg border ${statusColors[status]} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-75" />
      </div>
    </div>
  );
};

const TwoFactorSetup = ({ 
  userId, 
  onComplete 
}: { 
  userId: string; 
  onComplete: () => void;
}) => {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    initializeSetup();
  }, [userId]);

  const initializeSetup = async () => {
    try {
      const setupData = await securityService.setupTwoFactor(userId);
      setSetup(setupData);
    } catch (error) {
      console.error('Failed to initialize 2FA setup:', error);
    }
  };

  const enableTwoFactor = async () => {
    if (!setup || !verificationCode) return;

    setLoading(true);
    try {
      const success = await securityService.enableTwoFactor(userId, verificationCode);
      if (success) {
        setStep(3);
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        alert('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
      alert('Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!setup) return;
    
    const codes = setup.backupCodes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventra-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!setup) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Initializing 2FA setup...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {step === 1 && (
        <div className="text-center">
          <div className="mb-6">
            <Smartphone className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Setup Two-Factor Authentication</h3>
            <p className="text-gray-600">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border mb-4">
            <img 
              src={setup.qrCodeUrl} 
              alt="2FA QR Code" 
              className="mx-auto"
            />
          </div>
          
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Manual Entry Key:</p>
            <code className="text-xs bg-white px-2 py-1 rounded border break-all">
              {setup.secret}
            </code>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            I've Added the Account
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="text-center">
          <div className="mb-6">
            <Key className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verify Your Setup</h3>
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app to complete setup
            </p>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl font-mono px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={6}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={enableTwoFactor}
              disabled={loading || verificationCode.length !== 6}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </button>
            
            <button
              onClick={() => setStep(1)}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">2FA Enabled Successfully!</h3>
            <p className="text-gray-600">
              Your account is now protected with two-factor authentication
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-800 mb-1">Save Your Backup Codes</p>
                <p className="text-xs text-yellow-700">
                  Store these codes in a safe place. You can use them to access your account if you lose your phone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="w-full px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {showBackupCodes ? <EyeOff className="w-4 h-4 inline mr-2" /> : <Eye className="w-4 h-4 inline mr-2" />}
              {showBackupCodes ? 'Hide' : 'Show'} Backup Codes
            </button>

            {showBackupCodes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {setup.backupCodes.map((code, index) => (
                    <code key={index} className="text-xs bg-white px-2 py-1 rounded border">
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  onClick={downloadBackupCodes}
                  className="flex items-center justify-center w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Codes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SecurityAlertsList = ({ alerts, onResolve }: { 
  alerts: SecurityAlert[]; 
  onResolve: (alertId: string) => void;
}) => {
  const severityConfig = {
    low: { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Bell },
    medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: AlertTriangle },
    high: { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle },
    critical: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-600">No security alerts. Your account is secure!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity];
        const Icon = config.icon;

        return (
          <div key={alert.id} className={`p-4 rounded-lg border ${config.color}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <Icon className="w-5 h-5 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium">{alert.message}</h4>
                  <p className="text-sm opacity-75 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                  {alert.ipAddress && (
                    <p className="text-xs opacity-60 mt-1">IP: {alert.ipAddress}</p>
                  )}
                </div>
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => onResolve(alert.id)}
                  className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const LoginHistoryList = ({ attempts }: { attempts: LoginAttempt[] }) => {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No login history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.slice(0, 10).map((attempt) => (
        <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              attempt.success ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="text-sm font-medium">
                {attempt.success ? 'Successful Login' : 'Failed Login'}
              </p>
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <span className="flex items-center">
                  <Globe className="w-3 h-3 mr-1" />
                  {attempt.ipAddress}
                </span>
                {attempt.location && (
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {attempt.location}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(attempt.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          {attempt.twoFactorUsed && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              2FA Used
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const SecuritySettingsForm = ({ 
  config, 
  onUpdate 
}: { 
  config: SecurityConfig; 
  onUpdate: (config: Partial<SecurityConfig>) => void;
}) => {
  const [settings, setSettings] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="text-lg font-medium mb-4">Password Policy</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Length
            </label>
            <input
              type="number"
              min="8"
              max="128"
              value={settings.passwordPolicy.minLength}
              onChange={(e) => setSettings({
                ...settings,
                passwordPolicy: {
                  ...settings.passwordPolicy,
                  minLength: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password History Count
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={settings.passwordPolicy.passwordHistoryCount}
              onChange={(e) => setSettings({
                ...settings,
                passwordPolicy: {
                  ...settings.passwordPolicy,
                  passwordHistoryCount: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          {[
            { key: 'requireUppercase', label: 'Require Uppercase' },
            { key: 'requireLowercase', label: 'Require Lowercase' },
            { key: 'requireNumbers', label: 'Require Numbers' },
            { key: 'requireSpecialChars', label: 'Require Special Characters' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.passwordPolicy[key as keyof typeof settings.passwordPolicy] as boolean}
                onChange={(e) => setSettings({
                  ...settings,
                  passwordPolicy: {
                    ...settings.passwordPolicy,
                    [key]: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-4">Session Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Session Duration (hours)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={settings.sessionSettings.maxSessionDuration / 60}
              onChange={(e) => setSettings({
                ...settings,
                sessionSettings: {
                  ...settings.sessionSettings,
                  maxSessionDuration: parseInt(e.target.value) * 60
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idle Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.sessionSettings.idleTimeout}
              onChange={(e) => setSettings({
                ...settings,
                sessionSettings: {
                  ...settings.sessionSettings,
                  idleTimeout: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-4">Threat Detection</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Failed Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.threatDetection.maxFailedAttempts}
              onChange={(e) => setSettings({
                ...settings,
                threatDetection: {
                  ...settings.threatDetection,
                  maxFailedAttempts: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.threatDetection.lockoutDuration}
              onChange={(e) => setSettings({
                ...settings,
                threatDetection: {
                  ...settings.threatDetection,
                  lockoutDuration: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mt-4">
          {[
            { key: 'geoLocationTracking', label: 'Enable Location Tracking' },
            { key: 'deviceFingerprinting', label: 'Enable Device Fingerprinting' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.threatDetection[key as keyof typeof settings.threatDetection] as boolean}
                onChange={(e) => setSettings({
                  ...settings,
                  threatDetection: {
                    ...settings.threatDetection,
                    [key]: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '', userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    loadSecurityData();
    
    // Check if 2FA is enabled for this user
    const twoFactorData = localStorage.getItem(`2fa-enabled-${userId}`);
    setTwoFactorEnabled(!!twoFactorData);
  }, [userId]);

  const loadSecurityData = () => {
    const config = securityService.getSecurityConfig();
    const metrics = securityService.getSecurityMetrics();
    const alerts = securityService.getSecurityAlerts(20);
    
    setSecurityConfig(config);
    setSecurityMetrics(metrics);
    setSecurityAlerts(alerts);
    
    // Mock login history for demo
    const mockHistory: LoginAttempt[] = [
      {
        id: '1',
        userId,
        email: 'user@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: true,
        timestamp: Date.now() - 3600000,
        location: 'New York, US',
        twoFactorUsed: twoFactorEnabled
      },
      {
        id: '2',
        userId,
        email: 'user@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: false,
        timestamp: Date.now() - 7200000,
        location: 'New York, US',
        twoFactorUsed: false,
        failureReason: 'Invalid password'
      }
    ];
    setLoginHistory(mockHistory);
  };

  const handleResolveAlert = (alertId: string) => {
    securityService.resolveSecurityAlert(alertId);
    loadSecurityData();
  };

  const handleUpdateSettings = (updates: Partial<SecurityConfig>) => {
    securityService.updateSecurityConfig(updates);
    loadSecurityData();
  };

  const handle2FAComplete = () => {
    setShow2FASetup(false);
    setTwoFactorEnabled(true);
    loadSecurityData();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
    { id: 'history', label: 'Login History', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!securityConfig || !securityMetrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading security dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Monitor and manage your account security</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecurityStatusCard
              title="Two-Factor Auth"
              value={twoFactorEnabled ? 'Enabled' : 'Disabled'}
              status={twoFactorEnabled ? 'good' : 'danger'}
              icon={twoFactorEnabled ? Lock : Unlock}
              onClick={() => !twoFactorEnabled && setShow2FASetup(true)}
            />
            
            <SecurityStatusCard
              title="Active Threats"
              value={securityMetrics.activeThreats}
              status={securityMetrics.activeThreats === 0 ? 'good' : 'danger'}
              icon={Shield}
            />
            
            <SecurityStatusCard
              title="Failed Logins (24h)"
              value={securityMetrics.failedLogins}
              status={securityMetrics.failedLogins < 3 ? 'good' : 'warning'}
              icon={XCircle}
            />
            
            <SecurityStatusCard
              title="Security Alerts"
              value={securityMetrics.securityAlertsToday}
              status={securityMetrics.securityAlertsToday === 0 ? 'good' : 'warning'}
              icon={AlertTriangle}
            />
          </div>

          {!twoFactorEnabled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800 mb-1">
                    Two-Factor Authentication Not Enabled
                  </h3>
                  <p className="text-red-700 mb-4">
                    Your account is vulnerable to unauthorized access. Enable 2FA to add an extra layer of security.
                  </p>
                  <button
                    onClick={() => setShow2FASetup(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Enable 2FA Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Security Alerts</h3>
              <SecurityAlertsList 
                alerts={securityAlerts.slice(0, 5)} 
                onResolve={handleResolveAlert}
              />
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Login Activity</h3>
              <LoginHistoryList attempts={loginHistory.slice(0, 5)} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Security Alerts</h3>
          <SecurityAlertsList alerts={securityAlerts} onResolve={handleResolveAlert} />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Login History</h3>
          <LoginHistoryList attempts={loginHistory} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
          <SecuritySettingsForm config={securityConfig} onUpdate={handleUpdateSettings} />
        </div>
      )}

      {show2FASetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Enable Two-Factor Authentication</h2>
              <button
                onClick={() => setShow2FASetup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <TwoFactorSetup userId={userId} onComplete={handle2FAComplete} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;