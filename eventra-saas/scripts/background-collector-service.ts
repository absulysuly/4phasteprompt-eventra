#!/usr/bin/env tsx
/**
 * Background Data Collection Service
 * 
 * Runs continuously in the background with status tracking
 * Windows-compatible with proper process management
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'data', 'collection-status.json');
const LOG_FILE = path.join(process.cwd(), 'data', 'collection.log');
const PID_FILE = path.join(process.cwd(), 'data', 'collector.pid');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

interface ServiceStatus {
  running: boolean;
  current_city?: string;
  current_batch?: number;
  progress: {
    total_batches: number;
    total_records: number;
    cities_completed: string[];
    current_step?: string;
  };
  stats: Record<string, number>;
  last_batch?: {
    city: string;
    records: number;
    timestamp: string;
  };
  logs: Array<{
    timestamp: string;
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;
  started_at?: string;
  pid?: number;
}

class BackgroundCollectionService {
  private process: ChildProcess | null = null;
  private status: ServiceStatus = {
    running: false,
    progress: {
      total_batches: 0,
      total_records: 0,
      cities_completed: [],
    },
    stats: {},
    logs: [],
  };

  constructor() {
    this.loadStatus();
  }

  private loadStatus() {
    try {
      if (fs.existsSync(STATUS_FILE)) {
        const data = fs.readFileSync(STATUS_FILE, 'utf-8');
        this.status = { ...this.status, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  }

  private saveStatus() {
    try {
      fs.writeFileSync(STATUS_FILE, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('Failed to save status:', error);
    }
  }

  private addLog(level: ServiceStatus['logs'][0]['level'], message: string) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };
    
    this.status.logs.push(log);
    
    // Keep only last 100 logs in memory
    if (this.status.logs.length > 100) {
      this.status.logs = this.status.logs.slice(-100);
    }
    
    // Append to log file
    try {
      const logLine = `[${log.timestamp}] [${level.toUpperCase()}] ${message}\n`;
      fs.appendFileSync(LOG_FILE, logLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
    
    this.saveStatus();
  }

  async start() {
    if (this.status.running) {
      console.log('⚠️  Collection service is already running');
      return false;
    }

    console.log('🚀 Starting background collection service...');
    
    this.status.running = true;
    this.status.started_at = new Date().toISOString();
    this.addLog('info', 'Starting continuous data collection');

    // Start the collector process
    this.process = spawn('npx', ['tsx', 'scripts/iraq-discovery-collector.ts', '--continuous'], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    this.status.pid = this.process.pid;
    
    // Save PID for later management
    fs.writeFileSync(PID_FILE, this.process.pid!.toString());

    // Handle process output
    if (this.process.stdout) {
      this.process.stdout.on('data', (data) => {
        const output = data.toString();
        this.parseOutput(output);
      });
    }

    if (this.process.stderr) {
      this.process.stderr.on('data', (data) => {
        const error = data.toString();
        this.addLog('error', error);
        console.error('Collection error:', error);
      });
    }

    // Handle process exit
    this.process.on('exit', (code) => {
      this.status.running = false;
      this.status.pid = undefined;
      this.addLog('warning', `Collection process exited with code ${code}`);
      this.saveStatus();
      
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }
    });

    this.saveStatus();
    console.log('✅ Background service started');
    return true;
  }

  async stop() {
    if (!this.status.running) {
      console.log('⚠️  Collection service is not running');
      return false;
    }

    console.log('🛑 Stopping background collection service...');
    
    this.addLog('info', 'Stopping continuous data collection');

    if (this.process) {
      // Try graceful shutdown first
      this.process.kill('SIGTERM');
      
      // Force kill after 5 seconds if needed
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL');
        }
      }, 5000);
    } else if (this.status.pid) {
      // Try to kill using PID
      try {
        process.kill(this.status.pid, 'SIGTERM');
      } catch (error) {
        console.error('Failed to kill process:', error);
      }
    }

    this.status.running = false;
    this.status.pid = undefined;
    this.saveStatus();

    if (fs.existsSync(PID_FILE)) {
      fs.unlinkSync(PID_FILE);
    }

    console.log('✅ Background service stopped');
    return true;
  }

  private parseOutput(output: string) {
    // Parse collector output to update status
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Detect current city
      if (line.includes('🌆')) {
        const match = line.match(/🌆\s+(\w+)/i);
        if (match) {
          this.status.current_city = match[1];
          this.addLog('info', `Collecting: ${match[1]}`);
        }
      }
      
      // Detect batch number
      if (line.includes('Batch') && line.includes('exported')) {
        const match = line.match(/Batch\s+(\d+)/i);
        if (match) {
          this.status.current_batch = parseInt(match[1]);
        }
      }
      
      // Detect step
      if (line.includes('Step')) {
        const match = line.match(/Step\s+\d+:\s+(.+)/i);
        if (match) {
          this.status.progress.current_step = match[1];
        }
      }
      
      // Success messages
      if (line.includes('✅') || line.includes('Complete')) {
        const cleanLine = line.replace(/[✅━]/g, '').trim();
        if (cleanLine) {
          this.addLog('success', cleanLine);
        }
      }
      
      // Warning messages
      if (line.includes('⚠️')) {
        const cleanLine = line.replace(/⚠️/g, '').trim();
        if (cleanLine) {
          this.addLog('warning', cleanLine);
        }
      }
      
      // Error messages
      if (line.includes('❌')) {
        const cleanLine = line.replace(/❌/g, '').trim();
        if (cleanLine) {
          this.addLog('error', cleanLine);
        }
      }
    }
    
    this.saveStatus();
  }

  getStatus(): ServiceStatus {
    return { ...this.status };
  }
}

// Export singleton instance
let serviceInstance: BackgroundCollectionService | null = null;

export function getCollectionService(): BackgroundCollectionService {
  if (!serviceInstance) {
    serviceInstance = new BackgroundCollectionService();
  }
  return serviceInstance;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const service = getCollectionService();

  (async () => {
    switch (command) {
      case 'start':
        await service.start();
        // Keep process alive
        process.stdin.resume();
        break;
        
      case 'stop':
        await service.stop();
        process.exit(0);
        break;
        
      case 'status':
        console.log(JSON.stringify(service.getStatus(), null, 2));
        process.exit(0);
        break;
        
      case 'restart':
        await service.stop();
        await new Promise(resolve => setTimeout(resolve, 2000));
        await service.start();
        process.stdin.resume();
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run collect:service:start    # Start background service');
        console.log('  npm run collect:service:stop     # Stop background service');
        console.log('  npm run collect:service:status   # Check status');
        console.log('  npm run collect:service:restart  # Restart service');
        process.exit(1);
    }
  })();
}
