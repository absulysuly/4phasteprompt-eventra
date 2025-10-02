'use client';

/**
 * Iraq Discovery Data Collection Monitor Dashboard
 * 
 * Real-time monitoring of the data collection agent
 */

import { useState, useEffect } from 'react';

interface CollectionStatus {
  running: boolean;
  current_city?: string;
  current_batch?: number;
  progress: {
    total_batches: number;
    total_records: number;
    cities_completed: string[];
    current_step?: string;
  };
  stats: {
    erbil?: number;
    baghdad?: number;
    basra?: number;
    sulaymaniyah?: number;
    nineveh?: number;
    najaf?: number;
    karbala?: number;
    duhok?: number;
    kirkuk?: number;
  };
  last_batch?: {
    city: string;
    records: number;
    timestamp: string;
  };
  logs: LogEntry[];
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export default function DataMonitorPage() {
  const [status, setStatus] = useState<CollectionStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStatus, 3000); // Refresh every 3 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/data-collection/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const startCollection = async () => {
    try {
      await fetch('/api/data-collection/start', { method: 'POST' });
      fetchStatus();
    } catch (error) {
      console.error('Failed to start collection:', error);
    }
  };

  const stopCollection = async () => {
    try {
      await fetch('/api/data-collection/stop', { method: 'POST' });
      fetchStatus();
    } catch (error) {
      console.error('Failed to stop collection:', error);
    }
  };

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading monitor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🇮🇶 Iraq Discovery Data Monitor
              </h1>
              <p className="text-white/70">Real-time collection monitoring dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
              {status.running ? (
                <button
                  onClick={stopCollection}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                >
                  ⏸️ Stop Collection
                </button>
              ) : (
                <button
                  onClick={startCollection}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
                >
                  ▶️ Start Collection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatusCard
            title="Status"
            value={status.running ? 'Running' : 'Stopped'}
            icon={status.running ? '🟢' : '🔴'}
            color={status.running ? 'green' : 'red'}
          />
          <StatusCard
            title="Total Batches"
            value={status.progress.total_batches}
            icon="📦"
            color="blue"
          />
          <StatusCard
            title="Total Records"
            value={status.progress.total_records}
            icon="📊"
            color="purple"
          />
          <StatusCard
            title="Cities Complete"
            value={status.progress.cities_completed.length}
            icon="🌆"
            color="yellow"
          />
        </div>

        {/* Current Activity */}
        {status.running && status.current_city && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">🔄 Current Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-white">
                <span className="text-white/70">City:</span>
                <span className="font-semibold text-lg">{status.current_city}</span>
              </div>
              <div className="flex items-center justify-between text-white">
                <span className="text-white/70">Batch Number:</span>
                <span className="font-semibold text-lg">#{status.current_batch}</span>
              </div>
              {status.current_step && (
                <div className="flex items-center justify-between text-white">
                  <span className="text-white/70">Step:</span>
                  <span className="font-semibold">{status.current_step}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all animate-pulse"
                  style={{ width: '75%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">📈 Collection Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(status.stats).map(([city, count]) => (
              <div key={city} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-white/70 text-sm capitalize mb-1">{city}</div>
                <div className="text-white text-2xl font-bold">{count || 0}</div>
                <div className="text-white/50 text-xs mt-1">records</div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Batch Info */}
        {status.last_batch && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4">✅ Last Completed Batch</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-white/70 text-sm mb-1">City</div>
                <div className="text-white text-lg font-semibold capitalize">{status.last_batch.city}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Records</div>
                <div className="text-white text-lg font-semibold">{status.last_batch.records}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Time</div>
                <div className="text-white text-lg font-semibold">
                  {new Date(status.last_batch.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Logs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">📜 Live Logs</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {status.logs.slice(-20).reverse().map((log, idx) => (
              <LogLine key={idx} log={log} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton
              label="View Exports"
              icon="📁"
              onClick={() => window.open('/data/iraq-discovery-exports', '_blank')}
            />
            <ActionButton
              label="Download Logs"
              icon="📥"
              onClick={() => window.open('/api/data-collection/logs', '_blank')}
            />
            <ActionButton
              label="Refresh Status"
              icon="🔄"
              onClick={fetchStatus}
            />
            <ActionButton
              label="View Docs"
              icon="📖"
              onClick={() => window.open('/IRAQ_DISCOVERY_AGENT_README.md', '_blank')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, value, icon, color }: any) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    red: 'from-red-500 to-rose-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white/70 text-sm">{title}</span>
        <span className="text-3xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}

function LogLine({ log }: { log: LogEntry }) {
  const levelColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  };

  const levelIcons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className="flex items-start gap-3 text-sm font-mono bg-black/30 rounded-lg p-3">
      <span className="text-white/50">{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span>{levelIcons[log.level]}</span>
      <span className={levelColors[log.level]}>{log.message}</span>
    </div>
  );
}

function ActionButton({ label, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-white transition-all"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
