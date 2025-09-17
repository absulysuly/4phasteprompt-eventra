import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Link, 
  Unlink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Calendar,
  Facebook,
  Twitter,
  Instagram,
  CreditCard,
  Mail,
  BarChart3,
  Users,
  Globe,
  Zap,
  Download,
  Upload
} from 'lucide-react';
import { integrationService, IntegrationConfig } from '../services/integrationService';

interface IntegrationsManagerProps {
  className?: string;
}

const IntegrationIcon = ({ type }: { type: string }) => {
  const iconMap = {
    calendar: Calendar,
    social: Facebook,
    payment: CreditCard,
    email: Mail,
    analytics: BarChart3,
    crm: Users
  };
  
  const Icon = iconMap[type as keyof typeof iconMap] || Globe;
  return <Icon className="w-5 h-5" />;
};

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    connected: { icon: CheckCircle, text: 'Connected', color: 'text-green-600 bg-green-50' },
    disconnected: { icon: XCircle, text: 'Disconnected', color: 'text-gray-500 bg-gray-50' },
    error: { icon: XCircle, text: 'Error', color: 'text-red-600 bg-red-50' },
    syncing: { icon: RefreshCw, text: 'Syncing', color: 'text-blue-600 bg-blue-50' }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className={`w-3 h-3 mr-1 ${status === 'syncing' ? 'animate-spin' : ''}`} />
      {config.text}
    </span>
  );
};

const IntegrationCard = ({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onConfigure 
}: { 
  integration: IntegrationConfig;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onConfigure: (id: string) => void;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg mr-3">
            <IntegrationIcon type={integration.type} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>
      
      {integration.enabled && integration.lastSync && (
        <div className="text-sm text-gray-500 mb-4">
          Last sync: {new Date(integration.lastSync).toLocaleString()}
        </div>
      )}
      
      {integration.errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-700">{integration.errorMessage}</p>
        </div>
      )}
      
      <div className="flex space-x-2">
        {integration.enabled ? (
          <>
            <button
              onClick={() => onConfigure(integration.id)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </button>
            <button
              onClick={() => onDisconnect(integration.id)}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <Unlink className="w-4 h-4 mr-1" />
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration.id)}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Link className="w-4 h-4 mr-1" />
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

const ConfigurationModal = ({ 
  integration, 
  isOpen, 
  onClose, 
  onSave 
}: {
  integration: IntegrationConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, settings: any) => void;
}) => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setSaving] = useState(false);
  
  useEffect(() => {
    if (integration) {
      setSettings({ ...integration.settings });
    }
  }, [integration]);
  
  const handleSave = async () => {
    if (!integration) return;
    
    setSaving(true);
    try {
      await onSave(integration.id, settings);
      onClose();
    } finally {
      setSaving(false);
    }
  };
  
  if (!isOpen || !integration) return null;
  
  const renderSettingsFields = () => {
    switch (integration.type) {
      case 'calendar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto Create Events
              </label>
              <input
                type="checkbox"
                checked={settings.autoCreateEvents || false}
                onChange={(e) => setSettings({ ...settings, autoCreateEvents: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calendar ID
              </label>
              <input
                type="text"
                value={settings.calendarId || ''}
                onChange={(e) => setSettings({ ...settings, calendarId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Minutes (comma separated)
              </label>
              <input
                type="text"
                value={(settings.reminderMinutes || []).join(', ')}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  reminderMinutes: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60, 1440"
              />
            </div>
          </div>
        );
        
      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auto Post Events
              </label>
              <input
                type="checkbox"
                checked={settings.autoPost || false}
                onChange={(e) => setSettings({ ...settings, autoPost: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Template
              </label>
              <textarea
                value={settings.postTemplate || ''}
                onChange={(e) => setSettings({ ...settings, postTemplate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Join me at {{eventTitle}} on {{eventDate}}! {{eventUrl}}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtags (comma separated)
              </label>
              <input
                type="text"
                value={(settings.hashtags || []).join(', ')}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  hashtags: e.target.value.split(',').map(tag => tag.trim().startsWith('#') ? tag.trim() : '#' + tag.trim())
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#event, #eventra"
              />
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={settings.currency || 'USD'}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Percentage
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.feePercentage || 2.9}
                onChange={(e) => setSettings({ ...settings, feePercentage: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fixed Fee
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.fixedFee || 0.30}
                onChange={(e) => setSettings({ ...settings, fixedFee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List ID
              </label>
              <input
                type="text"
                value={settings.listId || ''}
                onChange={(e) => setSettings({ ...settings, listId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enable Automation
              </label>
              <input
                type="checkbox"
                checked={settings.automationEnabled || false}
                onChange={(e) => setSettings({ ...settings, automationEnabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking ID
              </label>
              <input
                type="text"
                value={settings.trackingId || ''}
                onChange={(e) => setSettings({ ...settings, trackingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Track Page Views
              </label>
              <input
                type="checkbox"
                checked={settings.trackPageViews || false}
                onChange={(e) => setSettings({ ...settings, trackPageViews: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Track Events
              </label>
              <input
                type="checkbox"
                checked={settings.trackEvents || false}
                onChange={(e) => setSettings({ ...settings, trackEvents: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-gray-500">
            No specific settings available for this integration type.
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Configure {integration.name}
          </h2>
        </div>
        
        <div className="p-6">
          {renderSettingsFields()}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConnectionModal = ({ 
  integration, 
  isOpen, 
  onClose, 
  onConnect 
}: {
  integration: IntegrationConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (id: string, credentials: any) => void;
}) => {
  const [credentials, setCredentials] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const handleConnect = async () => {
    if (!integration) return;
    
    setLoading(true);
    try {
      await onConnect(integration.id, credentials);
      setCredentials({});
      onClose();
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen || !integration) return null;
  
  const renderCredentialFields = () => {
    switch (integration.type) {
      case 'calendar':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click "Connect" to authenticate with your {integration.name} account via OAuth.
            </p>
          </div>
        );
        
      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App ID
              </label>
              <input
                type="text"
                value={credentials.appId || ''}
                onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                App Secret
              </label>
              <input
                type="password"
                value={credentials.appSecret || ''}
                onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publishable Key
              </label>
              <input
                type="text"
                value={credentials.publishableKey || ''}
                onChange={(e) => setCredentials({ ...credentials, publishableKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret Key
              </label>
              <input
                type="password"
                value={credentials.secretKey || ''}
                onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={credentials.apiKey || ''}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement ID
              </label>
              <input
                type="text"
                value={credentials.measurementId || ''}
                onChange={(e) => setCredentials({ ...credentials, measurementId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Secret
              </label>
              <input
                type="password"
                value={credentials.apiSecret || ''}
                onChange={(e) => setCredentials({ ...credentials, apiSecret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect {integration.name}
          </h2>
        </div>
        
        <div className="p-6">
          {renderCredentialFields()}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      </div>
    </div>
  );
};

const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ className = '' }) => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [connectionModal, setConnectionModal] = useState(false);
  const [configModal, setConfigModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadIntegrations();
    integrationService.initialize();
  }, []);

  const loadIntegrations = () => {
    const integrationList = integrationService.getIntegrations();
    setIntegrations(integrationList);
  };

  const handleConnect = async (id: string, credentials: any) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    let success = false;
    
    try {
      switch (integration.type) {
        case 'calendar':
          success = await integrationService.connectCalendar(
            integration.id.replace('_calendar', '') as any,
            credentials
          );
          break;
        case 'social':
          success = await integrationService.connectSocialMedia(
            integration.id.replace('_integration', ''),
            credentials
          );
          break;
        case 'payment':
          success = await integrationService.connectPaymentProvider(
            integration.id.replace('_payments', ''),
            credentials
          );
          break;
        case 'email':
          success = await integrationService.connectEmailProvider(
            integration.id.replace('_email', ''),
            credentials
          );
          break;
        case 'analytics':
          success = await integrationService.connectAnalytics(
            integration.id.replace('_analytics', ''),
            credentials
          );
          break;
      }
      
      if (success) {
        loadIntegrations();
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async (id: string) => {
    await integrationService.disconnectIntegration(id);
    loadIntegrations();
  };

  const handleConfigure = async (id: string, settings: any) => {
    await integrationService.updateIntegrationSettings(id, settings);
    loadIntegrations();
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      await integrationService.syncAllIntegrations();
      loadIntegrations();
    } finally {
      setSyncing(false);
    }
  };

  const openConnectionModal = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setConnectionModal(true);
  };

  const openConfigModal = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setConfigModal(true);
  };

  const exportConfig = () => {
    const config = integrationService.exportIntegrationsConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventra-integrations.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const config = e.target?.result as string;
      const success = await integrationService.importIntegrationsConfig(config);
      if (success) {
        loadIntegrations();
      }
    };
    reader.readAsText(file);
  };

  const filteredIntegrations = integrations.filter(integration => {
    if (filter === 'all') return true;
    return integration.type === filter;
  });

  const integrationTypes = [
    { value: 'all', label: 'All Integrations' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'social', label: 'Social Media' },
    { value: 'payment', label: 'Payments' },
    { value: 'email', label: 'Email Marketing' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'crm', label: 'CRM' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600">Connect and manage your third-party services</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            className="hidden"
            id="import-config"
          />
          <label
            htmlFor="import-config"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <Upload className="w-4 h-4 mr-1" />
            Import
          </label>
          
          <button
            onClick={exportConfig}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
          
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {integrationTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                filter === type.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          {filteredIntegrations.length} integration{filteredIntegrations.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={() => openConnectionModal(integration)}
            onDisconnect={handleDisconnect}
            onConfigure={() => openConfigModal(integration)}
          />
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No integrations are available.' 
              : `No ${filter} integrations are available.`
            }
          </p>
        </div>
      )}

      <ConnectionModal
        integration={selectedIntegration}
        isOpen={connectionModal}
        onClose={() => setConnectionModal(false)}
        onConnect={handleConnect}
      />

      <ConfigurationModal
        integration={selectedIntegration}
        isOpen={configModal}
        onClose={() => setConfigModal(false)}
        onSave={handleConfigure}
      />
    </div>
  );
};

export default IntegrationsManager;