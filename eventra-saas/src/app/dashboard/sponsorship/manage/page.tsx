"use client";

import React, { useMemo, useState } from 'react';

type Campaign = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  placement: string;
  impressions: number;
  clicks: number;
  budgetDaily: number;
  duration: number;
  audience: { location: string; age: [number, number]; gender: string; interests: string[] };
};

const initialCampaigns: Campaign[] = [];
  { id: '1', name: 'Baghdad Food Festival', status: 'active', placement: 'Featured', impressions: 15420, clicks: 892, budgetDaily: 50, duration: 14, audience: { location: 'Baghdad', age: [18, 45], gender: 'any', interests: ['Food', 'Events'] } },
  { id: '2', name: 'Tech Conference', status: 'paused', placement: 'Feed', impressions: 8934, clicks: 456, budgetDaily: 20, duration: 7, audience: { location: 'Erbil', age: [21, 40], gender: 'any', interests: ['Tech', 'Startups'] } },
  { id: '3', name: 'Cultural Event', status: 'completed', placement: 'Stories', impressions: 22100, clicks: 1340, budgetDaily: 30, duration: 10, audience: { location: 'Sulaymaniyah', age: [18, 60], gender: 'any', interests: ['Culture', 'Music'] } },
];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-8">
      <polyline fill="none" stroke="#16a34a" strokeWidth="3" points={points} />
    </svg>
  );
}

export default function ManageCampaignsPage() {
  // Load from API
  React.useEffect(() => {
    fetch('/api/sponsorship/campaigns')
      .then(r => r.json())
      .then((data) => setRows(Array.isArray(data) ? data.map((c: any) => ({
        id: c.id,
        name: c.name || 'Campaign',
        status: (c.status || 'ACTIVE').toLowerCase(),
        placement: c.placement,
        impressions: c.impressions || 0,
        clicks: c.clicks || 0,
        budgetDaily: c.budgetDaily || 0,
        duration: c.durationDays || 0,
        audience: { location: '', age: [18,45], gender: 'any', interests: [] }
      })) : []);
  }, []);
  const [rows, setRows] = useState<Campaign[]>(initialCampaigns);
  const [editing, setEditing] = useState<string | null>(null);

  const totals = useMemo(() => ({
    impressions: rows.reduce((s, r) => s + r.impressions, 0),
    clicks: rows.reduce((s, r) => s + r.clicks, 0),
    dailySpend: rows.reduce((s, r) => s + r.budgetDaily, 0),
  }), [rows]);

const toggleStatus = async (id: string) => {
    const target = rows.find(r => r.id === id);
    const next = target?.status === 'active' ? 'PAUSED' : 'ACTIVE';
    await fetch('/api/sponsorship/campaigns', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: next }) });
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

const deleteRow = async (id: string) => {
    await fetch('/api/sponsorship/campaigns', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setRows(prev => prev.filter(r => r.id !== id));
  };
    setRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-sm text-gray-600">Total Impressions</div>
          <div className="text-2xl font-bold text-green-600">{totals.impressions.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-sm text-gray-600">Total Clicks</div>
          <div className="text-2xl font-bold text-purple-600">{totals.clicks.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="text-sm text-gray-600">Daily Spend</div>
          <div className="text-2xl font-bold text-blue-600">${totals.dailySpend.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="text-lg font-semibold">Campaigns</h3>
          <a href="/dashboard/sponsorship/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Campaign</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Placement</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Impr.</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Clicks</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Daily Budget</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Duration</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Trend</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'active' ? 'bg-green-100 text-green-800' : r.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-3">{r.placement}</td>
                  <td className="px-6 py-3">{r.impressions.toLocaleString()}</td>
                  <td className="px-6 py-3">{r.clicks.toLocaleString()}</td>
                  <td className="px-6 py-3">
{editing === r.id ? (
                      <input type="number" className="w-24 rounded border px-2 py-1" value={r.budgetDaily} onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, budgetDaily: Number(e.target.value) } : x))} onBlur={async ()=>{ await fetch('/api/sponsorship/campaigns', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, budgetDaily: r.budgetDaily })}); setEditing(null); }} />
                    ) : (
                      <input type="number" className="w-24 rounded border px-2 py-1" value={r.budgetDaily} onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, budgetDaily: Number(e.target.value) } : x))} />
                    ) : (
                      <>${r.budgetDaily.toFixed(2)}</>
                    )}
                  </td>
                  <td className="px-6 py-3">
{editing === r.id ? (
                      <input type="number" className="w-20 rounded border px-2 py-1" value={r.duration} onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, duration: Number(e.target.value) } : x))} onBlur={async ()=>{ await fetch('/api/sponsorship/campaigns', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: r.id, durationDays: r.duration })}); setEditing(null); }} />
                    ) : (
                      <input type="number" className="w-20 rounded border px-2 py-1" value={r.duration} onChange={e => setRows(prev => prev.map(x => x.id === r.id ? { ...x, duration: Number(e.target.value) } : x))} />
                    ) : (
                      <>{r.duration} days</>
                    )}
                  </td>
                  <td className="px-6 py-3"><Sparkline data={[10, 12, 11, 14, 16, 13, 18]} /></td>
                  <td className="px-6 py-3 flex gap-2">
                    {editing === r.id ? (
                      <>
                        <button onClick={() => setEditing(null)} className="px-3 py-1 rounded bg-green-600 text-white text-xs">Save</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1 rounded border text-xs">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => toggleStatus(r.id)} className="px-3 py-1 rounded border text-xs">{r.status === 'active' ? 'Pause' : 'Resume'}</button>
                        <button onClick={() => setEditing(r.id)} className="px-3 py-1 rounded border text-xs">Edit</button>
                        <button onClick={() => deleteRow(r.id)} className="px-3 py-1 rounded border text-red-600 text-xs">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}