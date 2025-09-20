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

  // Create test events
  const events = [
    {
      title: 'AI Innovation Summit Baghdad',
      description: 'Join us for a comprehensive exploration of artificial intelligence and machine learning technologies that are shaping the future of Iraq.',
      date: new Date('2025-03-15T10:00:00Z'),
      location: 'Baghdad Tech Center, Baghdad',
      category: 'tech',
      whatsappGroup: 'https://chat.whatsapp.com/test1',
      contactMethod: 'ai-summit@iraqevents.com',
      publicId: 'ai-summit-2025',
      userId: testUser.id,
    },
    {
      title: 'Kurdish Music Festival',
      description: 'Experience the rich musical heritage of Kurdistan with traditional and contemporary Kurdish artists performing live.',
      date: new Date('2025-03-20T18:00:00Z'),
      location: 'Central Park, Erbil',
      category: 'music',
      whatsappGroup: 'https://chat.whatsapp.com/test2',
      contactMethod: 'music-festival@kurdistan.org',
      publicId: 'kurdish-music-festival',
      userId: testUser.id,
    },
    {
      title: 'Business Leadership Workshop',
      description: 'Learn essential leadership skills and networking strategies for business growth in the Middle East market.',
      date: new Date('2025-03-25T09:00:00Z'),
      location: 'Business District, Basra',
      category: 'business',
      whatsappGroup: 'https://chat.whatsapp.com/test3',
      contactMethod: '+964-xxx-xxxx',
      publicId: 'business-workshop-basra',
      userId: testUser.id,
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