# 🌐 Eventra SaaS API Documentation

> **AI-Accessible API Documentation**: Complete endpoint documentation for AI systems including DeepSeek, GPT, Claude, and other AI models.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
- [Data Models](#data-models)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://eventra-venues.vercel.app/api
```

## 🔐 Authentication

### NextAuth.js Integration
```typescript
// Authentication headers
{
  "Authorization": "Bearer <session-token>",
  "Content-Type": "application/json"
}
```

### Session Management
```typescript
// Get current session
GET /api/auth/session

// Sign in
POST /api/auth/signin

// Sign out  
POST /api/auth/signout
```

## 📊 Response Format

### Success Response
```typescript
interface APIResponse<T> {
  success: true
  data: T
  message?: string
  timestamp: string
}
```

### Error Response
```typescript
interface APIError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}
```

## ⚠️ Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Codes
```typescript
type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_REQUIRED'
  | 'RESOURCE_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'
```

## 🛠️ Endpoints

### 1. Health Check
```typescript
GET /api/health

// Response
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 2. Events API

#### Get All Events
```typescript
GET /api/events
Query Parameters:
  - category?: 'events' | 'hotels' | 'restaurants' | 'cafes' | 'tourism'
  - location?: string
  - date?: string (ISO format)
  - limit?: number (default: 20)
  - offset?: number (default: 0)

// Response
{
  "success": true,
  "data": {
    "events": Event[],
    "total": number,
    "hasMore": boolean
  }
}
```

#### Get Single Event
```typescript
GET /api/events/[id]
Path Parameters:
  - id: string (event ID)

// Response
{
  "success": true,
  "data": Event
}
```

#### Create Event
```typescript
POST /api/events
Body: CreateEventRequest

// Response
{
  "success": true,
  "data": Event,
  "message": "Event created successfully"
}
```

#### Update Event
```typescript
PUT /api/events/[id]
Path Parameters:
  - id: string
Body: UpdateEventRequest

// Response
{
  "success": true,
  "data": Event,
  "message": "Event updated successfully"
}
```

#### Delete Event
```typescript
DELETE /api/events/[id]
Path Parameters:
  - id: string

// Response
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### 3. Venues API

#### Get All Venues
```typescript
GET /api/venues
Query Parameters:
  - category?: VenueCategory
  - city?: string
  - rating?: number
  - priceRange?: string
  - limit?: number
  - offset?: number

// Response
{
  "success": true,
  "data": {
    "venues": Venue[],
    "total": number,
    "hasMore": boolean
  }
}
```

#### Get Venue by ID
```typescript
GET /api/venues/[id]
Path Parameters:
  - id: string

// Response
{
  "success": true,
  "data": Venue
}
```

### 4. Categories API

#### Get All Categories
```typescript
GET /api/categories

// Response
{
  "success": true,
  "data": {
    "categories": Category[],
    "total": number
  }
}
```

### 5. User API

#### Get User Profile
```typescript
GET /api/user/profile
Requires Authentication

// Response
{
  "success": true,
  "data": UserProfile
}
```

#### Update User Profile
```typescript
PUT /api/user/profile
Body: UpdateProfileRequest
Requires Authentication

// Response
{
  "success": true,
  "data": UserProfile,
  "message": "Profile updated successfully"
}
```

## 📝 Data Models

### Event Model
```typescript
interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  location: {
    name: string
    address: string
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  date: {
    start: string // ISO datetime
    end: string   // ISO datetime
  }
  price: {
    amount: number
    currency: 'IQD' | 'USD'
    type: 'free' | 'paid'
  }
  images: string[]
  tags: string[]
  rating: number
  reviewCount: number
  capacity?: number
  organizer: {
    id: string
    name: string
    email: string
  }
  status: 'draft' | 'published' | 'cancelled'
  createdAt: string
  updatedAt: string
}
```

### Venue Model
```typescript
interface Venue {
  id: string
  name: string
  description: string
  category: VenueCategory
  location: VenueLocation
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  amenities: string[]
  images: string[]
  rating: number
  reviewCount: number
  priceRange: '$' | '$$' | '$$$' | '$$$$'
  openingHours: {
    [key: string]: {
      open: string
      close: string
      closed?: boolean
    }
  }
  verified: boolean
  createdAt: string
  updatedAt: string
}
```

### User Profile Model
```typescript
interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: {
    language: 'en' | 'ar' | 'ku'
    currency: 'IQD' | 'USD'
    notifications: boolean
  }
  location?: {
    city: string
    country: string
  }
  joinedAt: string
  lastActive: string
}
```

### Category Model
```typescript
interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  count: number
  subcategories?: Category[]
}
```

## 🏷️ Type Definitions

### Event Category
```typescript
type EventCategory = 
  | 'events'
  | 'hotels'
  | 'restaurants'
  | 'cafes'
  | 'tourism'
```

### Venue Category
```typescript
type VenueCategory = 
  | 'hotel'
  | 'restaurant'
  | 'cafe'
  | 'attraction'
  | 'museum'
  | 'park'
  | 'shopping'
  | 'nightlife'
```

### Location
```typescript
interface VenueLocation {
  name: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  coordinates: {
    lat: number
    lng: number
  }
}
```

## 🚦 Rate Limiting

### Limits
- **Authenticated Users**: 1000 requests/hour
- **Anonymous Users**: 100 requests/hour
- **Special Endpoints**: Vary by endpoint

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retryAfter": 3600
    }
  }
}
```

## 📚 Examples

### Get Events by Category
```bash
curl -X GET "https://eventra-venues.vercel.app/api/events?category=restaurants&location=Baghdad&limit=10" \
  -H "Content-Type: application/json"
```

### Create New Event
```bash
curl -X POST "https://eventra-venues.vercel.app/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Baghdad Food Festival",
    "description": "Annual celebration of Iraqi cuisine",
    "category": "restaurants",
    "location": {
      "name": "Al-Mutanabbi Street",
      "address": "Al-Mutanabbi Street, Baghdad",
      "city": "Baghdad",
      "country": "Iraq"
    },
    "date": {
      "start": "2025-03-15T10:00:00Z",
      "end": "2025-03-15T22:00:00Z"
    },
    "price": {
      "amount": 15000,
      "currency": "IQD",
      "type": "paid"
    }
  }'
```

### Get Venue Information
```bash
curl -X GET "https://eventra-venues.vercel.app/api/venues/baghdad-palace-hotel" \
  -H "Content-Type: application/json"
```

## 🔄 Webhooks (Future Feature)

### Event Types
- `event.created`
- `event.updated`
- `event.cancelled`
- `venue.created`
- `venue.updated`
- `user.registered`

### Webhook Payload
```typescript
interface WebhookPayload {
  id: string
  event: string
  data: any
  timestamp: string
  signature: string
}
```

## 📊 Analytics API (Future Feature)

### Event Analytics
```typescript
GET /api/analytics/events
Query Parameters:
  - startDate: string
  - endDate: string
  - category?: EventCategory
  - location?: string

// Response
{
  "success": true,
  "data": {
    "totalEvents": number,
    "totalViews": number,
    "topCategories": CategoryStat[],
    "popularLocations": LocationStat[]
  }
}
```

## 🌐 Internationalization API

### Get Translations
```typescript
GET /api/i18n/[locale]
Path Parameters:
  - locale: 'en' | 'ar' | 'ku'

// Response
{
  "success": true,
  "data": {
    [key: string]: string
  }
}
```

## 🚀 AI Integration Examples

### For AI Systems
```typescript
// Example: AI getting event data for analysis
const events = await fetch('/api/events?category=tourism&limit=100')
  .then(res => res.json())

// AI can process the structured data for:
// - Content generation
// - Recommendations
// - Analytics
// - User assistance
```

---

**🤖 AI-Optimized**: This API is designed for seamless AI integration with comprehensive TypeScript definitions and standardized response formats.

**📚 Complete Documentation**: All endpoints, models, and examples are provided for easy AI understanding and integration.