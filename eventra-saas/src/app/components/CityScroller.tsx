"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackCityScrollerImpression, trackCityScrollerSelect, trackCityScrollerSnap } from "../../lib/analytics";

interface Props {
  items: string[];
  selected?: string;
  onSelect: (value: string) => void;
}

export default function CityScroller({ items, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  // Map city to id-like slug
  const ids = useMemo(() => items.map((c) => slugify(c)), [items]);

  useEffect(() => {
    // Initial impression: visible items
    const visible = getVisibleIds();
    if (visible.length > 0) {
      trackCityScrollerImpression({ city_list: visible });
    }
    // Observe visibility to emit impressions on change
    const el = containerRef.current;
    if (!el) return;

    const onScroll = debounce(() => {
      const visibleNow = getVisibleIds();
      trackCityScrollerImpression({ city_list: visibleNow });
      // Determine snapped index
      const idx = nearestSnapIndex();
      if (idx !== activeIndex) {
        trackCityScrollerSnap({ city_id: ids[idx], previous_city_id: prevIndex !== null ? ids[prevIndex] : null });
        setPrevIndex(activeIndex);
        setActiveIndex(idx);
      }
    }, 200);

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, ids, activeIndex, prevIndex]);

  function getVisibleIds(): string[] {
    const el = containerRef.current;
    if (!el) return [];
    const rect = el.getBoundingClientRect();
    const children = Array.from(el.children) as HTMLElement[];
    const visible: string[] = [];
    children.forEach((child, idx) => {
      const r = child.getBoundingClientRect();
      const visibleWidth = Math.min(r.right, rect.right) - Math.max(r.left, rect.left);
      if (visibleWidth > Math.min(120, r.width * 0.6)) {
        visible.push(ids[idx]);
      }
    });
    return visible;
  }

  function nearestSnapIndex(): number {
    const el = containerRef.current;
    if (!el) return 0;
    const children = Array.from(el.children) as HTMLElement[];
    let bestIdx = 0;
    let minDist = Number.MAX_VALUE;
    const center = el.scrollLeft + el.clientWidth / 2;
    children.forEach((child, idx) => {
      const offset = (child as HTMLElement).offsetLeft + child.clientWidth / 2;
      const dist = Math.abs(offset - center);
      if (dist < minDist) {
        minDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const el = containerRef.current;
    if (!el) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = Math.min(activeIndex + 1, items.length - 1);
      scrollToIndex(idx);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = Math.max(activeIndex - 1, 0);
      scrollToIndex(idx);
    }
  }

  function scrollToIndex(idx: number) {
    const el = containerRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div
        ref={containerRef}
        className="relative overflow-x-auto whitespace-nowrap snap-x snap-mandatory flex gap-3 md:gap-4 py-2 md:py-3 rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm"
        style={{ height: '56px' }}
        role="listbox"
        aria-label="City scroller"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {items.map((city, index) => {
          const isActive = (selected ? city === selected : index === activeIndex);
          return (
            <button
              key={city}
              role="option"
              aria-selected={isActive}
              className={`snap-center inline-flex items-center justify-center px-4 md:px-5 h-12 md:h-14 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md scale-[1.05] underline decoration-2 underline-offset-4'
                  : 'bg-white text-gray-800 border border-black/10 hover:bg-gray-50'
              }`}
              onClick={() => {
                onSelect(city);
                const idx = index;
                trackCityScrollerSelect({ city_id: ids[idx], user_id: null, entry_source: 'home_scroller' });
                setPrevIndex(activeIndex);
                setActiveIndex(idx);
              }}
            >
              <span className="truncate" title={city}>{city}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function debounce<F extends (...args: any[]) => void>(fn: F, wait: number) {
  let t: any;
  return (...args: Parameters<F>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function slugify(s: string): string {
  return s
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}