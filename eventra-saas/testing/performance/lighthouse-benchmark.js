// Lighthouse Performance Benchmarking for Eventra SaaS
// Measures Core Web Vitals and generates performance reports

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

// Configuration for different test scenarios
const TEST_CONFIGS = {
  mobile: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        requestLatencyMs: 150,
        downloadThroughputKbps: 1.6 * 1024,
        uploadThroughputKbps: 750,
        cpuSlowdownMultiplier: 4
      },
      screenEmulation: {
        mobile: true,
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      }
    }
  },
  desktop: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
      }
    }
  },
  slow3g: {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      throttling: {
        rttMs: 300,
        throughputKbps: 400,
        requestLatencyMs: 300,
        downloadThroughputKbps: 400,
        uploadThroughputKbps: 400,
        cpuSlowdownMultiplier: 4
      }
    }
  }
};

// Pages to benchmark
const TEST_PAGES = [
  {
    name: 'Homepage',
    path: '/',
    critical: true
  },
  {
    name: 'Events Listing',
    path: '/events',
    critical: true
  },
  {
    name: 'Event Details',
    path: '/events/sample-event-123',
    critical: true
  },
  {
    name: 'Search Results',
    path: '/search?q=music+events',
    critical: false
  },
  {
    name: 'Restaurants',
    path: '/restaurants',
    critical: false
  },
  {
    name: 'Venue Details',
    path: '/venues/sample-venue-123',
    critical: false
  },
  {
    name: 'Booking Page',
    path: '/booking',
    critical: false
  }
];

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  mobile: {
    performance: 75,
    accessibility: 95,
    bestPractices: 90,
    seo: 90,
    fcp: 2500,  // First Contentful Paint (ms)
    lcp: 4000,  // Largest Contentful Paint (ms)
    cls: 0.1,   // Cumulative Layout Shift
    fid: 300,   // First Input Delay (ms)
    tti: 5000   // Time to Interactive (ms)
  },
  desktop: {
    performance: 85,
    accessibility: 95,
    bestPractices: 90,
    seo: 90,
    fcp: 1500,
    lcp: 2500,
    cls: 0.1,
    fid: 100,
    tti: 3000
  }
};

class LighthouseBenchmark {
  constructor(baseUrl, outputDir = 'testing/results/performance') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.outputDir = outputDir;
    this.results = [];
  }

  async setup() {
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    console.log('🚀 Setting up Lighthouse benchmark...');
    console.log(`Base URL: ${this.baseUrl}`);
    console.log(`Output directory: ${this.outputDir}`);
  }

  async runBenchmark(device = 'mobile', pages = TEST_PAGES) {
    console.log(`\n📱 Running ${device} benchmark...`);
    
    const chrome = await chromeLauncher.launch({ 
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'] 
    });
    
    try {
      const config = TEST_CONFIGS[device];
      const thresholds = PERFORMANCE_THRESHOLDS[device] || PERFORMANCE_THRESHOLDS.mobile;
      
      for (const page of pages) {
        console.log(`  🧪 Testing ${page.name} (${page.path})...`);
        
        try {
          const url = `${this.baseUrl}${page.path}`;
          const result = await lighthouse(url, {
            port: chrome.port,
            disableDeviceEmulation: false,
            chromeFlags: ['--disable-mobile-emulation-override']
          }, config);
          
          const processedResult = this.processResult(result, page, device, thresholds);
          this.results.push(processedResult);
          
          // Save individual report
          await this.saveReport(result, page.name, device);
          
          console.log(`    ✅ Performance: ${processedResult.scores.performance}`);
          console.log(`    🎨 Accessibility: ${processedResult.scores.accessibility}`);
          console.log(`    ⚡ FCP: ${processedResult.metrics.fcp}ms`);
          console.log(`    🏆 LCP: ${processedResult.metrics.lcp}ms`);
          
        } catch (error) {
          console.error(`    ❌ Error testing ${page.name}: ${error.message}`);
          this.results.push({
            page: page.name,
            device,
            error: error.message,
            url: `${this.baseUrl}${page.path}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    } finally {
      await chrome.kill();
    }
  }

  processResult(lighthouseResult, page, device, thresholds) {
    const lhr = lighthouseResult.lhr;
    
    // Extract scores
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };
    
    // Extract key metrics
    const metrics = {
      fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
      lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
      cls: parseFloat(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
      fid: lhr.audits['max-potential-fid'] ? Math.round(lhr.audits['max-potential-fid'].numericValue) : null,
      tti: Math.round(lhr.audits['interactive'].numericValue),
      tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
      speedIndex: Math.round(lhr.audits['speed-index'].numericValue)
    };
    
    // Check against thresholds
    const warnings = [];
    if (scores.performance < thresholds.performance) {
      warnings.push(`Performance score ${scores.performance} below threshold ${thresholds.performance}`);
    }
    if (metrics.fcp > thresholds.fcp) {
      warnings.push(`FCP ${metrics.fcp}ms above threshold ${thresholds.fcp}ms`);
    }
    if (metrics.lcp > thresholds.lcp) {
      warnings.push(`LCP ${metrics.lcp}ms above threshold ${thresholds.lcp}ms`);
    }
    if (metrics.cls > thresholds.cls) {
      warnings.push(`CLS ${metrics.cls} above threshold ${thresholds.cls}`);
    }
    
    return {
      page: page.name,
      path: page.path,
      device,
      url: `${this.baseUrl}${page.path}`,
      scores,
      metrics,
      warnings,
      critical: page.critical,
      timestamp: new Date().toISOString(),
      passed: warnings.length === 0
    };
  }

  async saveReport(lighthouseResult, pageName, device) {
    const reportHtml = lighthouseResult.report;
    const filename = `${pageName.toLowerCase().replace(/\s+/g, '-')}-${device}.html`;
    const filepath = path.join(this.outputDir, filename);
    
    await fs.writeFile(filepath, reportHtml);
  }

  async generateSummaryReport() {
    console.log('\n📊 Generating summary report...');
    
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      totalTests: this.results.length,
      passed: this.results.filter(r => r.passed && !r.error).length,
      failed: this.results.filter(r => !r.passed || r.error).length,
      critical: this.results.filter(r => r.critical).length,
      results: this.results
    };
    
    // Calculate averages by device
    const deviceSummary = {};
    for (const device of ['mobile', 'desktop', 'slow3g']) {
      const deviceResults = this.results.filter(r => r.device === device && !r.error);
      if (deviceResults.length > 0) {
        deviceSummary[device] = {
          avgPerformance: Math.round(deviceResults.reduce((sum, r) => sum + r.scores.performance, 0) / deviceResults.length),
          avgAccessibility: Math.round(deviceResults.reduce((sum, r) => sum + r.scores.accessibility, 0) / deviceResults.length),
          avgFCP: Math.round(deviceResults.reduce((sum, r) => sum + r.metrics.fcp, 0) / deviceResults.length),
          avgLCP: Math.round(deviceResults.reduce((sum, r) => sum + r.metrics.lcp, 0) / deviceResults.length),
          avgCLS: parseFloat((deviceResults.reduce((sum, r) => sum + r.metrics.cls, 0) / deviceResults.length).toFixed(3))
        };
      }
    }
    summary.deviceSummary = deviceSummary;
    
    // Save JSON report
    const jsonPath = path.join(this.outputDir, 'lighthouse-summary.json');
    await fs.writeFile(jsonPath, JSON.stringify(summary, null, 2));
    
    // Generate CSV for tracking over time
    await this.generateCSVReport(summary);
    
    console.log(`📄 Summary report saved: ${jsonPath}`);
    return summary;
  }

  async generateCSVReport(summary) {
    const csvPath = path.join(this.outputDir, 'lighthouse-results.csv');
    
    // Check if file exists to determine if we need headers
    let needsHeader = true;
    try {
      await fs.access(csvPath);
      needsHeader = false;
    } catch {
      // File doesn't exist, we'll need headers
    }
    
    const csvRows = [];
    
    // Add header if needed
    if (needsHeader) {
      csvRows.push([
        'timestamp', 'page', 'device', 'performance', 'accessibility', 
        'fcp', 'lcp', 'cls', 'tti', 'warnings', 'passed'
      ].join(','));
    }
    
    // Add data rows
    for (const result of this.results.filter(r => !r.error)) {
      csvRows.push([
        result.timestamp,
        result.page,
        result.device,
        result.scores.performance,
        result.scores.accessibility,
        result.metrics.fcp,
        result.metrics.lcp,
        result.metrics.cls,
        result.metrics.tti,
        result.warnings.length,
        result.passed
      ].join(','));
    }
    
    if (csvRows.length > 0) {
      const csvContent = csvRows.join('\n') + '\n';
      await fs.appendFile(csvPath, csvContent);
    }
  }

  printSummary() {
    console.log('\n🎯 PERFORMANCE BENCHMARK SUMMARY');
    console.log('==================================');
    
    const passed = this.results.filter(r => r.passed && !r.error).length;
    const total = this.results.length;
    const critical = this.results.filter(r => r.critical && (!r.passed || r.error)).length;
    
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`🚨 Critical failures: ${critical}`);
    
    if (critical > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      this.results
        .filter(r => r.critical && (!r.passed || r.error))
        .forEach(r => {
          console.log(`  - ${r.page} (${r.device}): ${r.error || r.warnings.join(', ')}`);
        });
    }
    
    // Show top performers and worst performers
    const validResults = this.results.filter(r => !r.error);
    if (validResults.length > 0) {
      const byPerformance = validResults.sort((a, b) => b.scores.performance - a.scores.performance);
      
      console.log('\n🏆 TOP PERFORMERS:');
      byPerformance.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.page} (${r.device}): ${r.scores.performance} performance`);
      });
      
      console.log('\n⚠️  NEEDS IMPROVEMENT:');
      byPerformance.slice(-3).reverse().forEach(r => {
        console.log(`  - ${r.page} (${r.device}): ${r.scores.performance} performance, ${r.warnings.length} issues`);
      });
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3000';
  const devices = args[1] ? args[1].split(',') : ['mobile', 'desktop'];
  
  const benchmark = new LighthouseBenchmark(baseUrl);
  await benchmark.setup();
  
  try {
    for (const device of devices) {
      if (TEST_CONFIGS[device]) {
        await benchmark.runBenchmark(device);
      } else {
        console.warn(`⚠️  Unknown device: ${device}`);
      }
    }
    
    const summary = await benchmark.generateSummaryReport();
    benchmark.printSummary();
    
    // Exit with error code if critical tests failed
    const criticalFailures = benchmark.results.filter(r => r.critical && (!r.passed || r.error)).length;
    process.exit(criticalFailures > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic usage
module.exports = { LighthouseBenchmark, TEST_CONFIGS, TEST_PAGES };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}