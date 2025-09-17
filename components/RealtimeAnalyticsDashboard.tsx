import { useState, useEffect, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';
import { adminService } from '../services/adminService';

interface MetricData {
  timestamp: number;
  value: number;
  label?: string;
}

interface RealtimeMetrics {
  activeUsers: MetricData[];
  pageViews: MetricData[];
  eventRegistrations: MetricData[];
  chatMessages: MetricData[];
  systemLoad: MetricData[];
  errorRate: MetricData[];
  responseTime: MetricData[];
  conversions: MetricData[];
}

interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: number;
  details: any;
  location?: string;
  device?: string;
}

interface AlertRule {
  id: string;
  metric: keyof RealtimeMetrics;
  operator: '>' | '<' | '=' | '>=' | '<=';
  threshold: number;
  timeframe: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  name: string;
}

interface SystemAlert {
  id: string;
  rule: AlertRule;
  value: number;
  timestamp: number;
  acknowledged: boolean;
  message: string;
}

export function RealtimeAnalyticsDashboard({ 
  eventId, 
  isAdmin = false 
}: {
  eventId?: string;
  isAdmin?: boolean;
}) {
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeUsers: [],
    pageViews: [],
    eventRegistrations: [],
    chatMessages: [],
    systemLoad: [],
    errorRate: [],
    responseTime: [],
    conversions: []
  });

  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [timeRange, setTimeRange] = useState<'5m' | '15m' | '1h' | '24h'>('15m');
  const [selectedMetric, setSelectedMetric] = useState<keyof RealtimeMetrics>('activeUsers');
  const [showAlertConfig, setShowAlertConfig] = useState(false);

  const metricsRef = useRef<RealtimeMetrics>(metrics);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initializeRealtimeAnalytics();
    initializeDefaultAlertRules();
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    metricsRef.current = metrics;
    updateChart();
  }, [metrics, selectedMetric]);

  useEffect(() => {
    if (isRealTimeActive) {
      startRealTimeUpdates();
    } else {
      stopRealTimeUpdates();
    }
  }, [isRealTimeActive]);

  const initializeRealtimeAnalytics = async () => {
    try {
      // Initialize real-time service
      await realtimeService.initialize('analytics_dashboard');
      
      // Set up event listeners for real-time data
      setupRealtimeListeners();
      
      // Load initial data
      await loadInitialData();
      
      console.log('Real-time analytics dashboard initialized');
    } catch (error) {
      console.error('Failed to initialize real-time analytics:', error);
    }
  };

  const setupRealtimeListeners = () => {
    realtimeService.on('message:system_alert', (message) => {
      handleSystemUpdate(message.data);
    });

    realtimeService.on('message:user_action', (message) => {
      handleUserActivity(message.data);
    });

    realtimeService.on('message:chat', (message) => {
      updateMetric('chatMessages', 1);
    });

    realtimeService.on('message:event_update', (message) => {
      if (message.data.type === 'new_registration') {
        updateMetric('eventRegistrations', 1);
      }
    });
  };

  const handleSystemUpdate = (data: any) => {
    if (data.type === 'health_update') {
      const now = Date.now();
      
      setMetrics(prev => ({
        ...prev,
        activeUsers: [...prev.activeUsers, { timestamp: now, value: data.activeUsers }].slice(-100),
        systemLoad: [...prev.systemLoad, { timestamp: now, value: data.cpuUsage }].slice(-100),
        responseTime: [...prev.responseTime, { timestamp: now, value: Math.random() * 100 + 50 }].slice(-100)
      }));
      
      // Check alert rules
      checkAlertRules(data);
    }
  };

  const handleUserActivity = (data: any) => {
    const activity: UserActivity = {
      userId: data.userId,
      userName: data.userName || `User ${data.userId}`,
      action: data.action,
      timestamp: Date.now(),
      details: data.details || {},
      location: data.location,
      device: data.device
    };
    
    setUserActivities(prev => [activity, ...prev.slice(0, 99)]);
    
    // Update relevant metrics
    updateMetric('pageViews', 1);
  };

  const updateMetric = (metric: keyof RealtimeMetrics, increment: number) => {
    const now = Date.now();
    
    setMetrics(prev => ({
      ...prev,
      [metric]: [...prev[metric], { timestamp: now, value: increment }].slice(-100)
    }));
  };

  const loadInitialData = async () => {
    // Generate initial mock data
    const now = Date.now();
    const timePoints = 50;
    const interval = 30000; // 30 seconds
    
    const initialMetrics: RealtimeMetrics = {
      activeUsers: [],
      pageViews: [],
      eventRegistrations: [],
      chatMessages: [],
      systemLoad: [],
      errorRate: [],
      responseTime: [],
      conversions: []
    };
    
    // Generate historical data points
    for (let i = timePoints; i >= 0; i--) {
      const timestamp = now - (i * interval);
      
      initialMetrics.activeUsers.push({
        timestamp,
        value: Math.floor(Math.random() * 200 + 300)
      });
      
      initialMetrics.pageViews.push({
        timestamp,
        value: Math.floor(Math.random() * 50 + 20)
      });
      
      initialMetrics.eventRegistrations.push({
        timestamp,
        value: Math.floor(Math.random() * 5)
      });
      
      initialMetrics.chatMessages.push({
        timestamp,
        value: Math.floor(Math.random() * 15 + 5)
      });
      
      initialMetrics.systemLoad.push({
        timestamp,
        value: Math.random() * 60 + 20
      });
      
      initialMetrics.errorRate.push({
        timestamp,
        value: Math.random() * 2
      });
      
      initialMetrics.responseTime.push({
        timestamp,
        value: Math.random() * 100 + 50
      });
      
      initialMetrics.conversions.push({
        timestamp,
        value: Math.floor(Math.random() * 3)
      });
    }
    
    setMetrics(initialMetrics);
  };

  const startRealTimeUpdates = () => {
    if (updateIntervalRef.current) return;
    
    updateIntervalRef.current = setInterval(() => {
      if (!isRealTimeActive) return;
      
      // Simulate real-time data updates
      const now = Date.now();
      
      setMetrics(prev => {
        const updated = { ...prev };
        
        Object.keys(updated).forEach(key => {
          const metricKey = key as keyof RealtimeMetrics;
          let value = 0;
          
          switch (metricKey) {
            case 'activeUsers':
              value = Math.floor(Math.random() * 50 + 250);
              break;
            case 'pageViews':
              value = Math.floor(Math.random() * 20 + 10);
              break;
            case 'eventRegistrations':
              value = Math.floor(Math.random() * 3);
              break;
            case 'chatMessages':
              value = Math.floor(Math.random() * 10 + 2);
              break;
            case 'systemLoad':
              value = Math.random() * 20 + 40;
              break;
            case 'errorRate':
              value = Math.random() * 1;
              break;
            case 'responseTime':
              value = Math.random() * 50 + 75;
              break;
            case 'conversions':
              value = Math.floor(Math.random() * 2);
              break;
          }
          
          updated[metricKey] = [
            ...prev[metricKey],
            { timestamp: now, value }
          ].slice(-100);
        });
        
        return updated;
      });
    }, 5000); // Update every 5 seconds
  };

  const stopRealTimeUpdates = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const initializeDefaultAlertRules = () => {
    const defaultRules: AlertRule[] = [
      {
        id: '1',
        name: 'High System Load',
        metric: 'systemLoad',
        operator: '>',
        threshold: 80,
        timeframe: 5,
        severity: 'high',
        enabled: true
      },
      {
        id: '2',
        name: 'Low Active Users',
        metric: 'activeUsers',
        operator: '<',
        threshold: 50,
        timeframe: 10,
        severity: 'medium',
        enabled: true
      },
      {
        id: '3',
        name: 'High Error Rate',
        metric: 'errorRate',
        operator: '>',
        threshold: 5,
        timeframe: 5,
        severity: 'critical',
        enabled: true
      },
      {
        id: '4',
        name: 'Slow Response Time',
        metric: 'responseTime',
        operator: '>',
        threshold: 200,
        timeframe: 10,
        severity: 'medium',
        enabled: true
      }
    ];
    
    setAlertRules(defaultRules);
  };

  const checkAlertRules = (data: any) => {
    alertRules.forEach(rule => {
      if (!rule.enabled) return;
      
      const currentMetrics = metricsRef.current;
      const metricData = currentMetrics[rule.metric];
      
      if (metricData.length === 0) return;
      
      const recentData = metricData.slice(-Math.ceil(rule.timeframe * 2)); // Approximate based on update frequency
      const avgValue = recentData.reduce((sum, point) => sum + point.value, 0) / recentData.length;
      
      let triggered = false;
      
      switch (rule.operator) {
        case '>':
          triggered = avgValue > rule.threshold;
          break;
        case '<':
          triggered = avgValue < rule.threshold;
          break;
        case '>=':
          triggered = avgValue >= rule.threshold;
          break;
        case '<=':
          triggered = avgValue <= rule.threshold;
          break;
        case '=':
          triggered = Math.abs(avgValue - rule.threshold) < 0.1;
          break;
      }
      
      if (triggered) {
        // Check if alert already exists for this rule
        const existingAlert = alerts.find(alert => 
          alert.rule.id === rule.id && 
          Date.now() - alert.timestamp < 300000 // 5 minutes
        );
        
        if (!existingAlert) {
          const newAlert: SystemAlert = {
            id: `alert_${Date.now()}_${rule.id}`,
            rule,
            value: avgValue,
            timestamp: Date.now(),
            acknowledged: false,
            message: `${rule.name}: ${rule.metric} is ${avgValue.toFixed(2)} (threshold: ${rule.threshold})`
          };
          
          setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
          
          // Send notification for high/critical alerts
          if (rule.severity === 'high' || rule.severity === 'critical') {
            showNotification(newAlert);
          }
        }
      }
    });
  };

  const showNotification = (alert: SystemAlert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`System Alert: ${alert.rule.name}`, {
        body: alert.message,
        icon: '/logo192.png',
        tag: alert.id
      });
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const updateChart = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const metricData = metrics[selectedMetric];
    if (metricData.length === 0) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Get data range
    const values = metricData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;
    
    // Draw grid lines
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * chartHeight / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i * chartWidth / 10);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }
    
    // Draw chart line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    metricData.forEach((point, index) => {
      const x = padding + (index / (metricData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw chart points
    ctx.fillStyle = '#3b82f6';
    metricData.forEach((point, index) => {
      const x = padding + (index / (metricData.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw axis labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = maxValue - (i * range / 5);
      const y = padding + (i * chartHeight / 5);
      ctx.fillText(value.toFixed(0), padding - 10, y + 4);
    }
    
    // X-axis labels (time)
    ctx.textAlign = 'center';
    const timeLabels = 5;
    for (let i = 0; i <= timeLabels; i++) {
      const dataIndex = Math.floor((i / timeLabels) * (metricData.length - 1));
      const x = padding + (i * chartWidth / timeLabels);
      const time = new Date(metricData[dataIndex]?.timestamp || Date.now());
      ctx.fillText(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), x, canvas.height - 10);
    }
  };

  const cleanup = () => {
    stopRealTimeUpdates();
  };

  const getMetricColor = (metric: keyof RealtimeMetrics) => {
    const colors = {
      activeUsers: 'text-blue-600',
      pageViews: 'text-green-600',
      eventRegistrations: 'text-purple-600',
      chatMessages: 'text-yellow-600',
      systemLoad: 'text-red-600',
      errorRate: 'text-red-800',
      responseTime: 'text-orange-600',
      conversions: 'text-indigo-600'
    };
    
    return colors[metric] || 'text-gray-600';
  };

  const getMetricIcon = (metric: keyof RealtimeMetrics) => {
    const icons = {
      activeUsers: '👥',
      pageViews: '📊',
      eventRegistrations: '🎫',
      chatMessages: '💬',
      systemLoad: '⚙️',
      errorRate: '❌',
      responseTime: '⏱️',
      conversions: '💰'
    };
    
    return icons[metric] || '📈';
  };

  const getCurrentValue = (metric: keyof RealtimeMetrics) => {
    const data = metrics[metric];
    return data.length > 0 ? data[data.length - 1].value : 0;
  };

  const getChangeRate = (metric: keyof RealtimeMetrics) => {
    const data = metrics[metric];
    if (data.length < 2) return 0;
    
    const current = data[data.length - 1].value;
    const previous = data[data.length - 2].value;
    
    return previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  };

  return (
    <div className=\"space-y-6 p-6 bg-white dark:bg-gray-900\">
      {/* Header */}
      <div className=\"flex items-center justify-between\">
        <div>
          <h2 className=\"text-2xl font-bold text-gray-900 dark:text-white\">
            Real-time Analytics
          </h2>
          <p className=\"text-gray-600 dark:text-gray-400\">
            Live system and user activity monitoring
          </p>
        </div>
        
        <div className=\"flex items-center gap-4\">
          <div className=\"flex items-center gap-2\">
            <div className={`w-3 h-3 rounded-full ${
              isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className=\"text-sm text-gray-600 dark:text-gray-400\">
              {isRealTimeActive ? 'Live' : 'Paused'}
            </span>
          </div>
          
          <button
            onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRealTimeActive 
                ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
            }`}
          >
            {isRealTimeActive ? 'Pause' : 'Resume'}
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setShowAlertConfig(true)}
              className=\"px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-sm font-medium\"
            >
              Configure Alerts
            </button>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className=\"bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4\">
          <div className=\"flex items-center justify-between mb-3\">
            <h3 className=\"text-lg font-medium text-red-800 dark:text-red-200\">
              Active Alerts ({alerts.filter(a => !a.acknowledged).length})
            </h3>
          </div>
          <div className=\"space-y-2 max-h-32 overflow-y-auto\">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`flex items-center justify-between p-2 rounded ${
                alert.acknowledged ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
              }`}>
                <div className=\"flex items-center gap-2\">
                  <span className={`w-2 h-2 rounded-full ${
                    alert.rule.severity === 'critical' ? 'bg-red-600' :
                    alert.rule.severity === 'high' ? 'bg-orange-500' :
                    alert.rule.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></span>
                  <span className={`text-sm ${
                    alert.acknowledged ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                  }`}>
                    {alert.message}
                  </span>
                </div>
                
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className=\"px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded\"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      <div className=\"grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4\">
        {(Object.keys(metrics) as Array<keyof RealtimeMetrics>).map(metric => {
          const currentValue = getCurrentValue(metric);
          const changeRate = getChangeRate(metric);
          
          return (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedMetric === metric
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className=\"text-center\">
                <div className=\"text-2xl mb-1\">{getMetricIcon(metric)}</div>
                <div className={`text-lg font-bold ${getMetricColor(metric)}`}>
                  {currentValue.toFixed(metric === 'systemLoad' || metric === 'errorRate' || metric === 'responseTime' ? 1 : 0)}
                </div>
                <div className=\"text-xs text-gray-500 dark:text-gray-400 capitalize mb-1\">
                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className={`text-xs font-medium ${
                  changeRate > 0 ? 'text-green-600' : changeRate < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {changeRate > 0 ? '+' : ''}{changeRate.toFixed(1)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\">
        <div className=\"flex items-center justify-between mb-4\">
          <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white\">
            {getMetricIcon(selectedMetric)} {selectedMetric.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className=\"px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white\"
          >
            <option value=\"5m\">Last 5 minutes</option>
            <option value=\"15m\">Last 15 minutes</option>
            <option value=\"1h\">Last hour</option>
            <option value=\"24h\">Last 24 hours</option>
          </select>
        </div>
        
        <canvas
          ref={chartCanvasRef}
          width={800}
          height={300}
          className=\"w-full h-64 border border-gray-200 dark:border-gray-600 rounded\"
        ></canvas>
      </div>

      {/* Recent User Activities */}
      <div className=\"bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700\">
        <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white mb-4\">
          Recent User Activities
        </h3>
        
        <div className=\"space-y-2 max-h-64 overflow-y-auto\">
          {userActivities.map(activity => (
            <div key={`${activity.userId}-${activity.timestamp}`} className=\"flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700\">
              <div className=\"flex items-center gap-3\">
                <div className=\"w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center\">
                  <span className=\"text-xs font-medium text-gray-700 dark:text-gray-300\">
                    {activity.userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className=\"text-sm font-medium text-gray-900 dark:text-white\">
                    {activity.userName} {activity.action}
                  </div>
                  <div className=\"text-xs text-gray-500 dark:text-gray-400\">
                    {activity.location && `${activity.location} • `}
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {userActivities.length === 0 && (
            <div className=\"text-center py-8 text-gray-500 dark:text-gray-400\">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}