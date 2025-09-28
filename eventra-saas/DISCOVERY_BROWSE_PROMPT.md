# Google AI Studio Prompt: Discovery-First Browse Experience for "Discover Iraq" Platform

## Project Context
Building on the modular homepage concept, I need to design a unified **"Browse" or "Explore"** screen that enables seamless cross-domain discovery across all four platform domains:
- **Hotels** (accommodation with amenities)
- **Events** (conferences, concerts, cultural events)  
- **Restaurants & Cafes** (dining experiences with cuisine types)
- **Touristic Places** (historical sites, attractions, landmarks)

## Current Technical Foundation
- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: TailwindCSS v4 with custom Iraqi cultural theme
- **Internationalization**: next-intl (Arabic, English, Kurdish with RTL support)
- **Database**: Prisma with PostgreSQL
- **Existing Features**: PWA, user authentication, responsive design

## Existing Filter System
The current `/events` page uses:
- **Month filter**: January through December
- **Category filter**: 16 event categories (Tech, Business, Music, Arts, etc.)
- **City filter**: 11 Iraqi cities (Baghdad, Basra, Erbil, etc.)
- **Search**: Text-based title/description search

**Critical Constraint**: New system must integrate these existing filters without breaking current functionality.

## Core Design Challenge

### The Discovery Problem
Users currently must search within each domain separately, making it impossible to find interconnected experiences like:
- "A highly-rated restaurant near a historical site with an event happening this weekend"
- "Family-friendly activities in Historic Baghdad with nearby hotels"
- "Business conference venues with nearby luxury dining and accommodation"
- "Weekend cultural events near traditional markets and authentic restaurants"

### The Solution Vision
Create an innovative filtering and tagging system that:
1. **Connects attributes across domains** using shared tags
2. **Visually represents interconnectedness** of places and activities
3. **Encourages organic itinerary building** through smart suggestions
4. **Handles empty states gracefully** when filters don't match
5. **Maintains backward compatibility** with existing event filters

## Required Cross-Domain Tagging System

### 1. Universal Attribute Tags
Design a comprehensive tagging system that works across all domains:

#### Location-Based Tags:
- **Historic District** (Old Baghdad, Erbil Citadel area, Basra Heritage Quarter)
- **Business District** (Modern commercial areas)
- **Cultural Quarter** (Arts, museums, traditional crafts)
- **Riverside** (Tigris/Euphrates waterfront areas)
- **Mountain Region** (Kurdistan highlands)
- **Desert Edge** (Traditional Bedouin experiences)

#### Experience Tags:
- **Family-Friendly** (Suitable for children, family activities)
- **Luxury** (Premium experiences, high-end venues)
- **Authentic** (Traditional Iraqi culture, local experiences)
- **Modern** (Contemporary venues, international standards)
- **Outdoor** (Gardens, terraces, natural settings)
- **Indoor** (Climate-controlled, weather-independent)

#### Timing Tags:
- **Weekend Availability** (Friday-Saturday focus)
- **Evening Experience** (6PM-midnight optimal)
- **Morning Activity** (6AM-12PM optimal)
- **All-Day** (Flexible timing)
- **Seasonal** (Best during specific months)

#### Accessibility Tags:
- **Wheelchair Accessible**
- **Public Transport Accessible**
- **Parking Available**
- **English Speaking Staff**
- **Group Bookings Welcome**

### 2. Smart Filter Combination Logic

#### Primary Filters (Keep Existing):
- **Domain Selection**: Hotels | Events | Restaurants | Tourism | All
- **City**: Existing 11-city list
- **Date/Month**: Enhanced to show availability across domains
- **Search**: Text search across all content types

#### Secondary Filters (New Cross-Domain):
- **Experience Type**: Family | Business | Cultural | Luxury | Budget
- **Location Context**: Historic | Modern | Waterfront | Mountain | Desert
- **Timing**: Morning | Afternoon | Evening | Weekend | Weekday
- **Accessibility**: All filters from accessibility tags above

#### Smart Combinations:
```typescript
// Example filter logic
interface SmartFilter {
  domain: 'all' | 'hotels' | 'events' | 'restaurants' | 'tourism';
  city?: string;
  experienceType?: 'family' | 'business' | 'cultural' | 'luxury';
  locationContext?: 'historic' | 'modern' | 'waterfront';
  timing?: 'weekend' | 'evening' | 'morning';
  accessibility?: string[];
  dateRange?: { start: Date; end: Date };
}
```

### 3. Interconnected Results Display

#### Visual Representation System:
- **Map Integration**: Show all filtered results on interactive map
- **Connection Lines**: Visual links between related venues (restaurant near attraction)
- **Clustering**: Group nearby results with expandable clusters
- **Distance Indicators**: Walking/driving time between venues
- **Itinerary Builder**: Drag-and-drop to create custom itineraries

#### Result Card Enhancements:
```typescript
interface UnifiedResultCard {
  id: string;
  type: 'hotel' | 'event' | 'restaurant' | 'tourism';
  title: string;
  location: GeoLocation;
  tags: UniversalTag[];
  nearbyVenues: RelatedVenue[];
  availability: AvailabilityWindow[];
  rating: number;
  priceRange: PriceIndicator;
  images: string[];
  description: string;
  specialOffers?: string[];
}
```

### 4. Empty State & Error Handling

#### Progressive Filter Refinement:
When filters return no results, suggest:
1. **Broaden Location**: Expand from district to city
2. **Adjust Timing**: Show alternative dates/times
3. **Related Experiences**: Similar but available options
4. **Split Journey**: Break complex filters into multiple trips

#### Smart Suggestions:
```
"No family-friendly restaurants in Historic Baghdad for tonight"
↓
Suggestions:
• 3 family restaurants in nearby Modern Baghdad (10min drive)
• 2 family restaurants in Historic Baghdad (available tomorrow)
• 5 historic sites with nearby family dining (within 20min)
```

### 5. Integration with Existing Systems

#### Events Page Compatibility:
- **Preserve current URL structure**: `/events?month=march&category=tech&city=baghdad`
- **Enhanced URLs**: `/browse?domain=events&month=march&experience=business&location=modern`
- **Redirect logic**: Old URLs map to new filter system
- **Filter state**: Maintain user's filter preferences across sessions

#### Navigation Integration:
- **Browse/Explore** becomes primary discovery method
- **Domain-specific pages** remain for focused browsing
- **Quick filters** in main navigation for common searches
- **Recent searches** and **saved filters** for returning users

### 6. Advanced Discovery Features

#### AI-Powered Suggestions:
- **"Complete Your Experience"**: Auto-suggest complementary venues
- **"People Also Visited"**: Behavioral clustering recommendations
- **"Perfect for Today"**: Weather and time-sensitive suggestions
- **"Trending Combinations"**: Popular multi-venue itineraries

#### Social Discovery:
- **Local Favorites**: Venues popular with Iraqi users
- **Visitor Hotspots**: Most visited by tourists
- **Hidden Gems**: High-rated but lesser-known places
- **Community Reviews**: User-generated content and tips

### 7. Mobile-First Experience Design

#### Touch-Optimized Filters:
- **Chip-based selection**: Tap to add/remove filter tags
- **Swipe gestures**: Quick category switching
- **Voice search**: Arabic/Kurdish voice input support
- **Gesture navigation**: Pinch-to-zoom on map, swipe between results

#### Progressive Disclosure:
```
Level 1: Domain + City (Quick start)
Level 2: + Experience Type + Timing
Level 3: + Specific tags + Advanced options
```

### 8. Performance & Technical Specifications

#### Search & Filtering Performance:
- **Elasticsearch integration** for fast cross-domain search
- **Geospatial indexing** for location-based queries
- **Real-time availability** checks without blocking UI
- **Progressive loading** for large result sets
- **Offline filtering** using cached data (PWA)

#### Caching Strategy:
```typescript
interface FilterCache {
  popularCombinations: FilterSet[];
  locationClusters: GeoCluster[];
  availabilityWindows: TimeWindow[];
  userPreferences: PersonalizedFilters;
  recentSearches: SearchHistory[];
}
```

### 9. Specific UI/UX Requirements

#### Filter Interface Design:
- **Floating filter panel**: Collapsible on mobile, sidebar on desktop
- **Visual filter feedback**: Show result count as filters are applied
- **Quick clear options**: Remove individual filters or clear all
- **Filter memory**: Remember user preferences across sessions
- **Export filters**: Share filter combinations via URL

#### Result Visualization:
- **Grid/List toggle**: Card view or compact list
- **Map overlay**: Switch between results and map view
- **Sort options**: Distance, rating, price, availability
- **Save functionality**: Bookmark interesting combinations
- **Share itineraries**: Export to calendar, share with others

### 10. Cultural & Accessibility Considerations

#### Iraqi Context:
- **Prayer time awareness**: Account for local prayer schedules
- **Cultural events**: Integrate Islamic holidays and local festivals
- **Language mixing**: Support Arabic street names with English descriptions
- **Local customs**: Respect cultural norms in venue descriptions

#### RTL Language Support:
- **Filter panel positioning**: Right-to-left for Arabic/Kurdish
- **Map controls**: Culturally appropriate positioning
- **Text overflow**: Handle long Arabic place names gracefully
- **Number formatting**: Local number formats and currencies

## Expected Deliverables

### 1. Technical Architecture:
- React component structure for unified browse system
- TypeScript interfaces for cross-domain data models
- API endpoint design for complex filtering queries
- Database schema for universal tagging system

### 2. UI/UX Design:
- Responsive filter interface with TailwindCSS classes
- Interactive map integration (OpenStreetMap/Mapbox)
- Empty state designs with smart suggestions
- Loading states and progressive enhancement

### 3. Integration Code:
- Migration strategy from current events filters
- URL routing for new browse system
- Backward compatibility with existing bookmarks
- Performance optimization for complex queries

### 4. Example Scenarios:
- Complete user journeys for different personas
- Edge case handling (no results, network issues)
- Multi-language behavior examples
- Mobile vs desktop experience differences

## Success Criteria

### User Experience:
- **Discovery Rate**: Users find 3+ venues in single session
- **Cross-Domain Usage**: 60%+ users explore multiple domains
- **Itinerary Building**: Users save multi-venue combinations
- **Return Engagement**: Saved filters drive repeat visits

### Technical Performance:
- **Search Response**: <500ms for filtered results
- **Map Rendering**: <2s for complex overlays
- **Mobile Performance**: 60fps on mid-range devices
- **Offline Capability**: Basic filtering without network

---

**Design Philosophy**: Create a system that feels like having a knowledgeable local friend who understands exactly what you're looking for and can suggest the perfect combination of experiences, even ones you didn't know you wanted.