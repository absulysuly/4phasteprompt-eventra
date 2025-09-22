"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

export default function SearchSuggest({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { language, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ label: string; subtitle?: string; publicId?: string }[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const query = useMemo(() => value.trim(), [value]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query) {
      setItems([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?query=${encodeURIComponent(query)}&lang=${language}`);
        const json = await res.json();
        setItems(json?.suggestions || []);
        setOpen(true);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250); // debounce
  }, [query, language]);

  return (
    <div ref={boxRef} className={`relative ${className || ''}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-6 py-4 rounded-full text-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        onFocus={() => { if (items.length) setOpen(true); }}
      />
      {open && (
        <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-auto`}>
          {loading && (
            <div className="px-4 py-3 text-gray-500 text-sm">Searching…</div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-sm">No results</div>
          )}
          {!loading && items.map((it, idx) => (
            <Link
              key={idx}
              href={`/${language}/event/${it.publicId}`}
              className="block px-4 py-3 hover:bg-gray-50 border-b last:border-0"
              onClick={() => setOpen(false)}
            >
              <div className="font-medium text-gray-800">{it.label}</div>
              {it.subtitle && <div className="text-xs text-gray-500">{it.subtitle}</div>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
