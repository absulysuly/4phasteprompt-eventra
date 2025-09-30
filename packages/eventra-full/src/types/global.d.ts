declare global {
  interface Window {
    trackEvent?: (eventName: string, properties?: Record<string, any>) => void;
  }
}

export {};