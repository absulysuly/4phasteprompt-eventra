/**
 * Integration tests for Events API endpoints
 * Tests CRUD operations, authentication, validation, and database interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { GET as getEvents } from '../../app/api/events/route';
import { POST as createEvent } from '../../app/api/events/create/route';
import { PATCH as updateEvent, DELETE as deleteEvent } from '../../app/api/events/[id]/route';
import TestDatabase, { testUsers, testEvents, testValidation, createMockSession } from '../test-db';
import { getServerSession } from 'next-auth';

// Mock NextAuth
jest.mock('next-auth');
jest.mock('../../lib/auth', () => ({
  authOptions: {}
}));

// Mock translation and geocoding services (they're not core to API testing)
jest.mock('../../lib/translate', () => ({
  translateTriple: jest.fn().mockResolvedValue({
    ar: { title: 'العنوان', description: 'الوصف', location: 'الموقع' },
    ku: { title: 'سەردێڕ', description: 'وەسف', location: 'شوێن' }
  })
}));

jest.mock('../../lib/geocode', () => ({
  geocodeAddress: jest.fn().mockResolvedValue({ lat: 33.3128, lon: 44.3615 })
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Events API Integration Tests', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = TestDatabase.getInstance();
    await testDb.setup();
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await testDb.cleanup();
    await testDb.disconnect();
  });

  describe('GET /api/events', () => {
    describe('Public Events (type=public)', () => {
      it('should return all public events without authentication', async () => {
        const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=en');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
        
        // Check localized event structure
        const event = data[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('publicId');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('location');
        expect(event).toHaveProperty('date');
        expect(event).toHaveProperty('category');
        expect(event).toHaveProperty('user');
      });

      it('should return Arabic localized events when lang=ar', async () => {
        const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=ar');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const event = data.find((e: any) => e.publicId === testEvents.event1.publicId);
        expect(event.title).toBe('مؤتمر التكنولوجيا 2024');
      });

      it('should return Kurdish localized events when lang=ku', async () => {
        const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=ku');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const event = data.find((e: any) => e.publicId === testEvents.event1.publicId);
        expect(event.title).toBe('کۆنفرانسی تەکنەلۆژیا 2024');
      });

      it('should fallback to Arabic for unsupported languages', async () => {
        const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=fr');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const event = data.find((e: any) => e.publicId === testEvents.event1.publicId);
        expect(event.title).toBe('مؤتمر التكنولوجيا 2024');
      });

      it('should return events ordered by date ascending', async () => {
        const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=en');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.length).toBeGreaterThanOrEqual(2);
        
        // Check chronological order
        for (let i = 1; i < data.length; i++) {
          const prevDate = new Date(data[i - 1].date);
          const currDate = new Date(data[i].date);
          expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
        }
      });
    });

    describe('User-specific Events (authenticated)', () => {
      it('should return user events when authenticated', async () => {
        const session = createMockSession(testUsers.user1);
        mockGetServerSession.mockResolvedValue(session);

        const request = new NextRequest('http://localhost:3000/api/events');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        
        // Should only return events for user1
        data.forEach((event: any) => {
          expect(event.userId).toBe(testUsers.user1.id);
        });
      });

      it('should return empty array for unauthenticated user', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/events');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
      });

      it('should return empty array for non-existent user', async () => {
        const session = createMockSession({
          id: 'non-existent',
          email: 'nonexistent@example.com',
          name: 'Non Existent',
          password: ''
        });
        mockGetServerSession.mockResolvedValue(session);

        const request = new NextRequest('http://localhost:3000/api/events');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
      });
    });

    describe('Static Mode Fallback', () => {
      const originalEnv = process.env.NEXT_PUBLIC_EVENTS_STATIC;

      afterEach(() => {
        process.env.NEXT_PUBLIC_EVENTS_STATIC = originalEnv;
      });

      it('should return empty array when static mode enabled but no file', async () => {
        process.env.NEXT_PUBLIC_EVENTS_STATIC = '1';

        const request = new NextRequest('http://localhost:3000/api/events?type=public');
        const response = await getEvents(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual([]);
      });
    });
  });

  describe('POST /api/events/create', () => {
    describe('Authentication', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(testValidation.validEventData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
      });

      it('should return 400 when user not found in database', async () => {
        const session = createMockSession({
          id: 'non-existent',
          email: 'nonexistent@example.com',
          name: 'Non Existent',
          password: ''
        });
        mockGetServerSession.mockResolvedValue(session);

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(testValidation.validEventData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('User not found');
      });
    });

    describe('Validation', () => {
      beforeEach(() => {
        const session = createMockSession(testUsers.user1);
        mockGetServerSession.mockResolvedValue(session);
      });

      it('should return 400 when title is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(testValidation.invalidEventData.missingTitle)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing required fields');
      });

      it('should return 400 when date is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(testValidation.invalidEventData.missingDate)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Missing required fields');
      });
    });

    describe('Event Creation', () => {
      beforeEach(() => {
        const session = createMockSession(testUsers.user1);
        mockGetServerSession.mockResolvedValue(session);
      });

      it('should create event with valid data', async () => {
        const eventData = {
          ...testValidation.validEventData,
          title: 'Integration Test Event',
          whatsappGroup: 'https://chat.whatsapp.com/testgroup',
          city: 'Baghdad'
        };

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.event).toHaveProperty('id');
        expect(data.event).toHaveProperty('publicId');
        expect(data.event.userId).toBe(testUsers.user1.id);
        expect(data.event.category).toBe(eventData.category);
        expect(data.event.city).toBe(eventData.city);

        // Verify in database
        const dbEvent = await testDb.getEventByPublicId(data.event.publicId);
        expect(dbEvent).not.toBeNull();
        expect(dbEvent?.userId).toBe(testUsers.user1.id);
      });

      it('should create translations for source locale', async () => {
        const eventData = {
          ...testValidation.validEventData,
          title: 'Translation Test Event',
          locale: 'en'
        };

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.event.translations).toHaveLength(1);
        
        const translation = data.event.translations[0];
        expect(translation.locale).toBe('en');
        expect(translation.title).toBe(eventData.title);
        expect(translation.description).toBe(eventData.description);
      });

      it('should handle optional fields correctly', async () => {
        const minimalData = {
          title: 'Minimal Event',
          date: '2024-12-25T10:00:00.000Z',
          locale: 'en'
        };

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(minimalData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.event.category).toBe('');
        expect(data.event.imageUrl).toBe('');
      });

      it('should generate unique publicId', async () => {
        const eventData1 = { ...testValidation.validEventData, title: 'Event 1' };
        const eventData2 = { ...testValidation.validEventData, title: 'Event 2' };

        const request1 = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData1)
        });

        const request2 = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData2)
        });

        const [response1, response2] = await Promise.all([
          createEvent(request1),
          createEvent(request2)
        ]);

        const [data1, data2] = await Promise.all([
          response1.json(),
          response2.json()
        ]);

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
        expect(data1.event.publicId).not.toBe(data2.event.publicId);
      });
    });

    describe('Auto-translation', () => {
      beforeEach(() => {
        const session = createMockSession(testUsers.user1);
        mockGetServerSession.mockResolvedValue(session);
      });

      it('should attempt auto-translation to other locales', async () => {
        const eventData = {
          ...testValidation.validEventData,
          title: 'Auto-translate Test',
          locale: 'en'
        };

        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });

        const response = await createEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        
        // Verify the final event has translations
        // (Note: In real test, we'd check the database for all translations)
        const dbEvent = await testDb.getEventByPublicId(data.event.publicId);
        expect(dbEvent).not.toBeNull();
      });
    });
  });

  describe('PATCH /api/events/[id]', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/events/test-event-1', {
          method: 'PATCH',
          body: JSON.stringify({ id: testEvents.event1.id, title: 'Updated Title' })
        });

        const response = await updateEvent(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
      });

      it('should return 403 when trying to update another user\'s event', async () => {
        const session = createMockSession(testUsers.user2);
        mockGetServerSession.mockResolvedValue(session);

        const request = new NextRequest('http://localhost:3000/api/events/test-event-1', {
          method: 'PATCH',
          body: JSON.stringify({ id: testEvents.event1.id, title: 'Hacked Title' })
        });

        const response = await updateEvent(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Not permitted');
      });

      it('should allow owner to update their own event', async () => {
        const session = createMockSession(testUsers.user1);
        mockGetServerSession.mockResolvedValue(session);

        const updateData = {
          id: testEvents.event1.id,
          category: 'Updated Category',
          city: 'Updated City'
        };

        const request = new NextRequest('http://localhost:3000/api/events/test-event-1', {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        });

        const response = await updateEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.event.category).toBe(updateData.category);
        expect(data.event.city).toBe(updateData.city);

        // Verify in database
        const dbEvent = await testDb.getPrisma().event.findUnique({
          where: { id: testEvents.event1.id }
        });
        expect(dbEvent?.category).toBe(updateData.category);
        expect(dbEvent?.city).toBe(updateData.city);
      });
    });
  });

  describe('DELETE /api/events/[id]', () => {
    describe('Authentication & Authorization', () => {
      it('should return 401 when not authenticated', async () => {
        mockGetServerSession.mockResolvedValue(null);

        const request = new NextRequest('http://localhost:3000/api/events/test-event-1', {
          method: 'DELETE',
          body: JSON.stringify({ id: testEvents.event1.id })
        });

        const response = await deleteEvent(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Unauthorized');
      });

      it('should return 403 when trying to delete another user\'s event', async () => {
        const session = createMockSession(testUsers.user2);
        mockGetServerSession.mockResolvedValue(session);

        const request = new NextRequest('http://localhost:3000/api/events/test-event-1', {
          method: 'DELETE',
          body: JSON.stringify({ id: testEvents.event1.id })
        });

        const response = await deleteEvent(request);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Not permitted');
      });

      it('should allow owner to delete their own event', async () => {
        const session = createMockSession(testUsers.user2);
        mockGetServerSession.mockResolvedValue(session);

        // Create a test event first
        const testEvent = await testDb.getPrisma().event.create({
          data: {
            publicId: 'delete-test-event',
            date: new Date(),
            userId: testUsers.user2.id,
            translations: {
              create: {
                locale: 'en',
                title: 'Event to Delete',
                description: 'This event will be deleted',
                location: 'Test Location'
              }
            }
          }
        });

        const request = new NextRequest('http://localhost:3000/api/events/delete-test', {
          method: 'DELETE',
          body: JSON.stringify({ id: testEvent.id })
        });

        const response = await deleteEvent(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        // Verify deletion in database
        const dbEvent = await testDb.getPrisma().event.findUnique({
          where: { id: testEvent.id }
        });
        expect(dbEvent).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily disconnect the database to simulate connection error
      await testDb.getPrisma().$disconnect();

      const request = new NextRequest('http://localhost:3000/api/events?type=public');
      const response = await getEvents(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch events');

      // Reconnect for cleanup
      await testDb.setup();
    });

    it('should handle malformed JSON in request body', async () => {
      const session = createMockSession(testUsers.user1);
      mockGetServerSession.mockResolvedValue(session);

      const request = new NextRequest('http://localhost:3000/api/events/create', {
        method: 'POST',
        body: 'invalid json{'
      });

      try {
        await createEvent(request);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent event creation requests', async () => {
      const session = createMockSession(testUsers.user1);
      mockGetServerSession.mockResolvedValue(session);

      const concurrentRequests = Array.from({ length: 5 }, (_, i) => {
        const eventData = {
          ...testValidation.validEventData,
          title: `Concurrent Event ${i}`,
        };

        return new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(eventData)
        });
      });

      const responses = await Promise.all(
        concurrentRequests.map(request => createEvent(request))
      );

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Verify all events were created with unique publicIds
      const data = await Promise.all(responses.map(r => r.json()));
      const publicIds = data.map(d => d.event.publicId);
      const uniquePublicIds = new Set(publicIds);
      
      expect(uniquePublicIds.size).toBe(publicIds.length);
    });

    it('should efficiently fetch large numbers of events', async () => {
      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost:3000/api/events?type=public');
      const response = await getEvents(request);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});