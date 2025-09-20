/*
  Import events from a CSV URL or local file into the Prisma database.

  Usage examples:
    npx tsx scripts/import-events-from-csv.ts --url "https://docs.google.com/spreadsheets/d/FILE_ID/export?format=csv"
    npx tsx scripts/import-events-from-csv.ts --file "./data/events.csv"

  Notes:
  - Attempts best-effort mapping of common headers: title, description, date, time, location, city, category,
    whatsappGroup, whatsappPhone, contactMethod, imageUrl, sourceUrl.
  - If imageUrl is missing, assigns a relevant Unsplash image based on category.
  - Attempts to geocode the location (best effort).
  - Creates EN translation as source, then auto-translates to AR and KU if translator is configured.
*/

import { PrismaClient } from "@prisma/client";
import { createReadStream } from "fs";
import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";
import { parse as parseCsv } from "csv-parse/sync";
import { translateTriple } from "../src/lib/translate";
import { geocodeAddress } from "../src/lib/geocode";

const prisma = new PrismaClient();

function log(msg: string) {
  process.stdout.write(`[import] ${msg}\n`);
}

function normalizeHeader(h: string): string {
  return (h || "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .trim();
}

function pick(row: Record<string, any>, candidates: string[]): string {
  for (const c of candidates) {
    const norm = normalizeHeader(c);
    for (const key in row) {
      if (normalizeHeader(key) === norm) {
        const v = row[key];
        if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
      }
    }
  }
  return "";
}

function parseDateTime(row: Record<string, any>): string | null {
  const dt = pick(row, ["datetime", "date_time", "date_and_time"]);
  const d = pick(row, ["date", "event_date"]);
  const t = pick(row, ["time", "event_time"]);
  let candidate = "";
  if (dt) candidate = dt;
  else if (d && t) candidate = `${d} ${t}`;
  else if (d) candidate = d;

  if (!candidate) return null;

  const parsed = new Date(candidate);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function classifyCategory(rawTitle: string, rawCategory: string): {
  key: 'tech'|'music'|'business'|'art'|'food'|'sports'|'health'|'community'|'general',
  display: string
} {
  const text = `${rawTitle} ${rawCategory}`.toLowerCase();
  const hit = (words: string[]) => words.some(w => text.includes(w));

  if (hit(["music","concert","festival","dj","band","song"])) return { key: 'music', display: 'Music & Concerts' };
  if (hit(["sport","football","soccer","basketball","match","marathon","fitness"])) return { key: 'sports', display: 'Sports & Fitness' };
  if (hit(["food","restaurant","cafe","dinner","kitchen","cook","culinary","taste"])) return { key: 'food', display: 'Food & Drink' };
  if (hit(["business","startup","marketing","finance","sales","leadership","workshop"])) return { key: 'business', display: 'Business' };
  if (hit(["tech","technology","developer","program","coding","ai","ml","data","innovation"])) return { key: 'tech', display: 'Technology & Innovation' };
  if (hit(["art","gallery","exhibit","painting","sculpture","museum","culture"])) return { key: 'art', display: 'Arts & Culture' };
  if (hit(["health","medical","clinic","wellness","fitness","yoga","mental"])) return { key: 'health', display: 'Health & Wellness' };
  if (hit(["community","volunteer","meetup","social","charity","youth","family"])) return { key: 'community', display: 'Community & Social' };

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

function pickCity(row: Record<string, any>): string {
  return (
    pick(row, ["city","governorate","governorate_name","المحافظة","المدينة"]) ||
    ""
  );
}

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
  return await res.text();
}

function parseCsvText(text: string): Record<string, any>[] {
  const records = parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true
  });
  return records as Record<string, any>[];
}

async function main() {
  const args = process.argv.slice(2);
  let csvSource = "";
  let isUrl = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--url" && args[i+1]) { csvSource = args[i+1]; isUrl = true; i++; }
    else if (args[i] === "--file" && args[i+1]) { csvSource = args[i+1]; isUrl = false; i++; }
  }

  if (!csvSource) {
    log("Please provide --url <csv_url> or --file <path>.");
    process.exit(1);
  }

  // Load CSV text
  let csvText = "";
  if (isUrl) {
    log(`Fetching CSV from URL: ${csvSource}`);
    csvText = await fetchCsv(csvSource);
  } else {
    const absolute = path.isAbsolute(csvSource) ? csvSource : path.join(process.cwd(), csvSource);
    log(`Reading CSV from file: ${absolute}`);
    csvText = await readFile(absolute, "utf8");
  }

  const rows = parseCsvText(csvText);
  log(`Parsed ${rows.length} rows.`);

  let createdCount = 0;
  for (const row of rows) {
    try {
      const title = pick(row, ["title","name","event","event_title","العنوان","اسم_الفعالية"]); 
      const description = pick(row, ["description","desc","about","details","الوصف"]);
      const location = pick(row, ["location","venue","address","الموقع","العنوان"]);
      const city = pickCity(row);
      const categoryRaw = pick(row, ["category","type","الفئة","التصنيف"]);
      const whatsappGroup = pick(row, ["whatsappgroup","whatsapp_group","whatsapp","رابط_الواتساب"]);
      const whatsappPhone = pick(row, ["whatsappphone","whatsapp_phone","phone","رقم_الهاتف"]);
      const contactMethod = pick(row, ["contact","contact_method","التواصل"]);
      const sourceUrl = pick(row, ["source","source_url","link","الرابط"]);
      const imageUrlInput = pick(row, ["image","image_url","cover","الصورة"]);
      const iso = parseDateTime(row);

      if (!title || !iso) {
        log(`Skipping row: missing required fields (title/date).`);
        continue;
      }

      const cat = classifyCategory(title, categoryRaw);
      const imageUrl = imageUrlInput || placeholderImage(cat.key);

      // Best-effort geocoding
      let latitude: number | undefined = undefined;
      let longitude: number | undefined = undefined;
      try {
        if (location) {
          const geo = await geocodeAddress(location);
          if (geo) { latitude = geo.lat; longitude = geo.lon; }
        }
      } catch {}

      const created = await prisma.event.create({
        data: {
          date: new Date(iso),
          category: cat.display,
          imageUrl,
          whatsappGroup: whatsappGroup || undefined,
          whatsappPhone: whatsappPhone || undefined,
          contactMethod: contactMethod || undefined,
          sourceUrl: sourceUrl || undefined,
          city: city || undefined,
          latitude,
          longitude,
          user: {
            connectOrCreate: {
              where: { email: "importer@local" },
              create: { email: "importer@local", password: "imported" }
            }
          },
          publicId: Math.random().toString(36).slice(2, 10),
          translations: {
            create: {
              locale: 'en',
              title,
              description: description || "",
              location: location || ""
            }
          }
        },
        include: { translations: true }
      });

      // Auto-translate to AR + KU (best-effort)
      try {
        const translated = await translateTriple({
          title,
          description: description || "",
          location: location || ""
        }, ['ar','ku'] as any);

        await prisma.event.update({
          where: { id: created.id },
          data: {
            translations: {
              create: [
                { locale: 'ar', title: translated.ar.title, description: translated.ar.description, location: translated.ar.location },
                { locale: 'ku', title: translated.ku.title, description: translated.ku.description, location: translated.ku.location }
              ]
            }
          }
        });
      } catch (e) {
        log(`Translate skipped: ${(e as any)?.message || e}`);
      }

      createdCount++;
    } catch (e) {
      log(`Row import failed: ${(e as any)?.message || e}`);
    }
  }

  log(`Done. Created ${createdCount} events.`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});