/**
 * Shared types for Eventra multi-version platform
 * Supports both events-only and full-service versions
 */

export type EventraVersion = 'events-only' | 'full-service'

export interface EventraPlatformConfig {
  version: EventraVersion
  features: {
    events: boolean
    hotels: boolean
    restaurants: boolean
    travel: boolean
    packages: boolean
  }
  branding: {
    name: string
    tagline: string
    colors: {
      primary: string
      secondary: string
    }
  }
}

export const EVENTRA_CONFIGS: Record<EventraVersion, EventraPlatformConfig> = {
  'events-only': {
    version: 'events-only',
    features: {
      events: true,
      hotels: false,
      restaurants: false,
      travel: false,
      packages: false
    },
    branding: {
      name: 'Eventra Events',
      tagline: 'Discover Amazing Events in Iraq',
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6'
      }
    }
  },
  'full-service': {
    version: 'full-service',
    features: {
      events: true,
      hotels: true,
      restaurants: true,
      travel: true,
      packages: true
    },
    branding: {
      name: 'Eventra Full',
      tagline: 'Your Complete Experience Platform',
      colors: {
        primary: '#059669',
        secondary: '#DC2626'
      }
    }
  }
}

// Feature flags helper
export const hasFeature = (version: EventraVersion, feature: keyof EventraPlatformConfig['features']): boolean => {
  return EVENTRA_CONFIGS[version].features[feature]
}

// Environment variable helper
export const getCurrentVersion = (): EventraVersion => {
  const envVersion = process.env.EVENTRA_VERSION as EventraVersion
  return envVersion && envVersion in EVENTRA_CONFIGS ? envVersion : 'events-only'
}

export const getCurrentConfig = (): EventraPlatformConfig => {
  return EVENTRA_CONFIGS[getCurrentVersion()]
}