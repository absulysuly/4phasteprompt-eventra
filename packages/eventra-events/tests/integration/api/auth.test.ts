import { NextRequest } from 'next/server'
import { POST as registerUser } from '@/app/api/register/route'
import { POST as requestReset } from '@/app/api/reset/request/route'
import { POST as confirmReset } from '@/app/api/reset/confirm/route'
import { setupTestDb, cleanupTestDb, disconnectTestDb, testPrisma, TestUser } from '../../setup/test-db'
import bcrypt from 'bcryptjs'

describe('Authentication API Integration Tests', () => {
  let testUsers: TestUser[]
  
  beforeAll(async () => {
    const testData = await setupTestDb()
    testUsers = testData.users
  })
  
  afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'ValidPassword123',
        name: 'New User'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('success', true)
      expect(data.user).toHaveProperty('email', userData.email.toLowerCase())
      expect(data.user).toHaveProperty('name', userData.name)
      expect(data.user).not.toHaveProperty('password')

      // Verify user was created in database
      const createdUser = await testPrisma.user.findUnique({
        where: { email: userData.email.toLowerCase() }
      })
      expect(createdUser).toBeTruthy()
      expect(createdUser?.email).toBe(userData.email.toLowerCase())
      
      // Verify password was hashed
      const isValidPassword = await bcrypt.compare(userData.password, createdUser!.password)
      expect(isValidPassword).toBe(true)

      // Clean up
      await testPrisma.user.delete({ where: { id: createdUser!.id } })
    })

    it('should validate required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing password
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(incompleteData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Email and password are required')
    })

    it('should validate email format', async () => {
      const invalidEmailData = {
        email: 'invalid-email',
        password: 'ValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Invalid email format')
    })

    it('should validate password strength - minimum length', async () => {
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'short'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(weakPasswordData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Password must be at least 8 characters long')
    })

    it('should validate password strength - lowercase requirement', async () => {
      const noLowercaseData = {
        email: 'test@example.com',
        password: 'NOUPPERCASEONLY123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(noLowercaseData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Password must contain at least one lowercase letter')
    })

    it('should validate password strength - uppercase requirement', async () => {
      const noUppercaseData = {
        email: 'test@example.com',
        password: 'nouppercase123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(noUppercaseData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Password must contain at least one uppercase letter')
    })

    it('should validate password strength - number requirement', async () => {
      const noNumberData = {
        email: 'test@example.com',
        password: 'NoNumbersHere'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(noNumberData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Password must contain at least one number')
    })

    it('should prevent duplicate user registration', async () => {
      const existingUserData = {
        email: testUsers[0].email,
        password: 'AnotherValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(existingUserData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toHaveProperty('error', 'User already exists')
    })

    it('should handle case insensitive email uniqueness', async () => {
      const upperCaseEmailData = {
        email: testUsers[0].email.toUpperCase(),
        password: 'ValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(upperCaseEmailData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toHaveProperty('error', 'User already exists')
    })

    it('should normalize email to lowercase', async () => {
      const mixedCaseEmailData = {
        email: 'MixEdCaSe@Example.COM',
        password: 'ValidPassword123',
        name: 'Mixed Case User'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(mixedCaseEmailData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toHaveProperty('email', 'mixedcase@example.com')

      // Clean up
      const createdUser = await testPrisma.user.findUnique({
        where: { email: 'mixedcase@example.com' }
      })
      if (createdUser) {
        await testPrisma.user.delete({ where: { id: createdUser.id } })
      }
    })

    it('should handle optional name field', async () => {
      const userDataWithoutName = {
        email: 'noname@example.com',
        password: 'ValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(userDataWithoutName)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toHaveProperty('email', userDataWithoutName.email)
      expect(data.user).toHaveProperty('name', null)

      // Clean up
      const createdUser = await testPrisma.user.findUnique({
        where: { email: userDataWithoutName.email }
      })
      if (createdUser) {
        await testPrisma.user.delete({ where: { id: createdUser.id } })
      }
    })

    it('should trim and handle empty name', async () => {
      const userDataWithEmptyName = {
        email: 'emptyname@example.com',
        password: 'ValidPassword123',
        name: '   '
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(userDataWithEmptyName)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toHaveProperty('name', null)

      // Clean up
      const createdUser = await testPrisma.user.findUnique({
        where: { email: userDataWithEmptyName.email }
      })
      if (createdUser) {
        await testPrisma.user.delete({ where: { id: createdUser.id } })
      }
    })

    it('should use BCRYPT_ROUNDS environment variable', async () => {
      // Set custom bcrypt rounds
      const originalRounds = process.env.BCRYPT_ROUNDS
      process.env.BCRYPT_ROUNDS = '4' // Lower rounds for faster testing

      const userData = {
        email: 'bcrypttest@example.com',
        password: 'ValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(201)

      // Verify user was created with custom bcrypt rounds
      const createdUser = await testPrisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(createdUser).toBeTruthy()
      
      const isValidPassword = await bcrypt.compare(userData.password, createdUser!.password)
      expect(isValidPassword).toBe(true)

      // Clean up
      await testPrisma.user.delete({ where: { id: createdUser!.id } })
      
      // Restore original environment
      if (originalRounds) {
        process.env.BCRYPT_ROUNDS = originalRounds
      } else {
        delete process.env.BCRYPT_ROUNDS
      }
    })

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalCreate = testPrisma.user.create
      testPrisma.user.create = jest.fn().mockRejectedValueOnce(new Error('Database connection failed'))

      const userData = {
        email: 'dberror@example.com',
        password: 'ValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error', 'Internal server error')

      // Restore original method
      testPrisma.user.create = originalCreate
    })

    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/register', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await registerUser(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error', 'Internal server error')
    })
  })

  describe('POST /api/reset/request', () => {
    it('should create password reset token for existing user', async () => {
      const resetData = {
        email: testUsers[0].email
      }

      const request = new NextRequest('http://localhost:3000/api/reset/request', {
        method: 'POST',
        body: JSON.stringify(resetData)
      })

      const response = await requestReset(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)

      // Verify reset token was created
      const resetToken = await testPrisma.passwordResetToken.findFirst({
        where: { user: { email: testUsers[0].email } }
      })
      expect(resetToken).toBeTruthy()
      expect(resetToken?.expiresAt.getTime()).toBeGreaterThan(Date.now())

      // Clean up
      if (resetToken) {
        await testPrisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      }
    })

    it('should handle non-existent email gracefully', async () => {
      const resetData = {
        email: 'nonexistent@example.com'
      }

      const request = new NextRequest('http://localhost:3000/api/reset/request', {
        method: 'POST',
        body: JSON.stringify(resetData)
      })

      const response = await requestReset(request)
      const data = await response.json()

      // Should still return success for security reasons
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
    })
  })

  describe('POST /api/reset/confirm', () => {
    it('should reset password with valid token', async () => {
      // First create a reset token
      const user = testUsers[0]
      const resetToken = await testPrisma.passwordResetToken.create({
        data: {
          token: 'valid-reset-token',
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
        }
      })

      const confirmData = {
        token: 'valid-reset-token',
        password: 'NewValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/reset/confirm', {
        method: 'POST',
        body: JSON.stringify(confirmData)
      })

      const response = await confirmReset(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)

      // Verify password was changed
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: user.id }
      })
      const isNewPasswordValid = await bcrypt.compare('NewValidPassword123', updatedUser!.password)
      expect(isNewPasswordValid).toBe(true)

      // Verify token was deleted
      const deletedToken = await testPrisma.passwordResetToken.findUnique({
        where: { id: resetToken.id }
      })
      expect(deletedToken).toBeNull()
    })

    it('should reject expired reset token', async () => {
      // Create expired reset token
      const user = testUsers[1]
      const expiredToken = await testPrisma.passwordResetToken.create({
        data: {
          token: 'expired-reset-token',
          userId: user.id,
          expiresAt: new Date(Date.now() - 1000) // 1 second ago
        }
      })

      const confirmData = {
        token: 'expired-reset-token',
        password: 'NewValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/reset/confirm', {
        method: 'POST',
        body: JSON.stringify(confirmData)
      })

      const response = await confirmReset(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Invalid or expired reset token')

      // Clean up
      await testPrisma.passwordResetToken.delete({ where: { id: expiredToken.id } })
    })

    it('should reject invalid reset token', async () => {
      const confirmData = {
        token: 'invalid-token',
        password: 'NewValidPassword123'
      }

      const request = new NextRequest('http://localhost:3000/api/reset/confirm', {
        method: 'POST',
        body: JSON.stringify(confirmData)
      })

      const response = await confirmReset(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error', 'Invalid or expired reset token')
    })

    it('should validate new password strength', async () => {
      const user = testUsers[2]
      const resetToken = await testPrisma.passwordResetToken.create({
        data: {
          token: 'weak-password-token',
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        }
      })

      const confirmData = {
        token: 'weak-password-token',
        password: 'weak'
      }

      const request = new NextRequest('http://localhost:3000/api/reset/confirm', {
        method: 'POST',
        body: JSON.stringify(confirmData)
      })

      const response = await confirmReset(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
      expect(data.error).toContain('Password must be at least 8 characters long')

      // Clean up
      await testPrisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    })
  })

  describe('Concurrency and Edge Cases', () => {
    it('should handle concurrent user registration attempts', async () => {
      const baseEmail = `concurrent-${Date.now()}`
      
      const promises = [1, 2, 3].map(async (i) => {
        const userData = {
          email: `${baseEmail}-${i}@example.com`,
          password: 'ConcurrentPassword123',
          name: `Concurrent User ${i}`
        }

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        })

        return registerUser(request)
      })

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      // All should succeed
      results.forEach((result, i) => {
        expect(responses[i].status).toBe(201)
        expect(result).toHaveProperty('success', true)
      })

      // Clean up created users
      const createdUserIds = results.map(r => r.user.id)
      await testPrisma.user.deleteMany({
        where: { id: { in: createdUserIds } }
      })
    })

    it('should handle race condition for duplicate email registration', async () => {
      const email = `race-condition-${Date.now()}@example.com`
      
      const promises = [1, 2].map(async (i) => {
        const userData = {
          email,
          password: `RaceConditionPassword12${i}`,
          name: `Race User ${i}`
        }

        const request = new NextRequest('http://localhost:3000/api/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        })

        return registerUser(request)
      })

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))

      // One should succeed, one should fail
      const successCount = results.filter(r => r.success).length
      const conflictCount = results.filter((r, i) => responses[i].status === 409).length
      
      expect(successCount).toBe(1)
      expect(conflictCount).toBe(1)

      // Clean up any created user
      const createdUser = await testPrisma.user.findUnique({
        where: { email }
      })
      if (createdUser) {
        await testPrisma.user.delete({ where: { id: createdUser.id } })
      }
    })
  })
})