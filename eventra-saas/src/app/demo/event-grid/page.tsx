'use client';

import React, { useState, useMemo } from 'react';
import EventCardGrid from '@/components/discovery/EventCardGrid';
import MonthFilterBar from '@/components/discovery/MonthFilterBar';
import GovernorateFilterBar from '@/components/discovery/GovernorateFilterBar';
import CategoryTabsNavigation from '@/components/discovery/CategoryTabsNavigation';
import { EventCardData } from '@/components/discovery/EventCard';

// Mock data generator
const generateMockEvents = (count: number): EventCardData[] => {
  const categories = ['WEDDING', 'CONFERENCE', 'CONCERT', 'EXHIBITION', 'SPORT', 'SOCIAL'] as const;
  const governorates = [
    'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Sulaymaniyah', 
    'Duhok', 'Najaf', 'Karbala', 'Anbar', 'Diyala'
  ];
  
  const venues = [
    { name: 'Grand Tigris Hall', nameAr: 'قاعة دجلة الكبرى', nameKu: 'هۆڵی دیجلەی مەزن' },
    { name: 'Babylon Conference Center', nameAr: 'مركز بابل للمؤتمرات', nameKu: 'ناوەندی کۆنفرانسی بابل' },
    { name: 'Mesopotamia Arena', nameAr: 'ساحة بلاد الرافدين', nameKu: 'یاریگای میزۆپۆتامیا' },
    { name: 'Ziggurat Gardens', nameAr: 'حدائق الزقورة', nameKu: 'باخچەکانی زیگورات' },
    { name: 'Ishtar Palace', nameAr: 'قصر عشتار', nameKu: 'کۆشکی ئیشتار' }
  ];

  const eventTitles = [
    { en: 'Summer Music Festival', ar: 'مهرجان الموسيقى الصيفي', ku: 'جەژنی مۆسیقای هاوین' },
    { en: 'Tech Innovation Summit', ar: 'قمة الابتكار التقني', ku: 'لوتکەی نوێکاری تەکنەلۆژی' },
    { en: 'Wedding Celebration', ar: 'احتفال الزفاف', ku: 'ئاهەنگی زەماوەند' },
    { en: 'Art Exhibition: Modern Iraq', ar: 'معرض فني: العراق الحديث', ku: 'پێشانگای هونەر: عێراقی نوێ' },
    { en: 'Football Championship Finals', ar: 'نهائي بطولة كرة القدم', ku: 'یاریی کۆتایی پاڵەوانیتی تۆپی پێ' },
    { en: 'Community Gathering', ar: 'تجمع المجتمع', ku: 'کۆبوونەوەی کۆمەڵگا' },
    { en: 'Business Networking Event', ar: 'فعالية التواصل التجاري', ku: 'ڕووداوی تۆڕی بازرگانی' },
    { en: 'Classical Music Concert', ar: 'حفلة موسيقى كلاسيكية', ku: 'کۆنسێرتی مۆسیقای کلاسیک' }
  ];

  const images = [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80'
  ];

  return Array.from({ length: count }, (_, i) => {
    const category = categories[i % categories.length];
    const venue = venues[i % venues.length];
    const title = eventTitles[i % eventTitles.length];
    const governorate = governorates[i % governorates.length];
    
    // Generate dates spread across the year
    const month = (i % 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const date = new Date(2025, month - 1, day);

    return {
      id: `event-${i + 1}`,
      title: title.en,
      titleAr: title.ar,
      titleKu: title.ku,
      slug: `event-${i + 1}-${title.en.toLowerCase().replace(/\s+/g, '-')}`,
      category,
      imageUrl: images[i % images.length],
      venue: {
        name: venue.name,
        nameAr: venue.nameAr,
        nameKu: venue.nameKu,
        governorate
      },
      date: date.toISOString(),
      startTime: `${Math.floor(Math.random() * 12) + 1}:00 PM`,
      endTime: `${Math.floor(Math.random() * 3) + 6}:00 PM`,
      capacity: Math.floor(Math.random() * 500) + 100,
      currentAttendees: Math.floor(Math.random() * 400),
      priceFrom: [25000, 50000, 75000, 100000, 150000][Math.floor(Math.random() * 5)],
      isFeatured: i % 7 === 0,
      isNew: i % 5 === 0
    };
  });
};

export default function EventGridDemoPage() {
  const [locale, setLocale] = useState<'en' | 'ar' | 'ku'>('en');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Generate 60 mock events
  const allEvents = useMemo(() => generateMockEvents(60), []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Filter by governorate
      if (selectedGovernorate && event.venue.governorate !== selectedGovernorate) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }

      // Filter by month
      if (selectedMonth !== null) {
        const eventMonth = new Date(event.date).getMonth() + 1;
        if (eventMonth !== selectedMonth) {
          return false;
        }
      }

      return true;
    });
  }, [allEvents, selectedGovernorate, selectedCategory, selectedMonth]);

  // Calculate event counts by month for the filter bar
  const eventCountsByMonth = useMemo(() => {
    const counts: Record<number, number> = {};
    
    allEvents.forEach(event => {
      // Apply current filters except month
      if (selectedGovernorate && event.venue.governorate !== selectedGovernorate) return;
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) return;

      const month = new Date(event.date).getMonth() + 1;
      counts[month] = (counts[month] || 0) + 1;
    });

    return counts;
  }, [allEvents, selectedGovernorate, selectedCategory]);

  const handleLocaleChange = (newLocale: 'en' | 'ar' | 'ku') => {
    setLocale(newLocale);
  };

  const simulateLoading = (callback: () => void) => {
    setLoading(true);
    setTimeout(() => {
      callback();
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Event Discovery Demo
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length} events found
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {(['en', 'ar', 'ku'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLocaleChange(lang)}
                  className={`
                    px-4 py-2 rounded-md font-semibold text-sm transition-all
                    ${locale === lang
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <CategoryTabsNavigation
        activeCategory={selectedCategory}
        onCategoryChange={(category) => simulateLoading(() => setSelectedCategory(category))}
        locale={locale}
      />

      {/* Governorate Filter */}
      <GovernorateFilterBar
        selectedGovernorate={selectedGovernorate}
        onGovernorateChange={(gov) => simulateLoading(() => setSelectedGovernorate(gov))}
        locale={locale}
      />

      {/* Month Filter */}
      <MonthFilterBar
        selectedMonth={selectedMonth}
        onMonthChange={(month) => simulateLoading(() => setSelectedMonth(month))}
        locale={locale}
        year={2025}
        eventCounts={eventCountsByMonth}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <EventCardGrid
          events={filteredEvents}
          locale={locale}
          loading={loading}
          showPrice={true}
          showCapacity={true}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>Event Discovery System Demo • Eventra Platform</p>
          <p className="text-sm mt-2">
            Showing {filteredEvents.length} of {allEvents.length} total events
          </p>
        </div>
      </footer>
    </div>
  );
}
