/**
 * Jest Setup File
 * Global test configuration and setup
 */

// Load test environment configuration first
require('./test-env.js')
require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/en'
  },
  useParams() {
    return {
      locale: 'en'
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  // Avoid JSX here to prevent parser errors; use createElement directly
  default: (props) => {
    const React = require('react')
    return React.createElement('img', props)
  },
}))

// Mock NextAuth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia (only in browser-like env)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  // @ts-ignore
  global.localStorage = localStorageMock
}

// Expose Prisma client used in tests to API routes via globalThis
try {
  const { testPrisma } = require('../setup/test-db')
  // @ts-ignore
  global.prisma = testPrisma
} catch {}

// Mock fetch for API tests
global.fetch = jest.fn()

// Mock console to reduce noise in tests
const originalConsole = global.console
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: (...args) => {
    // Still show errors that might be important
    if (
      args.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('Error:') || arg.includes('Failed'))
      )
    ) {
      originalConsole.error(...args)
    }
  },
}