import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
  vus: 8,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<700']
  }
};

export default function () {
  const base = __ENV.STAGING_URL || 'https://example.com';
  const params = {
    headers: {
      'Accept-Language': 'ar',
      'User-Agent': 'LocalLeyla/1.0 (+https://example.com)'
    }
  };

  // Homepage (RTL + localized)
  let r1 = http.get(base + '/?lang=ar', params);
  check(r1, { 'homepage status 200': (r) => r.status === 200 });
  sleep(Math.random() * 1.5);

  // Events list in Arabic
  let r2 = http.get(base + '/api/events?lang=ar', params);
  check(r2, { 'events status 200': (r) => r.status === 200 });
  sleep(Math.random() * 2);
}
