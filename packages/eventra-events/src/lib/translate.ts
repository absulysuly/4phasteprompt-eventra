import type { Locale } from "@prisma/client";

// Provider selection via env
const PROVIDER = process.env.TRANSLATE_PROVIDER || "none"; // "google" | "none"
const API_KEY = process.env.TRANSLATE_API_KEY || "";

// Basic glossary for consistent terminology
const GLOSSARY: Record<string, Record<string, string>> = {
  ar: {
    "Event": "فعالية",
    "Events": "فعاليات",
    "Register": "سجل",
    "Free": "مجاني",
    "WhatsApp": "واتساب",
  },
  ku: {
    "Event": "بۆنە",
    "Events": "بۆنەکان",
    "Register": "تۆماركردن",
    "Free": "به‌خۆڕایی",
    "WhatsApp": "واتساپ",
  }
};

function applyGlossary(text: string, target: Locale): string {
  const map = GLOSSARY[target];
  if (!map) return text;
  let out = text;
  for (const [en, localized] of Object.entries(map)) {
    // replace case-sensitively and case-insensitively
    out = out.replace(new RegExp(`\n?\b${en}\b`, "g"), localized);
  }
  return out;
}

async function googleTranslate(text: string, target: Locale): Promise<string> {
  // Google Translate v2 REST
  // POST https://translation.googleapis.com/language/translate/v2
  // Body: q, target, format, source (optional)
  const endpoint = "https://translation.googleapis.com/language/translate/v2";
  const url = `${endpoint}?key=${API_KEY}`;
  const payload = { q: text, target, format: "text" } as any;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
  const json = await res.json();
  const translated = json?.data?.translations?.[0]?.translatedText as string | undefined;
  if (!translated) throw new Error("No translation returned");
  return translated;
}

export async function translateText(text: string, target: Locale): Promise<string> {
  if (!text || target === "en") return text;
  try {
    let translated = text;
    if (PROVIDER === "google" && API_KEY) {
      translated = await googleTranslate(text, target);
    } else {
      // Fallback: return original text and let UI mark needsReview if desired
      translated = text;
    }
    return applyGlossary(translated, target);
  } catch (e) {
    // Fail gracefully
    return applyGlossary(text, target);
  }
}

export async function translateTriple(
  sourceText: { title: string; description: string; location: string },
  targets: Locale[]
) {
  const result: Record<Locale, { title: string; description: string; location: string }> = {} as any;
  for (const target of targets) {
    result[target] = {
      title: await translateText(sourceText.title, target),
      description: await translateText(sourceText.description, target),
      location: await translateText(sourceText.location, target),
    };
  }
  return result;
}
