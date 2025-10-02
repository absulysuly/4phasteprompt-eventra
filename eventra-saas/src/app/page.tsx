'use client';

/**
 * Homepage - Eventra
 * Main landing page with proper navigation to all sections
 */

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Stats {
  total: number;
  byType: Record<string, number>;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

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

  const categories = [
    {
      id: 'hotels',
      title: 'Hotels',
      description: 'Discover comfortable accommodations across Iraq',
      icon: '🏨',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      count: stats?.byType?.HOTEL || 0,
      href: '/hotels'
    },
    {
      id: 'restaurants',
      title: 'Restaurants',
      description: 'Explore authentic Iraqi and international cuisine',
      icon: '🍽️',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      count: stats?.byType?.RESTAURANT || 0,
      href: '/restaurants'
    },
    {
      id: 'tourism',
      title: 'Tourism & Activities',
      description: 'Experience the rich history and culture of Iraq',
      icon: '🎯',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      count: stats?.byType?.ACTIVITY || 0,
      href: '/tourism'
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Stay updated with the latest happenings',
      icon: '🎉',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      count: stats?.byType?.EVENT || 0,
      href: '/events'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Discover Iraq's Best
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                Hotels, Restaurants & More
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Your comprehensive guide to exploring accommodations, dining, and tourism across Iraq and Kurdistan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/venues/list"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                🗺️ Browse All Venues
              </Link>
              <Link
                href="/admin/data-import"
                className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all shadow-md border-2 border-slate-200"
              >
                ⚙️ Import Data
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.total > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-slate-600 font-medium mt-2">Total Venues</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">{stats.byType?.HOTEL || 0}</div>
                <div className="text-slate-600 font-medium mt-2">Hotels</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600">{stats.byType?.RESTAURANT || 0}</div>
                <div className="text-slate-600 font-medium mt-2">Restaurants</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600">{stats.byType?.ACTIVITY || 0}</div>
                <div className="text-slate-600 font-medium mt-2">Activities</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
          Explore by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className={`${category.bgColor} rounded-2xl p-8 border-2 ${category.borderColor} hover:shadow-xl transition-all hover:scale-[1.02] group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-6xl">{category.icon}</div>
                {category.count > 0 && (
                  <div className={`px-4 py-2 bg-gradient-to-r ${category.color} text-white rounded-full font-bold text-lg shadow-md`}>
                    {category.count}
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.title}
              </h3>
              <p className="text-slate-600 mb-4">
                {category.description}
              </p>
              <div className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${category.color} text-transparent bg-clip-text`}>
                Explore {category.title}
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
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
