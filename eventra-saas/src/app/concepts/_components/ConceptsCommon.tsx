"use client";
import React, { useMemo } from 'react';

export type Variant = 'a' | 'b' | 'c';
export type GridType = 'circular' | 'hex' | 'pill';

export const categories = [
  { key: 'hotels', name: 'Hotels', ar: 'فنادق', ku: 'هوتێل', icon: '🏨' },
  { key: 'cafes', name: 'Cafes', ar: 'مقاهي', ku: 'Cafe', icon: '☕' },
  { key: 'events', name: 'Events', ar: 'فعاليات', ku: 'رووداو', icon: '🎉' },
  { key: 'institutes', name: 'Institutes', ar: 'معاهد', ku: 'کۆڵێژ/ئینستیتوت', icon: '🏫' },
  { key: 'suggested', name: 'Suggested', ar: 'مقترح', ku: 'پێشنیارکراو', icon: '✨' },
];

export function useVariantStyles(variant: Variant) {
  return useMemo(() => {
    if (variant === 'a') {
      return {
        panel: 'backdrop-blur-md bg-white/30 border border-white/40 shadow-lg',
        card: 'backdrop-blur-sm bg-white/20 border border-white/30',
        accent: 'from-indigo-500 via-purple-500 to-blue-500',
        text: 'text-slate-900',
        ring: 'ring-2 ring-purple-300/60',
      };
    }
    if (variant === 'b') {
      return {
        panel: 'bg-gradient-to-br from-peach-50 to-mint-50 shadow-[inset_2px_2px_8px_rgba(0,0,0,0.06),_inset_-2px_-2px_8px_rgba(255,255,255,0.7)]',
        card: 'bg-[#f6f7f9] shadow-[6px_6px_12px_rgba(0,0,0,0.05),_-6px_-6px_12px_rgba(255,255,255,0.9)]',
        accent: 'from-rose-200 via-sky-200 to-emerald-200',
        text: 'text-slate-800',
        ring: 'shadow-inner',
      };
    }
    return {
      panel: 'bg-white',
      card: 'bg-white shadow-lg',
      accent: 'from-orange-500 via-amber-400 to-fuchsia-500',
      text: 'text-slate-900',
      ring: 'ring-2 ring-amber-300/70',
    };
  }, [variant]);
}

export function CircleTile({ label, icon, variant, selected }: { label: string; icon: string; variant: Variant; selected?: boolean }) {
  const s = useVariantStyles(variant);
  return (
    <button className={`flex flex-col items-center justify-center w-24 h-24 rounded-full ${s.card} ${selected ? 'scale-105 ' + s.ring : ''} transition-all`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xs mt-1">{label}</div>
    </button>
  );
}

export function HexTile({ label, icon, variant, selected }: { label: string; icon: string; variant: Variant; selected?: boolean }) {
  const s = useVariantStyles(variant);
  return (
    <button className={`relative w-28 h-24 ${s.card} transition-all ${selected ? 'scale-105 ' + s.ring : ''}`} style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl">{icon}</div>
        <div className="text-xs mt-1">{label}</div>
      </div>
    </button>
  );
}

export function PillTile({ label, icon, variant, selected }: { label: string; icon: string; variant: Variant; selected?: boolean }) {
  const s = useVariantStyles(variant);
  return (
    <button className={`flex items-center gap-2 px-4 h-12 rounded-full ${s.card} ${selected ? 'scale-105 ' + s.ring : ''} transition-all`}>
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

export function ReachPreview({ placement, budget, duration }: { placement: 'Stories'|'Featured'|'Carousel'; budget: number; duration: number }) {
  const base = placement === 'Featured' ? 1.6 : placement === 'Stories' ? 1.3 : 1.2;
  const estimate = Math.round(base * Math.log2(1 + Math.max(0, budget)) * (1 + duration/14) * 1200);
  return (
    <div className="text-sm">
      <div className="font-semibold">Est. reach</div>
      <div className="text-2xl font-bold text-green-600">{estimate.toLocaleString()}</div>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.min(100, (estimate/50000)*100)}%` }} />
      </div>
    </div>
  );
}

export function PaymentMethods({ variant }: { variant: Variant }) {
  const s = useVariantStyles(variant);
  const items = [
    { key: 'fib', name: 'FIB', info: 'Redirect to FIB gateway', logo: '🏦' },
    { key: 'qi', name: 'QI Card', info: 'Redirect to QI card page', logo: '💳' },
    { key: 'fast', name: 'FAST PAY', info: 'Enter mobile number', logo: '⚡' },
    { key: 'bank', name: 'Bank Transfer', info: 'Upload transfer receipt', logo: '🏛️' },
    { key: 'cod', name: 'COD', info: 'Pay on delivery', logo: '🚚' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(i => (
        <div key={i.key} className={`p-3 rounded-xl ${s.card} flex items-center gap-2`}>
          <span className="text-lg">{i.logo}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold">{i.name}</div>
            <div className="text-[11px] text-gray-500">{i.info}</div>
          </div>
          <div title={i.info} aria-label={i.info} className="text-gray-400">ⓘ</div>
        </div>
      ))}
    </div>
  );
}