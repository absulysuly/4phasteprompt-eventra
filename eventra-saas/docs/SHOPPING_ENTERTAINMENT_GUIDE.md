# Shopping & Entertainment Venue Types - Complete Guide

## Overview

Eventra now supports **7 venue types** to cover all Iraqi business and entertainment needs:

1. **EVENT** - Events, conferences, exhibitions
2. **HOTEL** - Hotels and accommodations
3. **RESTAURANT** - Restaurants, cafes, food venues
4. **ACTIVITY** - Tourism, activities, attractions
5. **SERVICE** - General services
6. **SHOPPING** - ✨ NEW: Shopping centers, stores, markets
7. **ENTERTAINMENT** - ✨ NEW: Entertainment venues and companies

---

## 🛍️ Shopping Venues

### Overview
Shopping venues include retail stores, shopping malls, markets, and any place where people buy products.

### Categories
- **Shopping Mall** - Large shopping centers
- **Supermarket** - Grocery stores
- **Clothing Store** - Fashion and apparel
- **Electronics Store** - Tech and electronics
- **Jewelry Store** - Jewelry and accessories
- **Bookstore** - Books and stationery
- **Pharmacy** - Pharmacies and drugstores
- **Furniture Store** - Home and furniture
- **Traditional Market (Souq)** - Traditional Iraqi markets
- **Department Store** - Multi-category stores

### Specific Fields

#### Product Categories (Array)
Categories of products sold:
```json
["Electronics", "Clothing", "Home & Garden", "Sports", "Toys"]
```

#### Brands (Array)
Popular brands available:
```json
["Apple", "Samsung", "Nike", "Zara", "IKEA"]
```

#### Payment Methods (Array)
Accepted payment options (Iraqi-specific):
```json
["Cash", "Credit Card", "Zain Cash", "Fastpay", "Qi Card", "Asia Hawala"]
```

### API Examples

**Create Shopping Venue:**
```json
{
  "type": "SHOPPING",
  "category": "ELECTRONICS",
  "productCategories": ["Electronics", "Mobile Phones", "Computers"],
  "brands": ["Apple", "Samsung", "HP", "Dell"],
  "paymentMethods": ["Cash", "Credit Card", "Zain Cash"],
  "priceRange": "$$",
  "businessEmail": "info@techstore.iq",
  "businessPhone": "+964 770 123 4567",
  "website": "https://techstore.iq",
  "address": "Karrada District, Baghdad",
  "city": "baghdad",
  "translations": [
    {
      "locale": "en",
      "title": "Tech Store Baghdad",
      "description": "Leading electronics store with latest gadgets",
      "location": "Karrada District, near Al-Mansour Mall"
    },
    {
      "locale": "ar",
      "title": "متجر التقنية بغداد",
      "description": "متجر إلكترونيات رائد مع أحدث الأجهزة",
      "location": "منطقة الكرادة، بالقرب من مول المنصور"
    }
  ]
}
```

**Filter Shopping Venues:**
```bash
# Get all shopping venues in Baghdad
GET /api/venues?type=SHOPPING&city=baghdad

# Search for clothing stores
GET /api/venues/search?type=SHOPPING&category=CLOTHING_STORE

# Find stores accepting Zain Cash
GET /api/venues/search?type=SHOPPING&q=zain+cash
```

---

## 🎬 Entertainment Venues

### Overview
Entertainment venues include cinemas, gaming centers, amusement parks, and business/company services like tech companies, agencies, and consultancies.

### Categories
- **Cinema** - Movie theaters
- **Theater** - Performing arts venues
- **Gaming Center** - Gaming and esports
- **Amusement Park** - Theme parks and attractions
- **Bowling Alley** - Bowling and recreation
- **Escape Room** - Escape room experiences
- **Technology Company** - Tech and IT companies
- **Consultancy Firm** - Business consulting
- **Creative Agency** - Design and marketing
- **Event Management Company** - Event planning services

### Specific Fields

#### Business Type (String)
Type of entertainment or business:
```
"Cinema", "Gaming Center", "Tech Company", "Creative Agency"
```

#### Services (Array)
Services offered by the business:
```json
["Web Development", "Mobile Apps", "UI/UX Design", "Consulting"]
```

#### Operating Hours (Object)
Detailed schedule by day:
```json
{
  "sunday": { "open": "09:00", "close": "22:00" },
  "monday": { "open": "09:00", "close": "22:00" },
  "tuesday": { "open": "09:00", "close": "22:00" },
  "wednesday": { "open": "09:00", "close": "22:00" },
  "thursday": { "open": "09:00", "close": "22:00" },
  "friday": { "closed": true },
  "saturday": { "open": "10:00", "close": "18:00" }
}
```

### API Examples

**Create Entertainment Venue (Cinema):**
```json
{
  "type": "ENTERTAINMENT",
  "category": "CINEMA",
  "businessType": "Cinema",
  "services": ["Movie Screening", "3D Movies", "IMAX", "VIP Seats"],
  "operatingHours": {
    "sunday": { "open": "12:00", "close": "23:00" },
    "monday": { "open": "12:00", "close": "23:00" },
    "tuesday": { "open": "12:00", "close": "23:00" },
    "wednesday": { "open": "12:00", "close": "23:00" },
    "thursday": { "open": "12:00", "close": "23:00" },
    "friday": { "open": "14:00", "close": "23:00" },
    "saturday": { "open": "12:00", "close": "23:00" }
  },
  "priceRange": "$$",
  "bookingUrl": "https://cinema.iq/book",
  "businessEmail": "info@cinema.iq",
  "businessPhone": "+964 770 234 5678",
  "address": "Mansour District, Baghdad",
  "city": "baghdad",
  "translations": [
    {
      "locale": "en",
      "title": "Grand Cinema Baghdad",
      "description": "Modern cinema with latest movies and IMAX",
      "location": "Mansour District, Zawra Park area"
    },
    {
      "locale": "ar",
      "title": "سينما غراند بغداد",
      "description": "سينما حديثة مع أحدث الأفلام و IMAX",
      "location": "منطقة المنصور، منطقة حديقة الزوراء"
    }
  ]
}
```

**Create Entertainment Venue (Tech Company):**
```json
{
  "type": "ENTERTAINMENT",
  "category": "TECH_COMPANY",
  "businessType": "Technology Company",
  "services": [
    "Web Development",
    "Mobile App Development",
    "UI/UX Design",
    "Cloud Solutions",
    "IT Consulting"
  ],
  "operatingHours": {
    "sunday": { "open": "09:00", "close": "17:00" },
    "monday": { "open": "09:00", "close": "17:00" },
    "tuesday": { "open": "09:00", "close": "17:00" },
    "wednesday": { "open": "09:00", "close": "17:00" },
    "thursday": { "open": "09:00", "close": "17:00" },
    "friday": { "closed": true },
    "saturday": { "closed": true }
  },
  "website": "https://techco.iq",
  "businessEmail": "contact@techco.iq",
  "businessPhone": "+964 770 345 6789",
  "address": "Karrada, Tech Tower",
  "city": "baghdad",
  "translations": [
    {
      "locale": "en",
      "title": "TechCo Iraq",
      "description": "Leading technology solutions provider in Iraq",
      "location": "Tech Tower, Karrada District"
    },
    {
      "locale": "ar",
      "title": "تك كو العراق",
      "description": "مزود رائد للحلول التقنية في العراق",
      "location": "برج التقنية، منطقة الكرادة"
    }
  ]
}
```

---

## 🔌 Integration with Existing Backend

### All APIs Support New Types

✅ **GET /api/venues** - List shopping/entertainment venues  
✅ **GET /api/venues/search** - Search with new fields  
✅ **GET /api/venues/stats** - Statistics include new types  
✅ **POST /api/venues** - Create new venues  
✅ **GET /api/admin/venues** - Admin management  
✅ **PATCH /api/admin/venues/[id]** - Update venues  

### Database Schema

New fields added to Venue model:
```prisma
model Venue {
  // ... existing fields ...
  
  // Shopping-specific
  productCategories String?  // JSON array
  brands        String?      // JSON array
  paymentMethods String?     // JSON array
  
  // Entertainment-specific
  businessType  String?
  services      String?      // JSON array
  operatingHours String?     // JSON object
  
  // ... rest of fields ...
}
```

### TypeScript Types

Import type definitions:
```typescript
import {
  ShoppingVenueData,
  EntertainmentVenueData,
  SHOPPING_CATEGORIES,
  ENTERTAINMENT_CATEGORIES,
  PAYMENT_METHODS
} from '@/types/venue-extensions';
```

---

## 📊 Admin Dashboard Support

The admin dashboard automatically supports the new venue types:

### Filtering
```
Filter by type: ALL | PENDING | ACTIVE | SUSPENDED | CLOSED
Select type: EVENT | HOTEL | RESTAURANT | ACTIVITY | SERVICE | SHOPPING | ENTERTAINMENT
```

### Venue Cards
Display type-specific information:
- **Shopping**: Shows product categories, brands, payment methods
- **Entertainment**: Shows business type, services, operating hours

### Actions
All admin actions work with new types:
- Approve/Reject
- Feature/Unfeature
- Verify/Unverify
- Edit
- Delete

---

## 🎨 Frontend Integration

### Filtering by Type

```typescript
// Filter shopping venues
fetch('/api/venues?type=SHOPPING&city=baghdad')

// Filter entertainment venues
fetch('/api/venues?type=ENTERTAINMENT&city=erbil')

// Get all venue types
fetch('/api/venues')
```

### Display Type-Specific Data

```typescript
interface Venue {
  type: 'SHOPPING' | 'ENTERTAINMENT' | 'HOTEL' | 'RESTAURANT' | ...
  
  // Common fields
  title: string;
  description: string;
  
  // Shopping-specific
  productCategories?: string[];
  brands?: string[];
  paymentMethods?: string[];
  
  // Entertainment-specific
  businessType?: string;
  services?: string[];
  operatingHours?: OperatingHours;
}

// Render based on type
function VenueCard({ venue }: { venue: Venue }) {
  if (venue.type === 'SHOPPING') {
    return (
      <div>
        <h3>{venue.title}</h3>
        <p>Categories: {venue.productCategories?.join(', ')}</p>
        <p>Brands: {venue.brands?.join(', ')}</p>
        <p>Payment: {venue.paymentMethods?.join(', ')}</p>
      </div>
    );
  }
  
  if (venue.type === 'ENTERTAINMENT') {
    return (
      <div>
        <h3>{venue.title}</h3>
        <p>Type: {venue.businessType}</p>
        <p>Services: {venue.services?.join(', ')}</p>
        {venue.operatingHours && <OperatingHoursDisplay hours={venue.operatingHours} />}
      </div>
    );
  }
  
  // ... other types
}
```

---

## 🚀 Migration & Testing

### Database Migration
Already applied:
```bash
✅ Migration: 20251002170813_add_shopping_entertainment_types
```

### Testing

**Test Shopping Venue Creation:**
```bash
curl -X POST http://localhost:3000/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHOPPING",
    "category": "MALL",
    "productCategories": ["Fashion", "Electronics"],
    "brands": ["Nike", "Apple"],
    "paymentMethods": ["Cash", "Zain Cash"],
    "translations": [...]
  }'
```

**Test Entertainment Venue Creation:**
```bash
curl -X POST http://localhost:3000/api/venues \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ENTERTAINMENT",
    "businessType": "Cinema",
    "services": ["Movie Screening", "3D Movies"],
    "operatingHours": {...},
    "translations": [...]
  }'
```

---

## 📋 Category Mapping

### Shopping Categories
```typescript
export const SHOPPING_CATEGORIES = {
  MALL: "Shopping Mall",
  SUPERMARKET: "Supermarket",
  CLOTHING_STORE: "Clothing Store",
  ELECTRONICS: "Electronics Store",
  JEWELRY: "Jewelry Store",
  BOOKSTORE: "Bookstore",
  PHARMACY: "Pharmacy",
  FURNITURE: "Furniture Store",
  MARKET: "Traditional Market (Souq)",
  DEPARTMENT_STORE: "Department Store",
}
```

### Entertainment Categories
```typescript
export const ENTERTAINMENT_CATEGORIES = {
  CINEMA: "Cinema",
  THEATER: "Theater",
  GAMING_CENTER: "Gaming Center",
  AMUSEMENT_PARK: "Amusement Park",
  BOWLING: "Bowling Alley",
  ESCAPE_ROOM: "Escape Room",
  TECH_COMPANY: "Technology Company",
  CONSULTANCY: "Consultancy Firm",
  CREATIVE_AGENCY: "Creative Agency",
  EVENT_COMPANY: "Event Management Company",
}
```

---

## ✅ Summary

### What's New
- ✅ **SHOPPING** venue type with product categories, brands, payment methods
- ✅ **ENTERTAINMENT** venue type with business types, services, operating hours
- ✅ 20+ predefined categories for both types
- ✅ Full API integration
- ✅ Admin dashboard support
- ✅ TypeScript type definitions
- ✅ Database migration applied

### Backward Compatibility
- ✅ All existing venue types work as before
- ✅ Existing APIs unchanged
- ✅ Admin dashboard supports all types
- ✅ Caching works for all types

### Ready for Frontend
- ✅ APIs return new fields
- ✅ Type definitions available
- ✅ Categories predefined
- ✅ Example payloads provided

**Your backend now supports all 7 venue types!** 🎉

Start building your frontend with confidence! 🚀
