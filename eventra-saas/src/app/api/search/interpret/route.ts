import { NextResponse } from "next/server";

// Lightweight multilingual intent parser (heuristic). Replace/extend with spaCy or transformer model as needed.
// Supports English, Arabic (Iraqi dialect heuristics), Kurdish Sorani basics.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const q: string = (body.query || "").trim();
    const lang: string = (body.lang || "en").toLowerCase();
    if (!q) return NextResponse.json({ intent: "unknown", confidence: 0, suggestions: ["Try describing the event, venue, city, or time"] });

    const norm = normalize(q, lang);

    // Identify intent
    let intent: "journey_plan" | "event_time" | "event_search" | "venue_search" | "city_info" | "unknown" = "unknown";
    let confidence = 0.6;
    const entities: any = {};

    // Time words
    const whenWords = lang === 'ar' ? ["شوكت", "متى", "يبدأ", "يبدي", "ساعة"]
                    : lang === 'ku' ? ["کاتێ", "دەست پێ دەکات", "دەست پێدەکات", "سێعات", "کات"]
                    : ["when", "what time", "start", "time", "at"];

    // Journey words
    const journeyWords = lang === 'ar' ? ["خطة", "رحلة", "طريق", "اروح", "من", "الى", "إلى"]
                      : lang === 'ku' ? ["پلانی", "ڕێگا", "گەشت", "بۆ", "لە"]
                      : ["plan", "trip", "route", "go to", "from", "to"];

    // City/venue/event keywords
    const eventWords = lang === 'ar' ? ["مهرجان", "حفلة", "فعالية", "معرض", "موسيقى"]
                    : lang === 'ku' ? ["فستیڤاڵ", "کۆنسێرت", "ڕووداو", "پێشانگا"]
                    : ["event", "festival", "concert", "exhibition", "music"];

    // Normalize whitespace
    const lower = norm.toLowerCase();

    // Extract time (simple pattern like 5 pm, 17:00, 5:00)
    const timeMatch = lower.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b|\b(\d{1,2}):(\d{2})\b/);
    if (timeMatch) {
      entities.time = timeMatch[0];
    }

    // Extract date words like today/tomorrow
    const dateWords = lang === 'ar' ? { today: /اليوم|هسه/, tomorrow: /باجر|غداً|غدا/ }
                    : lang === 'ku' ? { today: /ئه‌مڕۆ|ئەمڕو/, tomorrow: /سبەی|به‌یانی|سبه‌ی/ }
                    : { today: /today/, tomorrow: /tomorrow/ };
    if (dateWords.today.test(lower)) entities.date = 'today';
    else if (dateWords.tomorrow.test(lower)) entities.date = 'tomorrow';

    // City extraction (very naive; in production, use gazetteer)
    const cities = ["baghdad","basra","mosul","erbil","sulaymaniyah","duhok","kirkuk","anbar","najaf","karbala",
                    "بغداد","البصره","الموصل","اربيل","السليمانية","دهوك","كركوك","الانبار","النجف","كربلاء",
                    "هه‌ولێر","سلێمانی","دهۆك","کەرکوک","هەڵەبجە","کربەلا"];
    const foundCity = cities.find(c => lower.includes(c.toLowerCase()));
    if (foundCity) entities.city = foundCity;

    // Decide intent
    if (journeyWords.some(w => lower.includes(w))) {
      intent = "journey_plan";
      confidence = 0.75;
    } else if (whenWords.some(w => lower.includes(w))) {
      intent = "event_time";
      confidence = 0.75;
    } else if (eventWords.some(w => lower.includes(w))) {
      intent = "event_search";
      confidence = 0.7;
    } else if (entities.city) {
      intent = "city_info";
      confidence = 0.65;
    }

    // Build filters for DB search
    const filters: any = {};
    if (entities.city) filters.city = entities.city;
    if (intent === 'event_search' && entities.date) filters.date = entities.date;

    // Suggestions fallback if confidence low
    const suggestions = confidence < 0.7 ? buildSuggestions(lang) : [];

    return NextResponse.json({ intent, confidence, entities, filters, suggestions });
  } catch (e) {
    console.error("interpret error", e);
    return NextResponse.json({ intent: "unknown", confidence: 0.0, suggestions: buildSuggestions("en") });
  }
}

function normalize(q: string, lang: string) {
  // Basic normalization; extend as needed per language
  return q.replace(/\s+/g, " ").trim();
}

function buildSuggestions(lang: string) {
  if (lang === 'ar') {
    return [
      "ابحث عن فعالية بالموسيقى في بغداد",
      "شوكت يبدى مهرجان؟",
      "خطط رحلة إلى السوق القديم باجر ساعة 5",
    ];
  }
  if (lang === 'ku') {
    return [
      "گەڕان بۆ ڕووداوی میوزیک لە هەولێر",
      "کاتێ فستیڤاڵ دەست پێدەکات؟",
      "پلانی گەشت بۆ بازاڕی کۆن سبەی لە کاتژمێر ٥",
    ];
  }
  return [
    "Search music events in Erbil",
    "When does the festival start?",
    "Plan a trip to the old bazaar tomorrow at 5 PM",
  ];
}
