'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Venue {
  id: string;
  publicId: string;
  type: 'EVENT' | 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | 'SERVICE';
  title: string;
  description: string;
  location: string;
  city: string;
  category?: string;
  priceRange?: string;
  imageUrl?: string;
  featured: boolean;
  verified: boolean;
  cuisineType?: string;
  eventDate?: string;
  amenities?: string[];
}

export default function MultiVenueHomepage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'all', label: 'All', icon: '🌟' },
    { id: 'EVENT', label: 'Events', icon: '🎉' },
    { id: 'HOTEL', label: 'Hotels', icon: '🏨' },
    { id: 'RESTAURANT', label: 'Restaurants', icon: '🍽️' },
    { id: 'ACTIVITY', label: 'Activities', icon: '🎯' },
  ];

  useEffect(() => {
    fetchVenues();
  }, [activeTab]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.set('type', activeTab);
      }
      params.set('locale', 'en'); // TODO: Get from context
      
      const response = await fetch(`/api/venues?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVenueTypeIcon = (type: string) => {
    switch (type) {
      case 'EVENT': return '🎉';
      case 'HOTEL': return '🏨';
      case 'RESTAURANT': return '🍽️';
      case 'ACTIVITY': return '🎯';
      case 'SERVICE': return '🛎️';
      default: return '📍';
    }
  };

  const formatPrice = (priceRange?: string) => {
    if (!priceRange) return null;
    return priceRange;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🏰 Discover Iraq & Kurdistan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Events • Hotels • Restaurants • Activities - All in One Platform
          </p>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {venues.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' 
                      ? 'Venues are being added to our platform'
                      : `${tabs.find(t => t.id === activeTab)?.label} will be available soon`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the Platform
          </h2>
          <p className="text-xl mb-8 opacity-90">
            List your business and reach thousands of customers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/venues/create"
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              List Your Venue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  const getEventDate = (eventDate?: string) => {
    if (!eventDate) return null;
    return new Date(eventDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {venue.imageUrl ? (
          <Image
            src={venue.imageUrl}
            alt={venue.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            {getVenueTypeIcon(venue.type)}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {venue.featured && (
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              ⭐ Featured
            </span>
          )}
          {venue.verified && (
            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {getVenueTypeIcon(venue.type)} {venue.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
          {venue.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {venue.description}
        </p>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <span className="mr-1">📍</span>
          <span className="line-clamp-1">{venue.location}</span>
        </div>

        {/* Event Date */}
        {venue.type === 'EVENT' && venue.eventDate && (
          <div className="flex items-center text-blue-600 text-sm mb-2">
            <span className="mr-1">📅</span>
            <span>{getEventDate(venue.eventDate)}</span>
          </div>
        )}

        {/* Cuisine Type */}
        {venue.type === 'RESTAURANT' && venue.cuisineType && (
          <div className="flex items-center text-orange-600 text-sm mb-2">
            <span className="mr-1">🍴</span>
            <span>{venue.cuisineType}</span>
          </div>
        )}

        {/* Price Range */}
        {venue.priceRange && (
          <div className="flex items-center text-green-600 text-sm mb-3">
            <span className="mr-1">💰</span>
            <span>{formatPrice(venue.priceRange)}</span>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/venue/${venue.publicId}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}