"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Prevent SSR for this component
const DynamicContentEditor = dynamic(() => Promise.resolve(ContentEditorComponent), {
  ssr: false,
  loading: () => (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4">
        <div className="font-semibold mb-1">Loading...</div>
        <div>Initializing content editor...</div>
      </div>
    </div>
  )
});

import { useSession } from "next-auth/react";
import { useTranslations } from "../../hooks/useTranslations";
import { useLanguage } from "../../components/LanguageProvider";

const PRESET_KEYS = [
  { key: "about.subtitle", label: "About - Subtitle" },
  { key: "categoriesPage.subtitle", label: "Categories - Subtitle" },
];

function ContentEditorComponent() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const [locale, setLocale] = useState<string>(language);
  const [keyName, setKeyName] = useState<string>(PRESET_KEYS[0].key);
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4">
          <div className="font-semibold mb-1">Loading...</div>
          <div>Initializing application.</div>
        </div>
      </div>
    );
  }

  const options = useMemo(() => PRESET_KEYS, []);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setNotice(null);
      try {
        const res = await fetch(`/api/content?key=${encodeURIComponent(keyName)}&locale=${encodeURIComponent(locale)}`);
        const json = await res.json();
        setValue(json?.content?.data || "");
      } catch (e) {
        setNotice("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [keyName, locale]);

  const onSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyName, locale, data: value }),
      });
      if (!res.ok) throw new Error("Save failed");
      setNotice("Saved");
    } catch (e) {
      setNotice("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4">
          <div className="font-semibold mb-1">Loading...</div>
          <div>Checking authentication status.</div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4">
          <div className="font-semibold mb-1">Authentication required</div>
          <div>Please login to edit content.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-2xl font-bold mb-4">Content Manager</h1>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="ku">کوردی</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              >
                {options.map((o) => (
                  <option key={o.key} value={o.key}>{o.label} ({o.key})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <textarea
              className="w-full min-h-[160px] border rounded-lg px-3 py-2"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter text for the selected key and locale"
            />
          </div>

          {notice && (
            <div className="mb-4 text-sm text-gray-700">{notice}</div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {loading && <div className="text-sm text-gray-500">Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentEditorPage() {
  return <DynamicContentEditor />;
}
