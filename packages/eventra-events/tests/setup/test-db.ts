// tests/setup/test-db.ts
// Improved deterministic seeding with verification & retry
// NOTE: Replace prisma import path if your project exposes prisma differently.

import { PrismaClient } from '@prisma/client'

// Prefer a single Prisma instance. Use injected global in tests if available.
const prisma: PrismaClient = (globalThis as any).prisma ?? new PrismaClient()

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function seedTestData({ maxRetries = 3 }: { maxRetries?: number } = {}) {
  // Example users array; replace with your test users source if desired
  const testUsers = [
    { email: 'alice@example.com', name: 'Alice', password: 'testhash' },
    { email: 'bob@example.com', name: 'Bob', password: 'testhash' },
    { email: 'charlie@example.com', name: 'Charlie', password: 'testhash' },
  ]

  // Upsert users (idempotent)
  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { email: u.email.toLowerCase() },
      update: { name: u.name, password: u.password },
      create: { email: u.email.toLowerCase(), name: u.name, password: u.password },
    })
  }

  // Verify users exist (retry loop)
  let users = [] as Array<{ id: string; email: string; name: string | null }>
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    users = await prisma.user.findMany({
      where: { email: { in: testUsers.map((t) => t.email.toLowerCase()) } },
      select: { id: true, email: true, name: true },
    })
    if (users.length === testUsers.length) break
    // eslint-disable-next-line no-console
    console.warn(`seedTestData: found ${users.length}/${testUsers.length} users (attempt ${attempt}). Retrying...`)
    await delay(250 * attempt)
    // re-upsert in case of timing/race issues
    for (const u of testUsers) {
      await prisma.user.upsert({
        where: { email: u.email.toLowerCase() },
        update: {},
        create: { email: u.email.toLowerCase(), name: u.name, password: u.password },
      })
    }
  }

  if (!users || users.length !== testUsers.length) {
    // eslint-disable-next-line no-console
    console.error('seedTestData: failed to confirm test users after retries. Aborting to avoid FK errors.')
    throw new Error('seedTestData: missing test users after retries')
  }

  // Map emails to user ids for later use by tests
  const userByEmail = users.reduce<Record<string, { id: string; email: string }>>((acc, u) => {
    acc[u.email] = u
    return acc
  }, {})

  // Example event seeding: ensure we create events in a transaction and reference existing users
  const events = [
    {
      publicId: `test-event-1-${Date.now()}`,
      title: 'Test Conference 2024',
      date: new Date().toISOString(),
      organizerEmail: testUsers[0].email.toLowerCase(),
    },
    {
      publicId: `test-event-2-${Date.now()}`,
      title: 'Development Workshop',
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      organizerEmail: testUsers[1].email.toLowerCase(),
    },
  ]

  for (const e of events) {
    // delete any existing event with same publicId (idempotent cleanup)
    try {
      await prisma.$transaction([
        prisma.eventTranslation.deleteMany({ where: { event: { publicId: e.publicId } } }),
        prisma.event.deleteMany({ where: { publicId: e.publicId } }),
      ])
    } catch (error) {
      // Ignore cleanup errors - the records might not exist
      console.warn('Cleanup warning:', error)
    }

    const organizer = userByEmail[e.organizerEmail]
    if (!organizer) {
      throw new Error(`seedTestData: missing organizer ${e.organizerEmail}`)
    }

    // Create event and its translations in a transaction
    await prisma.$transaction(async (tx) => {
      const createdEvent = await tx.event.create({
        data: {
          publicId: e.publicId,
          date: new Date(e.date),
          userId: organizer.id,
        },
      })

      await tx.eventTranslation.create({
        data: {
          eventId: createdEvent.id,
          locale: 'en',
          title: e.title,
          description: 'Seeded test event',
          location: 'Test Location',
        },
      })
    })
  }

  // Optionally expose seeded data on globalThis for tests to reuse (test-only)
  if (process.env.NODE_ENV === 'test') {
    ;(globalThis as any).__SEED_DATA__ = {
      users,
      events,
    }
  }

  return { users, events }
}

// Expose prisma for tests that need direct client access
export { prisma as testPrisma }

/**
 * Refresh seeded data from DB (useful if tests need fresh IDs)
 * This will re-query the DB for users/events and update globalThis.__SEED_DATA__.
 */
export async function refreshSeedData() {
  const seed: any = (globalThis as any).__SEED_DATA__
  if (!seed) {
    const emails = ['alice@example.com', 'bob@example.com', 'charlie@example.com']
    const users = await prisma.user.findMany({ where: { email: { in: emails } } })
    const events = await prisma.event.findMany({ where: { publicId: { contains: 'test-event-' } } })
    ;(globalThis as any).__SEED_DATA__ = { users, events }
    return (globalThis as any).__SEED_DATA__
  }

  const emails = Array.isArray(seed.users) && seed.users.length > 0 ? seed.users.map((u: any) => u.email) : ['alice@example.com', 'bob@example.com', 'charlie@example.com']
  const users = await prisma.user.findMany({ where: { email: { in: emails } } })

  const eventPublicIds = Array.isArray(seed.events) ? seed.events.map((e: any) => e.publicId).filter(Boolean) : []
  const events = eventPublicIds.length > 0
    ? await prisma.event.findMany({ where: { publicId: { in: eventPublicIds } } })
    : await prisma.event.findMany({ where: { publicId: { contains: 'test-event-' } } })

  ;(globalThis as any).__SEED_DATA__ = { users, events }
  return (globalThis as any).__SEED_DATA__
}

/**
 * Cleanup helper: delete test artifacts created by seedTestData (safe and targeted).
 * Does NOT delete users by default—only deletes events and tokens created for tests.
 */
export async function cleanupTestDb() {
  const seed: any = (globalThis as any).__SEED_DATA__
  if (!seed) return

  const userIds = (seed.users || []).map((u: any) => u.id).filter(Boolean)
  const publicIds = (seed.events || []).map((e: any) => e.publicId).filter(Boolean)

  try {
    if (userIds.length > 0) {
      await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } }).catch(() => undefined)
    }
    if (publicIds.length > 0) {
      await prisma.eventTranslation.deleteMany({ where: { event: { publicId: { in: publicIds } } } }).catch(() => undefined)
      await prisma.event.deleteMany({ where: { publicId: { in: publicIds } } }).catch(() => undefined)
    }
  } catch (err) {
    console.warn('cleanupTestDb: cleanup encountered an error', err)
  }
}

/**
 * Compatibility wrapper: keeps existing tests working.
 * Usage in tests:
 *   beforeAll(async () => { await setupTestDb(); });
 */
export async function setupTestDb(options?: { maxRetries?: number }) {
  await seedTestData(options)
  await refreshSeedData()
  return (globalThis as any).__SEED_DATA__
}

/**
 * Optional: provide a disconnect helper for parity with previous API.
 */
export async function disconnectTestDb() {
  await prisma.$disconnect()
}
