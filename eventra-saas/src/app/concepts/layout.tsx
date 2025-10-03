import React from 'react';
import LanguageProviderWrapper from '../dashboard/LanguageProviderWrapper';
import Link from 'next/link';

export default function ConceptsLayout({ children }: { children: React.ReactNode }) {
  const nav = [
    { grid: 'circular', label: 'Circular Mosaic' },
    { grid: 'hex', label: 'Hex Honeycomb' },
    { grid: 'pill', label: 'Pill Carousel' },
  ];
  const variants = [
    { key: 'a', label: 'A (Glass)' },
    { key: 'b', label: 'B (Neumorph)' },
    { key: 'c', label: 'C (Bold Gradients)' },
  ];
  return (
    <LanguageProviderWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Concept Prototypes</h1>
              <Link href="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Back to Dashboard</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {nav.map(n => (
                <div key={n.grid} className="bg-white border rounded-xl p-3">
                  <div className="text-sm font-semibold mb-2">{n.label}</div>
                  <div className="flex gap-2 flex-wrap">
                    {variants.map(v => (
                      <Link key={v.key} href={`/concepts/${n.grid}/${v.key}`} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs hover:bg-gray-800">
                        {v.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {children}
        </div>
      </div>
    </LanguageProviderWrapper>
  );
}