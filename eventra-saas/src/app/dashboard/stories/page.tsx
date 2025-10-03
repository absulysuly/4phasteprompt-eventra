"use client";

import React, { useEffect, useMemo, useState } from "react";
import StoryUploadCard from "../../components/StoryUploadCard";
import { useTranslations } from "../../hooks/useTranslations";

export default function StoriesDashboardPage() {
  const { t } = useTranslations();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<any[]>([]);
  const [filterVenueId, setFilterVenueId] = useState<string>("");

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/stories/mine');
      const json = await res.json();
      if (json?.success) setStories(json.stories || []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('story:uploaded', handler);
    return () => window.removeEventListener('story:uploaded', handler);
  }, []);

  useEffect(() => {
    const loadVenues = async () => {
      try {
        const res = await fetch('/api/venues/mine');
        const json = await res.json();
        if (json?.success) setVenues(json.venues || []);
      } catch {}
    };
    loadVenues();
  }, []);

  const filteredStories = React.useMemo(() => {
    if (!filterVenueId) return stories;
    if (filterVenueId === '__untagged__') return stories.filter((s: any) => !s.venue);
    return stories.filter((s: any) => s.venue && s.venue.id === filterVenueId);
  }, [stories, filterVenueId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{t('dashboardStories.title')}</h1>
      <p className="text-gray-600 mb-6">{t('dashboardStories.subtitle')}</p>

      <div className="mb-8">
        <StoryUploadCard />
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-xl font-semibold">{t('dashboardStories.myStories')}</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">{t('dashboardStories.filterByVenue')}</label>
            <select
              value={filterVenueId}
              onChange={(e) => setFilterVenueId(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="">{t('dashboardStories.allVenues')}</option>
              <option value="__untagged__">{t('dashboardStories.untagged')}</option>
              {venues.map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.publicId}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-500">{t('dashboardStories.loading')}</div>
        ) : filteredStories.length === 0 ? (
          <div className="text-gray-500">{t('dashboardStories.noStories')}</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stories.map((s) => (
              <div key={s.id} className="rounded-xl overflow-hidden bg-white shadow">
                <div className="aspect-[16/9] bg-black">
                  {s.mediaType === 'IMAGE' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.thumbnailUrl || s.mediaUrl} alt={s.caption || 'story'} className="w-full h-full object-cover" />
                  ) : (
                    <video src={s.mediaUrl} className="w-full h-full object-cover" muted playsInline controls={false} />
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm text-gray-700 truncate">{s.caption || '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">{t('dashboardStories.status')}: <span className={
                    s.moderationStatus === 'APPROVED' ? 'text-green-600' : s.moderationStatus === 'REJECTED' ? 'text-red-600' : 'text-yellow-700'
                  }>{s.moderationStatus}</span></div>
                  {s.expiresAt && (
                    <div className="text-xs text-gray-500">{t('dashboardStories.expires')}: {new Date(s.expiresAt).toLocaleString()}</div>
                  )}
                  {s.venue && (
                    <div className="text-xs text-gray-500">{t('dashboardStories.venue')}: {s.venue.publicId}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
