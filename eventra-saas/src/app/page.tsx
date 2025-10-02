'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Users, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import EventCardGrid from '@/components/discovery/EventCardGrid';
import CategoryTabsNavigation from '@/components/discovery/CategoryTabsNavigation';
import { EventCardData } from '@/components/discovery/EventCard';

interface Stats {
  total: number;
  byType: Record<string, number>;
}

// Generate featured mock events for homepage
const generateFeaturedEvents = (): EventCardData[] => {
  const events = [
    {
      id: '1',
      title: 'Grand Wedding Celebration',
      titleAr: 'حفل زفاف كبير',
      titleKu: 'ئاهەنگی زەماوەندی گەورە',
      slug: 'grand-wedding-celebration',
      category: 'WEDDING' as const,
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      venue: {
        name: 'Ishtar Palace',
        nameAr: 'قصر عشتار',
        nameKu: 'کۆشکی ئیشتار',
        governorate: 'Baghdad'
      },
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '6:00 PM',
      capacity: 500,
      currentAttendees: 350,
      priceFrom: 150000,
      isFeatured: true
    },
    {
      id: '2',
      title: 'Tech Innovation Summit 2025',
      titleAr: 'قمة الابتكار التقني 2025',
      titleKu: 'لوتکەی نوێکاری تەکنەلۆژی 2025',
      slug: 'tech-innovation-summit',
      category: 'CONFERENCE' as const,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      venue: {
        name: 'Babylon Conference Center',
        nameAr: 'مركز بابل للمؤتمرات',
        nameKu: 'ناوەندی کۆنفرانسی بابل',
        governorate: 'Erbil'
      },
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '9:00 AM',
      capacity: 300,
      currentAttendees: 180,
      priceFrom: 75000,
      isFeatured: true
    },
    {
      id: '3',
      title: 'Live Music Festival',
      titleAr: 'مهرجان الموسيقى الحية',
      titleKu: 'جەژنی مۆسیقای زیندوو',
      slug: 'live-music-festival',
      category: 'CONCERT' as const,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      venue: {
        name: 'Mesopotamia Arena',
        nameAr: 'ساحة بلاد الرافدين',
        nameKu: 'یاریگای میزۆپۆتامیا',
        governorate: 'Basra'
      },
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '7:00 PM',
      capacity: 1000,
      currentAttendees: 850,
      priceFrom: 50000,
      isNew: true
    },
    {
      id: '4',
      title: 'Modern Art Exhibition',
      titleAr: 'معرض الفن الحديث',
      titleKu: 'پێشانگای هونەری مۆدێرن',
      slug: 'modern-art-exhibition',
      category: 'EXHIBITION' as const,
      imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80',
      venue: {
        name: 'Ziggurat Gardens',
        nameAr: 'حدائق الزقورة',
        nameKu: 'باخچەکانی زیگورات',
        governorate: 'Najaf'
      },
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '10:00 AM',
      priceFrom: 25000,
      isNew: true
    }
  ];
  return events;
};

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const featuredEvents = useMemo(() => generateFeaturedEvents(), []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/venues/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filteredEvents = featuredEvents.filter(event => 
    selectedCategory === 'ALL' || event.category === selectedCategory
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section - Modern & Eye-Catching */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="text-center">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-6 animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>Discover Amazing Events in Iraq</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Experience Iraq's
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 text-transparent bg-clip-text mt-2">
                Best Events
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              From weddings to concerts, conferences to exhibitions - discover and book the perfect venue for your next event
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/demo/event-grid"
                className="group px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Browse Events</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/venues/list"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 flex items-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                <span>All Venues</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(239 246 255)" />
          </svg>
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="bg-white border-y border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mb-3">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">1,200+</div>
              <div className="text-gray-600 font-medium mt-1">Events</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-2xl mb-3">
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats?.total || 500}+</div>
              <div className="text-gray-600 font-medium mt-1">Venues</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-2xl mb-3">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">50K+</div>
              <div className="text-gray-600 font-medium mt-1">Attendees</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-100 p-4 rounded-2xl mb-3">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">18</div>
              <div className="text-gray-600 font-medium mt-1">Cities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the hottest events happening across Iraq right now
          </p>
        </div>
        
        {/* Category Filter */}
        <CategoryTabsNavigation
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          locale="en"
        />
        
        {/* Event Grid */}
        <div className="mt-8">
          <EventCardGrid
            events={filteredEvents}
            locale="en"
            showPrice={true}
            showCapacity={true}
          />
        </div>
        
        {/* View More Button */}
        <div className="text-center mt-12">
          <Link
            href="/demo/event-grid"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>View All Events</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Why Choose Eventra?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Comprehensive</h3>
              <p className="text-slate-600">
                Complete database of venues across Iraq and Kurdistan
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Verified</h3>
              <p className="text-slate-600">
                All listings are verified for accuracy and quality
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Local & Authentic</h3>
              <p className="text-slate-600">
                Discover authentic Iraqi experiences and hidden gems
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Explore?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start discovering the best venues in Iraq today
          </p>
          <Link
            href="/venues/list"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all shadow-lg"
          >
            View All Venues
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Eventra</h3>
              <p className="text-slate-400">
                Your guide to Iraq's best venues and experiences
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/hotels" className="hover:text-white transition-colors">Hotels</Link></li>
                <li><Link href="/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
                <li><Link href="/tourism" className="hover:text-white transition-colors">Tourism</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Admin</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/admin/data-import" className="hover:text-white transition-colors">Import Data</Link></li>
                <li><Link href="/venues/list" className="hover:text-white transition-colors">All Venues</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Eventra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
