import React from 'react';
import Link from 'next/link';

export default function SponsorshipLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sponsorship Dashboard</h1>
              <p className="text-gray-600">Create, manage, and monitor your sponsored posts</p>
            </div>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-6">
            <nav className="flex gap-2 text-sm" aria-label="Tabs">
              <Link href="/dashboard/sponsorship" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">Overview</Link>
              <Link href="/dashboard/sponsorship/create" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">Create New Campaign</Link>
              <Link href="/dashboard/sponsorship/manage" className="px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700">Manage Campaigns</Link>
            </nav>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}