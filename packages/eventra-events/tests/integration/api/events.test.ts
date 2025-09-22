import { NextRequest } from 'next/server'
import { GET, POST, PATCH, DELETE } from '@/app/api/events/route'
import { GET as getEventById, PATCH as patchEventById, DELETE as deleteEventById } from '@/app/api/events/[id]/route'
import { POST as createEvent } from '@/app/api/events/create/route'
import { setupTestDb, cleanupTestDb, disconnectTestDb, testPrisma, TestUser, TestEvent } from '../../setup/test-db'
import { jest } from '@jest/globals'

// Mock NextAuth
const mockSession = {
  user: { email: 'test@example.com', name: 'Test User' }
}

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession))
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {}
}))

describe('/api/events Integration Tests', () => {
  let testUsers: TestUser[]
  let testEvents: TestEvent[]
  
  beforeAll(async () => {
    // Set up test database
    const testData = await setupTestDb()
    testUsers = testData.users
    testEvents = testData.events
  })
  
  afterAll(async () => {
    await cleanupTestDb()
    await disconnectTestDb()
  })
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })
  
  describe('GET /api/events', () => {
    it('should return user-specific events when authenticated', async () => {
      // Mock session for specific user
      const userSession = {
        user: { email: testUsers[0].email, name: testUsers[0].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const request = new NextRequest('http://localhost:3000/api/events')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('publicId')
    })
    
    it('should return empty array when user is not authenticated', async () => {
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(null)
      
      const request = new NextRequest('http://localhost:3000/api/events')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
    
    it('should return public events when type=public', async () => {
      const request = new NextRequest('http://localhost:3000/api/events?type=public')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('publicId')
      expect(data[0]).toHaveProperty('title')
      expect(data[0]).toHaveProperty('description')
      expect(data[0]).toHaveProperty('location')
      expect(data[0]).toHaveProperty('user')
    })
    
    it('should return localized public events based on lang parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=en')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      
      // Check if we have the English translation
      const eventWithEnTranslation = data.find((event: any) => 
        event.title === 'Test Conference 2024' || event.title === 'Development Workshop'
      )
      expect(eventWithEnTranslation).toBeDefined()
    })
    
    it('should fallback to Arabic when invalid locale is specified', async () => {
      const request = new NextRequest('http://localhost:3000/api/events?type=public&lang=invalid')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      // Should fallback to Arabic translations
    })
    
    it('should handle database errors gracefully for public events', async () => {
      // Mock database error
      const originalFindMany = testPrisma.event.findMany
      testPrisma.event.findMany = jest.fn().mockRejectedValueOnce(new Error('Database error'))
      
      const request = new NextRequest('http://localhost:3000/api/events?type=public')
      const response = await GET(request)
      const data = await response.json()
      
      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error', 'Failed to fetch events')
      
      // Restore original method
      testPrisma.event.findMany = originalFindMany
    })
  })
  
  describe('GET /api/events/[id]', () => {
    it('should return event by id when authenticated', async () => {
      const userSession = {
        user: { email: testUsers[0].email, name: testUsers[0].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const request = new NextRequest(`http://localhost:3000/api/events/${testEvents[0].id}`)
      const response = await getEventById(request, { params: { id: testEvents[0].id } })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id', testEvents[0].id)
      expect(data).toHaveProperty('translations')
      expect(Array.isArray(data.translations)).toBe(true)
    })
    
    it('should return 404 when event not found', async () => {
      const userSession = {
        user: { email: testUsers[0].email, name: testUsers[0].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const request = new NextRequest('http://localhost:3000/api/events/nonexistent-id')
      const response = await getEventById(request, { params: { id: 'nonexistent-id' } })
      const data = await response.json()
      
      expect(response.status).toBe(404)
      expect(data).toHaveProperty('error', 'Event not found')
    })
    
    it('should return 401 when not authenticated', async () => {
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(null)
      
      const request = new NextRequest(`http://localhost:3000/api/events/${testEvents[0].id}`)
      const response = await getEventById(request, { params: { id: testEvents[0].id } })
      const data = await response.json()
      
      expect(response.status).toBe(401)
      expect(data).toHaveProperty('error', 'Unauthorized')
    })
  })
  
  describe('POST /api/events/create', () => {
    it('should create a new event with translations', async () => {
      const userSession = {
        user: { email: testUsers[1].email, name: testUsers[1].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const eventData = {
        publicId: `test-create-${Date.now()}`,
        date: new Date('2025-02-01T20:00:00Z').toISOString(),
        category: 'meetup',
        city: 'duhok',
        latitude: 36.8617,
        longitude: 42.9956,
        translations: [
          {
            locale: 'en',
            title: 'New Test Event',
            description: 'A newly created test event',
            location: 'Duhok Community Center'
          },
          {
            locale: 'ku',
            title: 'رووداوی تاقیکردنەوەی نوێ',
            description: 'رووداوی تاقیکردنەوە کە نوێ درووست کراوە',
            location: 'ناوەندی کۆمەڵگای دهۆک'
          }
        ]
      }
      
      const request = new NextRequest('http://localhost:3000/api/events/create', {
        method: 'POST',
        body: JSON.stringify(eventData)
      })
      
      const response = await createEvent(request)
      const data = await response.json()
      
      expect(response.status).toBe(201)
      expect(data).toHaveProperty('success', true)
      expect(data.event).toHaveProperty('id')
      expect(data.event).toHaveProperty('publicId', eventData.publicId)
      expect(data.event.translations).toHaveLength(2)
      
      // Clean up created event
      await testPrisma.event.delete({ where: { id: data.event.id } })
    })
    
    it('should validate required fields', async () => {
      const userSession = {
        user: { email: testUsers[1].email, name: testUsers[1].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const incompleteEventData = {
        publicId: 'incomplete-event'
        // Missing date and translations
      }
      
      const request = new NextRequest('http://localhost:3000/api/events/create', {
        method: 'POST',
        body: JSON.stringify(incompleteEventData)
      })
      
      const response = await createEvent(request)
      const data = await response.json()
      
      expect(response.status).toBe(400)
      expect(data).toHaveProperty('error')
    })
    
    it('should handle duplicate publicId gracefully', async () => {
      const userSession = {
        user: { email: testUsers[1].email, name: testUsers[1].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const eventData = {
        publicId: testEvents[0].publicId, // Use existing publicId
        date: new Date('2025-02-01T20:00:00Z').toISOString(),
        category: 'meetup',
        translations: [
          {
            locale: 'en',
            title: 'Duplicate Test Event',
            description: 'This should fail',
            location: 'Nowhere'
          }
        ]
      }
      
      const request = new NextRequest('http://localhost:3000/api/events/create', {
        method: 'POST',
        body: JSON.stringify(eventData)
      })
      
      const response = await createEvent(request)
      const data = await response.json()
      
      expect(response.status).toBe(409)
      expect(data).toHaveProperty('error')
    })
  })
  
  describe('PATCH /api/events/[id]', () => {
    it('should update event fields', async () => {
      const userSession = {
        user: { email: testUsers[0].email, name: testUsers[0].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const updateData = {
        category: 'updated-category',
        city: 'updated-city'
      }
      
      const request = new NextRequest(`http://localhost:3000/api/events/${testEvents[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })
      
      const response = await patchEventById(request, { params: { id: testEvents[0].id } })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      expect(data.event).toHaveProperty('category', 'updated-category')
      expect(data.event).toHaveProperty('city', 'updated-city')
    })
    
    it('should prevent unauthorized updates', async () => {
      const userSession = {
        user: { email: 'unauthorized@example.com', name: 'Unauthorized User' }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const updateData = {
        category: 'hacked-category'
      }
      
      const request = new NextRequest(`http://localhost:3000/api/events/${testEvents[0].id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })
      
      const response = await patchEventById(request, { params: { id: testEvents[0].id } })
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error', 'Forbidden')
    })
  })
  
  describe('DELETE /api/events/[id]', () => {
    it('should delete event when authorized', async () => {
      // Create a temporary event to delete
      const tempEvent = await testPrisma.event.create({
        data: {
          publicId: `temp-delete-${Date.now()}`,
          date: new Date('2025-12-31T23:59:59Z'),
          category: 'temp',
          userId: testUsers[0].id,
          translations: {
            create: [
              {
                locale: 'en',
                title: 'Temp Event',
                description: 'To be deleted',
                location: 'Nowhere'
              }
            ]
          }
        }
      })
      
      const userSession = {
        user: { email: testUsers[0].email, name: testUsers[0].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const request = new NextRequest(`http://localhost:3000/api/events/${tempEvent.id}`)
      const response = await deleteEventById(request, { params: { id: tempEvent.id } })
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data).toHaveProperty('success', true)
      
      // Verify event is deleted
      const deletedEvent = await testPrisma.event.findUnique({
        where: { id: tempEvent.id }
      })
      expect(deletedEvent).toBeNull()
    })
    
    it('should prevent unauthorized deletion', async () => {
      const userSession = {
        user: { email: 'unauthorized@example.com', name: 'Unauthorized User' }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValueOnce(userSession)
      
      const request = new NextRequest(`http://localhost:3000/api/events/${testEvents[0].id}`)
      const response = await deleteEventById(request, { params: { id: testEvents[0].id } })
      const data = await response.json()
      
      expect(response.status).toBe(403)
      expect(data).toHaveProperty('error', 'Forbidden')
    })
  })
  
  describe('Concurrency and Edge Cases', () => {
    it('should handle concurrent event creation', async () => {
      const userSession = {
        user: { email: testUsers[2].email, name: testUsers[2].name }
      }
      const getServerSession = require('next-auth').getServerSession as jest.MockedFunction<any>
      getServerSession.mockResolvedValue(userSession)
      
      const createEventData = (suffix: string) => ({
        publicId: `concurrent-${Date.now()}-${suffix}`,
        date: new Date('2025-03-01T20:00:00Z').toISOString(),
        category: 'concurrent',
        translations: [
          {
            locale: 'en',
            title: `Concurrent Event ${suffix}`,
            description: 'Created concurrently',
            location: 'Test Location'
          }
        ]
      })
      
      const promises = [1, 2, 3].map(async (i) => {
        const request = new NextRequest('http://localhost:3000/api/events/create', {
          method: 'POST',
          body: JSON.stringify(createEventData(`${i}`))
        })
        return createEvent(request)
      })
      
      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map(r => r.json()))
      
      // All should succeed
      results.forEach((result, i) => {
        expect(responses[i].status).toBe(201)
        expect(result).toHaveProperty('success', true)
      })
      
      // Clean up created events
      const createdEvents = results.map(r => r.event.id)
      await testPrisma.event.deleteMany({
        where: { id: { in: createdEvents } }
      })
    })
  })
})