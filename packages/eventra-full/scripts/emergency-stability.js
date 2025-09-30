#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY STABILITY MODE - Disabling complex components...\n');

// Backup current files
const backupDir = '_emergency_backup';
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

function backupAndReplace(originalPath, minimalPath) {
  const originalFullPath = path.join(process.cwd(), originalPath);
  const minimalFullPath = path.join(process.cwd(), minimalPath);
  const backupPath = path.join(backupDir, path.basename(originalPath));
  
  try {
    // Backup original
    if (fs.existsSync(originalFullPath)) {
      fs.copyFileSync(originalFullPath, backupPath);
      console.log(`✅ Backed up: ${originalPath} → ${backupPath}`);
    }
    
    // Replace with minimal version
    if (fs.existsSync(minimalFullPath)) {
      fs.copyFileSync(minimalFullPath, originalFullPath);
      console.log(`✅ Replaced: ${originalPath} with minimal version`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${originalPath}:`, error.message);
  }
}

console.log('Phase 1: Switching to minimal components...\n');

// Replace complex components with minimal versions
backupAndReplace('src/app/layout.tsx', 'src/app/layout.minimal.tsx');
backupAndReplace('src/app/page.tsx', 'src/app/page.minimal.tsx');

// Disable problematic middleware
const middlewarePath = 'middleware.ts';
const middlewareDisabledPath = 'middleware.disabled.ts';

if (fs.existsSync(middlewarePath)) {
  fs.renameSync(middlewarePath, middlewareDisabledPath);
  console.log('✅ Disabled middleware.ts → middleware.disabled.ts');
}

// Create minimal vercel.json
const minimalVercelConfig = {
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
};

fs.writeFileSync('vercel.minimal.json', JSON.stringify(minimalVercelConfig, null, 2));
console.log('✅ Created minimal vercel configuration');

// Create stability test script
const stabilityTest = `#!/usr/bin/env node

console.log('🔍 Testing application stability...');

const testEndpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check' }
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(\`http://localhost:3000\${endpoint.path}\`);
    const status = response.status;
    console.log(\`\${status === 200 ? '✅' : '❌'} \${endpoint.name}: \${status}\`);
    return status === 200;
  } catch (error) {
    console.log(\`❌ \${endpoint.name}: \${error.message}\`);
    return false;
  }
}

async function runTests() {
  const results = [];
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(\`\\n📊 Stability Test Results: \${passed}/\${total} passed\`);
  
  if (passed === total) {
    console.log('✅ Application is stable!');
    process.exit(0);
  } else {
    console.log('❌ Application has stability issues');
    process.exit(1);
  }
}

runTests();
`;

fs.writeFileSync('scripts/test-stability.js', stabilityTest);
console.log('✅ Created stability test script');

console.log('\n🎯 EMERGENCY STABILITY ACTIONS COMPLETED');
console.log('\nNext steps:');
console.log('1. npm run build');
console.log('2. npm run dev (test locally)');
console.log('3. node scripts/test-stability.js');
console.log('4. Deploy with: vercel --prod');
console.log('\nTo restore: node scripts/restore-from-backup.js');