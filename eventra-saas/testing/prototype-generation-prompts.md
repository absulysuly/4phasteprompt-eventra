# Prototype Generation Prompts for Eventra SaaS

## Event Management Component Variations

### 1. Event Card Layout Variations
```
Generate 3 distinct event card layouts for the Eventra platform:

Context: Eventra is a travel and entertainment platform for Iraq & Kurdistan featuring events, hotels, restaurants, and activities.

Requirements:
- Display: event title, date, location, price, image
- Support: Arabic/Kurdish RTL and English LTR text
- Include: booking CTA, favorite button, share option
- Style variations: minimal, rich media, compact list

Target personas: Local families, tourists, business travelers

Output format: React/TypeScript components with Tailwind CSS
```

### 2. Event Discovery Flow Variations
```
Create 3 different event discovery user flows:

Scenario: User wants to find family-friendly events in Baghdad this weekend

Flow variations:
1. Search-first: Prominent search bar with filters
2. Category-first: Visual category tiles leading to filtered results
3. Recommendation-first: AI-powered suggestions based on user preferences

For each flow, include:
- Entry point wireframes
- User journey steps (3-5 screens max)
- Decision points and fallback options
- Success metrics to track

Consider cultural context and local user behavior patterns.
```

### 3. Multi-language Event Creation Forms
```
Design event creation forms optimized for different user types:

User types:
- Venue managers (tech-savvy, bulk operations)
- Individual hosts (occasional use, simple needs)  
- Event companies (professional features, analytics)

For each type, generate:
- Form field variations and progressive disclosure
- Validation patterns for Arabic/Kurdish/English content
- Image upload flows with local CDN optimization
- Preview modes showing public event listing

Include accessibility considerations for low-bandwidth areas.
```

## Booking System Variations

### 4. Checkout Process Prototypes
```
Generate 3 checkout flow variations for Eventra bookings:

Payment context: Iraq/Kurdistan market with mixed digital adoption
Methods: Mobile wallets, bank transfers, cash on delivery, international cards

Variations:
1. Express checkout (returning users, saved payment)
2. Guest checkout (first-time users, minimal friction)  
3. Group booking (multiple tickets, different attendees)

For each variation:
- Form layouts with field validation
- Payment method selection UI
- Confirmation and ticket delivery options
- Error states and recovery flows

Consider: Currency display (IQD), tax calculations, refund policies
```

### 5. Ticket Management Dashboard
```
Create ticket management interfaces for different user roles:

Roles:
- End users (view tickets, share, request refunds)
- Event organizers (scan tickets, check attendance, analytics)
- Venue staff (door control, capacity management)

Generate:
- Dashboard layouts with relevant actions
- QR code display and scanning interfaces  
- Real-time attendance tracking
- Mobile-first designs for on-site usage

Include offline capabilities for areas with poor connectivity.
```

## Venue Discovery & Booking

### 6. Venue Comparison Views
```
Design venue comparison interfaces for different booking types:

Booking types:
- Wedding venues (capacity, catering, decoration options)
- Corporate events (AV equipment, parking, accessibility)
- Restaurants (cuisine, ambiance, group size flexibility)

For each type:
- Comparison table layouts
- Filter and sort options
- Photo galleries and virtual tours
- Pricing calculators with packages

Optimize for mobile viewing and quick decision-making.
```

### 7. Availability Calendar Variations
```
Create calendar interfaces for venue availability:

Calendar types:
1. Month view (overview planning, multiple venues)
2. Week view (detailed scheduling, time slots)
3. Timeline view (multi-venue comparison, duration planning)

Features to include:
- Booking conflicts and partial availability
- Pricing variations by time/date
- Bulk booking options
- Integration with external calendars

Consider Islamic calendar events and local holidays.
```

## User Onboarding & Engagement

### 8. Personalization Flow Prototypes
```
Generate onboarding flows that capture user preferences:

User segments:
- Tourists (short-term, discovery-focused)
- Locals (regular use, community-focused)
- Event planners (business use, efficiency-focused)

For each segment:
- Preference capture screens (interests, budget, frequency)
- Location and notification permissions
- Social connections and friend finding
- Tutorial flows for key features

Minimize steps while maximizing personalization value.
```

### 9. Social Features Variations
```
Design social interaction patterns for Eventra:

Social features:
- Event reviews and ratings
- Photo sharing from events
- Friend recommendations and event sharing
- Community groups by interest/location

Variations:
1. Privacy-focused (minimal social exposure)
2. Community-driven (high engagement, sharing)
3. Professional networking (business connections)

Include cultural considerations for social interaction preferences.
```

## Admin & Analytics Dashboards

### 10. Event Performance Analytics
```
Create analytics dashboard variations for event organizers:

Dashboard types:
1. Overview dashboard (key metrics, quick insights)
2. Detailed analytics (conversion funnels, user behavior)
3. Comparative analysis (event performance comparison)

Metrics to visualize:
- Booking conversion rates
- Revenue tracking
- Attendance patterns
- User engagement scores
- Geographic distribution

Design for both desktop analysis and mobile monitoring.
```

## Mobile App Variations

### 11. Navigation Pattern Prototypes
```
Generate mobile navigation variations for Eventra app:

Navigation styles:
1. Bottom tab bar (standard iOS/Android patterns)
2. Hamburger menu (content-focused, more space)
3. Gesture-based (modern, minimal UI)

Considerations:
- One-handed usage patterns
- RTL layout support
- Accessibility for different age groups
- Integration with device features (maps, calendar, camera)

Test with different screen sizes and orientations.
```

### 12. Offline Experience Designs
```
Design offline-capable features for areas with poor connectivity:

Offline scenarios:
- Viewing booked events and tickets
- Browsing cached event listings
- Basic venue information access
- Emergency contact information

Create:
- Offline state indicators
- Data synchronization patterns
- Progressive enhancement approaches
- Cache management interfaces

Consider data usage limitations and storage constraints.
```

## Accessibility & Inclusive Design

### 13. Accessibility-First Prototypes
```
Generate accessible design variations for key Eventra features:

Accessibility focuses:
- Visual impairments (screen reader optimization, high contrast)
- Motor disabilities (large touch targets, voice navigation)
- Cognitive differences (simplified flows, clear language)
- Temporary disabilities (one-handed use, noisy environments)

For each focus:
- Interface adaptations
- Alternative interaction methods
- Content structure improvements
- Testing scenarios with assistive technology
```

### 14. Cultural Adaptation Prototypes
```
Create culturally adapted interface variations:

Cultural considerations:
- Religious event filtering and timing
- Family vs. individual booking patterns
- Gender-specific event sections
- Local payment and communication preferences

Generate:
- Layout adaptations for cultural norms
- Content organization patterns
- User flow modifications
- Visual design cultural cues

Include feedback loops for community input and refinement.
```

## Performance & Technical Variations

### 15. Progressive Web App Features
```
Design PWA-specific features and variations:

PWA capabilities:
- Offline event browsing and ticket access
- Push notifications for event reminders
- Home screen installation prompts
- Background sync for bookings

Create variations for:
- Installation onboarding flows
- Notification permission requests
- Offline/online state management
- App update and cache management

Optimize for low-end devices and slow networks.
```

## Usage Instructions

### How to Use These Prompts:

1. **Select relevant prompts** based on your current development priorities
2. **Customize context** with specific Eventra requirements
3. **Run through AI tools** (ChatGPT, Claude, etc.) for initial concepts
4. **Iterate with feedback** from your target users
5. **Document variations** for A/B testing

### Evaluation Criteria:

For each generated prototype, assess:
- **User experience quality** (intuitive, efficient, delightful)
- **Technical feasibility** (implementation complexity, performance)
- **Cultural appropriateness** (local context, accessibility)
- **Business impact** (conversion rates, engagement, retention)
- **Scalability** (works across user segments and growth)

### Integration with Development:

- Use prototypes for **design system development**
- Create **component libraries** from successful variations
- Implement **A/B testing** for competing approaches
- Build **user feedback loops** for continuous improvement
- Document **design decisions** and rationale