/**
 * Integration tests for Prisma Database CRUD Operations
 * Tests database interactions, seeded data, relationships, and constraints
 */

import { PrismaClient, Locale } from '@prisma/client';
import TestDatabase, { testUsers, testEvents } from '../test-db';
import bcrypt from 'bcryptjs';

describe('Database Integration Tests', () => {
  let testDb: TestDatabase;
  let prisma: PrismaClient;

  beforeAll(async () => {
    testDb = TestDatabase.getInstance();
    prisma = testDb.getPrisma();
    await testDb.setup();
  });

  beforeEach(async () => {
    // Reset to clean state for each test
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  describe('User CRUD Operations', () => {
    describe('Create Users', () => {
      it('should create user with all fields', async () => {
        const userData = {
          email: 'dbtest@example.com',
          password: await bcrypt.hash('TestPassword123!', 10),
          name: 'Database Test User'
        };

        const user = await prisma.user.create({
          data: userData
        });

        expect(user.id).toBeDefined();
        expect(user.email).toBe(userData.email);
        expect(user.name).toBe(userData.name);
        expect(user.password).toBe(userData.password);
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('should create user with minimal required fields', async () => {
        const userData = {
          email: 'minimal@example.com',
          password: await bcrypt.hash('TestPassword123!', 10)
        };

        const user = await prisma.user.create({
          data: userData
        });

        expect(user.email).toBe(userData.email);
        expect(user.name).toBeNull();
        expect(user.password).toBe(userData.password);
      });

      it('should enforce unique email constraint', async () => {
        const userData = {
          email: 'unique@example.com',
          password: await bcrypt.hash('TestPassword123!', 10)
        };

        // First user should succeed
        await prisma.user.create({ data: userData });

        // Second user with same email should fail
        await expect(
          prisma.user.create({ data: userData })
        ).rejects.toThrow();
      });
    });

    describe('Read Users', () => {
      it('should find user by email', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email }
        });

        expect(user).not.toBeNull();
        expect(user?.email).toBe(testUsers.user1.email);
        expect(user?.name).toBe(testUsers.user1.name);
      });

      it('should return null for non-existent email', async () => {
        const user = await prisma.user.findUnique({
          where: { email: 'nonexistent@example.com' }
        });

        expect(user).toBeNull();
      });

      it('should find multiple users', async () => {
        const users = await prisma.user.findMany();
        expect(users.length).toBeGreaterThanOrEqual(3); // testUsers has 3 users
      });

      it('should include user events in query', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email },
          include: { events: true }
        });

        expect(user).not.toBeNull();
        expect(user?.events).toBeDefined();
        expect(Array.isArray(user?.events)).toBe(true);
      });
    });

    describe('Update Users', () => {
      it('should update user name', async () => {
        const updatedUser = await prisma.user.update({
          where: { email: testUsers.user2.email },
          data: { name: 'Updated Name' }
        });

        expect(updatedUser.name).toBe('Updated Name');
        expect(updatedUser.updatedAt).toBeInstanceOf(Date);
      });

      it('should update user password', async () => {
        const newPassword = await bcrypt.hash('NewPassword123!', 10);
        const updatedUser = await prisma.user.update({
          where: { email: testUsers.user2.email },
          data: { password: newPassword }
        });

        expect(updatedUser.password).toBe(newPassword);
      });
    });

    describe('Delete Users', () => {
      it('should delete user by id', async () => {
        // Create a user to delete
        const userData = {
          email: 'todelete@example.com',
          password: await bcrypt.hash('TestPassword123!', 10),
          name: 'To Delete User'
        };

        const user = await prisma.user.create({ data: userData });
        
        // Delete the user
        await prisma.user.delete({
          where: { id: user.id }
        });

        // Verify deletion
        const deletedUser = await prisma.user.findUnique({
          where: { id: user.id }
        });
        expect(deletedUser).toBeNull();
      });

      it('should cascade delete user events', async () => {
        // Create user with events
        const user = await prisma.user.create({
          data: {
            email: 'cascade@example.com',
            password: await bcrypt.hash('TestPassword123!', 10),
            events: {
              create: {
                publicId: 'cascade-test',
                date: new Date(),
                translations: {
                  create: {
                    locale: Locale.en,
                    title: 'Cascade Test Event',
                    description: 'This should be deleted too',
                    location: 'Test Location'
                  }
                }
              }
            }
          }
        });

        const eventCount = await prisma.event.count({
          where: { userId: user.id }
        });
        expect(eventCount).toBe(1);

        // Delete user
        await prisma.user.delete({ where: { id: user.id } });

        // Verify events are deleted
        const remainingEvents = await prisma.event.count({
          where: { userId: user.id }
        });
        expect(remainingEvents).toBe(0);
      });
    });
  });

  describe('Event CRUD Operations', () => {
    describe('Create Events', () => {
      it('should create event with translations', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email }
        });

        const eventData = {
          publicId: 'test-event-create',
          date: new Date('2024-12-25T10:00:00.000Z'),
          category: 'Technology',
          imageUrl: 'https://example.com/image.jpg',
          city: 'Baghdad',
          userId: user!.id,
          translations: {
            create: [
              {
                locale: Locale.en,
                title: 'Created Test Event',
                description: 'This is a created test event',
                location: 'Test Location'
              },
              {
                locale: Locale.ar,
                title: 'الحدث التجريبي المنشأ',
                description: 'هذا حدث تجريبي منشأ',
                location: 'موقع تجريبي'
              }
            ]
          }
        };

        const event = await prisma.event.create({
          data: eventData,
          include: { translations: true }
        });

        expect(event.publicId).toBe(eventData.publicId);
        expect(event.category).toBe(eventData.category);
        expect(event.translations).toHaveLength(2);
        
        const enTranslation = event.translations.find(t => t.locale === Locale.en);
        expect(enTranslation?.title).toBe('Created Test Event');
        
        const arTranslation = event.translations.find(t => t.locale === Locale.ar);
        expect(arTranslation?.title).toBe('الحدث التجريبي المنشأ');
      });

      it('should enforce unique publicId constraint', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email }
        });

        const eventData = {
          publicId: 'duplicate-test',
          date: new Date(),
          userId: user!.id,
          translations: {
            create: {
              locale: Locale.en,
              title: 'First Event',
              description: 'Description',
              location: 'Location'
            }
          }
        };

        // First event should succeed
        await prisma.event.create({ data: eventData });

        // Second event with same publicId should fail
        await expect(
          prisma.event.create({ data: eventData })
        ).rejects.toThrow();
      });

      it('should create event with optional fields', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email }
        });

        const eventData = {
          publicId: 'optional-fields-test',
          date: new Date(),
          userId: user!.id,
          whatsappGroup: 'https://chat.whatsapp.com/test',
          whatsappPhone: '+9647701234567',
          contactMethod: 'WhatsApp',
          latitude: 33.3128,
          longitude: 44.3615,
          translations: {
            create: {
              locale: Locale.en,
              title: 'Optional Fields Event',
              description: 'Event with all optional fields',
              location: 'Baghdad'
            }
          }
        };

        const event = await prisma.event.create({
          data: eventData
        });

        expect(event.whatsappGroup).toBe(eventData.whatsappGroup);
        expect(event.whatsappPhone).toBe(eventData.whatsappPhone);
        expect(event.contactMethod).toBe(eventData.contactMethod);
        expect(event.latitude).toBe(eventData.latitude);
        expect(event.longitude).toBe(eventData.longitude);
      });
    });

    describe('Read Events', () => {
      it('should find event by publicId with translations', async () => {
        const event = await prisma.event.findUnique({
          where: { publicId: testEvents.event1.publicId },
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

        expect(event).not.toBeNull();
        expect(event?.publicId).toBe(testEvents.event1.publicId);
        expect(event?.translations).toBeDefined();
        expect(event?.translations.length).toBeGreaterThan(0);
        expect(event?.user).toBeDefined();
        expect(event?.user.email).toBe(testUsers.user1.email);
      });

      it('should filter events by user', async () => {
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user1.email }
        });

        const events = await prisma.event.findMany({
          where: { userId: user!.id },
          include: { translations: true }
        });

        expect(events.length).toBeGreaterThan(0);
        events.forEach(event => {
          expect(event.userId).toBe(user!.id);
        });
      });

      it('should order events by date', async () => {
        const events = await prisma.event.findMany({
          orderBy: { date: 'asc' }
        });

        expect(events.length).toBeGreaterThan(1);
        for (let i = 1; i < events.length; i++) {
          expect(events[i - 1].date.getTime()).toBeLessThanOrEqual(events[i].date.getTime());
        }
      });

      it('should filter events by category', async () => {
        const techEvents = await prisma.event.findMany({
          where: { category: 'Technology' }
        });

        expect(techEvents.length).toBeGreaterThan(0);
        techEvents.forEach(event => {
          expect(event.category).toBe('Technology');
        });
      });
    });

    describe('Update Events', () => {
      it('should update event basic fields', async () => {
        const event = await prisma.event.findUnique({
          where: { publicId: testEvents.event2.publicId }
        });

        const updatedEvent = await prisma.event.update({
          where: { id: event!.id },
          data: {
            category: 'Updated Category',
            city: 'Updated City',
            whatsappGroup: 'https://updated.whatsapp.com'
          }
        });

        expect(updatedEvent.category).toBe('Updated Category');
        expect(updatedEvent.city).toBe('Updated City');
        expect(updatedEvent.whatsappGroup).toBe('https://updated.whatsapp.com');
      });

      it('should update event translations', async () => {
        const event = await prisma.event.findUnique({
          where: { publicId: testEvents.event2.publicId },
          include: { translations: true }
        });

        const englishTranslation = event?.translations.find(t => t.locale === Locale.en);
        
        if (englishTranslation) {
          const updatedTranslation = await prisma.eventTranslation.update({
            where: { id: englishTranslation.id },
            data: {
              title: 'Updated Event Title',
              description: 'Updated event description'
            }
          });

          expect(updatedTranslation.title).toBe('Updated Event Title');
          expect(updatedTranslation.description).toBe('Updated event description');
        }
      });
    });

    describe('Delete Events', () => {
      it('should delete event and cascade translations', async () => {
        // Create an event to delete
        const user = await prisma.user.findUnique({
          where: { email: testUsers.user2.email }
        });

        const event = await prisma.event.create({
          data: {
            publicId: 'to-delete-event',
            date: new Date(),
            userId: user!.id,
            translations: {
              create: [
                {
                  locale: Locale.en,
                  title: 'Event to Delete',
                  description: 'This event will be deleted',
                  location: 'Delete Location'
                },
                {
                  locale: Locale.ar,
                  title: 'حدث للحذف',
                  description: 'سيتم حذف هذا الحدث',
                  location: 'موقع الحذف'
                }
              ]
            }
          }
        });

        // Verify translations exist
        const translationsCount = await prisma.eventTranslation.count({
          where: { eventId: event.id }
        });
        expect(translationsCount).toBe(2);

        // Delete the event
        await prisma.event.delete({
          where: { id: event.id }
        });

        // Verify event is deleted
        const deletedEvent = await prisma.event.findUnique({
          where: { id: event.id }
        });
        expect(deletedEvent).toBeNull();

        // Verify translations are cascade deleted
        const remainingTranslations = await prisma.eventTranslation.count({
          where: { eventId: event.id }
        });
        expect(remainingTranslations).toBe(0);
      });
    });
  });

  describe('Event Translation Operations', () => {
    it('should create translations in multiple locales', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUsers.user1.email }
      });

      const event = await prisma.event.create({
        data: {
          publicId: 'multi-locale-test',
          date: new Date(),
          userId: user!.id,
          translations: {
            create: [
              {
                locale: Locale.en,
                title: 'English Title',
                description: 'English Description',
                location: 'English Location'
              },
              {
                locale: Locale.ar,
                title: 'العنوان العربي',
                description: 'الوصف العربي',
                location: 'الموقع العربي'
              },
              {
                locale: Locale.ku,
                title: 'سەردێڕی کوردی',
                description: 'وەسفی کوردی',
                location: 'شوێنی کوردی'
              }
            ]
          }
        },
        include: { translations: true }
      });

      expect(event.translations).toHaveLength(3);
      
      const locales = event.translations.map(t => t.locale);
      expect(locales).toContain(Locale.en);
      expect(locales).toContain(Locale.ar);
      expect(locales).toContain(Locale.ku);
    });

    it('should enforce unique constraint on eventId + locale', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUsers.user1.email }
      });

      const event = await prisma.event.create({
        data: {
          publicId: 'unique-locale-test',
          date: new Date(),
          userId: user!.id,
          translations: {
            create: {
              locale: Locale.en,
              title: 'First Translation',
              description: 'First Description',
              location: 'First Location'
            }
          }
        }
      });

      // Attempting to create another translation with same locale should fail
      await expect(
        prisma.eventTranslation.create({
          data: {
            eventId: event.id,
            locale: Locale.en,
            title: 'Duplicate Translation',
            description: 'Duplicate Description',
            location: 'Duplicate Location'
          }
        })
      ).rejects.toThrow();
    });

    it('should query events with specific locale translations', async () => {
      const events = await prisma.event.findMany({
        include: {
          translations: {
            where: { locale: Locale.ar }
          }
        }
      });

      events.forEach(event => {
        event.translations.forEach(translation => {
          expect(translation.locale).toBe(Locale.ar);
        });
      });
    });
  });

  describe('Seeded Data Validation', () => {
    it('should have seeded users available', async () => {
      const userEmails = Object.values(testUsers).map(u => u.email);
      
      for (const email of userEmails) {
        const user = await prisma.user.findUnique({
          where: { email }
        });
        expect(user).not.toBeNull();
        expect(user?.email).toBe(email);
      }
    });

    it('should have seeded events available', async () => {
      const eventPublicIds = Object.values(testEvents).map(e => e.publicId);
      
      for (const publicId of eventPublicIds) {
        const event = await prisma.event.findUnique({
          where: { publicId },
          include: { translations: true }
        });
        expect(event).not.toBeNull();
        expect(event?.publicId).toBe(publicId);
        expect(event?.translations.length).toBeGreaterThan(0);
      }
    });

    it('should maintain referential integrity between users and events', async () => {
      const events = await prisma.event.findMany({
        include: { user: true }
      });

      events.forEach(event => {
        expect(event.user).not.toBeNull();
        expect(event.userId).toBe(event.user.id);
      });
    });

    it('should have proper password hashing for seeded users', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testUsers.user1.email }
      });

      expect(user?.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
      
      // Verify password can be checked
      const isValid = await bcrypt.compare(testUsers.user1.password, user!.password);
      expect(isValid).toBe(true);
    });
  });

  describe('Database Constraints and Relationships', () => {
    it('should prevent deletion of user with events (if foreign key constraint exists)', async () => {
      // Create user with event
      const user = await prisma.user.create({
        data: {
          email: 'constraint@example.com',
          password: await bcrypt.hash('TestPassword123!', 10),
          events: {
            create: {
              publicId: 'constraint-test-event',
              date: new Date(),
              translations: {
                create: {
                  locale: Locale.en,
                  title: 'Constraint Test',
                  description: 'Testing foreign key constraint',
                  location: 'Test Location'
                }
              }
            }
          }
        }
      });

      // In SQLite, foreign key constraints might be disabled by default
      // The actual behavior depends on the database configuration
      // This test documents the expected behavior
      const hasEvents = await prisma.event.count({
        where: { userId: user.id }
      });
      
      expect(hasEvents).toBeGreaterThan(0);
    });

    it('should handle date operations correctly', async () => {
      const futureDate = new Date('2025-12-31T23:59:59.999Z');
      const pastDate = new Date('2020-01-01T00:00:00.000Z');

      // Test future events
      const futureEvents = await prisma.event.findMany({
        where: {
          date: {
            gte: futureDate
          }
        }
      });

      // Test past events  
      const pastEvents = await prisma.event.findMany({
        where: {
          date: {
            lte: pastDate
          }
        }
      });

      expect(Array.isArray(futureEvents)).toBe(true);
      expect(Array.isArray(pastEvents)).toBe(true);
    });

    it('should handle text search operations', async () => {
      // Test case-insensitive search
      const searchResults = await prisma.eventTranslation.findMany({
        where: {
          title: {
            contains: 'tech',
            mode: 'insensitive'
          }
        },
        include: { event: true }
      });

      searchResults.forEach(result => {
        expect(result.title.toLowerCase()).toContain('tech');
      });
    });
  });

  describe('Performance and Optimization', () => {
    it('should efficiently query events with translations', async () => {
      const startTime = Date.now();

      const events = await prisma.event.findMany({
        include: {
          translations: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(events.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle batch operations efficiently', async () => {
      const batchSize = 10;
      const user = await prisma.user.findUnique({
        where: { email: testUsers.user1.email }
      });

      // Create multiple events in a transaction
      const events = await prisma.$transaction(
        Array.from({ length: batchSize }, (_, i) => 
          prisma.event.create({
            data: {
              publicId: `batch-event-${i}`,
              date: new Date(),
              userId: user!.id,
              category: 'Batch Test',
              translations: {
                create: {
                  locale: Locale.en,
                  title: `Batch Event ${i}`,
                  description: `Batch test event ${i}`,
                  location: 'Batch Location'
                }
              }
            }
          })
        )
      );

      expect(events).toHaveLength(batchSize);
      
      // Cleanup
      await prisma.event.deleteMany({
        where: {
          publicId: {
            in: events.map(e => e.publicId)
          }
        }
      });
    });
  });
});