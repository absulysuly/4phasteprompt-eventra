
export const loggingService = {
  /**
   * Tracks a user interaction or significant event in the application.
   * In a real application, this would send data to an analytics service
   * like Google Analytics, Mixpanel, or a custom logging backend.
   *
   * @param {string} eventName - The name of the event (e.g., 'login_success', 'open_event_modal').
   * @param {any} [data] - Optional data associated with the event.
   */
  trackEvent: (eventName: string, data?: any) => {
    console.log(`[TRACKING EVENT]: ${eventName}`, data || '');
  },

  /**
   * Logs an error to the console and, in a real application, would send
   * it to an error tracking service like Sentry, Bugsnag, or Datadog.
   *
   * @param {Error} error - The error object that was caught.
   * @param {any} [context] - Optional context or additional info about the error's circumstances.
   */
  logError: (error: Error, context?: any) => {
    console.error('[LOGGED ERROR]:', error);
    if (context) {
      console.error('[ERROR CONTEXT]:', context);
    }
  }
};
