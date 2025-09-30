#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates all required environment variables for production deployment
 */

const requiredEnvVars = {
  'DATABASE_URL': 'Database connection string',
  'NEXTAUTH_SECRET': 'NextAuth.js secret key',
  'NEXTAUTH_URL': 'Canonical URL for NextAuth.js',
};

const optionalEnvVars = {
  'GOOGLE_CLIENT_ID': 'Google OAuth client ID',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth client secret',
  'UPSTASH_REDIS_REST_URL': 'Redis URL for rate limiting',
  'UPSTASH_REDIS_REST_TOKEN': 'Redis token for rate limiting',
  'BCRYPT_ROUNDS': 'Bcrypt hashing rounds (default: 12)',
  'NEXT_PUBLIC_SHOW_TOP_BANNER': 'Show marketing banner on homepage',
  'NEXT_PUBLIC_ENABLE_GOOGLE': 'Enable Google OAuth sign-in',
};

function validateEnvironment() {
  console.log('🔍 Validating Production Environment Variables...\n');
  
  let hasErrors = false;
  const warnings = [];
  
  // Check required variables
  console.log('📋 Required Variables:');
  for (const [envVar, description] of Object.entries(requiredEnvVars)) {
    const value = process.env[envVar];
    
    if (!value) {
      console.log(`❌ ${envVar}: MISSING - ${description}`);
      hasErrors = true;
    } else if (value === '<REPLACE_ME>' || value.includes('REPLACE')) {
      console.log(`⚠️  ${envVar}: PLACEHOLDER - ${description}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${envVar}: CONFIGURED`);
    }
  }
  
  // Check optional variables
  console.log('\n📋 Optional Variables:');
  for (const [envVar, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[envVar];
    
    if (!value) {
      console.log(`⚠️  ${envVar}: NOT SET - ${description}`);
      warnings.push(`Consider setting ${envVar} for full functionality`);
    } else if (value === '<REPLACE_ME>' || value.includes('REPLACE')) {
      console.log(`⚠️  ${envVar}: PLACEHOLDER - ${description}`);
      warnings.push(`Update ${envVar} with actual value`);
    } else {
      console.log(`✅ ${envVar}: CONFIGURED`);
    }
  }
  
  // Database URL validation
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('file:')) {
      console.log('\n📝 Note: Using SQLite database (file-based)');
      console.log('   For production, consider PostgreSQL or MySQL');
    } else if (process.env.DATABASE_URL.includes('postgresql') || process.env.DATABASE_URL.includes('postgres')) {
      console.log('\n✅ Using PostgreSQL database (production-ready)');
    }
  }
  
  // NextAuth URL validation
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.includes('localhost') || process.env.NEXTAUTH_URL.includes('127.0.0.1')) {
      warnings.push('NEXTAUTH_URL appears to be set to localhost - update for production');
    }
  }
  
  console.log('\n📊 Validation Summary:');
  if (hasErrors) {
    console.log('❌ Environment validation FAILED');
    console.log('   Fix the missing required variables above');
    process.exit(1);
  } else {
    console.log('✅ Environment validation PASSED');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n🚀 Environment is ready for deployment!');
}

// Run validation
validateEnvironment();