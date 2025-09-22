/**
 * Test Environment Setup (CommonJS)
 * Configures environment variables and settings for testing
 */

const { loadEnvConfig } = require('@next/env')
const path = require('path')

// Load environment configuration for tests
const projectDir = path.join(__dirname, '../..')
loadEnvConfig(projectDir)

// Override environment variables for testing
process.env.NODE_ENV = 'test'

// Always use a dedicated SQLite database for tests to ensure isolation
// and avoid leaking data between test runs.
process.env.DATABASE_URL = 'file:./test.db'

// Use test-specific NextAuth settings
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key-for-testing'

// Disable external services in tests
process.env.DISABLE_WEBHOOKS = 'true'
process.env.DISABLE_EMAILS = 'true'
process.env.DISABLE_NOTIFICATIONS = 'true'

// Configure test-specific settings
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'
