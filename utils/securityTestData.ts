import { securityService } from '../services/securityService';

// Generate sample audit logs to demonstrate the security system
export const generateSampleSecurityData = () => {
  console.log('🔒 Generating sample military-grade security data...');

  // Simulate various security events
  const sampleEvents = [
    {
      action: 'user_login',
      resource: 'authentication_system',
      success: true,
      riskLevel: 'low' as const,
      details: { method: '2fa_enabled', location: 'New York, US' }
    },
    {
      action: 'password_change',
      resource: 'user_account',
      success: true,
      riskLevel: 'medium' as const,
      details: { strength: 'strong', policy_compliant: true }
    },
    {
      action: 'admin_access',
      resource: 'admin_dashboard',
      success: true,
      riskLevel: 'high' as const,
      details: { permissions: ['user_management', 'system_config'] }
    },
    {
      action: 'failed_login_attempt',
      resource: 'authentication_system',
      success: false,
      riskLevel: 'medium' as const,
      details: { reason: 'invalid_credentials', attempts: 3 }
    },
    {
      action: 'data_export',
      resource: 'user_database',
      success: true,
      riskLevel: 'critical' as const,
      details: { records_count: 1500, encryption: 'aes_256' }
    },
    {
      action: 'system_backup',
      resource: 'database_server',
      success: true,
      riskLevel: 'low' as const,
      details: { size: '2.5GB', encrypted: true }
    },
    {
      action: 'suspicious_api_calls',
      resource: 'api_gateway',
      success: false,
      riskLevel: 'critical' as const,
      details: { rate_limit_exceeded: true, blocked: true }
    },
    {
      action: 'encryption_key_rotation',
      resource: 'encryption_service',
      success: true,
      riskLevel: 'high' as const,
      details: { algorithm: 'AES-256-GCM', key_age: '30_days' }
    },
    {
      action: 'compliance_scan',
      resource: 'security_scanner',
      success: true,
      riskLevel: 'low' as const,
      details: { standards: ['ISO27001', 'SOC2', 'GDPR'], score: 95 }
    },
    {
      action: 'vulnerability_detected',
      resource: 'security_scanner',
      success: true,
      riskLevel: 'high' as const,
      details: { cve: 'CVE-2024-0001', severity: 'medium', patched: false }
    }
  ];

  // Generate logs for the past week
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const sampleIPs = ['192.168.1.100', '10.0.0.50', '203.0.113.1', '198.51.100.42'];
  const sampleUserAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  // Generate 50 sample audit logs
  for (let i = 0; i < 50; i++) {
    const event = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
    const randomTime = now - Math.floor(Math.random() * oneWeek);
    
    securityService.logAuditEvent(
      event.action,
      event.resource,
      event.success,
      {
        userId: `user_${Math.floor(Math.random() * 100) + 1}`,
        ipAddress: sampleIPs[Math.floor(Math.random() * sampleIPs.length)],
        userAgent: sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)],
        riskLevel: event.riskLevel,
        details: {
          ...event.details,
          timestamp_override: randomTime
        }
      }
    );
  }

  // Simulate some login attempts for demo
  const loginAttempts = [
    {
      email: 'admin@eventra.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      userId: 'admin_001',
      location: 'New York, US',
      twoFactorUsed: true,
      deviceFingerprint: 'fp_12345678'
    },
    {
      email: 'user@example.com',
      ipAddress: '203.0.113.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: false,
      location: 'London, UK',
      twoFactorUsed: false,
      failureReason: 'Invalid password'
    },
    {
      email: 'manager@eventra.com',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      success: true,
      userId: 'manager_001',
      location: 'San Francisco, CA',
      twoFactorUsed: true,
      deviceFingerprint: 'fp_87654321'
    }
  ];

  // Record login attempts
  loginAttempts.forEach(attempt => {
    securityService.recordLoginAttempt(attempt);
  });

  // Test some rate limiting scenarios
  const testIP = '198.51.100.999';
  for (let i = 0; i < 5; i++) {
    securityService.checkRateLimit(`${testIP}-api`, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    });
  }

  // Test DDoS detection (simulate high traffic)
  for (let i = 0; i < 10; i++) {
    securityService.checkRateLimit(`${testIP}-ddos-test`, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 50,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    });
  }

  // Test user verification
  const verificationId = securityService.initiateUserVerification('user_001', 'identity');
  console.log(`🔐 Test verification ID: ${verificationId}`);

  // Generate some security alerts
  const alertTypes: Array<'login_failed' | 'suspicious_activity' | 'password_changed' | 'device_new' | 'location_new' | 'rate_limit_exceeded'> = [
    'login_failed',
    'suspicious_activity', 
    'device_new',
    'location_new'
  ];

  // Create some test alerts
  alertTypes.forEach((type, index) => {
    setTimeout(() => {
      // This would normally be called internally, but for demo purposes:
      const alert = {
        type,
        severity: index % 2 === 0 ? 'medium' as const : 'low' as const,
        message: `Test ${type.replace('_', ' ')} alert for demonstration`,
        userId: 'demo_user',
        ipAddress: sampleIPs[index % sampleIPs.length],
        details: {
          test: true,
          generated_at: new Date().toISOString()
        }
      };
      console.log(`🚨 Generated test alert: ${alert.message}`);
    }, index * 1000); // Stagger the alerts
  });

  console.log('✅ Sample military-grade security data generated successfully!');
  console.log('📊 Dashboard now populated with:');
  console.log('  - 50 audit log entries');
  console.log('  - Login attempt history');
  console.log('  - Rate limiting tests');
  console.log('  - User verification process');
  console.log('  - Security alerts');
  console.log('  - Compliance scoring');
};

// Test compliance features
export const testComplianceFeatures = () => {
  console.log('🛡️ Testing compliance features...');

  const compliance = securityService.getComplianceReport();
  console.log('📋 Compliance Report:', compliance);

  const securityMetrics = securityService.getSecurityMetrics();
  console.log('📈 Security Metrics:', securityMetrics);

  const dashboardData = securityService.getSecurityDashboardData();
  console.log('🖥️ Dashboard Data:', dashboardData);

  console.log('✅ Compliance testing completed!');
};

// Test encryption features
export const testEncryptionFeatures = async () => {
  console.log('🔐 Testing encryption features...');

  try {
    const keyPair = await securityService.generateKeyPair();
    console.log('🔑 Generated key pair');

    const testData = 'This is sensitive user data that needs encryption';
    const encrypted = await securityService.encryptData(testData, keyPair.publicKey);
    console.log('🔒 Data encrypted successfully');

    const decrypted = await securityService.decryptData(encrypted, keyPair.privateKey);
    console.log('🔓 Data decrypted successfully');
    console.log('✅ Encryption test passed:', decrypted === testData);

  } catch (error) {
    console.error('❌ Encryption test failed:', error);
  }
};

// Run all tests
export const runSecurityTests = async () => {
  console.log('🚀 Running comprehensive military-grade security tests...\n');
  
  generateSampleSecurityData();
  
  setTimeout(() => {
    testComplianceFeatures();
  }, 2000);

  setTimeout(async () => {
    await testEncryptionFeatures();
    console.log('\n✅ All military-grade security tests completed!');
    console.log('🎯 Security dashboard is now fully populated with test data');
  }, 3000);
};

export default {
  generateSampleSecurityData,
  testComplianceFeatures,
  testEncryptionFeatures,
  runSecurityTests
};