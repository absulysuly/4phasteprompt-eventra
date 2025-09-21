import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

async function getEvent(publicId: string, lang: string) {
  // Use absolute URL for server-side fetching or relative for client-side
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/events/public/${publicId}?lang=${lang}`, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Eventra-Server/1.0',
      },
    });
    if (!res.ok) {
      console.error(`Failed to fetch event: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function PublicEventPage({ params, searchParams }: { params: Promise<{ publicId: string }>, searchParams?: Promise<{ lang?: string }> }) {
  const { publicId } = await params;
  const q = (await searchParams) || {};
  const lang = (q.lang || 'en') as string;
  const event = await getEvent(publicId, lang);
  if (!event) notFound();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ← Back to IraqEvents
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">📅</span>
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-400">📍</span>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">👤</span>
              <span>by {event.user?.name || event.user?.email || "Anonymous"}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Event Image Placeholder */}
          <div className="h-64 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg opacity-80">Event Image</p>
            </div>
          </div>
          
          <div className="p-8">
            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📅</span>
                    <div>
                      <div className="font-semibold text-gray-900">Date & Time</div>
                      <div className="text-gray-600">{new Date(event.date).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-semibold text-gray-900">Location</div>
                      <div className="text-gray-600">{event.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🏷️</span>
                    <div>
                      <div className="font-semibold text-gray-900">Category</div>
                      <div className="text-gray-600">{event.category || 'General'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-semibold text-gray-900">Price</div>
                      <div className={`font-bold ${
                        event.isFree || event.price === 0 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {event.isFree || event.price === 0 ? 'FREE' : `$${event.price}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description || 'No description available.'}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    🎟️ Register for Event
                  </button>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    📱 Share Event
                  </button>
                </div>
              </div>
            </div>
            
            {/* Organizer Info */}
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {event.user?.name?.charAt(0) || event.user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{event.user?.name || 'Anonymous Organizer'}</div>
                  <div className="text-gray-600">{event.user?.email || 'No contact information'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}