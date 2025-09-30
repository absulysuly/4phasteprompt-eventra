import { PrismaClient } from '@prisma/client';

describe('Database Connectivity', () => {
  let prisma;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./test.db',
        },
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  test('should connect to database successfully', async () => {
    expect(async () => {
      await prisma.$connect();
    }).not.toThrow();
  });

  test('should validate database schema', async () => {
    // Check if main tables exist
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    const tableNames = tables.map(table => table.name);
    
    expect(tableNames).toContain('User');
    expect(tableNames).toContain('Event');
    expect(tableNames).toContain('EventTranslation');
  });

  test('should perform basic CRUD operations', async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'Test User',
      },
    });

    expect(testUser.id).toBeDefined();
    expect(testUser.email).toContain('@example.com');

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Name' },
    });

    expect(updatedUser.name).toBe('Updated Name');

    // Delete user
    await prisma.user.delete({
      where: { id: testUser.id },
    });

    // Verify deletion
    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(deletedUser).toBeNull();
  });

  test('should handle database errors gracefully', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: 'invalid-email-format',
          password: null, // This should fail validation
        },
      })
    ).rejects.toThrow();
  });

  test('should support international text storage', async () => {
    const testUser = await prisma.user.create({
      data: {
        email: `arabic-test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        name: 'اسم المستخدم العربي', // Arabic text
      },
    });

    expect(testUser.name).toBe('اسم المستخدم العربي');

    await prisma.user.delete({
      where: { id: testUser.id },
    });
  });
});