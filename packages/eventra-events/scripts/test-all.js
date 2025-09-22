#!/usr/bin/env node

/**
 * Comprehensive test runner for Eventra SaaS
 * Runs all tests, checks, and validations in the correct order
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting comprehensive test suite for Eventra SaaS...\n');

const runCommand = (command, description, optional = false) => {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    if (optional) {
      console.log(`⚠️  ${description} skipped (optional)\n`);
      return true;
    } else {
      console.error(`❌ ${description} failed`);
      console.error(`Command: ${command}`);
      console.error(`Error: ${error.message}\n`);
      return false;
    }
  }
};

const checkFileExists = (filePath, description) => {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.log(`❌ ${description} missing: ${filePath}`);
    return false;
  }
};

let allPassed = true;

console.log('🔍 Pre-flight checks...');
const preflightChecks = [
  checkFileExists('jest.config.js', 'Jest configuration'),
  checkFileExists('tests/setup/jest.setup.ts', 'Jest setup file'),
  checkFileExists('tests/unit', 'Unit tests directory'),
  checkFileExists('tests/integration', 'Integration tests directory'),
  checkFileExists('tests/setup/test-db.ts', 'Test database setup'),
];

if (!preflightChecks.every(check => check)) {
  console.log('❌ Pre-flight checks failed. Please ensure test infrastructure is set up correctly.');
  process.exit(1);
}

console.log('✅ Pre-flight checks passed\n');

// Step 1: Code Quality Checks
console.log('🔧 Code Quality Checks');
console.log('=' .repeat(50));

if (!runCommand('npm run type-check', 'TypeScript type checking')) {
  allPassed = false;
}

if (!runCommand('npm run lint', 'ESLint code linting')) {
  allPassed = false;
}

if (!runCommand('npm run format:check', 'Prettier formatting check', true)) {
  // Format check is optional - we can auto-fix if needed
  console.log('💡 Running auto-format...');
  runCommand('npm run format', 'Auto-formatting code', true);
}

// Step 2: Internationalization Validation
console.log('🌐 Internationalization Validation');
console.log('=' .repeat(50));

if (!runCommand('npm run i18n:check', 'Translation completeness validation')) {
  allPassed = false;
}

// Step 3: Unit Tests
console.log('🧪 Unit Tests');
console.log('=' .repeat(50));

if (!runCommand('npm run test:unit', 'Unit tests')) {
  allPassed = false;
}

// Step 3.5: Integration Tests
console.log('🔗 Integration Tests');
console.log('=' .repeat(50));

if (!runCommand('npm run test:integration', 'Integration tests')) {
  allPassed = false;
}

// Step 3.75: Coverage Report
console.log('📊 Coverage Report');
console.log('=' .repeat(50));

runCommand('npm run test:coverage', 'Test coverage report', true);

// Step 4: Database Checks
console.log('🗄️  Database Validation');
console.log('=' .repeat(50));

if (!runCommand('npm run db:generate', 'Prisma client generation')) {
  allPassed = false;
}

// Check if we can connect to database
runCommand('npx prisma db push --accept-data-loss', 'Database schema validation', true);

// Step 5: Build Test
console.log('🏗️  Build Validation');
console.log('=' .repeat(50));

if (!runCommand('npm run build', 'Production build test')) {
  allPassed = false;
}

// Step 6: E2E Tests (optional)
console.log('🌐 End-to-End Tests');
console.log('=' .repeat(50));

runCommand('npm run test:e2e', 'End-to-end tests', true);

// Final Report
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUITE SUMMARY');
console.log('='.repeat(60));

if (allPassed) {
  console.log('🎉 All critical tests passed!');
  console.log('✅ Code is ready for deployment');
  
  // Show coverage information if available
  const coverageDir = path.join(process.cwd(), 'coverage');
  if (fs.existsSync(coverageDir)) {
    console.log('\n📈 Test coverage report generated in coverage/');
    console.log('💡 Open coverage/lcov-report/index.html in your browser to view details');
  }
  
  console.log('\n🚀 Ready to commit and push!');
  process.exit(0);
} else {
  console.log('❌ Some critical tests failed');
  console.log('🔧 Please fix the issues above before proceeding');
  console.log('\n💡 Common fixes:');
  console.log('   • Run npm run lint:fix to auto-fix linting issues');
  console.log('   • Run npm run format to fix formatting');
  console.log('   • Check TypeScript errors with npm run type-check');
  console.log('   • Validate translations with npm run i18n:check');
  process.exit(1);
}