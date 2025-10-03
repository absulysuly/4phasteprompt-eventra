"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageProvider';
import { useTranslations } from '../hooks/useTranslations';
import VenueDetailsModal from './VenueDetailsModal';
import VenueCard from './VenueCard';
import HeroSection from './HeroSection';
import MonthFilterBar from './MonthFilterBar';
import GovernorateFilter from './GovernorateFilter';
import CategoryTabs from './CategoryTabs';

interface Venue {
  id: string;
  publicId: string;
  type: string;
  title: string;
  description: string;
  location: string;
  city: string;
  category: string;
  priceRange: string;
  imageUrl?: string;
  galleryUrls?: string[];
  eventDate?: string;
  amenities?: string[];
  features?: string[];
  whatsappPhone?: string;
  website?: string;
  bookingUrl?: string;
  featured: boolean;
  verified: boolean;
}

interface VenueStats {
  totalVenues: number;
  totalEvents: number;
  activeCities: number;
  featuredVenues: number;
}

const ITEMS_PER_PAGE = 12;

const GOVERNORATES = [
  'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Sulaymaniyah', 'Duhok',
  'Kirkuk', 'Anbar', 'Najaf', 'Karbala', 'Diyala', 'Wasit',
  'Maysan', 'Dhi Qar', 'Muthanna', 'Qadisiyyah', 'Babil', 
  'Saladin', 'Halabja'
];

const VENUE_CATEGORIES = [
  { id: 'all', name: 'All Venues', icon: '🏛️', count: 0 },
  { id: 'EVENT', name: 'Events', icon: '🎪', count: 0 },
  { id: 'HOTEL', name: 'Hotels', icon: '🏨', count: 0 },
  { id: 'RESTAURANT', name: 'Restaurants', icon: '🍽️', count: 0 },
  { id: 'ACTIVITY', name: 'Activities', icon: '🎯', count: 0 },
  { id: 'SERVICE', name: 'Services', icon: '⚙️', count: 0 }
];

export default function DiscoveryPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState(VENUE_CATEGORIES);
  const [stats, setStats] = useState<VenueStats>({ totalVenues: 0, totalEvents: 0, activeCities: 0, featuredVenues: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [monthCounts, setMonthCounts] = useState<Record<string, number>>({});
  
  const { language, isRTL } = useLanguage();
  const { t } = useTranslations();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Fetch venue stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/venues/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch category counts
  const fetchCategoryCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/venues/counts-by-category');
      if (response.ok) {
        const counts = await response.json();
        setCategories(prevCategories => 
          prevCategories.map(cat => ({
            ...cat,
            count: cat.id === 'all' ? 
              Object.values(counts).reduce((sum: number, count: any) => sum + count, 0) :
              counts[cat.id] || 0
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  }, []);

  // Fetch month counts
  const fetchMonthCounts = useCallback(async () => {
    try {
      const response = await fetch('/api/events/counts');
      if (response.ok) {
        const data = await response.json();
        setMonthCounts(data);
      }
    } catch (error) {
      console.error('Error fetching month counts:', error);
    }
  }, []);

  // Fetch venues
  const fetchVenues = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        lang: language
      });

      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedGovernorate !== 'all') params.append('city', selectedGovernorate);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);

      const response = await fetch(`/api/venues?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        const newVenues = Array.isArray(data) ? data : data.venues || [];
        
        if (reset || pageNum === 1) {
          setVenues(newVenues);
          setFilteredVenues(newVenues);
        } else {
          setVenues(prev => [...prev, ...newVenues]);
          setFilteredVenues(prev => [...prev, ...newVenues]);
        }
        
        setHasMore(newVenues.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [language, selectedCategory, selectedGovernorate, selectedMonth]);

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchCategoryCounts(),
      fetchMonthCounts(),
      fetchVenues(1, true)
    ]);
  }, [fetchStats, fetchCategoryCounts, fetchMonthCounts, fetchVenues]);

  // Refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchVenues(1, true);
  }, [selectedCategory, selectedGovernorate, selectedMonth, fetchVenues]);

  // Infinite scroll
  useEffect(() => {
    const loadingElement = loadingRef.current;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchVenues(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingElement) {
      observerRef.current.observe(loadingElement);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchVenues]);

  // Handle venue selection
  const handleVenueSelect = async (venue: Venue) => {
    try {
      // Fetch detailed venue data
      const response = await fetch(`/api/venues/${venue.publicId}`);
      if (response.ok) {
        const detailedVenue = await response.json();
        setSelectedVenue(detailedVenue);
      } else {
        setSelectedVenue(venue);
      }
    } catch (error) {
      console.error('Error fetching venue details:', error);
      setSelectedVenue(venue);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">IQ</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white tracking-wide">IRAQ DISCOVERY</h1>
                <p className="text-xs text-gray-400">Explore Beautiful Iraq</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/discovery" className="flex items-center space-x-2 text-amber-400 font-medium">
                <span>🏛️</span>
                <span>Discover</span>
              </Link>
              <Link href="/events" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <span>🎪</span>
                <span>Events</span>
              </Link>
              <Link href="/about" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <span>📖</span>
                <span>About</span>
              </Link>
            </nav>

            {/* Dashboard Link */}
            <Link 
              href="/dashboard"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="space-y-6 mb-8">
          {/* Category Tabs */}
          <CategoryTabs 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Month Filter */}
          <MonthFilterBar
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthCounts={monthCounts}
          />

          {/* Governorate Filter */}
          <GovernorateFilter
            governorates={GOVERNORATES}
            selectedGovernorate={selectedGovernorate}
            onGovernorateChange={setSelectedGovernorate}
          />
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {loading ? 'Loading...' : `${filteredVenues.length} ${t('discovery.venuesFound')}`}
            </h2>
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{stats.activeCities} Cities</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>⭐</span>
                <span>{stats.featuredVenues} Featured</span>
              </span>
            </div>
          </div>
        </div>

        {/* Venue Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-2xl p-6">
                  <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVenues.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  onSelect={handleVenueSelect}
                  language={language}
                />
              ))}
            </div>

            {/* Loading More */}
            {hasMore && (
              <div ref={loadingRef} className="flex justify-center py-8">
                {loadingMore ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                ) : (
                  <div className="h-8"></div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">{t('discovery.noVenuesFound')}</h3>
            <p className="text-gray-400 mb-6">{t('discovery.tryDifferentFilters')}</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedGovernorate('all');
                setSelectedMonth('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              {t('discovery.clearFilters')}
            </button>
          </div>
        )}
      </main>

      {/* Venue Details Modal */}
      {selectedVenue && (
        <VenueDetailsModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          language={language}
          isRTL={isRTL}
        />
      )}
    </div>
  );
}