import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@iraqevents.com' },
    update: {},
    create: {
      email: 'test@iraqevents.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  // Create test events with translations
  const events = [
    {
      date: new Date('2025-03-15T10:00:00Z'),
      category: 'tech',
      whatsappGroup: 'https://chat.whatsapp.com/test1',
      contactMethod: 'ai-summit@iraqevents.com',
      publicId: 'ai-summit-2025',
      city: 'baghdad',
      userId: testUser.id,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'AI Innovation Summit Baghdad',
            description: 'Join us for a comprehensive exploration of artificial intelligence and machine learning technologies that are shaping the future of Iraq.',
            location: 'Baghdad Tech Center, Baghdad'
          },
          {
            locale: 'ar',
            title: 'قمة الابتكار في الذكاء الاصطناعي بغداد',
            description: 'انضم إلينا لاستكشاف شامل لتقنيات الذكاء الاصطناعي والتعلم الآلي التي تشكل مستقبل العراق.',
            location: 'مركز بغداد التقني، بغداد'
          },
          {
            locale: 'ku',
            title: 'کۆنگرەی داهێنانی زیرەکی دەستکرد لە بەغداد',
            description: 'لەگەڵمان بن بۆ گەڕانێکی تەواو بە تەکنەلۆژیای زیرەکی دەستکرد کە داهاتووی عێراق شێوە دەدات.',
            location: 'ناوەندی تەکنەلۆژیای بەغداد، بەغداد'
          }
        ]
      }
    },
    {
      date: new Date('2025-03-20T18:00:00Z'),
      category: 'music',
      whatsappGroup: 'https://chat.whatsapp.com/test2',
      contactMethod: 'music-festival@kurdistan.org',
      publicId: 'kurdish-music-festival',
      city: 'erbil',
      userId: testUser.id,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Kurdish Music Festival',
            description: 'Experience the rich musical heritage of Kurdistan with traditional and contemporary Kurdish artists performing live.',
            location: 'Central Park, Erbil'
          },
          {
            locale: 'ar',
            title: 'مهرجان الموسيقى الكردية',
            description: 'اختبر التراث الموسيقي الغني لكردستان مع فنانين كرد تقليديين ومعاصرين يؤدون مباشرة.',
            location: 'الحديقة المركزية، أربيل'
          },
          {
            locale: 'ku',
            title: 'فێستیڤاڵی مۆسیقای کوردی',
            description: 'میراتی مۆسیقی دەوڵەمەندی کوردستان تاقی بکەرەوە لەگەڵ هونەرمەندانی کوردی نەریتی و سەردەمی کە زیندوو نمایش دەکەن.',
            location: 'پارکی ناوەندی، هەولێر'
          }
        ]
      }
    },
    {
      date: new Date('2025-03-25T09:00:00Z'),
      category: 'business',
      whatsappGroup: 'https://chat.whatsapp.com/test3',
      contactMethod: '+964-xxx-xxxx',
      publicId: 'business-workshop-basra',
      city: 'basra',
      userId: testUser.id,
      translations: {
        create: [
          {
            locale: 'en',
            title: 'Business Leadership Workshop',
            description: 'Learn essential leadership skills and networking strategies for business growth in the Middle East market.',
            location: 'Business District, Basra'
          },
          {
            locale: 'ar',
            title: 'ورشة عمل القيادة التجارية',
            description: 'تعلم مهارات القيادة الأساسية واستراتيجيات التشبيك لنمو الأعمال في السوق الشرق أوسطية.',
            location: 'المنطقة التجارية، البصرة'
          },
          {
            locale: 'ku',
            title: 'وۆرکشۆپی ڕابەرایەتی بازرگانی',
            description: 'کارامەییەکانی ڕابەرایەتی بنەڕەتی و ستراتیژی تۆڕسازی بۆ گەشەی بازرگانی لە بازاڕی ڕۆژهەڵاتی ناوەڕاست فێر ببە.',
            location: 'ناحیەی بازرگانی، بەسرە'
          }
        ]
      }
    },
  ];

  for (const eventData of events) {
    await prisma.event.upsert({
      where: { publicId: eventData.publicId },
      update: {},
      create: eventData,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });