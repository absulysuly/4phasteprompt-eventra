#!/usr/bin/env node
/*
 Full multilingual routing and language switching verification with screenshots.
 Outputs artifacts to artifacts/i18n/.
*/
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUTDIR = path.join(__dirname, '..', 'artifacts', 'i18n');
fs.mkdirSync(OUTDIR, { recursive: true });

async function save(page, name) {
  await page.screenshot({ path: path.join(OUTDIR, name), fullPage: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });

  const results = { route: {}, switch: {}, rtl_ltr: {}, nav_preserve: {} };

  // 1) Route Accessibility Test
  await page.goto(`${BASE}/ar/events`, { waitUntil: 'networkidle' });
  let dir = await page.getAttribute('html', 'dir');
  let body = await page.textContent('body');
  results.route.ar_events = { dir, hasArabic: body.includes('اكتشف الفعاليات المذهلة') };
  await save(page, 'route_ar_events.png');

  await page.goto(`${BASE}/ku/events`, { waitUntil: 'networkidle' });
  dir = await page.getAttribute('html', 'dir');
  body = await page.textContent('body');
  results.route.ku_events = { dir, hasKurdish: body.includes('بۆنه نایابهکان بدۆزهرهوه') };
  await save(page, 'route_ku_events.png');

  await page.goto(`${BASE}/events`, { waitUntil: 'networkidle' });
  const urlAfterEvents = page.url();
  results.route.events_redirect = { url: urlAfterEvents };
  await save(page, 'route_events_redirect.png');

  await page.goto(`${BASE}/event/sample-id`, { waitUntil: 'load' });
  const urlAfterEvent = page.url();
  results.route.event_redirect = { url: urlAfterEvent };
  await save(page, 'route_event_redirect.png');

  // 2) Language Switching Test (homepage)
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const startUrl = page.url();
  const marker = Math.random().toString(36).slice(2);
  await page.evaluate(m => { window.__marker = m; }, marker);
  await save(page, 'switch_home_before.png');

  // Use desktop language switcher (hover + click EN)
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.hover('[data-testid=\"language-switcher\"]');
  await page.waitForSelector('[data-testid=\"lang-en-option\"]', { timeout: 5000 });
  await page.click('[data-testid=\"lang-en-option\"]');
  dir = await page.getAttribute('html', 'dir');
  const lang = await page.getAttribute('html', 'lang');
  body = await page.textContent('body');
  const urlAfterEn = page.url();
  const markerAfterEn = await page.evaluate(() => window.__marker);
  results.switch.home_to_en = {
    dir, lang,
    noRefresh: markerAfterEn === marker,
    url: urlAfterEn,
    englishText: body.includes('Discover Amazing Events') || body.includes('Explore Categories')
  };
  await save(page, 'switch_home_en.png');

  // Switch to Arabic (desktop)
  await page.hover('[data-testid=\"language-switcher\"]');
  await page.click('text=العربية');
  dir = await page.getAttribute('html', 'dir');
  const langAr = await page.getAttribute('html', 'lang');
  body = await page.textContent('body');
  const markerAfterAr = await page.evaluate(() => window.__marker);
  results.switch.home_to_ar = {
    dir, lang: langAr,
    noRefresh: markerAfterAr === marker,
    arabicText: body.includes('اكتشف الفعاليات المذهلة') || body.includes('استكشف الأقسام')
  };
  await save(page, 'switch_home_ar.png');

  // Switch to Kurdish (desktop)
  await page.hover('[data-testid=\"language-switcher\"]');
  await page.click('text=کوردی');
  dir = await page.getAttribute('html', 'dir');
  const langKu = await page.getAttribute('html', 'lang');
  body = await page.textContent('body');
  const markerAfterKu = await page.evaluate(() => window.__marker);
  results.switch.home_to_ku = {
    dir, lang: langKu,
    noRefresh: markerAfterKu === marker,
    kurdishText: body.includes('بۆنە نایابەکان') || body.includes('پۆلەکان بگەڕێ') || body.includes('بۆنە نایابهکان بدۆزهرهوه')
  };
  await save(page, 'switch_home_ku.png');

  // 3) RTL/LTR Specific Tests
  // Text alignment flip on events page wrapper
  await page.goto(`${BASE}/ar/events`, { waitUntil: 'networkidle' });
  const alignAr = await page.evaluate(() => {
    const el = document.querySelector('div[class*="text-right"]') || document.body;
    return getComputedStyle(el).textAlign;
  });
  await save(page, 'rtl_ltr_ar_events.png');

  await page.goto(`${BASE}/en/events`, { waitUntil: 'networkidle' });
  const alignEn = await page.evaluate(() => {
    const el = document.querySelector('div[class*="text-left"]') || document.body;
    return getComputedStyle(el).textAlign;
  });
  await save(page, 'rtl_ltr_en_events.png');

  // Form element direction on login input
  await page.goto(`${BASE}/ar/login`, { waitUntil: 'networkidle' });
  const dirInputAr = await page.evaluate(() => {
    const el = document.querySelector('input#email');
    return el ? getComputedStyle(el).direction : null;
  });
  await save(page, 'rtl_login_ar.png');

  await page.goto(`${BASE}/en/login`, { waitUntil: 'networkidle' });
  const dirInputEn = await page.evaluate(() => {
    const el = document.querySelector('input#email');
    return el ? getComputedStyle(el).direction : null;
  });
  await save(page, 'ltr_login_en.png');

  results.rtl_ltr = { alignAr, alignEn, dirInputAr, dirInputEn };

  // 4) Navigation Preservation Test
  await page.goto(`${BASE}/ar/events`, { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 390, height: 800 });
  await page.click('[data-testid=\"mobile-menu-toggle\"]');
  await page.waitForSelector('[data-testid=\"lang-en-mobile\"]', { timeout: 5000 });
  await page.click('[data-testid=\"lang-en-mobile\"]');
  const urlAfterPreserveEn = page.url();
  await save(page, 'nav_preserve_en.png');

  await page.goto(`${BASE}/ar/event/sample-id`, { waitUntil: 'load' });
  await page.click('[data-testid=\"mobile-menu-toggle\"]');
  await page.waitForSelector('[data-testid=\"lang-ku-mobile\"]', { timeout: 5000 });
  await page.click('[data-testid=\"lang-ku-mobile\"]');
  const urlAfterPreserveKu = page.url();
  await save(page, 'nav_preserve_ku.png');

  results.nav_preserve = {
    from_ar_events_to_en: urlAfterPreserveEn,
    from_ar_event_to_ku: urlAfterPreserveKu
  };

  await browser.close();

  fs.writeFileSync(path.join(OUTDIR, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ ok: true, artifacts: OUTDIR, results }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
