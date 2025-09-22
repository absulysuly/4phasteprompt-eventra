import { PrismaClient, User, Event, Locale } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Use separate test database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db'
    }
  }
});

// Test data fixtures
export const testUsers = {
  user1: {
    id: 'test-user-1',
    email: 'test1@example.com',
    name: 'Test User 1',
    password: 'TestPassword123!'
  },
  user2: {
    id: 'test-user-2', 
    email: 'test2@example.com',
    name: 'Test User 2',
    password: 'TestPassword456!'
  },
  admin: {
    id: 'test-admin',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'AdminPassword789!'
  }
};

export const testEvents = {
  event1: {
    id: 'test-event-1',
    publicId: 'evt-123abc',
    date: new Date('2024-12-25T10:00:00.000Z'),
    category: 'Technology',
    imageUrl: 'https://example.com/event1.jpg',
    whatsappGroup: 'https://chat.whatsapp.com/test1',
    whatsappPhone: '+9647701234567',
    contactMethod: 'WhatsApp',
    city: 'Baghdad',
    latitude: 33.3128,
    longitude: 44.3615,
    userId: testUsers.user1.id,
    translations: [
      {
        locale: Locale.en,
        title: 'Tech Conference 2024',
        description: 'Annual technology conference in Baghdad',
        location: 'Baghdad Convention Center'
      },
      {
        locale: Locale.ar,
        title: 'مؤتمر التكنولوجيا 2024',
        description: 'مؤتمر التكنولوجيا السنوي في بغداد',
        location: 'مركز بغداد للمؤتمرات'
      },
      {
        locale: Locale.ku,
        title: 'کۆنفرانسی تەکنەلۆژیا 2024',
        description: 'کۆنفرانسی ساڵانەی تەکنەلۆژیا لە بەغداد',
        location: 'ناوەندی کۆنفرانسی بەغداد'
      }
    ]
  },
  event2: {
    id: 'test-event-2',
    publicId: 'evt-456def',
    date: new Date('2024-11-15T14:30:00.000Z'),
    category: 'Music',
    imageUrl: 'https://example.com/event2.jpg',
    city: 'Erbil',
    userId: testUsers.user2.id,
    translations: [
      {
        locale: Locale.en,
        title: 'Music Festival Erbil',
        description: 'Traditional and modern music festival',
        location: 'Erbil Citadel'
      },
      {
        locale: Locale.ku,
        title: 'فێستیڤاڵی مۆسیقا هەولێر',
        description: 'فێستیڤاڵی مۆسیقای نەریتی و مۆدێرن',
        location: 'قەڵای هەولێر'
      }
    ]
  }
};

// Database utility functions
export class TestDatabase {
  private static instance: TestDatabase;
  
  static getInstance(): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase();
    }
    return TestDatabase.instance;
  }

  async setup(): Promise<void> {
    // Reset database
    await this.cleanup();
    
    // Create test users
    for (const userData of Object.values(testUsers)) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          password: hashedPassword
        }
      });
    }

    // Create test events with translations
    for (const eventData of Object.values(testEvents)) {
      await prisma.event.create({
        data: {
          id: eventData.id,
          publicId: eventData.publicId,
          date: eventData.date,
          category: eventData.category,
          imageUrl: eventData.imageUrl || '',
          whatsappGroup: eventData.whatsappGroup || '',
          whatsappPhone: eventData.whatsappPhone || '',
          contactMethod: eventData.contactMethod || '',
          city: eventData.city || '',
          latitude: eventData.latitude || null,
          longitude: eventData.longitude || null,
          userId: eventData.userId,
          translations: {
            create: eventData.translations
          }
        }
      });
    }
  }

  async cleanup(): Promise<void> {
    // Delete in correct order due to foreign key constraints
    await prisma.eventTranslation.deleteMany();
    await prisma.event.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.content.deleteMany();
    await prisma.user.deleteMany();
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async getEventByPublicId(publicId: string): Promise<Event | null> {
    return prisma.event.findUnique({
      where: { publicId },
      include: {
        translations: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });
  }

  async getEventsByUserId(userId: string): Promise<Event[]> {
    return prisma.event.findMany({
      where: { userId },
      include: {
        translations: true
      }
    });
  }

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

  // Get prisma instance for direct queries in tests
  getPrisma(): PrismaClient {
    return prisma;
  }
}

// Helper to create test JWT tokens for authentication
export function createMockSession(user: typeof testUsers.user1) {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
}

// Mock NextAuth session for testing
export function mockNextAuthSession(user: typeof testUsers.user1) {
  const session = createMockSession(user);
  
  // Mock getServerSession to return our test session
  jest.mock('next-auth', () => ({
    getServerSession: jest.fn().mockResolvedValue(session)
  }));

  return session;
}

// Test data validation helpers
export const testValidation = {
  validEventData: {
    title: 'Test Event',
    description: 'Test event description',
    date: '2024-12-25T10:00:00.000Z',
    location: 'Test Location',
    category: 'Technology',
    locale: 'en'
  },

  invalidEventData: {
    missingTitle: {
      description: 'Test event description',
      date: '2024-12-25T10:00:00.000Z'
    },
    missingDate: {
      title: 'Test Event',
      description: 'Test event description'
    },
    invalidDate: {
      title: 'Test Event',
      description: 'Test event description',
      date: 'invalid-date'
    }
  },

  validUserData: {
    email: 'newuser@example.com',
    password: 'NewPassword123!',
    name: 'New User'
  },

  invalidUserData: {
    missingEmail: {
      password: 'TestPassword123!'
    },
    invalidEmail: {
      email: 'invalid-email',
      password: 'TestPassword123!'
    },
    weakPassword: {
      email: 'test@example.com',
      password: '123'
    },
    duplicateEmail: {
      email: testUsers.user1.email,
      password: 'TestPassword123!'
    }
  }
};

export default TestDatabase;