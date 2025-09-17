import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    ...process.env,
    VITE_GEMINI_API_KEY: 'test-api-key',
  },
});

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock window.matchMedia (often needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});