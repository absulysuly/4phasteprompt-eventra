/* Validate that all translation keys exist across locales.
   Usage: node scripts/validate-i18n.js
*/
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'messages');
const locales = ['en', 'ar', 'ku'];

function readJson(locale) {
  const p = path.join(localesDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = true;
    }
  }
  return out;
}

function main() {
  const maps = {};
  for (const loc of locales) {
    maps[loc] = flatten(readJson(loc));
  }
  const base = maps['en'];
  let ok = true;
  for (const loc of locales) {
    if (loc === 'en') continue;
    const missing = [];
    for (const key of Object.keys(base)) {
      if (!maps[loc][key]) missing.push(key);
    }
    if (missing.length) {
      ok = false;
      console.log(`\n[${loc}] Missing ${missing.length} keys:`);
      for (const m of missing) console.log(' -', m);
    }
  }
  if (ok) {
    console.log('✅ All locales have matching keys.');
    process.exit(0);
  } else {
    console.log('\n❌ Some locales are missing keys. See above.');
    process.exit(1);
  }
}

main();
