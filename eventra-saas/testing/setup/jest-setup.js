// Jest setup file for Eventra SaaS testing
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Next.js modules
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    locale: 'en',
    locales: ['en', 'ar', 'ku'],
    defaultLocale: 'en',
    isReady: true,
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
}));

jest.mock('next/head', () => {
  return function Head({ children }) {
    return children;
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

jest.mock('next/link', () => {
  return function Link({ children, href, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock internationalization
jest.mock('next-intl', () => ({
  useTranslations: (namespace) => (key) => `${namespace}.${key}`,
  useLocale: () => 'en',
  useMessages: () => ({}),
}));

// Mock authentication
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}));

// Environment setup
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock fetch
global.fetch = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods in CI
if (process.env.CI) {
  global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  };
}

// Suppress specific warnings
const originalConsoleWarn = console.warn;
console.warn = (message, ...args) => {
  // Suppress known warnings from libraries
  const ignoredWarnings = [
    'componentWillReceiveProps',
    'componentWillMount',
    'ReactDOM.render is no longer supported',
  ];
  
  if (!ignoredWarnings.some(warning => message?.includes?.(warning))) {
    originalConsoleWarn(message, ...args);
  }
};

// Custom test utilities
global.createMockEvent = (data = {}) => ({
  id: 'event-1',
  title: 'Test Event',
  description: 'Test event description',
  date: new Date('2024-12-25T18:00:00Z'),
  location: 'Baghdad, Iraq',
  price: 25000,
  currency: 'IQD',
  category: 'entertainment',
  image: '/test-event.jpg',
  ...data,
});

global.createMockVenue = (data = {}) => ({
  id: 'venue-1',
  name: 'Test Venue',
  description: 'Test venue description',
  address: 'Test Address, Baghdad',
  capacity: 200,
  amenities: ['parking', 'wifi', 'ac'],
  images: ['/test-venue.jpg'],
  ...data,
});

global.createMockUser = (data = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  locale: 'en',
  preferences: {
    categories: ['entertainment', 'culture'],
    notifications: true,
  },
  ...data,
});

// Test timeout setup
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});

// Import cleanup from testing-library after globals are set up
import { cleanup } from '@testing-library/react';