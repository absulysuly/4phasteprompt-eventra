# Admin Dashboard Documentation

## Overview

The Eventra Admin Dashboard provides a clean, intuitive interface for managing venue submissions, approvals, and platform content. Built with Next.js and Tailwind CSS, it offers real-time statistics and powerful filtering capabilities.

## Features

✅ **Venue Management** - Review, approve, suspend, or delete venue submissions  
✅ **Status Filtering** - Filter by PENDING, ACTIVE, SUSPENDED, or ALL  
✅ **Real-time Statistics** - Live stats showing total, pending, active, featured, and verified venues  
✅ **Search & Filter** - Search venues by name, city, category, or type  
✅ **Quick Actions** - One-click approve/reject, feature/unfeature, verify/unverify  
✅ **Cache Integration** - Automatic cache invalidation on data changes  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

---

## Access the Dashboard

### Local Development

```bash
# Start your dev server
npm run dev

# Navigate to:
http://localhost:3000/admin/venues
```

**Note**: You need to be logged in to access the admin dashboard. The API checks for an authenticated session.

### Production

```
https://your-domain.com/admin/venues
```

---

## Dashboard Interface

### Overview Section

The dashboard opens with key statistics at the top:

```
┌─────────────────────────────────────────────────────────┐
│  Venue Management                                        │
│  Review, approve, and manage venue submissions          │
└─────────────────────────────────────────────────────────┘

┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│Total │  │Pending│ │Active│  │Featured│ │Verified│
│ 150  │  │  25   │ │ 120  │  │  15    │ │  80    │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘
```

### Filters

Filter venues by status with one click:

- **ALL** - Show all venues regardless of status
- **PENDING** - New submissions awaiting approval
- **ACTIVE** - Approved and live venues
- **SUSPENDED** - Suspended or rejected venues

### Search Bar

Real-time search across:
- Venue titles
- City names
- Categories
- Venue types

### Venue Cards

Each venue is displayed in a card with:

**Left Side (Venue Info):**
- Title and description
- Status badges (PENDING, ACTIVE, SUSPENDED)
- Type badge (HOTEL, RESTAURANT, ACTIVITY, EVENT, SERVICE)
- Featured/Verified badges (if applicable)
- City, category, phone, email
- Creation date and public ID

**Right Side (Actions):**
- **Approve** - Set status to ACTIVE (for PENDING venues)
- **Reject/Suspend** - Set status to SUSPENDED
- **Reactivate** - Set status back to ACTIVE (for SUSPENDED venues)
- **Feature/Unfeature** - Toggle featured status
- **Verify/Unverify** - Toggle verified status
- **Edit** - Navigate to edit page (coming soon)
- **Delete** - Permanently delete the venue

---

## API Endpoints

### List Venues

```http
GET /api/admin/venues?status=PENDING&page=1&limit=20
```

**Query Parameters:**
- `status` (optional) - Filter by status: `PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`
- `type` (optional) - Filter by type: `HOTEL`, `RESTAURANT`, `ACTIVITY`, `EVENT`, `SERVICE`
- `city` (optional) - Filter by city name
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "venues": [
    {
      "id": "clxxx...",
      "publicId": "hotel-1234567890-abc123",
      "type": "HOTEL",
      "status": "PENDING",
      "title": "Grand Baghdad Hotel",
      "description": "Luxury hotel in central Baghdad",
      "city": "baghdad",
      "category": "accommodation",
      "featured": false,
      "verified": false,
      "businessPhone": "+964 770 123 4567",
      "businessEmail": "info@grandhotel.iq",
      "createdAt": "2025-10-01T10:30:00Z",
      "owner": {
        "id": "user_xxx",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 95,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Update Venue

```http
PATCH /api/admin/venues/[id]
Content-Type: application/json

{
  "status": "ACTIVE",
  "featured": true,
  "verified": true
}
```

**Allowed Fields:**
- `status` - `PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`
- `featured` - `true` or `false`
- `verified` - `true` or `false`
- `type` - Venue type
- `category` - Category string
- `subcategory` - Subcategory string
- `city` - City name
- `priceRange` - Price range string

**Response:**
```json
{
  "success": true,
  "venue": { ... },
  "message": "Venue updated successfully"
}
```

### Delete Venue

```http
DELETE /api/admin/venues/[id]
```

**Response:**
```json
{
  "success": true,
  "message": "Venue deleted successfully"
}
```

### Get Single Venue

```http
GET /api/admin/venues/[id]
```

**Response:**
```json
{
  "success": true,
  "venue": {
    "id": "clxxx...",
    "publicId": "hotel-1234567890-abc123",
    "type": "HOTEL",
    "status": "ACTIVE",
    "translations": [
      {
        "locale": "en",
        "title": "Grand Baghdad Hotel",
        "description": "..."
      },
      {
        "locale": "ar",
        "title": "فندق بغداد الكبير",
        "description": "..."
      }
    ],
    "user": { ... }
  }
}
```

---

## Workflow Examples

### 1. Approving a Pending Venue

```
1. Open dashboard → Filter by "PENDING"
2. Review venue information
3. Click "✓ Approve" button
4. Venue status changes to "ACTIVE"
5. Cache is automatically invalidated
6. Venue appears on public site
```

### 2. Featuring a Popular Venue

```
1. Find the venue (use search or filter)
2. Click "☆ Feature" button
3. Venue gets featured badge
4. Appears in featured sections on frontend
5. Cache updates automatically
```

### 3. Suspending a Problematic Venue

```
1. Locate the venue
2. Click "Suspend" button
3. Venue disappears from public listings
4. Owner can see it's suspended in their dashboard
5. Can be reactivated later if resolved
```

### 4. Deleting Spam Submission

```
1. Find spam venue
2. Click "Delete" button
3. Confirm deletion
4. Venue and all translations are permanently deleted
5. Related caches are cleared
```

---

## Cache Behavior

All admin actions automatically invalidate relevant caches:

### On Status Change (Approve/Suspend/Reactivate):
```typescript
await cacheInvalidatePattern('venues:list:*');  // All venue lists
await cacheInvalidatePattern('venues:search:*'); // Search results
await cacheDel(CacheKeys.venueStats());          // Statistics
await cacheDel(CacheKeys.venueFilters());        // Filter metadata
```

### On Feature/Verify Toggle:
```typescript
await cacheInvalidatePattern('venues:list:*');  // Re-fetch lists
await cacheDel(CacheKeys.venue(id));             // Specific venue
```

### On Delete:
```typescript
await cacheInvalidatePattern('venues:*');  // All venue caches
await cacheDel(CacheKeys.venueStats());    // Update stats
```

This ensures users always see up-to-date data without manual cache clearing.

---

## Authentication & Security

### Current Implementation

The dashboard uses NextAuth session-based authentication:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json(
    { success: false, error: 'Authentication required' },
    { status: 401 }
  );
}
```

### Production Recommendations

For production, add role-based access control:

#### 1. Add Admin Role to User Model

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String?
  role     UserRole @default(USER)  // Add this
  // ... other fields
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

#### 2. Create Admin Middleware

```typescript
// lib/admin-auth.ts
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    throw new Error('Admin access required');
  }
  
  return user;
}
```

#### 3. Protect Admin Routes

```typescript
// In admin API routes:
import { requireAdmin } from '../../../../../lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();  // This line ensures only admins can access
    
    // ... rest of your code
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    );
  }
}
```

#### 4. Protect Admin Pages

```typescript
// src/app/admin/venues/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export default async function AdminVenuesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/admin/venues');
  }
  
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  if (user?.role !== 'ADMIN') {
    redirect('/unauthorized');
  }
  
  // ... render dashboard
}
```

---

## Customization

### Add New Filters

To add custom filters (e.g., by price range):

```typescript
// In page.tsx:
const [priceFilter, setPriceFilter] = useState<string>('');

// Add to fetch call:
if (priceFilter) {
  params.append('priceRange', priceFilter);
}

// Add UI:
<select
  value={priceFilter}
  onChange={(e) => setPriceFilter(e.target.value)}
>
  <option value="">All Prices</option>
  <option value="$">$</option>
  <option value="$$">$$</option>
  <option value="$$$">$$$</option>
  <option value="$$$$">$$$$</option>
</select>
```

### Customize Venue Card Display

Edit the `VenueCard` component in `page.tsx`:

```typescript
// Add custom fields:
<div>
  <span className="font-medium">Rating:</span> {venue.rating || 'N/A'}
</div>
<div>
  <span className="font-medium">Views:</span> {venue.views || '0'}
</div>
```

### Add Bulk Actions

```typescript
const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

const bulkApprove = async () => {
  await Promise.all(
    selectedVenues.map(id => 
      fetch(`/api/admin/venues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACTIVE' })
      })
    )
  );
  fetchVenues();
};
```

---

## Mobile Responsiveness

The dashboard is fully responsive:

### Desktop (>1024px):
- Full card layout with side-by-side info and actions
- 5-column stats grid
- Horizontal filter buttons

### Tablet (768px - 1024px):
- Stacked card layout
- 3-column stats grid
- Actions below venue info

### Mobile (<768px):
- Full-width cards
- 1-column stats grid (scrollable)
- Stacked filters
- Touch-friendly buttons

---

## Future Enhancements

Possible additions for v2:

- **Bulk Actions** - Select multiple venues and approve/delete at once
- **Advanced Filtering** - Date ranges, rating, verification status
- **Venue Editing** - Full inline editing interface
- **Activity Log** - Track who made what changes
- **Email Notifications** - Notify venue owners of approval/rejection
- **Analytics Dashboard** - Graphs and charts for trends
- **Export Functionality** - Export venue data to CSV/Excel
- **Image Moderation** - Review and approve uploaded images
- **Translation Management** - Edit translations directly in admin panel

---

## Troubleshooting

### "Authentication required" error

**Problem**: Can't access admin dashboard  
**Solution**: Make sure you're logged in. Go to `/login` first.

### Venues not loading

**Problem**: Empty dashboard or loading spinner stuck  
**Solution**: 
1. Check browser console for errors
2. Verify API endpoint is working: `curl http://localhost:3000/api/admin/venues`
3. Check database connection

### Cache not invalidating

**Problem**: Changes not reflecting on public site  
**Solution**:
1. Manually clear cache via `/api/admin/cache`
2. Check Redis connection
3. Restart dev server

### TypeScript errors

**Problem**: Type errors in IDE  
**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

## Summary

The admin dashboard provides:

✅ **Clean, intuitive UI** for venue management  
✅ **Real-time statistics** and filtering  
✅ **One-click actions** for common tasks  
✅ **Automatic cache invalidation** for data consistency  
✅ **Mobile-responsive** design  
✅ **Secure authentication** with session checking  
✅ **Easy to extend** with new features  

**Access it at**: `/admin/venues`  
**API Docs**: See examples above  
**Support**: Contact dev team for assistance  

Happy venue managing! 🎉
