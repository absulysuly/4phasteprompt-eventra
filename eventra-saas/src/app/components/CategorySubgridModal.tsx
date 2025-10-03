"use client";

import React, { useEffect, useRef, useState } from "react";

export default function CategorySubgridModal({
  category,
  onClose,
  onSelect,
}: {
  category: { name: string; icon?: string; subcategories?: { name: string; icon?: string }[] };
  onClose: () => void;
  onSelect: (subcat: { name: string; icon?: string }) => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Focus trap: collect focusable elements
  function trapFocus(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const root = panelRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  useEffect(() => {
    setMounted(true);
    const prev = document.activeElement as HTMLElement | null;
    // Focus panel on mount
    setTimeout(() => panelRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      trapFocus(e);
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [onClose]);

  function onOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const subs = category?.subcategories || [];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={onOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-label={`Subcategories of ${category?.name}`}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full max-w-3xl rounded-2xl p-5 outline-none
          bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl
          transition-all duration-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">{category?.icon}</div>
          <h3 className="text-white text-xl font-semibold drop-shadow">{category?.name}</h3>
        </div>

        {/* Subcategory grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {subs.slice(0, 9).map((sub, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(sub)}
              className="aspect-square rounded-2xl bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-2xl group flex items-center justify-center text-center"
            >
              <div>
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{sub.icon}</div>
                <div className="text-gray-900 font-bold text-xs md:text-sm max-w-[8rem] mx-auto leading-snug">{sub.name}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
