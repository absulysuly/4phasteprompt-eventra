#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class HealthChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(type, message) {
    console.log(`[${type.toUpperCase()}] ${message}`);
    this[type === 'error' ? 'errors' : type === 'warning' ? 'warnings' : 'passed'].push(message);
  }

  // Check 1: Code & State Management
  checkCodeQuality() {
    console.log('\n🔍 Checking Code Quality...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.log('pass', 'ESLint checks passed');
    } catch (error) {
      this.log('error', 'ESLint errors found - run npm run lint for details');
    }

    // Check for common React anti-patterns
    const srcFiles = this.getAllFiles('./src', ['.tsx', '.ts']);
    srcFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for state updates in render
      if (content.match(/useState.*=.*(?:render|useMemo)/s)) {
        this.log('warning', `Potential state update in render detected: ${file}`);
      }

      // Check for missing return statements
      const componentMatches = content.match(/export.*function.*\(.*\).*{/g);
      if (componentMatches && !content.includes('return')) {
        this.log('warning', `Component may be missing return statement: ${file}`);
      }
    });
  }

  // Check 2: Internationalization
  checkI18n() {
    console.log('\n🌐 Checking Internationalization...');
    
    const locales = ['en', 'ar', 'ku'];
    const i18nPath = './src/lib/i18n.ts';
    
    if (!fs.existsSync(i18nPath)) {
      this.log('error', 'i18n configuration file not found');
      return;
    }

    const i18nContent = fs.readFileSync(i18nPath, 'utf8');
    
    locales.forEach(locale => {
      if (!i18nContent.includes(`'${locale}'`) && !i18nContent.includes(`"${locale}"`)) {
        this.log('error', `Locale '${locale}' not found in i18n config`);
      } else {
        this.log('pass', `Locale '${locale}' configured`);
      }
    });

    // Check for language switcher component
    const navigationPath = './src/app/components/Navigation.tsx';
    if (fs.existsSync(navigationPath)) {
      const navContent = fs.readFileSync(navigationPath, 'utf8');
      if (navContent.includes('language-switcher')) {
        this.log('pass', 'Language switcher component found');
      } else {
        this.log('warning', 'Language switcher component not detected');
      }
    }
  }

  // Check 3: Content Security Policy
  checkCSP() {
    console.log('\n🔒 Checking Content Security Policy...');
    
    const nextConfigPath = './next.config.ts';
    if (!fs.existsSync(nextConfigPath)) {
      this.log('error', 'next.config.ts not found');
      return;
    }

    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (configContent.includes('Content-Security-Policy')) {
      this.log('pass', 'CSP headers configured');
      
      if (configContent.includes("'unsafe-inline'")) {
        this.log('warning', 'CSP contains unsafe-inline - consider using nonces/hashes');
      }
    } else {
      this.log('warning', 'CSP headers not configured');
    }
  }

  // Check 4: Database & Environment
  checkDatabase() {
    console.log('\n🗄️ Checking Database & Environment...');
    
    if (!fs.existsSync('.env')) {
      this.log('error', '.env file not found');
      return;
    }

    const envContent = fs.readFileSync('.env', 'utf8');
    
    if (envContent.includes('DATABASE_URL')) {
      this.log('pass', 'DATABASE_URL configured');
    } else {
      this.log('error', 'DATABASE_URL not found in .env');
    }

    // Check Prisma schema
    const schemaPath = './prisma/schema.prisma';
    if (fs.existsSync(schemaPath)) {
      this.log('pass', 'Prisma schema found');
      
      try {
        execSync('npx prisma validate', { stdio: 'pipe' });
        this.log('pass', 'Prisma schema validation passed');
      } catch {
        this.log('error', 'Prisma schema validation failed');
      }
    } else {
      this.log('error', 'Prisma schema not found');
    }
  }

  // Check 5: Build & Deployment
  checkBuild() {
    console.log('\n🏗️ Checking Build Configuration...');
    
    const lockfiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
    const foundLockfiles = lockfiles.filter(file => fs.existsSync(file));
    
    if (foundLockfiles.length > 1) {
      this.log('warning', `Multiple lockfiles found: ${foundLockfiles.join(', ')}`);
    } else if (foundLockfiles.length === 1) {
      this.log('pass', `Single lockfile found: ${foundLockfiles[0]}`);
    }

    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('pass', 'Build successful');
    } catch {
      this.log('error', 'Build failed - run npm run build for details');
    }
  }

  getAllFiles(dir, extensions) {
    const files = [];
    
    function traverse(currentDir) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
          traverse(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    traverse(dir);
    return files;
  }

  run() {
    console.log('🏥 Starting Health Check...\n');
    
    this.checkCodeQuality();
    this.checkI18n();
    this.checkCSP();
    this.checkDatabase();
    this.checkBuild();
    
    console.log('\n📊 Health Check Summary:');
    console.log(`✅ Passed: ${this.passed.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Critical Issues:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n✅ Health check completed successfully!');
  }
}

const checker = new HealthChecker();
checker.run();