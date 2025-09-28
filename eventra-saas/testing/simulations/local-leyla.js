// Local Leyla Simulation - K6 Load Test Script
// Simulates a local user browsing family events, Arabic RTL interface
// Usage: k6 run --env BASE_URL=https://staging.yourdomain.com local-leyla.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend } from 'k6/metrics';

// Custom metrics for local user behavior
const favoriteActions = new Counter('favorite_actions');
const familyEventViews = new Counter('family_event_views');
const sessionDuration = new Trend('session_duration');

export let options = {
  scenarios: {
    local_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: __ENV.RAMP_VUS || 15 }, // Ramp up
        { duration: __ENV.DURATION || '8m', target: __ENV.RAMP_VUS || 15 }, // Peak local usage
        { duration: '1m', target: 0 }, // Ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'], // Locals more patient, 3s threshold
    http_req_failed: ['rate<0.03'], // Lower failure tolerance
    session_duration: ['p(90)<300000'], // 5 minute max sessions
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Local search terms in Arabic transliteration and English
const LOCAL_SEARCH_TERMS = [
  'family events',
  'kids activities',
  'weekend plans',
  'restaurant family',
  'حفلات عائلية', // family parties
  'أنشطة أطفال', // children activities
];

const FAMILY_CATEGORIES = ['events', 'restaurants', 'activities'];

export function setup() {
  console.log(`Starting Local Leyla simulation (Arabic RTL user)`);
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const sessionStart = new Date().getTime();
  
  // Local Leyla's journey: Browse → Favorite → Plan for Later
  
  // 1. Homepage with Arabic preference
  let headers = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36',
    'Accept-Language': 'ar-IQ,ar;q=0.9,en;q=0.8', // Arabic (Iraq) preferred
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };
  
  let homepage = http.get(`${data.baseUrl}?locale=ar`, { headers });
  
  let pageCheck = check(homepage, {
    'homepage loads with Arabic': (r) => r.status === 200,
    'RTL content present': (r) => r.body.includes('dir="rtl"') || r.body.includes('direction: rtl'),
    'family content visible': (r) => r.body.toLowerCase().includes('family') || r.body.includes('عائل'),
  });
  
  if (!pageCheck) {
    return;
  }
  
  sleep(3 + Math.random() * 4); // Locals read more thoroughly
  
  // 2. Search for family-friendly events
  const searchTerm = LOCAL_SEARCH_TERMS[Math.floor(Math.random() * LOCAL_SEARCH_TERMS.length)];
  let searchUrl = `${data.baseUrl}/search?q=${encodeURIComponent(searchTerm)}&locale=ar`;
  let searchResponse = http.get(searchUrl, { headers });
  
  check(searchResponse, {
    'family search works': (r) => r.status === 200,
    'search results not empty': (r) => r.body.length > 500,
  });
  
  sleep(2 + Math.random() * 3); // Review search results
  
  // 3. Browse multiple family events (locals are thorough)
  const eventsToView = 3 + Math.floor(Math.random() * 3); // 3-5 events
  
  for (let i = 0; i < eventsToView; i++) {
    const eventId = 200 + Math.floor(Math.random() * 100);
    let eventDetails = http.get(`${data.baseUrl}/events/${eventId}?locale=ar`, { headers });
    
    if (check(eventDetails, { 'event loads': (r) => r.status === 200 })) {
      familyEventViews.add(1);
    }
    
    sleep(4 + Math.random() * 6); // Locals spend more time reading details
    
    // 4. Add to favorites (60% likelihood for locals)
    if (Math.random() < 0.6) {
      let favoriteResponse = http.post(`${data.baseUrl}/api/favorites`, 
        JSON.stringify({ eventId: eventId }),
        { 
          headers: { 
            ...headers, 
            'Content-Type': 'application/json',
            // Note: In real app, would need auth token
          } 
        }
      );
      
      if (check(favoriteResponse, { 
        'favorite action attempted': (r) => r.status < 500 
      })) {
        favoriteActions.add(1);
      }
    }
  }
  
  // 5. Check venue details (locals plan ahead)
  if (Math.random() < 0.7) { // 70% check venue details
    const venueId = 50 + Math.floor(Math.random() * 30);
    let venueResponse = http.get(`${data.baseUrl}/venues/${venueId}?locale=ar`, { headers });
    
    check(venueResponse, {
      'venue details accessible': (r) => r.status === 200 || r.status === 404,
    });
    
    sleep(3 + Math.random() * 5); // Check location, facilities, etc.
  }
  
  // 6. Browse restaurant options (family dining)
  if (Math.random() < 0.5) { // 50% browse restaurants
    let restaurantResponse = http.get(`${data.baseUrl}/restaurants?family=true&locale=ar`, { headers });
    
    check(restaurantResponse, {
      'family restaurants load': (r) => r.status === 200,
    });
    
    sleep(2 + Math.random() * 4);
  }
  
  // 7. Check saved items/profile (returning user behavior)
  if (Math.random() < 0.4) { // 40% check their profile
    let profileResponse = http.get(`${data.baseUrl}/profile?locale=ar`, { headers });
    
    check(profileResponse, {
      'profile page attempted': (r) => r.status === 200 || r.status === 401,
    });
  }
  
  // Calculate session duration
  const sessionEnd = new Date().getTime();
  sessionDuration.add(sessionEnd - sessionStart);
}

export function teardown(data) {
  console.log('Local Leyla simulation completed');
  console.log('Locals typically have longer, more engaged sessions');
}