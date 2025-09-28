# Google AI Studio Prompt: Modular & Adaptive Homepage for "Discover Iraq" Platform

## Project Context
I'm building "Discover Iraq" - an integrated experience platform that helps users discover and engage with venues and activities across Iraq. The platform covers four core domains:
- **Hotels** (accommodation booking)
- **Events** (conferences, concerts, meetups)
- **Restaurants & Cafes** (dining experiences)
- **Touristic Places** (historical sites, attractions)

## Current Technical Stack
- **Frontend**: Next.js 15.5.3, React 19.1.0, TypeScript
- **Styling**: TailwindCSS v4
- **Internationalization**: next-intl (supports Arabic, English, Kurdish)
- **Database**: Prisma with PostgreSQL
- **Features**: PWA support, RTL language support

## Existing Navigation Structure
The app already has:
- Dedicated `/events` page with filter-by-month paradigm
- Language switching (EN/AR/KU)
- User authentication system
- Responsive navigation component
- Event creation dashboard

## Design Challenge
Create a **modular and adaptive homepage** that personalizes content discovery based on user intent, moving beyond static category grids to dynamic, contextual experiences.

### Core User Scenarios:
1. **Tourist planning a trip**: Needs hotels → attractions → restaurants sequence
2. **Local looking for dinner**: Wants nearby restaurants → events happening tonight
3. **Business traveler**: Requires hotels → business events → meeting venues
4. **Cultural explorer**: Seeks events → attractions → authentic dining

## Required Design System

### 1. User Intent Detection
Design a system that identifies user goals through:
- **Time-based signals**: Business hours vs evening (local vs tourist behavior)
- **Session patterns**: First visit vs returning user
- **Geographic context**: Local vs visitor (IP/location-based)
- **Device context**: Mobile (on-the-go) vs desktop (planning)
- **Search history**: Previous category interactions

### 2. Modular Content Architecture
Create adaptive modules that can be **prioritized, rearranged, or combined**:

#### Core Modules:
- **"Trending Events"** - Live, popular events with availability
- **"Hotels with Availability"** - Real-time booking options
- **"Highly-Rated Restaurants"** - Context-aware dining suggestions
- **"Must-Visit Places"** - Cultural/historical attractions
- **"Local Experiences"** - Authentic, off-the-beaten-path activities
- **"Quick Actions"** - Time-sensitive recommendations

#### Module Behaviors:
- **Tourist Intent**: Tourism → Hotels → Restaurants → Events
- **Local Intent**: Restaurants → Events → Activities → Services  
- **Business Intent**: Hotels → Events → Meeting Venues → Dining
- **Explorer Intent**: Balanced mix with trending content prioritized

### 3. Dynamic Content Hierarchy
Design content that adapts based on:
- **Time of day**: Morning (hotels/breakfast) → Afternoon (attractions) → Evening (dining/events)
- **Day of week**: Weekday (business focus) → Weekend (leisure focus)
- **Season**: Summer (outdoor events) → Winter (indoor activities)
- **Local events**: Festival seasons, holidays, cultural celebrations

### 4. Technical Requirements

#### Integration Points:
- Must work seamlessly with existing `/events` page
- Preserve current navigation structure
- Support existing translation system
- Maintain PWA functionality
- Ensure RTL language compatibility

#### Responsive Design:
- **Mobile-first**: Cards stack vertically, swipe navigation
- **Tablet**: 2-column modular grid
- **Desktop**: 3-column adaptive layout with sidebar filters

#### Performance:
- Lazy loading for non-priority modules
- Image optimization for different module types
- Caching strategy for personalization data

### 5. Specific Features to Design

#### Hero Section Adaptation:
- **Tourist**: "Discover Iraq's Hidden Gems" with cultural imagery
- **Local**: "What's Happening Tonight?" with live event feed
- **Business**: "Professional Venues & Events" with corporate aesthetics
- **Explorer**: "Curated Experiences" with diverse content mix

#### Smart Recommendations:
- **"People like you visited..."** - Behavioral clustering
- **"Popular right now in [City]"** - Real-time trending
- **"Perfect for [Time/Weather]"** - Contextual suggestions
- **"Complete your experience"** - Cross-category bundling

#### Interactive Elements:
- **Quick filters bar**: Instantly filter all modules by city/category
- **"Change my experience"**: Manual intent switching
- **Save for later**: Bookmark interesting venues/events
- **Share itinerary**: Export personalized recommendations

### 6. Content Personalization Examples

#### Scenario A: Tourist on Weekend Morning
```
Hero: "Welcome to Iraq - Your Cultural Adventure Awaits"
Modules: 
1. Must-Visit Historical Sites (High Priority)
2. Weekend Cultural Events (High Priority) 
3. Hotels with Check-in Availability (Medium Priority)
4. Authentic Local Restaurants (Medium Priority)
5. Guided Tours & Experiences (Low Priority)
6. Transportation & Services (Low Priority)
```

#### Scenario B: Local on Weekday Evening
```
Hero: "What's Happening in [Your City] Tonight?"
Modules:
1. Tonight's Events Near You (High Priority)
2. Dinner Reservations Available (High Priority)
3. Weekend Plans Suggestions (Medium Priority)
4. New Restaurant Openings (Medium Priority)
5. Community Activities (Low Priority)
6. Local Services (Low Priority)
```

### 7. Design Language Requirements
- **Colors**: Reflect Iraq's cultural palette (desert golds, river blues, cultural greens)
- **Typography**: Support Arabic/Kurdish scripts with proper RTL layout
- **Icons**: Cultural sensitivity for Iraqi context
- **Imagery**: Authentic Iraqi locations and experiences
- **Animations**: Smooth, professional transitions that work on slower connections

### 8. Success Metrics to Design For
- **Engagement**: Time spent exploring modules
- **Conversion**: Click-through to detailed pages
- **Personalization**: Repeat visitor experience improvement
- **Cross-category Discovery**: Users exploring beyond their initial intent

## Output Requirements

Please provide:
1. **Detailed component architecture** with props and state management
2. **Responsive CSS/TailwindCSS classes** for different breakpoints
3. **TypeScript interfaces** for data structures
4. **Integration code** showing how it connects to existing navigation
5. **Example API calls** for fetching modular content
6. **Accessibility considerations** for RTL support and keyboard navigation
7. **Performance optimizations** for module loading and caching

## Technical Constraints
- Must maintain compatibility with existing Next.js app structure
- Should not break current `/events` filter system
- Must support server-side rendering for SEO
- Keep bundle size impact minimal
- Support offline functionality (PWA)

---

**Note**: Focus on creating a system that feels less like a directory and more like a curated, intelligent guide that understands what users need before they ask for it. The goal is to make content discovery feel effortless and contextually relevant.