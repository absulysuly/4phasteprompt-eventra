/*
  Lightweight analytics client with batching + retry/backoff.
  Emits JSON payloads to /api/track. Safe for poor networks (queues while offline).
*/

export type AnalyticsEventName =
  | "PageView"
  | "Click"
  | "CityScrollerImpression"
  | "CityScrollerSnap"
  | "CityScrollerSelect"
  | "CardImpression"
  | "DeepLinkOpen"
  | "Search"
  | "CTA"
  | "Error";

export interface AnalyticsEvent<T = any> {
  name: AnalyticsEventName;
  payload: T & { timestamp?: number; session_id?: string };
}

// Config
const ENDPOINT = 
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_TRACK_ENDPOINT) || 
  "/api/track";
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 3000;
const MAX_RETRY = 5;

// Internal queue
const queue: AnalyticsEvent[] = [];
let flushing = false;
let retryCount = 0;
let flushTimer: any = null;

function getSessionId(): string {
  try {
    const key = "__session_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, FLUSH_INTERVAL_MS);
}

export function track<T = any>(name: AnalyticsEventName, payload: T) {
  const event: AnalyticsEvent = {
    name,
    payload: {
      ...(payload as any),
      timestamp: Date.now(),
      session_id: getSessionId(),
    },
  };
  queue.push(event);
  if (queue.length >= BATCH_SIZE) {
    void flush();
  } else {
    scheduleFlush();
  }
}

async function flush() {
  if (flushing || queue.length === 0) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    scheduleFlush();
    return; // retry when back online
  }
  flushing = true;
  const batch = queue.splice(0, BATCH_SIZE);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: batch }),
      keepalive: true, // try to deliver even on page unload
    });
    if (!res.ok) throw new Error(`Track failed: ${res.status}`);
    retryCount = 0; // success
  } catch (err) {
    // re-queue at the front
    queue.unshift(...batch);
    retryCount = Math.min(MAX_RETRY, retryCount + 1);
    const backoff = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
    setTimeout(() => void flush(), backoff);
  } finally {
    flushing = false;
    if (queue.length > 0) scheduleFlush();
  }
}

// Convenience wrappers with schemas
export function trackPageView(data: { page_name: string; url: string; language?: string; city_id?: string | null }) {
  track("PageView", data);
}

export function trackClick(data: { element_name: string; element_type: string; page_name: string; destination?: string }) {
  track("Click", data);
}

export function trackCityScrollerImpression(data: { city_list: string[]; timestamp?: number }) {
  track("CityScrollerImpression", data);
}

export function trackCityScrollerSnap(data: { city_id: string; previous_city_id?: string | null }) {
  track("CityScrollerSnap", data);
}

export function trackCityScrollerSelect(data: { city_id: string; user_id?: string | null; entry_source?: string }) {
  track("CityScrollerSelect", data);
}

export function trackCardImpression(data: { entity_type: string; entity_id: string; position: number }) {
  track("CardImpression", data);
}

export function trackDeepLinkOpen(data: { entity_type: string; entity_id: string; referrer?: string | null }) {
  track("DeepLinkOpen", data);
}

export function trackSearch(data: { query: string; filters?: Record<string, any>; result_count?: number }) {
  track("Search", data);
}

export function trackCTA(data: { cta_name: string; cta_result: "success" | "fail"; entity_id?: string }) {
  track("CTA", data);
}

export function trackError(data: { error_type: string; stack?: string; user_action?: string }) {
  track("Error", data);
}

// Auto flush before unload when possible
if (typeof window !== 'undefined') {
  const handler = () => {
    if (queue.length > 0) {
      navigator.sendBeacon?.(ENDPOINT, JSON.stringify({ events: queue }));
    }
  };
  window.addEventListener('beforeunload', handler);
}