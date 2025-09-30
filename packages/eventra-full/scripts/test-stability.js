#!/usr/bin/env node

console.log('🔍 Testing application stability...');

const testEndpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check' }
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`http://localhost:3000${endpoint.path}`);
    const status = response.status;
    console.log(`${status === 200 ? '✅' : '❌'} ${endpoint.name}: ${status}`);
    return status === 200;
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ${error.message}`);
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
  
  console.log(`\n📊 Stability Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('✅ Application is stable!');
    process.exit(0);
  } else {
    console.log('❌ Application has stability issues');
    process.exit(1);
  }
}

runTests();
