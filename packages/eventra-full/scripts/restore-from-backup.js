#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 RESTORING FROM EMERGENCY BACKUP...\n');

const backupDir = '_emergency_backup';

if (!fs.existsSync(backupDir)) {
  console.error('❌ No backup directory found. Nothing to restore.');
  process.exit(1);
}

function restore(filename) {
  const backupPath = path.join(backupDir, filename);
  const originalPath = path.join('src', 'app', filename);
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, originalPath);
    console.log(`✅ Restored: ${filename}`);
    return true;
  } else {
    console.log(`⚠️  No backup found for: ${filename}`);
    return false;
  }
}

// Restore main files
restore('layout.tsx');
restore('page.tsx');

// Restore middleware
const middlewareDisabledPath = 'middleware.disabled.ts';
const middlewarePath = 'middleware.ts';

if (fs.existsSync(middlewareDisabledPath)) {
  fs.renameSync(middlewareDisabledPath, middlewarePath);
  console.log('✅ Restored middleware.ts');
}

// Clean up backup directory
try {
  fs.rmSync(backupDir, { recursive: true });
  console.log('✅ Cleaned up backup directory');
} catch (error) {
  console.log('⚠️  Could not clean up backup directory');
}

console.log('\n🎯 RESTORATION COMPLETED');
console.log('Your application has been restored to the previous state.');
console.log('Run: npm run build && npm run dev to test.');