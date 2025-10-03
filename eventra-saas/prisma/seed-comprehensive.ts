import { PrismaClient, EventType, DeviceType, VenueType, VenueStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate random data
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

// Iraqi cities with coordinates
const CITIES = [
  { name: 'baghdad', nameEn: 'Baghdad', nameAr: 'بغداد', nameKu: 'بەغدا', lat: 33.3152, lng: 44.3661 },
  { name: 'basra', nameEn: 'Basra', nameAr: 'البصرة', nameKu: 'بەسرە', lat: 30.5095, lng: 47.7804 },
  { name: 'erbil', nameEn: 'Erbil', nameAr: 'أربيل', nameKu: 'هەولێر', lat: 36.1911, lng: 44.0094 },
  { name: 'mosul', nameEn: 'Mosul', nameAr: 'الموصل', nameKu: 'مووسڵ', lat: 36.3350, lng: 43.1189 },
  { name: 'sulaymaniyah', nameEn: 'Sulaymaniyah', nameAr: 'السليمانية', nameKu: 'سلێمانی', lat: 35.5608, lng: 45.4388 },
  { name: 'duhok', nameEn: 'Duhok', nameAr: 'دهوك', nameKu: 'دهۆک', lat: 36.8617, lng: 42.9908 },
];

// Sample venue data templates
const HOTEL_TEMPLATES = [
  {
    nameEn: 'Grand {city} Hotel',
    nameAr: 'فندق {city} الكبير',
    nameKu: 'هوتێلی مەزنی {city}',
    descEn: 'Luxury hotel with modern amenities and traditional Iraqi hospitality',
    descAr: 'فندق فاخر مع وسائل راحة حديثة وضيافة عراقية تقليدية',
    descKu: 'هوتێلی لوکس لەگەڵ ئامرازەکانی نوێ و میوانداری نەریتی عێراقی',
    priceRange: '$80-150',
    amenities: ['wifi', 'parking', 'restaurant', 'spa', 'pool'],
  },
  {
    nameEn: '{city} Business Center',
    nameAr: 'مركز {city} التجاري',
    nameKu: 'ناوەندی بازرگانی {city}',
    descEn: 'Perfect for business travelers with meeting rooms and conference facilities',
    descAr: 'مثالي للمسافرين رجال الأعمال مع قاعات الاجتماعات ومرافق المؤتمرات',
    descKu: 'تەواو بۆ گەشتیاران بازرگانان لەگەڵ ژووری چاوپێکەوتن و ئامرازی کۆنفرانس',
    priceRange: '$60-100',
    amenities: ['wifi', 'meeting_rooms', 'business_center', 'restaurant'],
  },
];

const RESTAURANT_TEMPLATES = [
  {
    nameEn: 'Traditional {city} Kitchen',
    nameAr: 'مطبخ {city} التقليدي',
    nameKu: 'چێشتخانەی نەریتی {city}',
    descEn: 'Authentic Iraqi cuisine with family recipes passed down through generations',
    descAr: 'مأكولات عراقية أصيلة مع وصفات عائلية متوارثة عبر الأجيال',
    descKu: 'خواردنی ڕەسەنی عێراقی لەگەڵ ڕیسپیی خێزانی بە میرات',
    cuisineType: 'Iraqi',
    priceRange: '$15-30',
    dietaryOptions: ['halal', 'vegetarian'],
  },
  {
    nameEn: 'Modern {city} Bistro',
    nameAr: 'مطعم {city} العصري',
    nameKu: 'ڕێستۆرانتی سەردەمی {city}',
    descEn: 'Contemporary Middle Eastern fusion cuisine in elegant atmosphere',
    descAr: 'مأكولات شرق أوسطية معاصرة في جو أنيق',
    descKu: 'خواردنی تێکەڵی نوێی ڕۆژهەڵاتی ناوەڕاست لە کەشوهەوایەکی جوان',
    cuisineType: 'Middle Eastern Fusion',
    priceRange: '$25-45',
    dietaryOptions: ['halal', 'vegetarian', 'vegan'],
  },
];

const EVENT_TEMPLATES = [
  {
    nameEn: '{city} Cultural Festival',
    nameAr: 'مهرجان {city} الثقافي',
    nameKu: 'فێستیڤاڵی کولتووری {city}',
    descEn: 'Celebrate the rich cultural heritage of Iraq with music, dance, and traditional arts',
    descAr: 'احتفل بالتراث الثقافي الغني للعراق مع الموسيقى والرقص والفنون التقليدية',
    descKu: 'میراتی کولتووری دەوڵەمەندی عێراق لەگەڵ مۆسیقا و سەما و هونەری نەریتی جەژن بگیرە',
    category: 'culture',
  },
  {
    nameEn: 'Tech Meetup {city}',
    nameAr: 'لقاء تقني {city}',
    nameKu: 'کۆبوونەوەی تەکنەلۆژی {city}',
    descEn: 'Monthly gathering for tech enthusiasts, developers, and entrepreneurs',
    descAr: 'لقاء شهري لعشاق التكنولوجيا والمطورين ورجال الأعمال',
    descKu: 'کۆبوونەوەی مانگانە بۆ حەزخوازانی تەکنەلۆژیا و گەشەپێدەران و ئەنتەرپرایز',
    category: 'tech',
  },
];

// Generate synthetic session data
function generateSessionId() {
  return 'ses_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate realistic user agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

const SAMPLE_SEARCH_QUERIES = [
  'hotels in Baghdad', 'restaurants near me', 'cultural events', 'business meetings',
  'Kurdish music', 'tech conferences', 'traditional food', 'luxury hotels',
  'family activities', 'wedding venues', 'conference rooms', 'live music',
];

const PAGES = [
  '/en/events', '/en/venues', '/en/categories', '/en/events/create',
  '/ar/events', '/ar/venues', '/ku/events', '/en/event/',
];

async function main() {
  console.log('🚀 Starting comprehensive database seeding...');
  
  // 1. Create test users
  console.log('👥 Creating test users...');
  const users = [];
  
  for (let i = 0; i < 10; i++) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: `user${i + 1}@eventra.com` },
      update: {},
      create: {
        email: `user${i + 1}@eventra.com`,
        name: `Test User ${i + 1}`,
        password: hashedPassword,
      },
    });
    users.push(user);
  }
  
  console.log(`✅ Created ${users.length} users`);

  // 2. Create venues (Hotels, Restaurants, Events)
  console.log('🏨 Creating hotels...');
  let hotelCount = 0;
  
  for (const city of CITIES) {
    for (const template of HOTEL_TEMPLATES) {
      const venue = await prisma.venue.create({
        data: {
          type: VenueType.HOTEL,
          status: VenueStatus.ACTIVE,
          publicId: `hotel-${city.name}-${hotelCount + 1}`,
          priceRange: template.priceRange,
          address: `${randomInt(1, 100)} Main Street`,
          city: city.name,
          latitude: city.lat + randomFloat(-0.05, 0.05),
          longitude: city.lng + randomFloat(-0.05, 0.05),
          amenities: JSON.stringify(template.amenities),
          businessEmail: `hotel${hotelCount + 1}@${city.name}.com`,
          businessPhone: `+964-${randomInt(100, 999)}-${randomInt(1000000, 9999999)}`,
          featured: Math.random() > 0.7,
          verified: Math.random() > 0.3,
          userId: randomChoice(users).id,
          translations: {
            create: [
              {
                locale: 'en',
                title: template.nameEn.replace('{city}', city.nameEn),
                description: template.descEn,
                location: `${city.nameEn}, Iraq`,
              },
              {
                locale: 'ar',
                title: template.nameAr.replace('{city}', city.nameAr),
                description: template.descAr,
                location: `${city.nameAr}، العراق`,
              },
              {
                locale: 'ku',
                title: template.nameKu.replace('{city}', city.nameKu),
                description: template.descKu,
                location: `${city.nameKu}، عێراق`,
              },
            ],
          },
        },
      });
      hotelCount++;
    }
  }
  
  console.log(`✅ Created ${hotelCount} hotels`);

  // 3. Create restaurants
  console.log('🍽️ Creating restaurants...');
  let restaurantCount = 0;
  
  for (const city of CITIES) {
    for (const template of RESTAURANT_TEMPLATES) {
      const venue = await prisma.venue.create({
        data: {
          type: VenueType.RESTAURANT,
          status: VenueStatus.ACTIVE,
          publicId: `restaurant-${city.name}-${restaurantCount + 1}`,
          priceRange: template.priceRange,
          cuisineType: template.cuisineType,
          dietaryOptions: JSON.stringify(template.dietaryOptions),
          address: `${randomInt(1, 100)} Food Street`,
          city: city.name,
          latitude: city.lat + randomFloat(-0.05, 0.05),
          longitude: city.lng + randomFloat(-0.05, 0.05),
          businessEmail: `restaurant${restaurantCount + 1}@${city.name}.com`,
          businessPhone: `+964-${randomInt(100, 999)}-${randomInt(1000000, 9999999)}`,
          featured: Math.random() > 0.8,
          verified: Math.random() > 0.4,
          userId: randomChoice(users).id,
          translations: {
            create: [
              {
                locale: 'en',
                title: template.nameEn.replace('{city}', city.nameEn),
                description: template.descEn,
                location: `${city.nameEn}, Iraq`,
              },
              {
                locale: 'ar',
                title: template.nameAr.replace('{city}', city.nameAr),
                description: template.descAr,
                location: `${city.nameAr}، العراق`,
              },
              {
                locale: 'ku',
                title: template.nameKu.replace('{city}', city.nameKu),
                description: template.descKu,
                location: `${city.nameKu}، عێراق`,
              },
            ],
          },
        },
      });
      restaurantCount++;
    }
  }
  
  console.log(`✅ Created ${restaurantCount} restaurants`);

  // 4. Create events
  console.log('🎪 Creating events...');
  let eventCount = 0;
  
  for (const city of CITIES) {
    for (const template of EVENT_TEMPLATES) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + randomInt(1, 90)); // Random future date
      
      const event = await prisma.event.create({
        data: {
          date: eventDate,
          category: template.category,
          publicId: `event-${city.name}-${eventCount + 1}`,
          city: city.name,
          latitude: city.lat + randomFloat(-0.05, 0.05),
          longitude: city.lng + randomFloat(-0.05, 0.05),
          whatsappPhone: `+964-${randomInt(100, 999)}-${randomInt(1000000, 9999999)}`,
          contactMethod: `event${eventCount + 1}@${city.name}.com`,
          userId: randomChoice(users).id,
          translations: {
            create: [
              {
                locale: 'en',
                title: template.nameEn.replace('{city}', city.nameEn),
                description: template.descEn,
                location: `${city.nameEn} Convention Center, ${city.nameEn}`,
              },
              {
                locale: 'ar',
                title: template.nameAr.replace('{city}', city.nameAr),
                description: template.descAr,
                location: `مركز مؤتمرات ${city.nameAr}، ${city.nameAr}`,
              },
              {
                locale: 'ku',
                title: template.nameKu.replace('{city}', city.nameKu),
                description: template.descKu,
                location: `ناوەندی کۆنفرانسی ${city.nameKu}، ${city.nameKu}`,
              },
            ],
          },
        },
      });
      eventCount++;
    }
  }
  
  console.log(`✅ Created ${eventCount} events`);

  // 5. Generate analytics data immediately
  console.log('📊 Generating immediate analytics data...');
  
  // Create user sessions (simulate past 30 days)
  const sessions = [];
  const now = new Date();
  
  for (let day = 30; day >= 0; day--) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    const sessionsPerDay = randomInt(50, 200); // Random sessions per day
    
    for (let i = 0; i < sessionsPerDay; i++) {
      const sessionDate = new Date(date);
      sessionDate.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
      
      const session = await prisma.userSession.create({
        data: {
          sessionId: generateSessionId(),
          userId: Math.random() > 0.3 ? randomChoice(users).id : null, // 70% registered users
          ipAddress: `192.168.${randomInt(1, 254)}.${randomInt(1, 254)}`,
          userAgent: randomChoice(USER_AGENTS),
          deviceType: randomChoice([DeviceType.DESKTOP, DeviceType.MOBILE, DeviceType.TABLET]),
          language: randomChoice(['en', 'ar', 'ku']),
          country: 'Iraq',
          startedAt: sessionDate,
          lastActiveAt: new Date(sessionDate.getTime() + randomInt(60000, 3600000)), // 1min to 1hr session
        },
      });
      sessions.push(session);
    }
  }
  
  console.log(`✅ Created ${sessions.length} user sessions`);

  // 6. Generate analytics events for each session
  console.log('📈 Generating analytics events...');
  let totalEvents = 0;
  
  for (const session of sessions) {
    const eventsPerSession = randomInt(5, 30); // Random events per session
    
    for (let i = 0; i < eventsPerSession; i++) {
      const eventTime = new Date(
        session.startedAt.getTime() + (i * (session.lastActiveAt.getTime() - session.startedAt.getTime()) / eventsPerSession)
      );
      
      const eventType = randomChoice([
        EventType.PAGE_VIEW,
        EventType.CLICK,
        EventType.SCROLL,
        EventType.SEARCH,
        EventType.CATEGORY_SELECT,
        EventType.PERFORMANCE,
      ]);
      
      let eventName = 'generic_event';
      let page = randomChoice(PAGES);
      let properties: any = {};
      let value: number | null = null;
      let duration: number | null = null;
      
      switch (eventType) {
        case EventType.PAGE_VIEW:
          eventName = 'page_view';
          properties = { referrer: Math.random() > 0.5 ? 'google.com' : 'direct' };
          break;
          
        case EventType.CLICK:
          eventName = 'button_click';
          properties = { 
            elementId: randomChoice(['search-btn', 'venue-card', 'book-now', 'learn-more']),
            component: randomChoice(['VenueCard', 'SearchBar', 'HeroSection'])
          };
          break;
          
        case EventType.SCROLL:
          eventName = 'page_scroll';
          value = randomChoice([25, 50, 75, 90, 100]);
          properties = { scrollPercentage: value };
          break;
          
        case EventType.SEARCH:
          eventName = 'search_performed';
          const query = randomChoice(SAMPLE_SEARCH_QUERIES);
          properties = { query, resultsCount: randomInt(0, 50) };
          break;
          
        case EventType.CATEGORY_SELECT:
          eventName = 'category_filter';
          properties = { 
            category: randomChoice(['hotels', 'restaurants', 'events', 'activities']),
            city: randomChoice(CITIES).name
          };
          break;
          
        case EventType.PERFORMANCE:
          eventName = 'page_load';
          duration = randomInt(500, 3000); // Page load time in ms
          properties = { 
            loadTime: duration,
            connectionType: randomChoice(['4g', 'wifi', '3g'])
          };
          break;
      }
      
      await prisma.analyticsEvent.create({
        data: {
          sessionId: session.id,
          eventType,
          eventName,
          page,
          component: properties.component || null,
          elementId: properties.elementId || null,
          properties: JSON.stringify(properties),
          value,
          duration,
          timestamp: eventTime,
        },
      });
      
      totalEvents++;
    }
  }
  
  console.log(`✅ Created ${totalEvents} analytics events`);

  // 7. Generate some recent real-time events (last hour)
  console.log('⚡ Generating real-time events...');
  const recentSessions = sessions.slice(-10); // Last 10 sessions
  let recentEvents = 0;
  
  for (const session of recentSessions) {
    const recentEventCount = randomInt(3, 10);
    
    for (let i = 0; i < recentEventCount; i++) {
      const eventTime = new Date(Date.now() - randomInt(0, 3600000)); // Last hour
      
      await prisma.analyticsEvent.create({
        data: {
          sessionId: session.id,
          eventType: randomChoice([EventType.PAGE_VIEW, EventType.CLICK, EventType.SEARCH]),
          eventName: randomChoice(['page_view', 'venue_click', 'search_performed']),
          page: randomChoice(PAGES),
          properties: JSON.stringify({
            realTime: true,
            source: 'seed_data',
          }),
          timestamp: eventTime,
        },
      });
      recentEvents++;
    }
  }
  
  console.log(`✅ Created ${recentEvents} real-time events`);

  // 8. Create some business accounts
  console.log('💼 Creating business accounts...');
  const businessUsers = users.slice(0, 5);
  
  for (const user of businessUsers) {
    await prisma.businessAccount.create({
      data: {
        userId: user.id,
        bankName: randomChoice(['Iraq Bank', 'Kurdistan Bank', 'Commercial Bank of Iraq']),
        account: `ACC${randomInt(1000000, 9999999)}`,
        iban: `IQ${randomInt(10, 99)}BANK${randomInt(1000000000000, 9999999999999)}`,
        beneficiary: user.name!,
        status: 'VERIFIED',
      },
    });
  }
  
  console.log('✅ Created business accounts');

  console.log('🎉 Comprehensive database seeding completed!');
  console.log(`
📊 Summary:
- Users: ${users.length}
- Hotels: ${hotelCount}  
- Restaurants: ${restaurantCount}
- Events: ${eventCount}
- User Sessions: ${sessions.length}
- Analytics Events: ${totalEvents + recentEvents}
- Business Accounts: ${businessUsers.length}

🚀 Your analytics dashboard should now show immediate data!
Visit: /admin/analytics to see the results
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });