/**
 * Jest Global Setup for Integration Tests (CommonJS)
 * Ensures the SQLite test database has the correct schema before tests run,
 * then seeds deterministic test data.
 */

const path = require('path')
const { execSync } = require('child_process')

module.exports = async () => {
  // Ensure test env vars (DATABASE_URL=file:./test.db, NODE_ENV=test, etc.)
  require('./test-env.js')

  console.log('global-setup: ensuring test database schema exists (prisma db push)...')
  try {
    execSync('npx prisma db push --accept-data-loss --skip-generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../..'),
      env: process.env,
    })
  } catch (err) {
    console.error('Failed to push Prisma schema to test database:', err)
    throw err
  }

  // Register ts-node to allow requiring TypeScript seed module
  try {
    require('ts-node/register/transpile-only')
  } catch (e) {
    // ts-node may not be installed in some environments; attempt plain require
  }

  // Import and run seeding
  const { seedTestData } = require(path.resolve(__dirname, './test-db'))
  await seedTestData()
}
