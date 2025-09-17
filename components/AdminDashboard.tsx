import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/i18n';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  pendingEvents: number;
  totalRevenue: number;
  monthlyGrowth: number;
  userGrowthRate: number;
  eventGrowthRate: number;
  revenueGrowthRate: number;
  dailyActiveUsers: number;
  monthlyRevenue: number;
  conversionRate: number;
  churnRate: number;
  averageSessionDuration: number;
  totalTransactions: number;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  level: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'moderator' | 'admin' | 'super_admin';
  customRole?: UserRole;
  status: 'active' | 'suspended' | 'pending' | 'banned' | 'verified';
  joinDate: string;
  lastActive: string;
  eventsCreated: number;
  eventsAttended: number;
  reportCount: number;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  loginAttempts: number;
  lastLoginIp: string;
  twoFactorEnabled: boolean;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  totalSpent: number;
  riskScore: number;
  notes: string[];
}

interface Event {
  id: string;
  title: string;
  organizer: string;
  category: string;
  date: string;
  status: 'active' | 'pending' | 'rejected' | 'cancelled';
  attendees: number;
  revenue: number;
  reportCount: number;
  flagged: boolean;
}

interface ContentReport {
  id: string;
  type: 'event' | 'user' | 'comment';
  targetId: string;
  targetTitle: string;
  reason: string;
  reporter: string;
  date: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  details: string;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTime: number;
  uptime: number;
  activeConnections: number;
  errorRate: number;
  throughput: number;
  databaseConnections: number;
  cacheHitRate: number;
  queueSize: number;
  alertsCount: number;
  securityThreats: number;
  backupStatus: 'success' | 'failed' | 'in_progress';
  lastBackup: string;
  storageUsage: number;
  networkLatency: number;
}

interface AdminPermissions {
  canManageUsers: boolean;
  canManageEvents: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canViewSystemHealth: boolean;
  canManageRoles: boolean;
  canViewFinancials: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canViewSecurityLogs: boolean;
}

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'user' | 'event' | 'report' | 'system';
  targetId: string;
  timestamp: number;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function AdminDashboard() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentAdmin] = useState({ role: 'admin', permissions: {
    canManageUsers: true,
    canManageEvents: true,
    canViewReports: true,
    canViewAnalytics: true,
    canViewSystemHealth: true,
    canManageRoles: true,
    canViewFinancials: true,
    canExportData: true,
    canManageSettings: true,
    canViewSecurityLogs: true
  } as AdminPermissions });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('lastActive');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await Promise.all([
        fetchAdminStats(),
        fetchUsers(),
        fetchEvents(),
        fetchReports(),
        fetchSystemHealth()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAdminStats({
      totalUsers: 15847,
      activeUsers: 3214,
      totalEvents: 2891,
      pendingEvents: 47,
      totalRevenue: 387420,
      monthlyGrowth: 12.5,
      userGrowthRate: 8.3,
      eventGrowthRate: 15.7,
      revenueGrowthRate: 22.1,
      dailyActiveUsers: 892,
      monthlyRevenue: 42850,
      conversionRate: 3.2,
      churnRate: 1.8,
      averageSessionDuration: 18.5,
      totalTransactions: 5647
    });
  };

  const fetchUsers = async () => {
    // Simulate API call with mock data
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Ahmad Hassan',
        email: 'ahmad.hassan@example.com',
        role: 'organizer',
        status: 'verified',
        joinDate: '2024-01-15',
        lastActive: '2024-12-15',
        eventsCreated: 12,
        eventsAttended: 45,
        reportCount: 0,
        verificationStatus: 'verified',
        loginAttempts: 0,
        lastLoginIp: '192.168.1.100',
        twoFactorEnabled: true,
        subscriptionTier: 'premium',
        totalSpent: 1250.00,
        riskScore: 2,
        notes: ['Excellent organizer', 'Verified identity']
      },
      {
        id: '2',
        name: 'Sara Mohammed',
        email: 'sara.mohammed@example.com',
        role: 'user',
        status: 'active',
        joinDate: '2024-03-20',
        lastActive: '2024-12-14',
        eventsCreated: 0,
        eventsAttended: 8,
        reportCount: 1,
        verificationStatus: 'verified',
        loginAttempts: 0,
        lastLoginIp: '10.0.0.25',
        twoFactorEnabled: false,
        subscriptionTier: 'free',
        totalSpent: 150.00,
        riskScore: 1,
        notes: ['Regular user', 'Minor content report']
      },
      {
        id: '3',
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: 'user',
        status: 'suspended',
        joinDate: '2024-02-10',
        lastActive: '2024-12-10',
        eventsCreated: 2,
        eventsAttended: 15,
        reportCount: 3,
        verificationStatus: 'rejected',
        loginAttempts: 5,
        lastLoginIp: '45.123.67.89',
        twoFactorEnabled: false,
        subscriptionTier: 'free',
        totalSpent: 75.00,
        riskScore: 8,
        notes: ['Multiple violations', 'Suspended for inappropriate content', 'Failed verification']
      },
      {
        id: '4',
        name: 'Layla Ahmed',
        email: 'layla.ahmed@example.com',
        role: 'moderator',
        status: 'active',
        joinDate: '2024-02-01',
        lastActive: '2024-12-15',
        eventsCreated: 5,
        eventsAttended: 32,
        reportCount: 0,
        verificationStatus: 'verified',
        loginAttempts: 0,
        lastLoginIp: '192.168.1.50',
        twoFactorEnabled: true,
        subscriptionTier: 'enterprise',
        totalSpent: 2100.00,
        riskScore: 1,
        notes: ['Trusted moderator', 'Excellent track record']
      }
    ];
    setUsers(mockUsers);
  };

  const fetchEvents = async () => {
    // Simulate API call with mock data
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Tech Conference Erbil 2024',
        organizer: 'Ahmad Hassan',
        category: 'Technology',
        date: '2024-12-25',
        status: 'active',
        attendees: 245,
        revenue: 12250,
        reportCount: 0,
        flagged: false
      },
      {
        id: '2',
        title: 'Kurdish Music Festival',
        organizer: 'Sara Mohammed',
        category: 'Music',
        date: '2024-12-30',
        status: 'pending',
        attendees: 0,
        revenue: 0,
        reportCount: 0,
        flagged: false
      },
      {
        id: '3',
        title: 'Inappropriate Event Title',
        organizer: 'John Smith',
        category: 'Other',
        date: '2024-12-28',
        status: 'pending',
        attendees: 5,
        revenue: 150,
        reportCount: 2,
        flagged: true
      }
    ];
    setEvents(mockEvents);
  };

  const fetchReports = async () => {
    // Simulate API call with mock data
    const mockReports: ContentReport[] = [
      {
        id: '1',
        type: 'event',
        targetId: '3',
        targetTitle: 'Inappropriate Event Title',
        reason: 'Inappropriate content',
        reporter: 'Anonymous User',
        date: '2024-12-14',
        status: 'pending',
        priority: 'high',
        details: 'Event contains inappropriate language and content that violates community guidelines.'
      },
      {
        id: '2',
        type: 'user',
        targetId: '3',
        targetTitle: 'John Smith',
        reason: 'Spam behavior',
        reporter: 'Sara Mohammed',
        date: '2024-12-13',
        status: 'pending',
        priority: 'medium',
        details: 'User has been creating multiple duplicate events and sending spam messages.'
      }
    ];
    setReports(mockReports);
  };

  const fetchSystemHealth = async () => {
    // Simulate real-time system health data
    setSystemHealth({
      cpuUsage: Math.random() * 60 + 20, // 20-80%
      memoryUsage: Math.random() * 40 + 40, // 40-80%
      diskUsage: Math.random() * 30 + 50, // 50-80%
      responseTime: Math.random() * 100 + 50, // 50-150ms
      uptime: 99.8,
      activeConnections: Math.floor(Math.random() * 1000 + 500), // 500-1500
      errorRate: Math.random() * 0.5, // 0-0.5%
      throughput: Math.floor(Math.random() * 1000 + 2000), // 2000-3000 req/min
      databaseConnections: Math.floor(Math.random() * 50 + 10), // 10-60
      cacheHitRate: Math.random() * 20 + 80, // 80-100%
      queueSize: Math.floor(Math.random() * 100), // 0-100
      alertsCount: Math.floor(Math.random() * 5), // 0-5
      securityThreats: Math.floor(Math.random() * 3), // 0-3
      backupStatus: ['success', 'failed', 'in_progress'][Math.floor(Math.random() * 3)] as 'success' | 'failed' | 'in_progress',
      lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      storageUsage: Math.random() * 30 + 40, // 40-70%
      networkLatency: Math.random() * 20 + 5 // 5-25ms
    });
  };

  const logAdminAction = async (action: string, targetType: 'user' | 'event' | 'report' | 'system', targetId: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      adminId: 'current_admin_id',
      adminName: 'Current Admin',
      action,
      targetType,
      targetId,
      timestamp: Date.now(),
      details,
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
      severity
    };
    
    setAuditLogs(prev => [auditLog, ...prev.slice(0, 99)]); // Keep last 100 logs
    
    // In real app, send to server
    try {
      await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditLog)
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;
      
      console.log(`Performing ${action} on user ${userId}`);
      
      // Check permissions
      if (!currentAdmin.permissions.canManageUsers) {
        showToast('Access denied: Insufficient permissions', 'error');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let newStatus = user.status;
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      
      switch (action) {
        case 'suspend':
          newStatus = 'suspended';
          severity = 'high';
          break;
        case 'ban':
          newStatus = 'banned';
          severity = 'critical';
          break;
        case 'activate':
          newStatus = 'active';
          severity = 'medium';
          break;
        case 'verify':
          newStatus = 'verified';
          severity = 'low';
          break;
        case 'reset_password':
          severity = 'medium';
          break;
        case 'enable_2fa':
          severity = 'low';
          break;
      }
      
      if (action === 'suspend' || action === 'ban' || action === 'activate' || action === 'verify') {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: newStatus, loginAttempts: action === 'activate' ? 0 : u.loginAttempts }
            : u
        ));
      }
      
      // Log the action
      await logAdminAction(
        `user_${action}`,
        'user',
        userId,
        `${action === 'suspend' ? 'Suspended' : action === 'ban' ? 'Banned' : action === 'activate' ? 'Activated' : 'Modified'} user: ${user.name} (${user.email})`,
        severity
      );
      
      showToast(`User ${action}ed successfully`, 'success');
    } catch (error) {
      showToast(`Failed to ${action} user`, 'error');
    }
  };

  const handleEventAction = async (eventId: string, action: string) => {
    try {
      console.log(`Performing ${action} on event ${eventId}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, status: action as Event['status'] }
          : event
      ));
      
      showToast(`Event ${action}ed successfully`, 'success');
    } catch (error) {
      showToast(`Failed to ${action} event`, 'error');
    }
  };

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      console.log(`Performing ${action} on report ${reportId}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action as ContentReport['status'] }
          : report
      ));
      
      showToast(`Report ${action} successfully`, 'success');
    } catch (error) {
      showToast(`Failed to ${action} report`, 'error');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return;
    
    // Check permissions
    if (!currentAdmin.permissions.canManageUsers) {
      showToast('Access denied: Insufficient permissions', 'error');
      return;
    }
    
    try {
      console.log(`Performing bulk ${bulkAction} on items:`, selectedItems);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update users based on bulk action
      if (bulkAction === 'suspend' || bulkAction === 'activate' || bulkAction === 'ban') {
        setUsers(prev => prev.map(user => {
          if (selectedItems.includes(user.id)) {
            const newStatus = bulkAction === 'suspend' ? 'suspended' : 
                            bulkAction === 'ban' ? 'banned' : 'active';
            return { ...user, status: newStatus as User['status'] };
          }
          return user;
        }));
      }
      
      // Log bulk action
      await logAdminAction(
        `bulk_${bulkAction}`,
        'user',
        selectedItems.join(','),
        `Performed bulk ${bulkAction} on ${selectedItems.length} users`,
        bulkAction === 'ban' ? 'critical' : bulkAction === 'suspend' ? 'high' : 'medium'
      );
      
      showToast(`Bulk action completed for ${selectedItems.length} items`, 'success');
      setSelectedItems([]);
      setBulkAction('');
    } catch (error) {
      showToast('Bulk action failed', 'error');
    }
  };

  const filterUsers = (users: User[]) => {
    let filtered = users;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(user => user.status === filterStatus);
    }
    
    // Role filter
    if (filterRole) {
      filtered = filtered.filter(user => user.role === filterRole);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case 'lastActive':
          aValue = new Date(a.lastActive).getTime();
          bValue = new Date(b.lastActive).getTime();
          break;
        case 'riskScore':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          aValue = a.lastActive;
          bValue = b.lastActive;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const exportData = async (type: 'users' | 'events' | 'reports' | 'audit') => {
    if (!currentAdmin.permissions.canExportData) {
      showToast('Access denied: Insufficient permissions', 'error');
      return;
    }
    
    try {
      let data: any[] = [];
      let filename = '';
      
      switch (type) {
        case 'users':
          data = filterUsers(users);
          filename = 'users_export.csv';
          break;
        case 'events':
          data = events;
          filename = 'events_export.csv';
          break;
        case 'reports':
          data = reports;
          filename = 'reports_export.csv';
          break;
        case 'audit':
          data = auditLogs;
          filename = 'audit_logs_export.csv';
          break;
      }
      
      // Convert to CSV
      if (data.length === 0) {
        showToast('No data to export', 'error');
        return;
      }
      
      const csvContent = convertToCSV(data);
      downloadCSV(csvContent, filename);
      
      // Log export action
      await logAdminAction(
        'export_data',
        'system',
        type,
        `Exported ${data.length} ${type} records`,
        'medium'
      );
      
      showToast(`${type} data exported successfully`, 'success');
    } catch (error) {
      showToast('Export failed', 'error');
    }
  };

  const convertToCSV = (data: any[]): string => {
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
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('admin.dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.subtitle')}
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <nav className="flex space-x-8 mb-4 lg:mb-0">
              {[
                { id: 'overview', label: t('admin.overview'), permission: true },
                { id: 'users', label: t('admin.users'), permission: currentAdmin.permissions.canManageUsers },
                { id: 'events', label: t('admin.events'), permission: currentAdmin.permissions.canManageEvents },
                { id: 'reports', label: t('admin.reports'), permission: currentAdmin.permissions.canViewReports },
                { id: 'analytics', label: t('admin.analytics'), permission: currentAdmin.permissions.canViewAnalytics },
                { id: 'system', label: t('admin.system'), permission: currentAdmin.permissions.canViewSystemHealth },
                { id: 'audit', label: 'Audit Logs', permission: currentAdmin.permissions.canViewSecurityLogs }
              ].filter(tab => tab.permission).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))
            }
            </nav>
            
            {/* Real-time Updates Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Real-time Updates</span>
              </label>
              
              {/* Export Button */}
              {currentAdmin.permissions.canExportData && (
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        exportData(e.target.value as 'users' | 'events' | 'reports' | 'audit');
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Export Data</option>
                    <option value="users">Users</option>
                    <option value="events">Events</option>
                    <option value="reports">Reports</option>
                    <option value="audit">Audit Logs</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && adminStats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {t('admin.totalUsers')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(adminStats.totalUsers)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  +{adminStats.userGrowthRate}% {t('admin.thisMonth')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {t('admin.totalEvents')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(adminStats.totalEvents)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  +{adminStats.eventGrowthRate}% {t('admin.thisMonth')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {t('admin.totalRevenue')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(adminStats.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  +{adminStats.revenueGrowthRate}% {t('admin.thisMonth')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {t('admin.pendingEvents')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {adminStats.pendingEvents}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  {t('admin.requiresReview')}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.recentUsers')}
                </h3>
                <div className="space-y-4">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.recentEvents')}
                </h3>
                <div className="space-y-4">
                  {events.slice(0, 5).map(event => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.organizer} • {event.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.flagged && (
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          event.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && currentAdmin.permissions.canManageUsers && (
          <div className="space-y-6">
            {/* Users Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('admin.userManagement')} ({filterUsers(users).length} users)
              </h2>
            </div>
            
            {/* Advanced Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                </select>
                
                {/* Role Filter */}
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="organizer">Organizer</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                
                {/* Sort */}
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="lastActive">Last Active</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="role">Role</option>
                    <option value="status">Status</option>
                    <option value="joinDate">Join Date</option>
                    <option value="riskScore">Risk Score</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
              
              {/* Bulk Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItems.length} selected
                  </span>
                  {selectedItems.length > 0 && (
                    <div className="flex gap-2">
                      <select
                        value={bulkAction}
                        onChange={(e) => setBulkAction(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Bulk Actions</option>
                        <option value="activate">Activate</option>
                        <option value="suspend">Suspend</option>
                        <option value="ban">Ban</option>
                        <option value="verify">Verify</option>
                      </select>
                      <button
                        onClick={handleBulkAction}
                        disabled={!bulkAction}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItems([])}
                    className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const filteredUsers = filterUsers(users);
                            if (e.target.checked) {
                              setSelectedItems(filteredUsers.map(u => u.id));
                            } else {
                              setSelectedItems([]);
                            }
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role & Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status & Security
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Risk & Reports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filterUsers(users).map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, user.id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== user.id));
                              }
                            }}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center relative">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                              {user.twoFactorEnabled && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white" title="2FA Enabled"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                  user.subscriptionTier === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                  user.subscriptionTier === 'premium' ? 'bg-gold-100 text-gold-800 dark:bg-gold-900/20 dark:text-gold-400' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {user.subscriptionTier}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {user.lastLoginIp} • {new Date(user.lastActive).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'super_admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                user.role === 'moderator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                user.role === 'organizer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                user.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {user.verificationStatus}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                user.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                user.status === 'suspended' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                user.status === 'banned' ? 'bg-red-200 text-red-900 dark:bg-red-800/20 dark:text-red-300' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              {user.loginAttempts > 0 && (
                                <span className="text-red-500">⚠ {user.loginAttempts} failed logins</span>
                              )}
                              {user.twoFactorEnabled && (
                                <span className="text-green-500" title="2FA Enabled">🔐</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white space-y-1">
                            <div>Events: {user.eventsCreated} / {user.eventsAttended}</div>
                            <div>Spent: {formatCurrency(user.totalSpent)}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Joined: {new Date(user.joinDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                user.riskScore <= 3 ? 'bg-green-500' :
                                user.riskScore <= 6 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}></span>
                              <span className="text-sm font-medium">{user.riskScore}/10</span>
                            </div>
                            <div>
                              {user.reportCount > 0 ? (
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                                  {user.reportCount} reports
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500 dark:text-gray-400">Clean record</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUserAction(user.id, user.status === 'active' || user.status === 'verified' ? 'suspend' : 'activate')}
                              className={`px-2 py-1 rounded text-xs transition-colors ${
                                user.status === 'active' || user.status === 'verified'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                              }`}
                              title={user.status === 'active' || user.status === 'verified' ? 'Suspend User' : 'Activate User'}
                            >
                              {user.status === 'active' || user.status === 'verified' ? 'Suspend' : 'Activate'}
                            </button>
                            {user.status !== 'banned' && (
                              <button
                                onClick={() => handleUserAction(user.id, 'ban')}
                                className="px-2 py-1 bg-red-200 text-red-900 hover:bg-red-300 dark:bg-red-800/20 dark:text-red-300 rounded text-xs transition-colors"
                                title="Ban User"
                              >
                                Ban
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="px-2 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs transition-colors"
                              title="View Details"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AnalyticsDashboard />
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && currentAdmin.permissions.canViewSecurityLogs && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Audit Logs ({auditLogs.length} entries)
              </h2>
              <div className="flex gap-4 mt-4 md:mt-0">
                <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button
                  onClick={() => exportData('audit')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export Logs
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Target
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div>
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {log.adminName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.targetType === 'user' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                            log.targetType === 'event' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                            log.targetType === 'report' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {log.targetType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                            log.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditLogs.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No audit logs available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && currentAdmin.permissions.canViewSystemHealth && systemHealth && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Health & Monitoring
            </h2>
            
            {/* System Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    CPU Usage
                  </h3>
                  <span className={`text-sm font-medium ${
                    systemHealth.cpuUsage > 80 ? 'text-red-600 dark:text-red-400' :
                    systemHealth.cpuUsage > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.cpuUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.cpuUsage > 80 ? 'bg-red-500' :
                      systemHealth.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemHealth.cpuUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.memoryUsage')}
                  </h3>
                  <span className={`text-sm font-medium ${
                    systemHealth.memoryUsage > 80 ? 'text-red-600 dark:text-red-400' :
                    systemHealth.memoryUsage > 60 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemHealth.memoryUsage > 80 ? 'bg-red-500' :
                      systemHealth.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemHealth.memoryUsage}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('admin.responseTime')}
                  </h3>
                  <span className={`text-sm font-medium ${
                    systemHealth.responseTime > 200 ? 'text-red-600 dark:text-red-400' :
                    systemHealth.responseTime > 100 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.responseTime.toFixed(0)}ms
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Uptime
                  </h3>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {systemHealth.uptime}%
                  </span>
                </div>
              </div>

              {/* Database Connections */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    DB Connections
                  </h3>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {systemHealth.databaseConnections}/100
                  </span>
                </div>
              </div>

              {/* Cache Hit Rate */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cache Hit Rate
                  </h3>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {systemHealth.cacheHitRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Queue Size */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Queue Size
                  </h3>
                  <span className={`text-sm font-medium ${
                    systemHealth.queueSize > 50 ? 'text-red-600 dark:text-red-400' :
                    systemHealth.queueSize > 25 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.queueSize}
                  </span>
                </div>
              </div>

              {/* Security Threats */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Security Threats
                  </h3>
                  <span className={`text-sm font-medium ${
                    systemHealth.securityThreats > 0 ? 'text-red-600 dark:text-red-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {systemHealth.securityThreats}
                  </span>
                </div>
                {systemHealth.securityThreats > 0 && (
                  <div className="text-xs text-red-500 dark:text-red-400">
                    ⚠ Active threats detected
                  </div>
                )}
              </div>

              {/* Backup Status */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Last Backup
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemHealth.backupStatus === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    systemHealth.backupStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {systemHealth.backupStatus}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(systemHealth.lastBackup).toLocaleDateString()}
                </div>
              </div>

              {/* Network Latency */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Network Latency
                  </h3>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {systemHealth.networkLatency.toFixed(1)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            {systemHealth.alertsCount > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    System Alerts ({systemHealth.alertsCount})
                  </h3>
                </div>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  There are {systemHealth.alertsCount} active system alerts that require attention.
                </div>
                <div className="mt-3">
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    View Alerts
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}