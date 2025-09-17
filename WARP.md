# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Eventra** is a React-based event management SaaS platform targeting the Middle Eastern market, specifically Iraq. The application supports multiple languages (English, Arabic, Kurdish) and focuses on creating a comprehensive event discovery and management experience.

**Tech Stack:**
- React 18 with TypeScript
- Vite for build tooling 
- Vitest for testing
- Google Generative AI integration
- React Hook Form with Zod validation

## Development Commands

### Core Development Workflow
```powershell
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

### Testing
```powershell
# Run tests in watch mode
npm run test

# Run all tests once 
npm run test:run

# Run tests with UI
npm run test:ui
```

### Single Test Execution
```powershell
# Run specific test file
npx vitest run components/EnhancedAuthModal.test.tsx

# Run tests matching pattern
npx vitest run --grep "authentication"
```

## Architecture Overview

### High-Level Structure
The application follows a component-based architecture with clear separation of concerns:

**Core Application Layer (`App.tsx`):**
- State management for user authentication, events, filtering
- Centralized event handlers and data fetching
- Modal state orchestration

**Component Architecture:**
- **Enhanced Components**: Modern, feature-rich components (EnhancedAuthModal, EnhancedFilters, EnhancedCarousel)
- **Legacy Components**: Basic components being phased out
- **Service Layer**: External integrations and business logic

**Data Flow:**
- Events are fetched centrally and filtered through useMemo hooks
- User authentication state flows top-down through component props
- Email verification system uses dedicated service layer

### Key Architectural Patterns

**Multi-Language Support:**
All user-facing strings use `LocalizedString` interface with `en`, `ar`, `ku` properties. Components receive `lang` prop and display appropriate language.

**Pricing Tier System:**
Categories have associated pricing tiers (`free`, `paid`, `premium`) that drive filtering and UI organization.

**Modal Management:**
Complex modal orchestration for authentication flows, event creation, and user profiles with proper state management.

**Service Layer Pattern:**
- `emailService.ts`: Email verification and communication
- `api.ts`: Data fetching and CRUD operations
- `loggingService.ts`: Analytics and error tracking

## Current State & Phase System

The project follows a **6-phase development system** as outlined in `COMPLETE_6_PHASE_SYSTEM.md`:

**Current Status: Phase 2 Completion** (Frontend Excellence)
- ✅ Enhanced authentication with Gmail integration
- ✅ 10-category hierarchical organization system
- ✅ Mobile-optimized responsive design
- ✅ Advanced filtering with pricing tiers

**Phase Implementation Status:**
- Phase 1 (Foundation): Complete - Multi-tenant architecture ready
- Phase 2 (Frontend): Complete - Modern UI/UX implemented
- Phase 3 (AI Features): Planned - Google AI integration scaffolded
- Phase 4 (SaaS Features): Planned - Subscription system design ready
- Phase 5 (Performance): Planned - Production deployment strategy
- Phase 6 (Innovation): Future - Emerging tech integration

## Recent Implementations

### Authentication System (`EnhancedAuthModal.tsx`)
- Two-step Gmail authentication requiring email input first
- Real email verification system with simulated email sending
- Support for traditional email/password authentication
- Multi-factor authentication with 2FA codes

### Enhanced Filtering (`EnhancedFilters.tsx`)
- Hierarchical category organization by pricing tiers
- Integration with 18 Iraqi governorates
- Combined search, category, city, and pricing tier filters
- Mobile-responsive design with touch optimization

### Email Service (`emailService.ts`)
- Simulated email sending for verification flows
- Template-based emails in multiple languages
- Verification code generation and validation
- Resend functionality with code invalidation

## Key Components Deep Dive

### State Management Pattern
The application uses React's built-in state management with strategic use of `useMemo` for performance:

```typescript
// Central filtering logic with performance optimization
const filteredEvents = useMemo(() => {
  return events.filter(event => {
    const matchesCity = !selectedCity || event.cityId === selectedCity;
    const matchesCategory = !selectedCategory || event.categoryId === selectedCategory;
    const matchesPricingTier = !selectedPricingTier || 
      categories.find(cat => cat.id === event.categoryId)?.pricingTier === selectedPricingTier;
    return matchesCity && matchesCategory && matchesPricingTier;
  });
}, [events, selectedCity, selectedCategory, selectedPricingTier, categories]);
```

### Type System
Strong TypeScript integration with comprehensive interfaces:
- `LocalizedString` for multi-language content
- `PricingTier` enum for category organization
- `Event`, `User`, `Category`, `City` core domain models
- `AIAutofillData` for future AI feature integration

### Service Integration Points
- **Google AI**: Configured via `VITE_GEMINI_API_KEY` environment variable
- **Email System**: Mock implementation ready for SendGrid/AWS SES integration
- **Logging**: Event tracking and error logging infrastructure

## Environment & Configuration

### Environment Variables
```
VITE_GEMINI_API_KEY=your_google_ai_api_key
```

### Vite Configuration Highlights
- Path aliases: `@/*` points to root directory
- Google AI process.env mapping for client-side access
- Vitest configuration with jsdom environment
- Global test setup with mocked console methods

### Browser Compatibility
- Target: ES2020
- Modern browsers with ESNext module support
- Mobile-first responsive design for touch devices

## Testing Strategy

### Test Setup
- Jest DOM matchers available globally
- Console methods mocked in test environment
- Window.matchMedia mocked for responsive component testing
- Environment variables mocked for consistent test runs

### Test Patterns
- Component rendering tests for UI components
- Authentication flow testing for user journeys
- Email service testing for verification workflows
- Mobile responsiveness validation

## Development Guidelines

### Component Development
- Use `EnhancedAuthModal.tsx` as reference for modal patterns
- Follow mobile-first responsive design principles
- Implement proper loading states and error handling
- Support multi-language content from the start

### Authentication Integration
- Always use the `EnhancedAuthModal` for new auth features
- Email verification is handled through `emailService`
- User state flows through App.tsx centralised management

### Filtering & Search
- New filters should integrate with the `EnhancedFilters` component
- Use pricing tier system for category-based filtering
- Maintain URL parameter synchronization for filters

### Mobile Optimization
- Minimum 44px touch targets
- CSS scroll behaviors for smooth interactions
- Responsive grid systems (1→2→3→4 columns)
- Touch-optimized carousel navigation

## Future Development Areas

### AI Integration Ready Points
- Google Generative AI service configured
- `AIAutofillData` types defined for event creation assistance
- Service layer architecture ready for AI feature expansion

### SaaS Features Preparation
- Multi-tenant data structure in place
- Pricing tier system foundational for subscription models
- User management system ready for role-based access

### Performance Optimization Targets
- Event filtering optimization with large datasets
- Image loading and caching strategies
- Mobile performance monitoring integration points

## Common Development Tasks

### Adding New Event Categories
1. Update the categories data in `data/mockData.ts`
2. Assign appropriate `pricingTier` (`free`, `paid`, `premium`)
3. Add localized names for all supported languages
4. Ensure category filtering works in `EnhancedFilters.tsx`

### Implementing New Authentication Providers
1. Extend `EnhancedAuthModal.tsx` with new provider button
2. Add provider-specific authentication flow
3. Update `User` interface if additional fields needed
4. Integrate with centralized user state management

### Mobile Responsiveness Testing
1. Test on multiple device sizes in browser dev tools
2. Verify touch target sizes meet 44px minimum
3. Validate smooth scrolling behavior
4. Test filter component stacking on small screens