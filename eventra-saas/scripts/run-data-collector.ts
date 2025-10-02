#!/usr/bin/env tsx
/**
 * Data Collection CLI Tool
 * 
 * Manual data collection tool for testing and one-off imports
 * 
 * Usage:
 *   npm run collect:data                    # Run all enabled jobs
 *   npm run collect:data -- --job baghdad   # Run specific job
 *   npm run collect:data -- --list          # List all jobs
 *   npm run collect:data -- --test          # Test mode (mock data)
 */

import { getScheduler } from '../src/lib/dataCollection/scheduler';

async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         EVENTRA DATA COLLECTION TOOL                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const scheduler = getScheduler();

  // Parse arguments
  let command = 'run';
  let jobId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--list' || args[i] === '-l') {
      command = 'list';
    } else if (args[i] === '--job' || args[i] === '-j') {
      jobId = args[i + 1];
      i++;
    } else if (args[i] === '--test' || args[i] === '-t') {
      command = 'test';
    } else if (args[i] === '--help' || args[i] === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  try {
    switch (command) {
      case 'list':
        listJobs(scheduler);
        break;
      
      case 'test':
        await testCollector(scheduler);
        break;
      
      case 'run':
      default:
        if (jobId) {
          await runSingleJob(scheduler, jobId);
        } else {
          await runAllEnabledJobs(scheduler);
        }
        break;
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

/**
 * List all available jobs
 */
function listJobs(scheduler: any) {
  const jobs = scheduler.getJobs();
  
  console.log('📋 Available Data Collection Jobs:\n');
  console.log('═'.repeat(70));
  
  for (const job of jobs) {
    const status = job.enabled ? '✅ Enabled' : '⚪ Disabled';
    const lastRun = job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never';
    
    console.log(`\n🔹 ${job.name}`);
    console.log(`   ID: ${job.id}`);
    console.log(`   Source: ${job.source}`);
    console.log(`   Status: ${status}`);
    console.log(`   Schedule: ${job.schedule}`);
    console.log(`   Last Run: ${lastRun}`);
    console.log(`   Config: ${JSON.stringify(job.config, null, 2).split('\n').join('\n           ')}`);
  }
  
  console.log('\n═'.repeat(70));
  console.log(`\n💡 To run a specific job: npm run collect:data -- --job <job-id>`);
  console.log('💡 To run all enabled jobs: npm run collect:data\n');
}

/**
 * Run a single job
 */
async function runSingleJob(scheduler: any, jobId: string) {
  const job = scheduler.getJob(jobId);
  
  if (!job) {
    console.error(`❌ Job not found: ${jobId}`);
    console.log('\n💡 Use --list to see available jobs');
    process.exit(1);
  }

  console.log(`🚀 Running job: ${job.name}\n`);
  const result = await scheduler.executeJob(jobId);
  
  printResult(result);
}

/**
 * Run all enabled jobs
 */
async function runAllEnabledJobs(scheduler: any) {
  const jobs = scheduler.getJobs().filter((j: any) => j.enabled);
  
  if (jobs.length === 0) {
    console.log('⚠️  No enabled jobs found');
    console.log('💡 Use --list to see all jobs');
    return;
  }

  console.log(`🚀 Running ${jobs.length} enabled job(s)...\n`);
  
  const results = [];
  
  for (const job of jobs) {
    console.log(`\n${'━'.repeat(70)}`);
    console.log(`Starting: ${job.name}`);
    console.log('━'.repeat(70));
    
    try {
      const result = await scheduler.executeJob(job.id);
      results.push(result);
    } catch (error: any) {
      console.error(`Failed: ${job.name} - ${error.message}`);
      results.push({
        jobId: job.id,
        success: false,
        collected: 0,
        validated: 0,
        imported: 0,
        failed: 0,
        errors: [error.message]
      });
    }
  }

  // Print summary
  console.log('\n\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                  COLLECTION SUMMARY                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  let totalCollected = 0;
  let totalValidated = 0;
  let totalImported = 0;
  let totalFailed = 0;
  
  for (const result of results) {
    totalCollected += result.collected;
    totalValidated += result.validated;
    totalImported += result.imported;
    totalFailed += result.failed;
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.jobId}`);
    console.log(`   Collected: ${result.collected} | Validated: ${result.validated} | Imported: ${result.imported} | Failed: ${result.failed}`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log(`\n📊 TOTALS:`);
  console.log(`   Collected: ${totalCollected}`);
  console.log(`   Validated: ${totalValidated}`);
  console.log(`   Imported: ${totalImported}`);
  console.log(`   Failed: ${totalFailed}`);
  console.log('');
}

/**
 * Test the collector with mock data
 */
async function testCollector(scheduler: any) {
  console.log('🧪 Running test collection with mock data...\n');
  
  // Run baghdad job in test mode
  const result = await scheduler.executeJob('google-maps-baghdad');
  
  console.log('\n✅ Test completed!');
  console.log('💡 Mock data was used since no API key is configured');
  console.log('💡 To collect real data, add GOOGLE_PLACES_API_KEY to .env\n');
  
  printResult(result);
}

/**
 * Print job result
 */
function printResult(result: any) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    JOB RESULT                            ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
  console.log(`Status: ${status}`);
  console.log(`Duration: ${Math.round(result.duration / 1000)}s`);
  console.log(`\nData:`);
  console.log(`  📥 Collected: ${result.collected}`);
  console.log(`  ✅ Validated: ${result.validated}`);
  console.log(`  💾 Imported:  ${result.imported}`);
  console.log(`  ❌ Failed:    ${result.failed}`);
  
  if (result.errors && result.errors.length > 0) {
    console.log(`\n⚠️  Errors (${result.errors.length}):`);
    result.errors.slice(0, 5).forEach((err: string) => {
      console.log(`   - ${err}`);
    });
    if (result.errors.length > 5) {
      console.log(`   ... and ${result.errors.length - 5} more`);
    }
  }
  
  console.log('');
}

/**
 * Print help
 */
function printHelp() {
  console.log('Eventra Data Collection Tool');
  console.log('');
  console.log('USAGE:');
  console.log('  npm run collect:data [OPTIONS]');
  console.log('');
  console.log('OPTIONS:');
  console.log('  --list, -l           List all available collection jobs');
  console.log('  --job, -j <id>       Run a specific job by ID');
  console.log('  --test, -t           Test mode - run with mock data');
  console.log('  --help, -h           Show this help message');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  npm run collect:data                          # Run all enabled jobs');
  console.log('  npm run collect:data -- --list                # List jobs');
  console.log('  npm run collect:data -- --job google-maps-baghdad');
  console.log('  npm run collect:data -- --test                # Test with mock data');
  console.log('');
  console.log('SETUP:');
  console.log('  1. Add GOOGLE_PLACES_API_KEY to .env file');
  console.log('  2. Run: npm run collect:data -- --test');
  console.log('  3. If successful, run real collection jobs');
  console.log('');
}

// Run main function
main();
