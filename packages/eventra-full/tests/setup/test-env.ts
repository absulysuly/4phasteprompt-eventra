/**
 * Test Environment Setup
 * Configures environment variables and settings for testing
 */

import { loadEnvConfig } from '@next/env'
import path from 'path'

// Load environment configuration for tests
const projectDir = path.join(__dirname, '../..')
loadEnvConfig(projectDir)

// Override environment variables for testing
process.env.NODE_ENV = 'test'

// Use test database if available, otherwise use default with test suffix
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/eventra_test'
}

// Use test-specific NextAuth settings
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-key-for-testing'

// Disable external services in tests
process.env.DISABLE_WEBHOOKS = 'true'
process.env.DISABLE_EMAILS = 'true'
process.env.DISABLE_NOTIFICATIONS = 'true'

// Configure test-specific settings
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.BCRYPT_ROUNDS = '4' // Use fewer rounds for faster tests

export {}