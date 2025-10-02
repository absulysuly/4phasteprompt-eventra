'use client';

/**
 * Venues List Page
 * Displays all imported venues with filtering
 */

import { useState, useEffect } from 'react';

interface Venue {
  id: string;
  publicId: string;
  type: string;
  title: string;
  description: string;
  location: string;
  city: string;
  imageUrl?: string;
  priceRange?: string;
  cuisineType?: string;
  featured: boolean;
  verified: boolean;
}

export default function VenuesListPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('all');

  useEffect(() => {
    loadVenues();
  }, [filter, cityFilter]);

  const loadVenues = async () => {
    setLoading(true);
    try {
      let url = '/api/venues?locale=en';
      
      if (filter !== 'ALL') {
        url += `&type=${filter}`;
      }
      
      if (cityFilter !== 'all') {
        url += `&city=${cityFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setVenues(data.venues || []);
      }
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      HOTEL: '🏨',
      RESTAURANT: '🍽️',
      ACTIVITY: '🎯',
      SERVICE: '🛎️',
      EVENT: '🎉'
    };
    return icons[type] || '📍';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      HOTEL: 'bg-blue-100 text-blue-800 border-blue-200',
      RESTAURANT: 'bg-orange-100 text-orange-800 border-orange-200',
      ACTIVITY: 'bg-purple-100 text-purple-800 border-purple-200',
      SERVICE: 'bg-green-100 text-green-800 border-green-200',
      EVENT: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const cities = Array.from(new Set(venues.map(v => v.city))).filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            🗺️ All Venues
          </h1>
          <p className="text-slate-600 text-lg">
            Browse hotels, restaurants, and activities across Iraq
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {['ALL', 'HOTEL', 'RESTAURANT', 'ACTIVITY', 'SERVICE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === type
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'ALL' ? '📋 All' : `${getTypeIcon(type)} ${type}`}
                  </button>
                ))}
              </div>
            </div>

            {cities.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  City
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city.charAt(0).toUpperCase() + city.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div>
            <div className="mb-4 text-slate-600 font-medium">
              {venues.length} venue{venues.length !== 1 ? 's' : ''} found
            </div>

            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  {/* Image */}
                  {venue.imageUrl && (
                    <div className="h-48 overflow-hidden bg-slate-200">
                      <img
                        src={venue.imageUrl}
                        alt={venue.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 
                            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getTypeColor(
                          venue.type
                        )}`}
                      >
                        {getTypeIcon(venue.type)} {venue.type}
                      </span>
                      {venue.featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          ⭐ Featured
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                      {venue.title}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {venue.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span>📍</span>
                        <span className="font-medium">{venue.location}</span>
                      </div>

                      {venue.cuisineType && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>🍴</span>
                          <span>{venue.cuisineType}</span>
                        </div>
                      )}

                      {venue.priceRange && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>💰</span>
                          <span className="font-medium">{venue.priceRange}</span>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <button className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {venues.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  No venues found
                </h3>
                <p className="text-slate-600">
                  Try adjusting your filters or import more venues
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
