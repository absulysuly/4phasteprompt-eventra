#!/usr/bin/env node
/*
  Click-driven test to verify client-side language switching without page refresh.
  Steps:
  - Open /events (will redirect to default localized route by middleware)
  - Ensure initial locale (ar) dir and text
  - Set a window marker to detect reloads
  - Open desktop language switcher and click English
  - Verify: dir=ltr, English text present, URL unchanged (no route change), marker intact (no reload)
  - Click Kurdish
  - Verify: dir=rtl, Kurdish text present, URL unchanged, marker intact
*/
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Use mobile viewport to exercise the mobile language switcher (no hover dependency)
  const page = await browser.newPage({ viewport: { width: 390, height: 800 } });

  // Start at the generic route; middleware should redirect to best locale
  await page.goto(`${BASE}/events`, { waitUntil: 'networkidle' });

  // Track current URL after any redirect
  const startUrl = page.url();

  // Expect Arabic by default (rtl)
  let dir = await page.getAttribute('html', 'dir');
  let body = await page.textContent('body');
  const arOk = dir === 'rtl' && body.includes('اكتشف الفعاليات المذهلة');

  // Place a marker to ensure no reload occurs
  const marker = Math.random().toString(36).slice(2);
  await page.evaluate(m => { window.__marker = m; }, marker);

  // Open mobile menu
  await page.click('[data-testid="mobile-menu-toggle"]');
  // Click English on mobile
  await page.click('[data-testid="lang-en-mobile"]');

  // Verify LTR + English text present, URL unchanged, marker intact
  dir = await page.getAttribute('html', 'dir');
  body = await page.textContent('body');
  const urlAfterEn = page.url();
  const markerAfterEn = await page.evaluate(() => window.__marker);

  const enOk = dir === 'ltr' && body.includes('Discover Amazing Events') && urlAfterEn === startUrl && markerAfterEn === marker;

  // Open mobile menu again and switch to Kurdish
  await page.click('[data-testid="mobile-menu-toggle"]');
  await page.click('[data-testid="lang-ku-mobile"]');

  // Verify RTL + Kurdish text present, URL unchanged, marker intact
  dir = await page.getAttribute('html', 'dir');
  body = await page.textContent('body');
  const urlAfterKu = page.url();
  const markerAfterKu = await page.evaluate(() => window.__marker);

  const kuOk = dir === 'rtl' && body.includes('بۆنه نایابهکان بدۆزهرهوه') && urlAfterKu === startUrl && markerAfterKu === marker;

  await browser.close();

  const summary = {
    initialArabicOk: arOk,
    switchedToEnglishOk: enOk,
    switchedToKurdishOk: kuOk,
    passed: arOk && enOk && kuOk
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.passed ? 0 : 1);
})();
