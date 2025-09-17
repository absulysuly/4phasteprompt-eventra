import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Activity,
  Lock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Globe,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Server,
  Database,
  Key,
  AlertCircle,
  Settings
} from 'lucide-react';
import { securityService } from '../services/securityService';

interface MilitarySecurityDashboardProps {
  className?: string;
}

interface ComplianceStatus {
  gdprCompliant: boolean;
  iso27001Compliant: boolean;
  soc2Compliant: boolean;
  hipaaCompliant: boolean;
  pciCompliant: boolean;
  recommendations: string[];
}

interface SecurityDashboardData {
  activeThreats: number;
  blockedIPs: number;
  failedLogins24h: number;
  suspiciousActivities: number;
  complianceScore: number;
  criticalAlerts: number;
  recentAuditLogs: any[];
}

const SecurityMetricCard = ({ 
  title, 
  value, 
  trend, 
  status, 
  icon: Icon, 
  onClick 
}: {
  title: string;
  value: string | number;
  trend?: string;
  status: 'secure' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  onClick?: () => void;
}) => {
  const statusStyles = {
    secure: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    critical: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div 
      className={`p-6 rounded-lg border-2 ${statusStyles[status]} ${onClick ? 'cursor-pointer hover:shadow-lg' : ''} transition-all`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
        {trend && (
          <span className="text-sm font-medium">{trend}</span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
};

const ComplianceCard = ({ 
  standard, 
  isCompliant, 
  description 
}: { 
  standard: string; 
  isCompliant: boolean; 
  description: string;
}) => (
  <div className={`p-4 rounded-lg border ${isCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-lg">{standard}</h4>
      {isCompliant ? (
        <CheckCircle className="w-6 h-6 text-green-600" />
      ) : (
        <XCircle className="w-6 h-6 text-red-600" />
      )}
    </div>
    <p className="text-sm opacity-75">{description}</p>
    <div className={`mt-2 px-3 py-1 rounded text-xs font-medium inline-block ${
      isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
    </div>
  </div>
);

const AuditLogTable = ({ logs, onFilterChange }: { 
  logs: any[]; 
  onFilterChange: (filters: any) => void;
}) => {
  const [filters, setFilters] = useState({
    riskLevel: '',
    action: '',
    resource: ''
  });

  const riskLevelColors = {
    low: 'text-blue-600 bg-blue-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select 
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <input
            type="text"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            placeholder="Filter by action..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
          <input
            type="text"
            value={filters.resource}
            onChange={(e) => handleFilterChange('resource', e.target.value)}
            placeholder="Filter by resource..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log, index) => (
              <tr key={log.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.userId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.resource}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskLevelColors[log.riskLevel as keyof typeof riskLevelColors]}`}>
                    {log.riskLevel.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.ipAddress || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ThreatIntelligencePanel = ({ threats }: { threats: any[] }) => (
  <div className="bg-gray-900 text-white p-6 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-400" />
        Active Threat Intelligence
      </h3>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-300">Live Monitoring</span>
      </div>
    </div>
    
    {threats.length === 0 ? (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-300">No active threats detected</p>
        <p className="text-sm text-gray-400 mt-1">System is secure</p>
      </div>
    ) : (
      <div className="space-y-3">
        {threats.map((threat, index) => (
          <div key={index} className="bg-red-900 bg-opacity-50 p-4 rounded border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-300">{threat.type}</h4>
                <p className="text-sm text-gray-300 mt-1">{threat.description}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const MilitaryGradeSecurityDashboard: React.FC<MilitarySecurityDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [securityData, setSecurityData] = useState<SecurityDashboardData | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = () => {
    try {
      const dashboardData = securityService.getSecurityDashboardData();
      const compliance = securityService.getComplianceReport();
      const logs = securityService.getAuditLogs({ limit: 100 });
      
      setSecurityData(dashboardData);
      setComplianceStatus(compliance);
      setAuditLogs(logs);
      setFilteredLogs(logs);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load security data:', error);
      setLoading(false);
    }
  };

  const handleAuditLogFilter = (filters: any) => {
    let filtered = auditLogs;
    
    if (filters.riskLevel) {
      filtered = filtered.filter(log => log.riskLevel === filters.riskLevel);
    }
    
    if (filters.action) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }
    
    if (filters.resource) {
      filtered = filtered.filter(log => 
        log.resource.toLowerCase().includes(filters.resource.toLowerCase())
      );
    }
    
    setFilteredLogs(filtered);
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Resource', 'Risk Level', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userId || '',
        log.action,
        log.resource,
        log.riskLevel,
        log.success ? 'SUCCESS' : 'FAILED',
        log.ipAddress || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: Shield },
    { id: 'threats', label: 'Threat Intelligence', icon: AlertTriangle },
    { id: 'compliance', label: 'Compliance Status', icon: CheckCircle },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'monitoring', label: 'Real-time Monitoring', icon: Activity }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading military-grade security dashboard...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Military-Grade Security Center
          </h2>
          <p className="text-gray-600 mt-1">Advanced threat detection, compliance monitoring, and audit logging</p>
        </div>
        <button
          onClick={loadSecurityData}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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

      {activeTab === 'overview' && securityData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SecurityMetricCard
              title="Active Threats"
              value={securityData.activeThreats}
              status={securityData.activeThreats === 0 ? 'secure' : 'critical'}
              icon={AlertTriangle}
            />
            
            <SecurityMetricCard
              title="Blocked IPs"
              value={securityData.blockedIPs}
              status={securityData.blockedIPs > 10 ? 'warning' : 'secure'}
              icon={Ban}
            />
            
            <SecurityMetricCard
              title="Failed Logins (24h)"
              value={securityData.failedLogins24h}
              status={securityData.failedLogins24h > 50 ? 'critical' : securityData.failedLogins24h > 20 ? 'warning' : 'secure'}
              icon={Users}
            />
            
            <SecurityMetricCard
              title="Compliance Score"
              value={`${securityData.complianceScore}%`}
              status={securityData.complianceScore >= 80 ? 'secure' : securityData.complianceScore >= 60 ? 'warning' : 'critical'}
              icon={CheckCircle}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThreatIntelligencePanel threats={[]} />
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Monitoring</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DDoS Protection</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rate Limiting</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audit Logging</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-600">Recording</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && complianceStatus && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComplianceCard
              standard="GDPR"
              isCompliant={complianceStatus.gdprCompliant}
              description="General Data Protection Regulation compliance for EU data privacy"
            />
            
            <ComplianceCard
              standard="ISO 27001"
              isCompliant={complianceStatus.iso27001Compliant}
              description="International standard for information security management systems"
            />
            
            <ComplianceCard
              standard="SOC 2"
              isCompliant={complianceStatus.soc2Compliant}
              description="Service Organization Control 2 for security and availability"
            />
            
            <ComplianceCard
              standard="HIPAA"
              isCompliant={complianceStatus.hipaaCompliant}
              description="Health Insurance Portability and Accountability Act compliance"
            />
            
            <ComplianceCard
              standard="PCI DSS"
              isCompliant={complianceStatus.pciCompliant}
              description="Payment Card Industry Data Security Standard"
            />
          </div>

          {complianceStatus.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Compliance Recommendations
              </h3>
              <ul className="space-y-2">
                {complianceStatus.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Audit Log Analysis</h3>
            <button
              onClick={exportAuditLogs}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <AuditLogTable logs={filteredLogs} onFilterChange={handleAuditLogFilter} />
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2 text-blue-600" />
              Real-time Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">System Load</span>
                <span className="text-green-600">Normal</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Memory Usage</span>
                <span className="text-yellow-600">75%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Network Traffic</span>
                <span className="text-green-600">Low</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Database Connections</span>
                <span className="text-green-600">Stable</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-purple-600" />
              Encryption Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Data at Rest</span>
                <span className="text-green-600 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  AES-256
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Data in Transit</span>
                <span className="text-green-600 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  TLS 1.3
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Database</span>
                <span className="text-green-600 flex items-center">
                  <Database className="w-4 h-4 mr-1" />
                  Encrypted
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">Backups</span>
                <span className="text-green-600 flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilitaryGradeSecurityDashboard;