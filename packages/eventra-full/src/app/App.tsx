import React, { useEffect, useMemo, useState } from 'react';

type EventItem = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  location?: string;
  category?: string;
};

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [lang, setLang] = useState<string>('en');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Simulate loading / fetch
  useEffect(() => {
    const t = setTimeout(() => {
      // Example sample data
      setEvents([
        { id: '1', title: 'Tech Summit', category: 'tech', location: 'Erbil' },
        { id: '2', title: 'Music Fest', category: 'music', location: 'Baghdad' },
        { id: '3', title: 'Art Expo', category: 'art', location: 'Mosul' },
        { id: '4', title: 'Business Meetup', category: 'business', location: 'Basra' },
        { id: '5', title: 'Marathon', category: 'sports', location: 'Kirkuk' },
        { id: '6', title: 'Food Fair', category: 'food', location: 'Najaf' },
        { id: '7', title: 'Health Camp', category: 'health', location: 'Karbala' },
      ]);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // --- IMPORTANT FIX ---
  // Reset pagination when filters/search/lang change.
  // Do NOT call setCurrentPage inside useMemo (that would be during render).
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedCategory, activeSearchQuery, lang]);

  // Pure memo for filtered events (no side effects)
  const filteredEvents = useMemo(() => {
    const q = activeSearchQuery.trim().toLowerCase();
    return events.filter((e) => {
      if (selectedCity && selectedCity !== 'All Cities' && e.location && e.location !== selectedCity) {
        return false;
      }
      if (selectedCategory && selectedCategory !== 'All Categories' && e.category && e.category !== selectedCategory) {
        return false;
      }
      if (q && !(e.title.toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q))) {
        return false;
      }
      return true;
    });
  }, [events, selectedCity, selectedCategory, activeSearchQuery, lang]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pagedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div role="status" aria-live="polite">
          <strong>Loading Eventara...</strong>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Eventara — Events</h1>

      {/* Simple filter controls so tests can drive state */}
      <div style={{ margin: '12px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <select
          aria-label="city-select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option>All Cities</option>
          <option>Erbil</option>
          <option>Baghdad</option>
          <option>Mosul</option>
        </select>

        <select
          aria-label="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>tech</option>
          <option>music</option>
          <option>art</option>
        </select>

        <input
          aria-label="search-input"
          placeholder="Search..."
          value={activeSearchQuery}
          onChange={(e) => setActiveSearchQuery(e.target.value)}
        />

        <select aria-label="lang-select" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">en</option>
          <option value="ar">ar</option>
        </select>
      </div>

      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
          {pagedEvents.map((ev) => (
            <div key={ev.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <h3>{ev.title}</h3>
              <div style={{ fontSize: 12, color: '#666' }}>{ev.location} — {ev.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple pagination */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          aria-label="prev-page"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span aria-live="polite">Page {currentPage} / {pageCount}</span>
        <button
          aria-label="next-page"
          onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </div>
    </div>
  );
}
