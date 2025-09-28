// Tourist Tara Simulation - K6 Load Test Script
// Simulates a tourist discovering and booking events in Baghdad
// Usage: k6 run --env BASE_URL=https://staging.yourdomain.com tourist-tara.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const bookingAttempts = new Counter('booking_attempts');

export let options = {
  scenarios: {
    tourist_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: __ENV.RAMP_VUS || 10 }, // Ramp up
        { duration: __ENV.DURATION || '5m', target: __ENV.RAMP_VUS || 10 }, // Stay at load
        { duration: '2m', target: 0 }, // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.05'], // Less than 5% failures
    errors: ['rate<0.1'], // Less than 10% business logic errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Simulate realistic user behavior patterns
const SEARCH_TERMS = [
  'weekend events Baghdad',
  'family activities',
  'restaurants near me',
  'cultural events',
  'music concerts'
];

const CATEGORIES = ['events', 'restaurants', 'activities', 'venues'];

export function setup() {
  console.log(`Starting Tourist Tara simulation against ${BASE_URL}`);
  
  // Verify the homepage is accessible
  let response = http.get(`${BASE_URL}`);
  if (response.status !== 200) {
    throw new Error(`Homepage not accessible: ${response.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

export default function(data) {
  // Tourist Tara's journey: Discovery → Comparison → Booking
  
  // 1. Land on homepage (mobile user agent)
  let headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    'Accept-Language': 'en-US,en;q=0.9',
  };
  
  let homepage = http.get(`${data.baseUrl}`, { headers });
  
  let homepageCheck = check(homepage, {
    'homepage loads': (r) => r.status === 200,
    'homepage has events': (r) => r.body.includes('event') || r.body.includes('Event'),
    'homepage loads fast': (r) => r.timings.duration < 3000,
  });
  
  if (!homepageCheck) {
    errorRate.add(1);
    return;
  }
  
  sleep(2 + Math.random() * 3); // 2-5 seconds reading homepage
  
  // 2. Search for events (typical tourist behavior)
  const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  let searchResponse = http.get(`${data.baseUrl}/search?q=${encodeURIComponent(searchTerm)}`, { headers });
  
  check(searchResponse, {
    'search returns results': (r) => r.status === 200,
    'search has content': (r) => r.body.length > 1000,
  }) || errorRate.add(1);
  
  sleep(1 + Math.random() * 2); // 1-3 seconds reviewing search results
  
  // 3. Browse category (alternative discovery path)
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  let categoryResponse = http.get(`${data.baseUrl}/${category}`, { headers });
  
  check(categoryResponse, {
    'category page loads': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  sleep(1 + Math.random() * 2);
  
  // 4. View event details (tourist compares 2-3 options)
  const comparisons = 2 + Math.floor(Math.random() * 2); // 2-3 events
  
  for (let i = 0; i < comparisons; i++) {
    // Simulate clicking on an event (use mock event ID)
    const eventId = 100 + Math.floor(Math.random() * 50);
    let eventDetails = http.get(`${data.baseUrl}/events/${eventId}`, { headers });
    
    check(eventDetails, {
      'event details load': (r) => r.status === 200 || r.status === 404, // 404 OK for mock IDs
    });
    
    sleep(3 + Math.random() * 5); // 3-8 seconds reading event details
  }
  
  // 5. Attempt booking (30% of tourists actually book)
  if (Math.random() < 0.3) {
    bookingAttempts.add(1);
    
    // Check if booking flow exists (might be protected)
    let bookingPage = http.get(`${data.baseUrl}/booking`, { headers });
    
    check(bookingPage, {
      'booking page accessible': (r) => r.status === 200 || r.status === 401, // Auth might be required
    });
    
    // Don't complete actual booking in load test
    sleep(5 + Math.random() * 10); // 5-15 seconds on booking page
  }
  
  // 6. Share event (social behavior)
  if (Math.random() < 0.2) { // 20% share events
    // Simulate share API call or page
    let shareResponse = http.get(`${data.baseUrl}/share/event/123`, { headers });
    check(shareResponse, {
      'share functionality works': (r) => r.status < 500,
    });
  }
}

export function teardown(data) {
  console.log('Tourist Tara simulation completed');
}

// Helper function for realistic mobile behavior
function mobileThinkTime() {
  return 1 + Math.random() * 3; // Mobile users need 1-4 seconds between actions
}