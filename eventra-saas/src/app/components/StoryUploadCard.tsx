"use client";

import React, { useEffect, useRef, useState } from "react";

import { useTranslations } from "../hooks/useTranslations";

export default function StoryUploadCard() {
  const { t } = useTranslations();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [language, setLanguage] = useState<"en"|"ar"|"ku"|"">("");
  const [venueId, setVenueId] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!file) {
      setError(t('dashboardStories.selectFileError'));
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', file);
      if (caption) form.append('caption', caption);
      if (language) form.append('language', language);
      if (venueId) form.append('venueId', venueId);

      const resp = await fetch('/api/stories/upload', { method: 'POST', body: form });
      const data = await resp.json();
      if (!resp.ok || data?.error) {
        setError(data?.error || 'Upload failed');
      } else {
        setMessage(t('dashboardStories.messageSuccess'));
        // reset minimal
        setFile(null);
        setCaption("");
        setLanguage("");
        setVenueId("");
        // broadcast an event so the list refreshes
        window.dispatchEvent(new CustomEvent('story:uploaded'));
      }
    } catch (e: any) {
      setError(t('dashboardStories.messageError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white shadow">
      <h3 className="text-lg font-semibold mb-3">{t('dashboardStories.uploadTitle')}</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('dashboardStories.caption')}</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder={t('dashboardStories.captionPlaceholder')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboardStories.language')}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="w-full border rounded px-3 py-2">
              <option value="">{t('dashboardStories.auto')}
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="ku">کوردی</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">{t('dashboardStories.tagVenue')}</label>
            <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">{t('dashboardStories.none')}</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.publicId} {v.city ? `• ${v.city}` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {message && <div className="text-sm text-green-600">{message}</div>}

        <div className="flex justify-end">
          <button disabled={loading} type="submit" className="px-5 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50">
            {loading ? t('dashboardStories.uploading') : t('dashboardStories.upload')}
          </button>
        </div>
      </form>
    </div>
  );
}
