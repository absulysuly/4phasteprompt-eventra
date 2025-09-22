#!/usr/bin/env node
/*
  Verify language switching behavior by checking:
  1) html[dir] changes for en (ltr), ar (rtl), ku (rtl)
  2) Key UI texts on the events page match locale

  Usage: node scripts/verify-language-switching.js
*/
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

const EXPECT = {
  en: {
    dir: 'ltr',
    title: 'Discover Amazing Events',
    filter: 'All Categories',
  },
  ar: {
    dir: 'rtl',
    title: 'اكتشف الفعاليات المذهلة',
    filter: 'جميع الفئات',
  },
  ku: {
    dir: 'rtl',
    title: 'بۆنه نایابهکان بدۆزهرهوه',
    filter: 'هەموو پۆلەکان',
  }
};

async function checkLocale(page, locale) {
  const url = `${BASE}/${locale}/events`;
  await page.goto(url, { waitUntil: 'networkidle' });

  // Direction
  const dir = await page.getAttribute('html', 'dir');
  const okDir = dir === EXPECT[locale].dir;

  // Title and filter text checks
  const content = await page.textContent('body');
  const okTitle = content.includes(EXPECT[locale].title);
  const okFilter = content.includes(EXPECT[locale].filter);

  return { locale, dir, okDir, okTitle, okFilter };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  for (const lc of ['en', 'ar', 'ku']) {
    results.push(await checkLocale(page, lc));
  }

  await browser.close();

  const summary = {
    results,
    allPassed: results.every(r => r.okDir && r.okTitle && r.okFilter)
  };

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.allPassed ? 0 : 1);
})();
