'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Venue {
  id: string;
  publicId: string;
  type: string;
  status: string;
  title: string;
  description: string;
  city: string;
  category: string;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  businessPhone?: string;
  businessEmail?: string;
}

export default function AdminVenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVenues();
  }, [filter]);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') {
        params.append('status', filter);
      }
      
      const response = await fetch(`/api/admin/venues?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVenueStatus = async (venueId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the list
        fetchVenues();
      } else {
        alert('Failed to update venue status');
      }
    } catch (error) {
      console.error('Error updating venue:', error);
      alert('Error updating venue');
    }
  };

  const toggleFeatured = async (venueId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentValue })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchVenues();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const toggleVerified = async (venueId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentValue })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchVenues();
      }
    } catch (error) {
      console.error('Error toggling verified:', error);
    }
  };

  const deleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      const response = await fetch(`/api/admin/venues/${venueId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchVenues();
      } else {
        alert('Failed to delete venue');
      }
    } catch (error) {
      console.error('Error deleting venue:', error);
      alert('Error deleting venue');
    }
  };

  const filteredVenues = venues.filter(venue => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      venue.title.toLowerCase().includes(query) ||
      venue.city?.toLowerCase().includes(query) ||
      venue.category?.toLowerCase().includes(query) ||
      venue.type.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: venues.length,
    pending: venues.filter(v => v.status === 'PENDING').length,
    active: venues.filter(v => v.status === 'ACTIVE').length,
    featured: venues.filter(v => v.featured).length,
    verified: venues.filter(v => v.verified).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Venue Management
          </h1>
          <p className="text-gray-600">
            Review, approve, and manage venue submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={stats.total} color="blue" />
          <StatCard label="Pending" value={stats.pending} color="yellow" />
          <StatCard label="Active" value={stats.active} color="green" />
          <StatCard label="Featured" value={stats.featured} color="purple" />
          <StatCard label="Verified" value={stats.verified} color="indigo" />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search venues by name, city, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Venues List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading venues...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No venues found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onStatusChange={updateVenueStatus}
                onToggleFeatured={toggleFeatured}
                onToggleVerified={toggleVerified}
                onDelete={deleteVenue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>
        {value}
      </p>
    </div>
  );
}

// Venue Card Component
function VenueCard({
  venue,
  onStatusChange,
  onToggleFeatured,
  onToggleVerified,
  onDelete
}: {
  venue: Venue;
  onStatusChange: (id: string, status: string) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onToggleVerified: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Venue Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {venue.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[venue.status as keyof typeof statusColors]}`}>
                  {venue.status}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {venue.type}
                </span>
                {venue.featured && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    ⭐ Featured
                  </span>
                )}
                {venue.verified && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-3 line-clamp-2">
            {venue.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">City:</span> {venue.city || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Category:</span> {venue.category || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {venue.businessPhone || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Email:</span> {venue.businessEmail || 'N/A'}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">
            Added: {new Date(venue.createdAt).toLocaleDateString()} | ID: {venue.publicId}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 min-w-[200px]">
          {/* Status Actions */}
          {venue.status === 'PENDING' && (
            <>
              <button
                onClick={() => onStatusChange(venue.id, 'ACTIVE')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onStatusChange(venue.id, 'SUSPENDED')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                ✕ Reject
              </button>
            </>
          )}

          {venue.status === 'ACTIVE' && (
            <button
              onClick={() => onStatusChange(venue.id, 'SUSPENDED')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Suspend
            </button>
          )}

          {venue.status === 'SUSPENDED' && (
            <button
              onClick={() => onStatusChange(venue.id, 'ACTIVE')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Reactivate
            </button>
          )}

          {/* Feature/Verify Toggles */}
          <button
            onClick={() => onToggleFeatured(venue.id, venue.featured)}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              venue.featured
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {venue.featured ? '⭐ Unfeature' : '☆ Feature'}
          </button>

          <button
            onClick={() => onToggleVerified(venue.id, venue.verified)}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
              venue.verified
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {venue.verified ? '✓ Unverify' : 'Verify'}
          </button>

          {/* Edit and Delete */}
          <button
            onClick={() => window.location.href = `/admin/venues/${venue.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(venue.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
