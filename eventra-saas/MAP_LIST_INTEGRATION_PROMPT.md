# Google AI Studio Prompt: Contextual Map & List Integration for "Discover Iraq" Platform

## Project Context
Building on the modular homepage and discovery-first browse concepts, I need to design a **deeply integrated map and list view system** that serves as the primary interactive canvas for spatial discovery across all location-based domains:

- **Hotels** (with exact addresses and amenities)
- **Restaurants & Cafes** (with cuisine types and dining experiences)  
- **Touristic Places** (historical sites, landmarks, attractions)
- **Events** (pin-able at their venue locations)

## Current Technical Foundation
- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: TailwindCSS v4 with Iraqi cultural design system
- **Internationalization**: next-intl (Arabic, English, Kurdish with RTL)
- **Database**: Prisma with PostgreSQL + PostGIS for geospatial data
- **Existing Features**: Cross-domain filtering, PWA, responsive design

## Core Design Challenge

### The Spatial Discovery Problem
Current map implementations typically treat maps as a simple "toggle view" alternative to lists. Users lose context when switching between views, and the spatial relationships between venues (restaurants near hotels, events near attractions) aren't intuitive to explore.

### The Solution Vision
Create a **map-first discovery experience** where:
1. **Map serves as the primary canvas** for exploration and discovery
2. **List and map are contextually synchronized** with bi-directional interactivity
3. **Spatial relationships are visually highlighted** through smart interactions
4. **Performance remains optimal** even with high-density point rendering
5. **Natural planning workflows** are supported (how people think spatially)

## Required Map-List Integration System

### 1. Bi-Directional Interaction Architecture

#### Map → List Interactions:
```typescript
interface MapListSync {
  // Map area selection updates list
  onMapAreaSelect: (bounds: GeoBounds) => void;
  
  // Map pin click highlights list item
  onPinClick: (venueId: string, venueType: VenueType) => void;
  
  // Map clustering interaction
  onClusterClick: (cluster: VenueCluster) => void;
  
  // Map zoom changes list density/filtering
  onZoomChange: (zoomLevel: number, visibleArea: GeoBounds) => void;
}
```

#### List → Map Interactions:
```typescript
interface ListMapSync {
  // List item hover highlights map pin
  onListItemHover: (venueId: string) => void;
  
  // List item click centers map and shows context
  onListItemClick: (venue: Venue) => void;
  
  // List filtering updates map pins
  onListFilter: (filters: FilterState) => void;
  
  // List selection triggers contextual map highlights
  onListSelection: (venue: Venue) => void;
}
```

### 2. Contextual Highlighting System

#### Smart Proximity Highlighting:
When user selects a hotel on the list:
- **Highlight nearby restaurants** within 500m (walking distance)
- **Show nearby attractions** within 2km (short drive/taxi)
- **Display relevant events** happening at nearby venues
- **Indicate transportation options** (metro stops, parking, etc.)

#### Visual Highlighting Patterns:
```typescript
interface ContextualHighlight {
  primary: Venue;           // The selected venue (bright highlight)
  related: RelatedVenue[];  // Contextually relevant nearby venues
  connections: Connection[]; // Visual lines showing relationships
  accessibility: AccessibilityInfo; // Transport, parking, walkability
}

interface Connection {
  from: VenueId;
  to: VenueId;
  type: 'walking' | 'driving' | 'transit';
  duration: number; // in minutes
  visualStyle: ConnectionStyle;
}
```

#### Contextual Relevance Logic:
- **Hotel Selected**: Highlight restaurants (200m), attractions (1km), events (2km)
- **Restaurant Selected**: Highlight hotels (500m), attractions (300m), entertainment (1km)
- **Tourist Site Selected**: Highlight nearby dining (300m), parking (200m), related sites (2km)
- **Event Selected**: Highlight venue, nearby dining/hotels, parking areas

### 3. Performance-Optimized Rendering

#### Intelligent Point Clustering:
```typescript
interface SmartClustering {
  // Dynamic clustering based on zoom level and density
  zoomThresholds: {
    city: 10,      // Show district clusters
    district: 13,  // Show street-level clusters  
    street: 16,    // Show individual venues
    venue: 18      // Show venue details
  };
  
  // Cluster by venue type and proximity
  clusteringStrategy: 'proximity' | 'type' | 'hybrid';
  
  // Limit visible pins based on viewport and performance
  maxVisiblePins: number;
  
  // Progressive loading for dense areas
  progressiveLoading: boolean;
}
```

#### Performance Optimization Strategies:
- **Viewport-based loading**: Only render points in visible map area + buffer
- **Level-of-detail rendering**: Show simplified pins at low zoom, detailed at high zoom
- **Debounced interactions**: Prevent excessive API calls during rapid map movements
- **Virtual scrolling for lists**: Handle thousands of venues efficiently
- **Spatial indexing**: Use PostGIS for fast geospatial queries

### 4. Natural Planning Workflows

#### Journey Planning Mode:
```typescript
interface JourneyPlanner {
  selectedVenues: Venue[];
  suggestedRoute: OptimalRoute;
  travelTimes: TravelTimeMatrix;
  timeline: PlannedActivity[];
}

// Example workflow:
// 1. User clicks hotel → Map highlights nearby options
// 2. User adds restaurant → Map shows walking route
// 3. User adds attraction → Map suggests optimal visiting order  
// 4. System generates complete itinerary with times
```

#### Contextual Information Panels:
- **Venue Details Panel**: Slides up from bottom on selection
- **Route Information**: Shows walking/driving directions between selected venues
- **Time Estimates**: Real-time travel duration calculations
- **Availability Status**: Live availability for restaurants, events, hotels

### 5. Mobile-First Responsive Design

#### Touch-Optimized Interactions:
```typescript
interface TouchInteractions {
  // Single tap: Select venue, highlight context
  onTap: (venue: Venue) => void;
  
  // Long press: Add to itinerary
  onLongPress: (venue: Venue) => void;
  
  // Pinch zoom: Adjust map detail level
  onPinchZoom: (zoomLevel: number) => void;
  
  // Swipe on list: Reveal quick actions
  onListSwipe: (venue: Venue, direction: SwipeDirection) => void;
  
  // Drag: Reorder itinerary items
  onDrag: (from: number, to: number) => void;
}
```

#### Responsive Layout Patterns:
```css
/* Mobile: Full-screen map with slide-up list */
@media (max-width: 768px) {
  .map-container { height: 100vh; }
  .list-container { 
    position: fixed; 
    bottom: 0; 
    transform: translateY(80%); 
    transition: transform 0.3s ease;
  }
  .list-container.expanded { transform: translateY(0); }
}

/* Tablet: Split view with resizable divider */
@media (768px <= width < 1024px) {
  .map-list-container { 
    display: grid; 
    grid-template-columns: 1fr 400px; 
    resize: horizontal;
  }
}

/* Desktop: Map with floating list panel */
@media (width >= 1024px) {
  .map-container { position: relative; }
  .list-panel { 
    position: absolute; 
    right: 16px; 
    top: 16px; 
    width: 380px; 
    max-height: 80vh; 
  }
}
```

### 6. Map Layer Management System

#### Dynamic Layer Switching:
```typescript
interface MapLayers {
  venues: {
    hotels: boolean;
    restaurants: boolean;
    tourism: boolean;
    events: boolean;
  };
  
  contextual: {
    transportation: boolean;  // Metro, bus, taxi stands
    services: boolean;       // ATMs, hospitals, police
    accessibility: boolean;  // Wheelchair access, ramps
  };
  
  overlays: {
    districts: boolean;      // Historic/business district boundaries
    walkingAreas: boolean;   // Pedestrian zones
    culturalSites: boolean;  // UNESCO sites, heritage areas
  };
}
```

#### Iraqi Cultural Context Layers:
- **Prayer Time Indicators**: Nearby mosques with prayer time displays
- **Halal Certification**: Restaurant markers showing halal status
- **Cultural Sensitivity**: Appropriate dress code areas, photography restrictions
- **Local Events**: Cultural festivals, religious observances overlays

### 7. Advanced Spatial Features

#### Smart Route Optimization:
```typescript
interface RouteOptimization {
  // Optimize multi-venue visits
  optimizeRoute: (venues: Venue[], constraints: RouteConstraints) => OptimalRoute;
  
  // Consider Iraqi-specific factors
  constraints: {
    prayerTimes: boolean;     // Account for prayer breaks
    trafficPatterns: boolean; // Baghdad traffic considerations
    culturalHours: boolean;   // Venue opening hours, cultural norms
    weatherSeason: boolean;   // Hot weather, indoor preferences
  };
}
```

#### Geofencing & Notifications:
- **Proximity Alerts**: "You're near a highly-rated restaurant"
- **Event Notifications**: "Concert starting in 30min nearby"
- **Cultural Reminders**: "Prayer time in 15 minutes"
- **Safety Updates**: "Avoid this area during rush hour"

### 8. Integration with Existing Systems

#### Events Page Compatibility:
```typescript
interface EventsIntegration {
  // Maintain existing /events page functionality
  preserveCurrentFilters: boolean;
  
  // Add map view to events page
  eventsMapView: {
    showVenues: boolean;      // Show event venues on map
    clusterByDate: boolean;   // Group events by time
    routePlanning: boolean;   // Multi-event route planning
  };
  
  // Bidirectional navigation
  mapToEvents: (eventId: string) => void;
  eventsToMap: (filters: EventFilters) => void;
}
```

#### URL State Management:
```typescript
interface URLState {
  // Preserve map state in URLs
  mapCenter: [number, number];    // Lat, lng
  zoomLevel: number;
  selectedVenues: string[];       // Array of venue IDs
  activeFilters: FilterState;
  viewMode: 'map' | 'list' | 'split';
}

// Example URLs:
// /explore?center=33.3152,44.3661&zoom=14&venues=hotel123,rest456&view=map
// /events?map=true&center=36.1911,44.0092&date=2024-03&category=music
```

### 9. Accessibility & RTL Support

#### Screen Reader Compatibility:
```typescript
interface AccessibilityFeatures {
  // Keyboard navigation for map
  keyboardMapControls: boolean;
  
  // Screen reader announcements
  announceMapChanges: boolean;
  announceListUpdates: boolean;
  
  // High contrast mode
  highContrastPins: boolean;
  
  // Voice navigation
  voiceInstructions: boolean;
}
```

#### RTL Language Considerations:
- **Map controls positioning**: Right-to-left for Arabic/Kurdish interfaces
- **List panel placement**: Appropriate side for reading direction
- **Route directions**: Culturally appropriate navigation instructions
- **Street name display**: Mixed Arabic/English street names

### 10. Data Architecture & API Design

#### Geospatial Data Models:
```typescript
interface GeoVenue {
  id: string;
  type: 'hotel' | 'restaurant' | 'tourism' | 'event';
  coordinates: [number, number]; // [lng, lat] - GeoJSON standard
  address: {
    street: string;
    district: string;
    city: string;
    country: 'Iraq';
    arabic?: string;     // Arabic address
    kurdish?: string;    // Kurdish address
  };
  
  // Spatial relationships
  nearbyVenues: NearbyVenue[];
  walkingDistance: DistanceMatrix;
  accessibility: AccessibilityInfo;
  
  // Performance optimization
  boundingBox: BoundingBox;
  lastUpdated: Date;
}
```

#### API Endpoints:
```typescript
// Spatial search API
GET /api/venues/spatial
  ?bounds=33.3152,44.3661,33.3452,44.3961
  &types=hotel,restaurant
  &zoom=14
  &limit=100

// Contextual relationships API  
GET /api/venues/:id/context
  ?radius=500m
  &types=restaurant,tourism
  &include=walking_time,availability

// Route optimization API
POST /api/routes/optimize
  body: { venues: string[], preferences: RoutePreferences }
```

### 11. Performance Monitoring & Analytics

#### Key Performance Indicators:
```typescript
interface MapPerformance {
  // Technical metrics
  renderTime: number;        // Time to render initial map
  pinLoadTime: number;       // Time to load venue pins
  interactionDelay: number;  // Lag between click and response
  
  // User experience metrics  
  mapEngagement: number;     // Time spent on map vs list
  spatialDiscovery: number;  // Cross-venue type interactions
  routeCreation: number;     // Complete itinerary builds
  
  // Performance thresholds
  maxAcceptableRenderTime: 2000; // 2 seconds
  maxPinLoadTime: 500;           // 500ms
  maxInteractionDelay: 100;      // 100ms
}
```

## Expected Deliverables

### 1. Technical Implementation:
- **React component architecture** for map-list integration
- **TypeScript interfaces** for geospatial data and interactions
- **Performance optimization patterns** for high-density rendering
- **Mobile-responsive interaction handlers** with touch support

### 2. UI/UX Design:
- **TailwindCSS responsive layouts** for all device sizes
- **Interactive map controls** with cultural sensitivity
- **Smooth animation patterns** for state transitions
- **Loading states and error handling** for spatial data

### 3. Integration Patterns:
- **Backward compatibility** with existing events system
- **URL state management** for shareable map states
- **Cross-domain filtering** integration with browse system
- **Performance caching strategies** for geospatial queries

### 4. Iraqi Context Features:
- **Cultural landmark integration** (mosques, heritage sites)
- **Local transportation overlay** (Baghdad metro, bus routes)
- **Prayer time awareness** in routing and recommendations
- **Arabic/Kurdish place name handling** with proper RTL display

## Success Criteria

### User Experience Goals:
- **Spatial Discovery**: 70%+ users explore venues through map interactions
- **Cross-Domain Exploration**: Users regularly discover 2+ venue types per session
- **Itinerary Creation**: 40%+ map users create multi-venue itineraries
- **Mobile Engagement**: Equivalent experience quality across all device sizes

### Technical Performance Targets:
- **Initial Map Load**: <2 seconds on 3G connections
- **Pin Rendering**: <500ms for 100+ venues in viewport
- **Interaction Response**: <100ms delay for all map/list interactions
- **Battery Efficiency**: Minimal GPS/location service drain on mobile

### Cultural Integration Success:
- **Local User Adoption**: High engagement from Iraqi users
- **Cultural Accuracy**: Proper representation of local landmarks and customs
- **Language Support**: Seamless RTL experience for Arabic/Kurdish users
- **Accessibility Compliance**: WCAG 2.1 AA standards for all interactions

---

**Design Philosophy**: Create a spatial discovery experience that mirrors how people naturally think about places - not as isolated points, but as connected experiences within the rich cultural and geographical context of Iraq.