/*
  Convert a Google Sheets CSV (or local CSV) into public/data/events.json
  for a safe, DB-less deployment (served when NEXT_PUBLIC_EVENTS_STATIC=1).

  Usage:
    npx tsx scripts/csv-to-events-json.ts --url "https://docs.google.com/spreadsheets/d/FILE_ID/export?format=csv"
    npx tsx scripts/csv-to-events-json.ts --file "./data/events.csv"

  Spreadsheet columns supported (best-effort):
    - City
    - Event title
    - Category
    - Date(s) & time
    - Venue (full address)
    - Organizer / contact
    - Short description
    - Ticket / price / booking link
    - Source URL(s)
    - Confidence flag

  The output JSON array uses the same fields used by the UI and /api/events static mode:
    id, publicId, date, category, imageUrl, whatsappGroup, whatsappPhone, contactMethod, city, user, title, description, location
*/

import { parse as parseCsv } from 'csv-parse/sync';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

function log(msg: string) { process.stdout.write(`[csv2json] ${msg}\n`); }

function normalizeHeader(h: string): string {
  return (h || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .trim();
}

function pick(row: Record<string, any>, candidates: string[]): string {
  for (const c of candidates) {
    const norm = normalizeHeader(c);
    for (const key in row) {
      if (normalizeHeader(key) === norm) {
        const v = row[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
      }
    }
  }
  return '';
}

function classifyCategory(rawTitle: string, rawCategory: string): { key: string, display: string } {
  const text = `${rawTitle} ${rawCategory}`.toLowerCase();
  const hit = (words: string[]) => words.some(w => text.includes(w));
  if (hit(['music','concert','festival','dj','band','song'])) return { key: 'music', display: 'Music & Concerts' };
  if (hit(['sport','football','soccer','basketball','match','marathon','fitness'])) return { key: 'sports', display: 'Sports & Fitness' };
  if (hit(['food','restaurant','cafe','dinner','kitchen','cook','culinary','taste'])) return { key: 'food', display: 'Food & Drink' };
  if (hit(['business','startup','marketing','finance','sales','leadership','workshop'])) return { key: 'business', display: 'Business' };
  if (hit(['tech','technology','developer','program','coding','ai','ml','data','innovation'])) return { key: 'tech', display: 'Technology & Innovation' };
  if (hit(['art','gallery','exhibit','painting','sculpture','museum','culture'])) return { key: 'art', display: 'Arts & Culture' };
  if (hit(['health','medical','clinic','wellness','yoga','mental'])) return { key: 'health', display: 'Health & Wellness' };
  if (hit(['community','volunteer','meetup','social','charity','youth','family'])) return { key: 'community', display: 'Community & Social' };
  return { key: 'general', display: 'Community & Social' };
}

function placeholderImage(type: string = 'general', width = 1200, height = 630) {
  const base: Record<string, string> = {
    tech: `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    music: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    business: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    art: `https://images.unsplash.com/photo-1549490349-8643362247b5?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    food: `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    sports: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    health: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    community: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    general: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
  };
  return base[type] || base.general;
}

function parseDateField(row: Record<string, any>): string | null {
  // Try various date headers used by the sheet
  const candidates = [
    'date(s)_&_time', // normalized "Date(s) & time"
    'datetime', 'date_time', 'date_and_time', 'date', 'event_date'
  ];
  let raw = '';
  for (const c of candidates) {
    for (const key in row) {
      if (normalizeHeader(key) === c) { raw = String(row[key] || '').trim(); break; }
    }
    if (raw) break;
  }
  if (!raw) return null;
  // Basic parse; if includes ranges, take first date-like segment
  const firstPart = raw.split(/[–—-]|to/i)[0].trim();
  const parsed = new Date(firstPart);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

async function main() {
  const args = process.argv.slice(2);
  let src = '';
  let isUrl = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i+1]) { src = args[i+1]; isUrl = true; i++; }
    else if (args[i] === '--file' && args[i+1]) { src = args[i+1]; isUrl = false; i++; }
  }
  if (!src) {
    log('Provide --url <csv_url> or --file <path>');
    process.exit(1);
  }

  let csvText = '';
  if (isUrl) {
    log(`Fetching CSV: ${src}`);
    const res = await fetch(src);
    if (!res.ok) { throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`); }
    csvText = await res.text();
  } else {
    const absolute = path.isAbsolute(src) ? src : path.join(process.cwd(), src);
    log(`Reading CSV file: ${absolute}`);
    csvText = await readFile(absolute, 'utf8');
  }

  const rows = parseCsv(csvText, { columns: true, skip_empty_lines: true, bom: true, relax_quotes: true, trim: true }) as Record<string, any>[];
  log(`Rows parsed: ${rows.length}`);

  const out: any[] = [];
  for (const row of rows) {
    const city = pick(row, ['City','city']);
    const title = pick(row, ['Event title','title','event_title']);
    const categoryIn = pick(row, ['Category','category']);
    const dateIso = parseDateField(row);
    const location = pick(row, ['Venue (full address)','venue (full address)','venue_full_address','venue','address','location']);
    const organizer = pick(row, ['Organizer / contact','organizer_contact','organizer','contact']);
    const description = pick(row, ['Short description','short_description','description','details','about']);
    const ticket = pick(row, ['Ticket / price / booking link','ticket_price_booking_link','price','ticket']);
    const source = pick(row, ['Source URL(s)','source_url(s)','source_urls','source_url','source','link']);
    const confidence = pick(row, ['Confidence flag','confidence_flag','status']);

    // Skip pending/placeholder rows
    const line = `${title} ${description} ${confidence}`.toLowerCase();
    if (!title || !dateIso) continue;
    if (line.includes('research pending') || line.includes('pending')) continue;

    const cat = classifyCategory(title, categoryIn);
    const imageUrl = placeholderImage(cat.key);

    out.push({
      id: Math.random().toString(36).slice(2),
      publicId: Math.random().toString(36).slice(2, 10),
      date: dateIso,
      category: cat.display,
      imageUrl,
      whatsappGroup: '',
      whatsappPhone: '',
      contactMethod: organizer || '',
      city: city || '',
      user: { name: 'Imported', email: 'import@events.local' },
      title,
      description,
      location,
      sourceUrl: source || ticket || ''
    });
  }

  const outDir = path.join(process.cwd(), 'public', 'data');
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'events.json');
  await writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  log(`Wrote ${out.length} events -> ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });