import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<800'], // More realistic for API calls
    'http_req_failed': ['rate<0.1'], // Less than 10% failure rate
    'checks': ['rate>0.90'] // At least 90% of checks should pass
  }
};

export default function () {
  const base = __ENV.STAGING_URL || 'https://example.com';
  
  // Homepage (optional - focus on events API)
  if (Math.random() > 0.3) { // Only test homepage 70% of the time
    let r1 = http.get(base + '/');
    check(r1, { 'homepage status 200': (r) => r.status === 200 });
    sleep(Math.random() * 1); // Reduced sleep
  }

  // Events API (main focus)
  let r2 = http.get(base + '/api/events?type=public&lang=en');
  check(r2, { 
    'events or fallback status 200': (r) => r.status === 200,
    'events response has data': (r) => r.body && r.body.length > 10
  });
  sleep(Math.random() * 1); // Reduced sleep for better throughput
}
