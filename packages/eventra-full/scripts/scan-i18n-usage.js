#!/usr/bin/env node
/*
  Scan codebase for translation key usages and compare against messages/en.json.
  Looks for:
    - t('key.path') or t("key.path")
    - plural('key.path', ...)

  Usage: node scripts/scan-i18n-usage.js [projectRoot]
*/
const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2] || path.join(__dirname, '..');
const messagesPath = path.join(projectRoot, 'messages', 'en.json');

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

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.vercel',
  'public',
  '_backup',
  'scripts',
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (!IGNORE_DIRS.has(ent.name)) walk(full, files);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name);
      if (EXTENSIONS.has(ext)) files.push(full);
    }
  }
  return files;
}

function extractKeysFromContent(content) {
  const keys = new Set();
  const patterns = [
    /(?:^|[^A-Za-z0-9_])t\(\s*['"]([^'"\)]+)['"]/g,
    /plural\(\s*['"]([^'"\)]+)['"]/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1].trim();
      if (key) keys.add(key);
    }
  }
  return keys;
}

function main() {
  if (!fs.existsSync(messagesPath)) {
    console.error(`Messages file not found: ${messagesPath}`);
    process.exit(1);
  }
  const msg = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  const messageKeys = new Set(Object.keys(flatten(msg)));

  const files = walk(projectRoot);
  const usedKeys = new Set();

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const keys = extractKeysFromContent(content);
      for (const k of keys) usedKeys.add(k);
    } catch (e) {
      // ignore unreadable files
    }
  }

  // Compute diffs
  const usedButMissing = [];
  for (const k of usedKeys) if (!messageKeys.has(k)) usedButMissing.push(k);

  const presentButUnused = [];
  for (const k of messageKeys) if (!usedKeys.has(k)) presentButUnused.push(k);

  const result = {
    counts: {
      usedKeys: usedKeys.size,
      messageKeys: messageKeys.size,
    },
    usedButMissing: usedButMissing.sort(),
    presentButUnused: presentButUnused.sort(),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
