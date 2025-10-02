// --- MOCK DATABASE & API CONTROLLER ---
// In a real application, this logic would be on the server.
// For this client-side PWA, we simulate it here.

// --- Interfaces ---

type VenueType = 'EVENT' | 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE';

interface Venue {
  id: string;
  publicId: string;
  type: VenueType;
  imageUrl: string;
  galleryUrls: string[];
  city: string;
  latitude: number;
  longitude: number;
  priceRange: string;
  whatsappPhone: string;
  website: string;
  eventDate?: string; // ISO String
  amenities?: string[];
  translations: Record<'en' | 'ar' | 'ku', {
    title: string;
    description: string;
    location: string;
  }>;
}

interface GetEventsParams {
  city: string | null;
  month: string; // YYYY-MM
  limit: number;
  offset: number;
  locale: 'en' | 'ar' | 'ku';
}

// --- Data Generation ---

const GOVERNORATES = {
  baghdad: { lat: 33.3152, lon: 44.3661 },
  basra: { lat: 30.5155, lon: 47.7780 },
  mosul: { lat: 36.3410, lon: 43.1189 },
  erbil: { lat: 36.1911, lon: 44.0094 },
  kirkuk: { lat: 35.4674, lon: 44.3922 },
  najaf: { lat: 32.0270, lon: 44.3412 },
  karbala: { lat: 32.6163, lon: 44.0329 },
  sulaymaniyah: { lat: 35.5555, lon: 45.4328 },
  duhok: { lat: 36.8741, lon: 42.9840 },
  anbar: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  diyala: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  wasit: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  saladin: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  babil: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  dhiqar: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  maysan: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  qadisiyyah: { lat: 33.3152, lon: 44.3661 }, // Placeholder
  muthanna: { lat: 33.3152, lon: 44.3661 }, // Placeholder
};
const GOVERNORATES_IDS = Object.keys(GOVERNORATES);

const VENUE_TEMPLATES: Omit<Venue, 'id' | 'publicId' | 'city' | 'latitude' | 'longitude' | 'eventDate'>[] = [
  {
    type: 'EVENT',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    galleryUrls: ['https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=800', 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=800'],
    priceRange: '$25-50', whatsappPhone: '+9647701234567', website: 'https://example.com',
    translations: {
      en: { title: 'Cultural Night', description: 'Experience the rich heritage and vibrant culture. An evening of music, art, and tradition.', location: 'Central Hall' },
      ar: { title: 'أمسية ثقافية', description: 'استمتع بالتراث الغني والثقافة النابضة بالحياة. أمسية من الموسيقى والفن والتقاليد.', location: 'القاعة المركزية' },
      ku: { title: 'شەوی کولتووری', description: 'کلتووری دەوڵەمەند و زیندوو ئەزموون بکە. ئێوارەیەکی پڕ لە مۆسیقا و هونەر و نەریت.', location: 'هۆڵی ناوەندی' },
    }
  },
  {
    type: 'HOTEL',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    galleryUrls: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800'],
    priceRange: '$150-300', whatsappPhone: '+9647801234567', website: 'https://example-hotel.com',
    amenities: ['Free WiFi', 'Parking', 'Pool', 'Restaurant'],
    translations: {
      en: { title: 'Grand Palace Hotel', description: '5-star luxury hotel with premium services and breathtaking views.', location: 'Corniche St' },
      ar: { title: 'فندق القصر الكبير', description: 'فندق 5 نجوم فاخر مع خدمات ممتازة وإطلالات خلابة.', location: 'شارع الكورنيش' },
      ku: { title: 'هۆتێلی کۆشکی گەورە', description: 'هۆتێلێکی ٥ ئەستێرەیی شاهانە لەگەڵ خزمەتگوزاری نایاب و دیمەنی سەرنجڕاکێش.', location: 'شەقامی کۆرنیش' },
    }
  },
  {
    type: 'RESTAURANT',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
    galleryUrls: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800'],
    priceRange: '$40-80', whatsappPhone: '+9647901234567', website: 'https://example-restaurant.com',
    translations: {
      en: { title: 'Tigris Grill', description: 'Authentic Iraqi cuisine with a modern twist, overlooking the river.', location: 'Riverfront District' },
      ar: { title: 'مشويات دجلة', description: 'مأكولات عراقية أصيلة بلمسة عصرية، تطل على النهر.', location: 'منطقة الواجهة النهرية' },
      ku: { title: 'برژاوی دیجلە', description: 'خواردنی ڕەسەنی عێراقی بە ستایلێکی نوێ، بەسەر ڕووبارەکەدا دەڕوانێت.', location: 'ناوچەی کەناری ڕووبار' },
    }
  }
];

const MOCK_VENUES: Venue[] = [];

// Generate a large, realistic dataset
for (let i = 0; i < 500; i++) {
  const city = GOVERNORATES_IDS[i % GOVERNORATES_IDS.length];
  const template = VENUE_TEMPLATES[i % VENUE_TEMPLATES.length];
  
  const venue: Partial<Venue> = { ...template };
  venue.id = `venue_${i}`;
  venue.publicId = `pub_venue_${i}_${Date.now()}`;
  venue.city = city;
  venue.latitude = GOVERNORATES[city].lat + (Math.random() - 0.5) * 0.1;
  venue.longitude = GOVERNORATES[city].lon + (Math.random() - 0.5) * 0.1;

  if (venue.type === 'EVENT') {
    const monthOffset = Math.floor(i / (500 / 12));
    const day = (i % 28) + 1;
    const hour = 10 + (i % 12);
    const eventDate = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, day, hour, 0, 0);
    venue.eventDate = eventDate.toISOString();
  }
  
  // Create unique translations for this instance
  venue.translations = {
      en: { ...template.translations.en, title: `${template.translations.en.title} #${i}` },
      ar: { ...template.translations.ar, title: `${template.translations.ar.title} #${i}` },
      ku: { ...template.translations.ku, title: `${template.translations.ku.title} #${i}` },
  };


  MOCK_VENUES.push(venue as Venue);
}

// --- API Functions ---

export const getEvents = async (params: GetEventsParams) => {
  const { city, month, limit, offset, locale } = params;
  console.log(`API: Fetching events for city: ${city}, month: ${month}, page: ${offset/limit}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredEvents = MOCK_VENUES.filter(venue => {
    if (venue.type !== 'EVENT' || !venue.eventDate) return false;
    const eventMonth = venue.eventDate.substring(0, 7);
    const cityMatch = !city || city === 'all' || venue.city === city;
    const monthMatch = eventMonth === month;
    return cityMatch && monthMatch;
  });

  filteredEvents.sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());
  
  const total = filteredEvents.length;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  const responseEvents = paginatedEvents.map(e => ({
    id: e.id,
    publicId: e.publicId,
    imageUrl: e.imageUrl,
    eventDate: e.eventDate!,
    city: e.city,
    title: e.translations[locale].title,
    description: e.translations[locale].description,
    location: e.translations[locale].location,
  }));

  return {
    events: responseEvents,
    total,
    hasMore: offset + limit < total
  };
};

export const getEventCountsByMonth = async (city: string | null): Promise<Record<string, number>> => {
    console.log(`API: Fetching event counts for city: ${city}`);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const counts: Record<string, number> = {};
    const filteredEvents = MOCK_VENUES.filter(venue => {
        const isEvent = venue.type === 'EVENT';
        const cityMatch = !city || city === 'all' || venue.city === city;
        return isEvent && cityMatch;
    });

    filteredEvents.forEach(event => {
        if (!event.eventDate) return;
        const month = event.eventDate.substring(0, 7);
        counts[month] = (counts[month] || 0) + 1;
    });
    
    return counts;
};


export const getVenueDetails = async (publicId: string, locale: 'en' | 'ar' | 'ku') => {
  console.log(`API: Fetching details for venue: ${publicId}`);
  await new Promise(resolve => setTimeout(resolve, 600));

  const venue = MOCK_VENUES.find(v => v.publicId === publicId);

  if (!venue) {
    return null;
  }

  return {
    ...venue,
    title: venue.translations[locale].title,
    description: venue.translations[locale].description,
    location: venue.translations[locale].location,
  };
};