/**
 * Integration tests for Authentication API endpoints
 * Tests user registration, validation, password hashing, and database interactions
 */

import { NextRequest } from 'next/server';
import { POST as registerUser } from '../../app/api/register/route';
import TestDatabase, { testUsers, testValidation } from '../test-db';
import bcrypt from 'bcryptjs';

describe('Authentication API Integration Tests', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = TestDatabase.getInstance();
    await testDb.setup();
  });

  beforeEach(async () => {
    // Reset any test-specific data
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  describe('POST /api/register', () => {
    describe('Input Validation', () => {
      it('should return 400 when email is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(testValidation.invalidUserData.missingEmail)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email and password are required');
      });

      it('should return 400 when password is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email and password are required');
      });

      it('should return 400 for invalid email format', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(testValidation.invalidUserData.invalidEmail)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid email format');
      });

      it('should return 400 for weak password (too short)', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: '123'
          })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Password must be at least 8 characters long');
      });

      it('should return 400 for password without lowercase letter', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'PASSWORD123!'
          })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Password must contain at least one lowercase letter');
      });

      it('should return 400 for password without uppercase letter', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123!'
          })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Password must contain at least one uppercase letter');
      });

      it('should return 400 for password without number', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password!'
          })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Password must contain at least one number');
      });

      it('should accept various valid email formats', async () => {
        const validEmails = [
          'user@example.com',
          'user.name@example.com',
          'user+tag@example.co.uk',
          'user123@test-domain.org',
          'a@b.co'
        ];

        for (const email of validEmails) {
          const userData = {
            email,
            password: 'ValidPassword123!',
            name: 'Test User'
          };

          const request = new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(userData)
          });

          const response = await registerUser(request);
          const data = await response.json();

          expect(response.status).toBe(201);
          expect(data.success).toBe(true);
          expect(data.user.email).toBe(email.toLowerCase());

          // Clean up created user
          await testDb.getPrisma().user.delete({
            where: { email: email.toLowerCase() }
          });
        }
      });
    });

    describe('Duplicate User Prevention', () => {
      it('should return 409 when user already exists', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(testValidation.invalidUserData.duplicateEmail)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error).toBe('User already exists');
      });

      it('should be case-insensitive for email duplication check', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: testUsers.user1.email.toUpperCase(),
            password: 'ValidPassword123!'
          })
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error).toBe('User already exists');
      });
    });

    describe('Successful Registration', () => {
      it('should create user with valid data', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(testValidation.validUserData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.user).toHaveProperty('id');
        expect(data.user.email).toBe(testValidation.validUserData.email);
        expect(data.user.name).toBe(testValidation.validUserData.name);
        
        // Should not return password
        expect(data.user).not.toHaveProperty('password');

        // Verify in database
        const dbUser = await testDb.getUserByEmail(testValidation.validUserData.email);
        expect(dbUser).not.toBeNull();
        expect(dbUser?.email).toBe(testValidation.validUserData.email);
        expect(dbUser?.name).toBe(testValidation.validUserData.name);
      });

      it('should create user without name (optional field)', async () => {
        const userData = {
          email: 'noname@example.com',
          password: 'ValidPassword123!'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.user.email).toBe(userData.email);
        expect(data.user.name).toBeNull();

        // Verify in database
        const dbUser = await testDb.getUserByEmail(userData.email);
        expect(dbUser?.name).toBeNull();
      });

      it('should trim whitespace from name field', async () => {
        const userData = {
          email: 'whitespace@example.com',
          password: 'ValidPassword123!',
          name: '  Whitespace User  '
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.user.name).toBe('Whitespace User');

        // Verify in database
        const dbUser = await testDb.getUserByEmail(userData.email);
        expect(dbUser?.name).toBe('Whitespace User');
      });

      it('should convert email to lowercase', async () => {
        const userData = {
          email: 'UPPERCASE@EXAMPLE.COM',
          password: 'ValidPassword123!',
          name: 'Uppercase Email User'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.user.email).toBe('uppercase@example.com');

        // Verify in database
        const dbUser = await testDb.getUserByEmail('uppercase@example.com');
        expect(dbUser?.email).toBe('uppercase@example.com');
      });
    });

    describe('Password Security', () => {
      it('should hash password before storing', async () => {
        const userData = {
          email: 'hashtest@example.com',
          password: 'PlaintextPassword123!',
          name: 'Hash Test User'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);

        // Verify password is hashed in database
        const dbUser = await testDb.getUserByEmail(userData.email);
        expect(dbUser?.password).not.toBe(userData.password);
        expect(dbUser?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format

        // Verify password can be verified
        const isValidPassword = await bcrypt.compare(userData.password, dbUser!.password);
        expect(isValidPassword).toBe(true);

        // Verify wrong password fails
        const isWrongPassword = await bcrypt.compare('WrongPassword123!', dbUser!.password);
        expect(isWrongPassword).toBe(false);
      });

      it('should use configurable bcrypt rounds', async () => {
        const originalBcryptRounds = process.env.BCRYPT_ROUNDS;
        process.env.BCRYPT_ROUNDS = '10';

        const userData = {
          email: 'rounds@example.com',
          password: 'RoundsTest123!',
          name: 'Rounds Test'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        expect(response.status).toBe(201);

        const dbUser = await testDb.getUserByEmail(userData.email);
        expect(dbUser?.password).toMatch(/^\$2[aby]\$10\$/); // 10 rounds

        // Restore original environment
        if (originalBcryptRounds) {
          process.env.BCRYPT_ROUNDS = originalBcryptRounds;
        } else {
          delete process.env.BCRYPT_ROUNDS;
        }
      });

      it('should default to 12 bcrypt rounds when not configured', async () => {
        const originalBcryptRounds = process.env.BCRYPT_ROUNDS;
        delete process.env.BCRYPT_ROUNDS;

        const userData = {
          email: 'defaultrounds@example.com',
          password: 'DefaultRounds123!',
          name: 'Default Rounds Test'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        expect(response.status).toBe(201);

        const dbUser = await testDb.getUserByEmail(userData.email);
        expect(dbUser?.password).toMatch(/^\$2[aby]\$12\$/); // 12 rounds (default)

        // Restore original environment
        if (originalBcryptRounds) {
          process.env.BCRYPT_ROUNDS = originalBcryptRounds;
        }
      });
    });

    describe('Error Handling', () => {
      it('should handle malformed JSON request', async () => {
        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: 'invalid json{'
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
      });

      it('should handle database connection errors', async () => {
        // Temporarily disconnect the database
        await testDb.getPrisma().$disconnect();

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(testValidation.validUserData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');

        // Reconnect for cleanup
        await testDb.setup();
      });

      it('should handle extremely long input values', async () => {
        const longString = 'a'.repeat(1000);
        const userData = {
          email: 'long@example.com',
          password: 'ValidPassword123!',
          name: longString
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        // Should either succeed or fail gracefully
        expect([201, 400, 500]).toContain(response.status);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty string name', async () => {
        const userData = {
          email: 'emptyname@example.com',
          password: 'ValidPassword123!',
          name: ''
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.user.name).toBeNull(); // Empty string should become null
      });

      it('should handle special characters in name', async () => {
        const userData = {
          email: 'special@example.com',
          password: 'ValidPassword123!',
          name: 'Special Çhåraçtërs Üser 한국어'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.user.name).toBe(userData.name);
      });

      it('should handle minimum valid password requirements', async () => {
        const userData = {
          email: 'minpass@example.com',
          password: 'Aa1Bb2Cc', // Exactly 8 characters with all requirements
          name: 'Min Password'
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
      });

      it('should handle null values in optional fields', async () => {
        const userData = {
          email: 'nullname@example.com',
          password: 'ValidPassword123!',
          name: null
        };

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        });

        const response = await registerUser(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.user.name).toBeNull();
      });
    });

    describe('Performance Tests', () => {
      it('should handle concurrent registration requests', async () => {
        const concurrentUsers = Array.from({ length: 5 }, (_, i) => ({
          email: `concurrent${i}@example.com`,
          password: 'ConcurrentTest123!',
          name: `Concurrent User ${i}`
        }));

        const requests = concurrentUsers.map(userData =>
          new NextRequest('http://localhost:3000/api/register', {
            method: 'POST',
            body: JSON.stringify(userData)
          })
        );

        const responses = await Promise.all(
          requests.map(request => registerUser(request))
        );

        // All registrations should succeed
        responses.forEach(response => {
          expect(response.status).toBe(201);
        });

        // Verify all users were created
        for (const userData of concurrentUsers) {
          const dbUser = await testDb.getUserByEmail(userData.email);
          expect(dbUser).not.toBeNull();
          expect(dbUser?.email).toBe(userData.email);
        }
      });

      it('should complete registration within reasonable time', async () => {
        const startTime = Date.now();

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'performance@example.com',
            password: 'PerformanceTest123!',
            name: 'Performance User'
          })
        });

        const response = await registerUser(request);
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response.status).toBe(201);
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });
  });
});