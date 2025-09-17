import type { User, City, Category, Event, Review } from '@/types';

// ===================================================================================
// USERS
// ===================================================================================
export const USERS: User[] = [
  { id: 'user-1', name: 'Soran Gardi', avatarUrl: 'https://i.pravatar.cc/150?u=user-1', phone: '111-222-3333', email: 'soran@example.com', isVerified: true },
  { id: 'user-2', name: 'Layla Ahmed', avatarUrl: 'https://i.pravatar.cc/150?u=user-2', phone: '222-333-4444', email: 'layla@example.com', isVerified: false },
  { id: 'user-3', name: 'Zryan Taha', avatarUrl: 'https://i.pravatar.cc/150?u=user-3', phone: '333-444-5555', email: 'zryan@example.com', isVerified: true },
  { id: 'user-4', name: 'Narin Abdullah', avatarUrl: 'https://i.pravatar.cc/150?u=user-4', phone: '444-555-6666', email: 'narin@example.com', isVerified: true },
  { id: 'user-5', name: 'Kawa Hassan', avatarUrl: 'https://i.pravatar.cc/150?u=user-5', phone: '555-666-7777', email: 'kawa@example.com', isVerified: true },
  { id: 'user-6', name: 'Bahar Sherko', avatarUrl: 'https://i.pravatar.cc/150?u=user-6', phone: '666-777-8888', email: 'bahar@example.com', isVerified: true },
  { id: 'user-7', name: 'Darya Ali', avatarUrl: 'https://i.pravatar.cc/150?u=user-7', phone: '777-888-9999', email: 'darya@example.com', isVerified: true },
  { id: 'user-8', name: 'Ranj Peshraw', avatarUrl: 'https://i.pravatar.cc/150?u=user-8', phone: '888-999-0000', email: 'ranj@example.com', isVerified: true },
  { id: 'user-9', name: 'Shilan Mariwan', avatarUrl: 'https://i.pravatar.cc/150?u=user-9', phone: '999-000-1111', email: 'shilan@example.com', isVerified: true },
  { id: 'user-10', name: 'Hiwa Farhad', avatarUrl: 'https://i.pravatar.cc/150?u=user-10', phone: '000-111-2222', email: 'hiwa@example.com', isVerified: true },
  { id: 'user-11', name: 'Tara Rostam', avatarUrl: 'https://i.pravatar.cc/150?u=user-11', phone: '123-456-7890', email: 'tara@example.com', isVerified: true },
  { id: 'user-12', name: 'Saman Bakhtiar', avatarUrl: 'https://i.pravatar.cc/150?u=user-12', phone: '234-567-8901', email: 'saman@example.com', isVerified: true },
  { id: 'user-13', name: 'Fenk Omed', avatarUrl: 'https://i.pravatar.cc/150?u=user-13', phone: '345-678-9012', email: 'fenk@example.com', isVerified: true },
  { id: 'user-14', name: 'Lana Kamal', avatarUrl: 'https://i.pravatar.cc/150?u=user-14', phone: '456-789-0123', email: 'lana@example.com', isVerified: true },
  { id: 'user-15', name: 'Arin Hawrami', avatarUrl: 'https://i.pravatar.cc/150?u=user-15', phone: '567-890-1234', email: 'arin@example.com', isVerified: true },
];

// ===================================================================================
// CITIES - All 18 Iraqi Governorates
// ===================================================================================
export const CITIES: City[] = [
  { id: 'baghdad', name: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' }, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800' },
  { id: 'basra', name: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' }, image: 'https://images.unsplash.com/photo-1605640779851-ad2a96584203?q=80&w=800' },
  { id: 'nineveh', name: { en: 'Nineveh', ar: 'نينوى', ku: 'نەینەوا' }, image: 'https://images.unsplash.com/photo-1600968256473-87af8e692d8e?q=80&w=800' },
  { id: 'erbil', name: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' }, image: 'https://images.unsplash.com/photo-1606124238744-23a319dea255?q=80&w=800' },
  { id: 'sulaymaniyah', name: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' }, image: 'https://images.unsplash.com/photo-1599818496263-593a5256e2a2?q=80&w=800' },
  { id: 'duhok', name: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' }, image: 'https://images.unsplash.com/photo-1606563283299-84b335f37684?q=80&w=800' },
  { id: 'kirkuk', name: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' }, image: 'https://images.unsplash.com/photo-1615822360813-433b0a735b27?q=80&w=800' },
  { id: 'diyala', name: { en: 'Diyala', ar: 'ديالى', ku: 'دیالە' }, image: 'https://images.unsplash.com/photo-1591348122392-0c6356582fa8?q=80&w=800' },
  { id: 'anbar', name: { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' }, image: 'https://images.unsplash.com/photo-1572037993259-d8b5e0f1b7df?q=80&w=800' },
  { id: 'najaf', name: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' }, image: 'https://images.unsplash.com/photo-1568792923760-d4ab5f5d7c96?q=80&w=800' },
  { id: 'karbala', name: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' }, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800' },
  { id: 'babil', name: { en: 'Babil', ar: 'بابل', ku: 'بابل' }, image: 'https://images.unsplash.com/photo-1558437078-2bb81162dbc0?q=80&w=800' },
  { id: 'wasit', name: { en: 'Wasit', ar: 'واسط', ku: 'واسیت' }, image: 'https://images.unsplash.com/photo-1577981552651-5a7d47cf4d50?q=80&w=800' },
  { id: 'maysan', name: { en: 'Maysan', ar: 'ميسان', ku: 'مەیسان' }, image: 'https://images.unsplash.com/photo-1591027169744-c94ac99a3f8a?q=80&w=800' },
  { id: 'dhiqar', name: { en: 'Dhi Qar', ar: 'ذي قار', ku: 'زی قار' }, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800' },
  { id: 'qadisiyyah', name: { en: 'Al-Qadisiyyah', ar: 'القادسية', ku: 'قادسیە' }, image: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?q=80&w=800' },
  { id: 'salahuddin', name: { en: 'Salah ad-Din', ar: 'صلاح الدين', ku: 'سەلاحەددین' }, image: 'https://images.unsplash.com/photo-1518737074923-f75d9a1c6f90?q=80&w=800' },
  { id: 'muthanna', name: { en: 'Muthanna', ar: 'المثنى', ku: 'موسەنا' }, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=800' }
];

// ===================================================================================
// CATEGORIES - Event Categories for Iraq
// ===================================================================================
export const CATEGORIES: Category[] = [
  { 
    id: 'music', 
    name: { en: 'Music & Concerts', ar: 'الموسيقى والحفلات', ku: 'مۆسیقا و کۆنسێرتەکان' }, 
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=800',
    icon: '🎵',
    pricingTier: 'paid'
  },
  { 
    id: 'sports', 
    name: { en: 'Sports & Fitness', ar: 'الرياضة واللياقة', ku: 'وەرزش و لیاقەت' }, 
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800',
    icon: '⚽',
    pricingTier: 'free'
  },
  { 
    id: 'art', 
    name: { en: 'Arts & Culture', ar: 'الفنون والثقافة', ku: 'هونەر و کاڵتوور' }, 
    image: 'https://images.unsplash.com/photo-1531578499233-3e3c63a5680a?q=80&w=800',
    icon: '🎨',
    pricingTier: 'paid'
  },
  { 
    id: 'food', 
    name: { en: 'Food & Dining', ar: 'الطعام والمأكولات', ku: 'خواردن و خواردنخوازی' }, 
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800',
    icon: '🍽️',
    pricingTier: 'paid'
  },
  { 
    id: 'tech', 
    name: { en: 'Technology & Innovation', ar: 'التكنولوجيا والابتكار', ku: 'تەکنەلۆژیا و داهێنان' }, 
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800',
    icon: '💻',
    pricingTier: 'premium'
  },
  { 
    id: 'business', 
    name: { en: 'Business & Networking', ar: 'الأعمال والتواصل', ku: 'بازرگانی و پەیوەندیکردن' }, 
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800',
    icon: '💼',
    pricingTier: 'premium'
  },
  { 
    id: 'education', 
    name: { en: 'Education & Learning', ar: 'التعليم والتعلم', ku: 'پەروەردە و فێربوون' }, 
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800',
    icon: '🎓',
    pricingTier: 'free'
  },
  { 
    id: 'festivals', 
    name: { en: 'Festivals & Celebrations', ar: 'المهرجانات والاحتفالات', ku: 'فێستیڤاڵ و ئاهەنگەکان' }, 
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
    icon: '🎉',
    pricingTier: 'paid'
  },
  { 
    id: 'community', 
    name: { en: 'Community & Social', ar: 'المجتمع والاجتماعی', ku: 'کۆمەڵگا و کۆمەڵایەتی' }, 
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=800',
    icon: '🤝',
    pricingTier: 'free'
  },
  { 
    id: 'lifestyle', 
    name: { en: 'Lifestyle & Wellness', ar: 'نمط الحياة والعافية', ku: 'شێوازی ژیان و تەندروستی' }, 
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800',
    icon: '🧘‍♀️',
    pricingTier: 'paid'
  }
];

// ===================================================================================
// REVIEWS
// ===================================================================================
const generateReviews = (count: number): Review[] => {
    const reviews: Review[] = [];
    const comments = [
        "Absolutely fantastic! A must-see event.",
        "Well organized and a lot of fun. Highly recommended.",
        "It was good, but could have been better. The venue was too crowded.",
        "A bit disappointed. The sound system was not great.",
        "An unforgettable experience! I'll definitely go again next year.",
        "Great atmosphere and friendly staff.",
        "The best event I have attended this year.",
        "It was okay. Nothing special.",
        "Loved every moment of it. The performers were incredible.",
    ];
    for (let i = 0; i < count; i++) {
        const user = USERS[Math.floor(Math.random() * USERS.length)];
        reviews.push({
            id: `rev-${Date.now()}-${i}`,
            user,
            rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
            comment: comments[Math.floor(Math.random() * comments.length)],
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
    return reviews;
};

// ===================================================================================
// EVENTS
// ===================================================================================
export const EVENTS: Event[] = [
  // ... (25 event objects, each with full details)
  {
    id: 'event-1',
    title: { en: 'Erbil Tech Summit', ar: 'قمة أربيل التقنية', ku: 'لووتکەی تەکنەلۆژیای هەولێر' },
    description: { en: 'Join the brightest minds in technology and innovation. A full day of talks, workshops, and networking about the future of AI and Web3.', ar: 'انضم إلى ألمع العقول في مجال التكنولوجيا والابتكار. يوم كامل من المحادثات وورش العمل والتواصل.', ku: 'بەشداری بکە لەگەڵ زیرەکترین کەسایەتییەکانی بواری تەکنەلۆژیا و داهێنان.' },
    organizerId: 'user-1', organizerName: 'Tech Innovators Co.', categoryId: 'tech', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 7).toISOString(),
    venue: 'Saad Abdullah Palace Conference Hall', coordinates: { lat: 36.1911, lon: 44.0092 },
    organizerPhone: '1112223333', whatsappNumber: '1112223333', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1024',
    ticketInfo: 'Tickets available online. VIP passes include lunch.', reviews: generateReviews(8), isFeatured: true,
  },
  {
    id: 'event-2',
    title: { en: 'Slemani International Art Fair', ar: 'معرض السليمانية الدولي للفنون', ku: 'پێشانگای نێودەوڵەتی سلێمانی بۆ هونەر' },
    description: { en: 'A week-long celebration of contemporary and traditional art from around the world, featuring over 100 artists.', ar: 'احتفال لمدة أسبوع بالفن المعاصر والتقليدي من جميع أنحاء العالم.', ku: 'هەفتەیەک لە ئاهەنگگێڕان بۆ هونەری هاوچەرخ و truyền thốngی.' },
    organizerId: 'user-4', organizerName: 'Kurdistan Arts Foundation', categoryId: 'art', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 14).toISOString(),
    venue: 'Slemani Museum', coordinates: { lat: 35.5620, lon: 45.4215 },
    organizerPhone: '4445556666', imageUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=1024',
    reviews: generateReviews(12), isTop: true,
  },
   {
    id: 'event-3',
    title: { en: 'Duhok Food Festival', ar: 'مهرجان دهوك للطعام', ku: 'فیستیڤاڵی خواردنی دهۆک' },
    description: { en: 'Taste the best of local and international cuisine. Live cooking shows and music.', ar: 'تذوق أفضل المأكولات المحلية والعالمية. عروض طهي حية وموسيقى.', ku: 'تامی باشترین خواردنە خۆماڵی و نێودەوڵەتییەکان بکە.' },
    organizerId: 'user-3', organizerName: 'Gourmet Gatherings', categoryId: 'food', cityId: 'duhok',
    date: new Date(Date.now() + 86400000 * 21).toISOString(),
    venue: 'Azadi Park, Duhok', coordinates: { lat: 36.8631, lon: 42.9856 },
    organizerPhone: '7778889999', whatsappNumber: '7778889999', imageUrl: 'https://images.unsplash.com/photo-1600326145359-3a44737d2aa6?q=80&w=1024',
    reviews: generateReviews(15), isFeatured: true, isTop: true,
  },
  {
    id: 'event-4',
    title: { en: 'Kurdish Music Night', ar: 'ليلة الموسيقى الكردية', ku: 'شەوی مۆسیقای کوردی' },
    description: { en: 'An unforgettable evening with the stars of Kurdish music. Traditional and modern tunes.', ar: 'أمسية لا تنسى مع نجوم الموسيقى الكردية. ألحان تقليدية وحديثة.', ku: 'ئێوارەیەکی لەبیرنەکراو لەگەڵ ئەستێرەکانی مۆسیقای کوردی.' },
    organizerId: 'user-1', organizerName: 'Melody Makers', categoryId: 'music', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    venue: 'Erbil Citadel Amphitheater', coordinates: { lat: 36.1912, lon: 44.0094 },
    organizerPhone: '1231231234', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1024',
    ticketInfo: 'Free admission.', reviews: generateReviews(5),
  },
  {
    id: 'event-5',
    title: { en: 'Halabja Marathon for Peace', ar: 'ماراثون حلبجة للسلام', ku: 'ماراسۆنی هەڵەبجە بۆ ئاشتی' },
    description: { en: 'Run for peace and rememberance. A 10k race through the historic city of Halabja.', ar: 'اركض من أجل السلام والذكرى. سباق 10 كيلومترات عبر مدينة حلبجة التاريخية.', ku: 'بۆ ئاشتی و یادەوەری ڕابکە. پێشبڕکێیەکی ١٠ کم بەناو شاری مێژوویی هەڵەبجەدا.' },
    organizerId: 'user-6', organizerName: 'Runners for Change', categoryId: 'sports', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 30).toISOString(),
    venue: 'Halabja Monument', coordinates: { lat: 35.1844, lon: 45.9830 },
    organizerPhone: '5551112222', imageUrl: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=1024',
    ticketInfo: 'Registration required online. T-shirt included.', reviews: generateReviews(7), isTop: true,
  },
  {
    id: 'event-6',
    title: { en: 'Kirkuk Business Expo', ar: 'معرض كركوك للأعمال', ku: 'پێشانگای بازرگانی کەرکووک' },
    description: { en: 'Connect with local and national businesses. A premier networking event for entrepreneurs.', ar: 'تواصل مع الشركات المحلية والوطنية. حدث تواصل رئيسي لرواد الأعمال.', ku: 'پەیوەندی لەگەڵ بزنسە ناوخۆیی و نیشتمانییەکان بکە. بۆنەیەکی نێتۆرکینگی پێشەنگ بۆ خاوەنکاران.' },
    organizerId: 'user-8', organizerName: 'Kirkuk Chamber of Commerce', categoryId: 'business', cityId: 'kirkuk',
    date: new Date(Date.now() + 86400000 * 45).toISOString(),
    venue: 'Kirkuk International Fair', coordinates: { lat: 35.4673, lon: 44.3919 },
    organizerPhone: '8887776666', imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=1024',
    reviews: generateReviews(4), isFeatured: true,
  },
  {
    id: 'event-7',
    title: { en: 'Zaxo Bridge Festival', ar: 'مهرجان جسر زاخو', ku: 'فیستیڤاڵی پردی زاخۆ' },
    description: { en: 'A cultural celebration at the historic Delal Bridge, with live music, dancing, and local crafts.', ar: 'احتفال ثقافي عند جسر دلال التاريخي، مع موسيقى حية ورقص وحرف يدوية محلية.', ku: 'ئاهەنگێکی کەلتوری لەسەر پردی مێژوویی دەلال، لەگەڵ مۆسیقای زیندوو، سەم و کاری دەستی ناوخۆیی.' },
    organizerId: 'user-9', organizerName: 'Zaxo Municipality', categoryId: 'art', cityId: 'duhok',
    date: new Date(Date.now() + 86400000 * 50).toISOString(),
    venue: 'Delal Bridge', coordinates: { lat: 37.1436, lon: 42.6865 },
    organizerPhone: '9998887777', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1024',
    reviews: generateReviews(9),
  },
  // ... Adding 18 more events to reach 25
  {
    id: 'event-8',
    title: { en: 'Erbil International Book Fair', ar: 'معرض أربيل الدولي للكتاب', ku: 'پێشانگای نێودەوڵەتی هەولێر بۆ کتێب' },
    description: { en: 'Discover new worlds in literature. Meet authors, attend signings, and find rare books.', ar: 'اكتشف عوالم جديدة في الأدب. قابل المؤلفين، واحضر التوقيعات، واعثر على كتب نادرة.', ku: 'جیهانی نوێ لە ئەدەبدا بدۆزەرەوە. چاوت بە نووسەران بکەوێت، بەشداری واژۆکردن بکە، و کتێبی دەگمەن بدۆزەرەوە.' },
    organizerId: 'user-2', organizerName: 'Kurdistan Publishers Union', categoryId: 'art', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    venue: 'Erbil International Fair Ground', coordinates: { lat: 36.2372, lon: 43.9518 },
    organizerPhone: '2224445555', imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1024',
    reviews: generateReviews(11), isTop: true
  },
  {
    id: 'event-9',
    title: { en: 'Slemani Startup Weekend', ar: 'عطلة نهاية الأسبوع للشركات الناشئة في السليمانية', ku: 'ویکئێندی ستارتئەپی سلێمانی' },
    description: { en: 'Build a startup in 54 hours. Pitch your idea, form a team, and create a viable product.', ar: 'ابنِ شركة ناشئة في 54 ساعة. قدم فكرتك، وشكل فريقًا، وأنشئ منتجًا قابلاً للتطبيق.', ku: 'ستارتئەپێک لە ٥٤ کاتژمێردا دروست بکە. بیرۆکەکەت پێشکەش بکە، تیمێک پێکبهێنە، و بەرهەمێکی کارا دروست بکە.' },
    organizerId: 'user-5', organizerName: 'Five One Labs', categoryId: 'tech', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 25).toISOString(),
    venue: 'The American University of Iraq, Sulaimani', coordinates: { lat: 35.5494, lon: 45.3621 },
    organizerPhone: '5557778888', imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1024',
    reviews: generateReviews(6), isFeatured: true
  },
  {
    id: 'event-10',
    title: { en: 'Duhok International Film Festival', ar: 'مهرجان دهوك السينمائي الدولي', ku: 'فیستیڤاڵی نێودەوڵەتی فیلمی دهۆک' },
    description: { en: 'A showcase of Kurdish and international cinema. Screenings, Q&A sessions with directors, and workshops.', ar: 'عرض للسينما الكردية والعالمية. عروض، وجلسات أسئلة وأجوبة مع المخرجين، وورش عمل.', ku: 'نمایشێک بۆ سینەمای کوردی و نێودەوڵەتی. نمایشکردن، دانیشتنی پرسیار و وەڵام لەگەڵ دەرهێنەران، و وۆرکشۆپ.' },
    organizerId: 'user-7', organizerName: 'Duhok Cinema Directorate', categoryId: 'art', cityId: 'duhok',
    date: new Date(Date.now() + 86400000 * 60).toISOString(),
    venue: 'Congres Hall, University of Duhok', coordinates: { lat: 36.8573, lon: 43.0031 },
    organizerPhone: '7779990000', imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1024',
    reviews: generateReviews(14), isTop: true
  },
  //... Continue adding events up to 25
  {
    id: 'event-11',
    title: { en: 'Kurdistan Premier League Final', ar: 'نهائي دوري كردستان الممتاز', ku: 'یاری کۆتایی خولی نایابی کوردستان' },
    description: { en: 'The championship match! Watch the top two teams battle it out for the trophy.', ar: 'مباراة البطولة! شاهد أفضل فريقين يتنافسان على الكأس.', ku: 'یاری پاڵەوانێتی! سەیری دوو باشترین تیم بکە کە بۆ جامەکە ڕکابەری دەکەن.' },
    organizerId: 'user-11', organizerName: 'Kurdistan Football Association', categoryId: 'sports', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 18).toISOString(),
    venue: 'Franso Hariri Stadium', coordinates: { lat: 36.1705, lon: 44.0089 },
    organizerPhone: '1113334444', imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1024',
    reviews: generateReviews(18), isTop: true, isFeatured: true
  },
  {
    id: 'event-12',
    title: { en: 'Slemani Traditional Food Bazaar', ar: 'بازار السليمانية للمأكولات التقليدية', ku: 'بازاڕی خواردنی truyền thốngی سلێمانی' },
    description: { en: 'Experience the authentic taste of Kurdish cuisine. A variety of homemade dishes and sweets.', ar: 'جرب الطعم الأصيل للمطبخ الكردي. مجموعة متنوعة من الأطباق والحلويات المصنوعة منزليًا.', ku: 'تامی ڕەسەنی چێشتی کوردی بکە. جۆرەها خواردن و شیرینی ماڵەوە.' },
    organizerId: 'user-12', organizerName: 'Slemani Culinary Heritage', categoryId: 'food', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    venue: 'Amna Suraka Museum Park', coordinates: { lat: 35.5683, lon: 45.4244 },
    organizerPhone: '2225556666', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1024',
    reviews: generateReviews(9)
  },
  {
    id: 'event-13',
    title: { en: 'Mount Halgurd Hiking Trip', ar: 'رحلة تسلق جبل هالغورد', ku: 'گەشتی شاخەوانی چیای هەڵگورد' },
    description: { en: 'A guided hiking adventure to the highest peak in Iraq. For experienced hikers only.', ar: 'مغامرة تسلق موجهة إلى أعلى قمة في العراق. للمتسلقين ذوي الخبرة فقط.', ku: 'سەرکێشییەکی شاخەوانی بە ڕێنمایی بۆ بەرزترین لووتکەی عێراق. تەنها بۆ شاخەوانە شارەزاکان.' },
    organizerId: 'user-13', organizerName: 'Kurdistan Adventures', categoryId: 'sports', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 40).toISOString(),
    venue: 'Choman District', coordinates: { lat: 36.6333, lon: 44.8833 },
    organizerPhone: '3336667777', imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1024',
    reviews: generateReviews(6)
  },
  {
    id: 'event-14',
    title: { en: 'Digital Marketing Workshop', ar: 'ورشة عمل التسويق الرقمي', ku: 'وۆرکشۆپی بازاڕکردنی دیجیتاڵی' },
    description: { en: 'Learn the latest strategies in SEO, social media marketing, and content creation from industry experts.', ar: 'تعلم أحدث الاستراتيجيات في تحسين محركات البحث، والتسويق عبر وسائل التواصل الاجتماعي، وإنشاء المحتوى من خبراء الصناعة.', ku: 'نوێترین ستراتیژییەکانی SEO، بازاڕکردنی سۆشیال میدیا، و دروستکردنی ناوەڕۆک لە پسپۆڕانی بوارەکەوە فێربە.' },
    organizerId: 'user-14', organizerName: 'Growth Hackers KR', categoryId: 'business', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 22).toISOString(),
    venue: 'Talary Hunar', coordinates: { lat: 35.5638, lon: 45.4350 },
    organizerPhone: '4447778888', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1024',
    reviews: generateReviews(8), isFeatured: true
  },
  {
    id: 'event-15',
    title: { en: 'Classical Music Concert', ar: 'حفل موسيقى كلاسيكية', ku: 'کۆنسێرتی مۆسیقای کلاسیک' },
    description: { en: 'An evening of Beethoven and Mozart performed by the Kurdistan National Orchestra.', ar: 'أمسية من بيتهوفن وموزارت تؤديها أوركسترا كردستان الوطنية.', ku: 'ئێوارەیەکی بتهۆڤن و مۆزارت بە izvrsnosti ئۆرکێسترای نیشتمانی کوردستان.' },
    organizerId: 'user-15', organizerName: 'Kurdistan Philharmonic', categoryId: 'music', cityId: 'duhok',
    date: new Date(Date.now() + 86400000 * 35).toISOString(),
    venue: 'Duhok Opera House', coordinates: { lat: 36.8610, lon: 42.9901 },
    organizerPhone: '5558889999', imageUrl: 'https://images.unsplash.com/photo-1520442053-229235955369?q=80&w=1024',
    reviews: generateReviews(10), isTop: true
  },
  {
    id: 'event-16',
    title: { en: 'Erbil Gaming Expo', ar: 'معرض أربيل للألعاب', ku: 'پێشانگای گەیمینگی هەولێر' },
    description: { en: 'The biggest gaming event in the region! Tournaments, new game demos, and cosplay competitions.', ar: 'أكبر حدث للألعاب في المنطقة! بطولات، وعروض لألعاب جديدة، ومسابقات كوسبلاي.', ku: 'گەورەترین بۆنەی گەیمینگ لە ناوچەکە! پاڵەوانێتی، دیمۆی یاری نوێ، و پێشبڕکێی کۆسپلەی.' },
    organizerId: 'user-1', organizerName: 'Pixel Warriors', categoryId: 'tech', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 80).toISOString(),
    venue: 'Erbil International Fair Ground', coordinates: { lat: 36.2372, lon: 43.9518 },
    organizerPhone: '1112224444', imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1024',
    reviews: generateReviews(20), isFeatured: true, isTop: true
  },
  {
    id: 'event-17',
    title: { en: 'Yoga in the Park', ar: 'يوغا في الحديقة', ku: 'یۆگا لە پارکدا' },
    description: { en: 'A relaxing morning yoga session in the beautiful Sami Abdulrahman Park. All levels welcome.', ar: 'جلسة يوغا صباحية مريحة في حديقة سامي عبد الرحمن الجميلة. جميع المستويات مرحب بها.', ku: 'دانیشتنێکی یۆگای بەیانیانی ئارامبەخش لە پارکی جوانی سامی عەبدولڕەحمان. هەموو ئاستەکان بەخێربێن.' },
    organizerId: 'user-6', organizerName: 'Zen Kurdistan', categoryId: 'sports', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 4).toISOString(),
    venue: 'Sami Abdulrahman Park', coordinates: { lat: 36.1950, lon: 43.9822 },
    organizerPhone: '6668889999', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1024',
    reviews: generateReviews(5)
  },
  {
    id: 'event-18',
    title: { en: 'Slemani Poetry Night', ar: 'أمسية شعرية في السليمانية', ku: 'شەوی شیعری سلێمانی' },
    description: { en: 'An evening dedicated to the powerful words of contemporary Kurdish poets.', ar: 'أمسية مخصصة للكلمات القوية لشعراء كرد معاصرين.', ku: 'ئێوارەیەک تەرخانکراو بۆ وشە بەهێزەکانی شاعیرانی هاوچەرخی کورد.' },
    organizerId: 'user-4', organizerName: 'Galawej Cultural Center', categoryId: 'art', cityId: 'sulaymaniyah',
    date: new Date(Date.now() + 86400000 * 28).toISOString(),
    venue: 'Chwar Chra Hotel', coordinates: { lat: 35.5653, lon: 45.4347 },
    organizerPhone: '4446667777', imageUrl: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?q=80&w=1024',
    reviews: generateReviews(7)
  },
  {
    id: 'event-19',
    title: { en: 'Entrepreneurship Bootcamp', ar: 'معسكر تدريب ريادة الأعمال', ku: 'کەمپی ڕاهێنانی خاوەنکارێتی' },
    description: { en: 'A 3-day intensive bootcamp for aspiring entrepreneurs. Learn from successful founders and VCs.', ar: 'معسكر تدريبي مكثف لمدة 3 أيام لرواد الأعمال الطموحين. تعلم من مؤسسين ناجحين ومستثمرين.', ku: 'کەمپێکی چڕی ٣ ڕۆژە بۆ خاوەنکارە ئارەزوومەندەکان. لە دامەزرێنەرە سەرکەوتووەکان و سەرمایەدارەکانەوە فێربە.' },
    organizerId: 'user-8', organizerName: 'Ignite Kurdistan', categoryId: 'business', cityId: 'erbil',
    date: new Date(Date.now() + 86400000 * 55).toISOString(),
    venue: 'Erbil Rotana Hotel', coordinates: { lat: 36.1897, lon: 43.9961 },
    organizerPhone: '8880001111', imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1024',
    reviews: generateReviews(10), isFeatured: true
  },
  {
    id: 'event-20',
    title: { en: 'Duhok Cycling Tour', ar: 'جولة دراجات في دهوك', ku: 'گەشتی پاسکیلسواری دهۆک' },
    description: { en: 'Explore the scenic landscapes around Duhok on a 50km cycling tour. Refreshments provided.', ar: 'استكشف المناظر الطبيعية الخلابة حول دهوك في جولة بالدراجات لمسافة 50 كم. يتم توفير المرطبات.', ku: 'دیمەنە جوانەکانی دەوروبەری دهۆک بگەڕێ لە گەشتێکی پاسکیلسواری ٥٠ کم. خواردنەوە دابین دەکرێت.' },
    organizerId: 'user-13', organizerName: 'Duhok Cyclists', categoryId: 'sports', cityId: 'duhok',
    date: new Date(Date.now() + 86400000 * 16).toISOString(),
    venue: 'Duhok Dam', coordinates: { lat: 36.9031, lon: 42.9866 },
    organizerPhone: '3337778888', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1024',
    reviews: generateReviews(4)
  },
// FIX: Removed a malformed object from the end of the array.
];
