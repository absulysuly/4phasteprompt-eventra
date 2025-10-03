"use client";

import React, { useMemo, useState } from 'react';

const placements = [
  { key: 'stories', title: 'Stories', desc: 'Full-screen, immersive vertical format', icon: '📖', suggested: 30 },
  { key: 'featured', title: 'Featured Sections', desc: 'Top placement on discovery pages', icon: '⭐', suggested: 50 },
  { key: 'carousel', title: 'Carousel', desc: 'Swipeable multi-card format', icon: '🎠', suggested: 40 },
  { key: 'feed', title: 'Feed', desc: 'Native placement in user feed', icon: '📰', suggested: 20 },
];

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateCampaignPage() {
  const [step, setStep] = useState<Step>(1);
  const [placement, setPlacement] = useState<string>('feed');
  const [location, setLocation] = useState('Baghdad');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 45]);
  const [interests, setInterests] = useState<string[]>(['Events', 'Food']);
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
  const [budget, setBudget] = useState<number>(placements.find(p => p.key === 'feed')?.suggested || 20);
  const [duration, setDuration] = useState<number>(7);
  const [postText, setPostText] = useState<string>('Join us at the Baghdad Food Festival!');

  const estimatedReach = useMemo(() => {
    const base = placement === 'featured' ? 2000 : placement === 'stories' ? 1500 : placement === 'carousel' ? 1200 : 800;
    const budgetFactor = Math.log2(1 + budget) * 300;
    const durationFactor = 1 + (duration / 14);
    return Math.round(base * durationFactor + budgetFactor);
  }, [placement, budget, duration]);

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 text-sm mb-6">
      {[1,2,3,4,5].map(n => (
        <div key={n} className={`h-2 rounded-full ${n <= step ? 'bg-blue-600' : 'bg-gray-200'} ${n === 1 ? 'w-8' : 'w-8'}`}/>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
        <a href="/dashboard/sponsorship" className="text-sm text-gray-600 hover:text-gray-900">Cancel</a>
      </div>

      <StepIndicator />

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Step 1: Select Ad Placement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {placements.map(p => (
              <button key={p.key} onClick={() => { setPlacement(p.key); setBudget(p.suggested); }} className={`text-left p-4 rounded-xl border transition-all hover:shadow-sm ${placement === p.key ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                <div className="text-2xl">{p.icon}</div>
                <div className="mt-2 font-semibold">{p.title}</div>
                <div className="text-sm text-gray-600">{p.desc}</div>
                <div className="mt-2 text-xs text-gray-500">Suggested budget: ${p.suggested}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 2: Define Target Audience</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="City or region" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value as any)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Age Range</label>
              <div className="mt-1 flex gap-2 items-center">
                <input type="number" min={13} max={65} value={ageRange[0]} onChange={e => setAgeRange([Number(e.target.value), ageRange[1]])} className="w-24 rounded-lg border border-gray-300 px-3 py-2" />
                <span className="text-gray-500">-</span>
                <input type="number" min={13} max={80} value={ageRange[1]} onChange={e => setAgeRange([ageRange[0], Number(e.target.value)])} className="w-24 rounded-lg border border-gray-300 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Interests</label>
              <input value={interests.join(', ')} onChange={e => setInterests(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="e.g., Food, Music, Tech" />
              <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(3)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Next</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 3: Set Budget and Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4 border">
              <label className="text-sm font-medium text-gray-700">Daily Budget ($)</label>
              <input type="number" min={1} value={budget} onChange={e => setBudget(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              <p className="mt-1 text-xs text-gray-500">Suggested for {placement}: ${placements.find(p => p.key === placement)?.suggested}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border">
              <label className="text-sm font-medium text-gray-700">Duration (days)</label>
              <input type="number" min={1} max={60} value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
              <p className="mt-1 text-xs text-gray-500">Max 60 days</p>
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-600">Estimated reach</div>
            <div className="text-2xl font-bold text-green-600">{estimatedReach.toLocaleString()} people</div>
            <p className="text-xs text-gray-500">Based on placement, budget, and duration</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(4)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 4: Preview Ad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border overflow-hidden">
              <div className="bg-gray-900 text-white px-4 py-2 text-sm">{placement.toUpperCase()} preview</div>
              <div className="p-4">
                <div className="rounded-xl border overflow-hidden">
                  <img src="https://via.placeholder.com/800x400" alt="Preview" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="font-semibold">Sponsored • Your Business</div>
                    <div className="text-gray-700 mt-1">
                      {postText}
                    </div>
                    <div className="mt-3">
                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">Learn more</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Post Text</label>
              <textarea value={postText} onChange={e => setPostText(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-40" />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div><span className="text-gray-500">Placement: </span>{placements.find(p => p.key === placement)?.title}</div>
                <div><span className="text-gray-500">Location: </span>{location}</div>
                <div><span className="text-gray-500">Age: </span>{ageRange[0]} - {ageRange[1]}</div>
                <div><span className="text-gray-500">Gender: </span>{gender}</div>
                <div className="col-span-2"><span className="text-gray-500">Interests: </span>{interests.join(', ')}</div>
                <div><span className="text-gray-500">Budget: </span>${budget}/day</div>
                <div><span className="text-gray-500">Duration: </span>{duration} days</div>
                <div><span className="text-gray-500">Est. Reach: </span>{estimatedReach.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back</button>
            <button onClick={() => setStep(5)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Next</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 5: Confirm and Launch</h3>
          <div className="rounded-xl border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div><span className="text-gray-500">Placement:</span> {placements.find(p => p.key === placement)?.title}</div>
              <div><span className="text-gray-500">Location:</span> {location}</div>
              <div><span className="text-gray-500">Audience:</span> {ageRange[0]}-{ageRange[1]} / {gender}</div>
              <div className="sm:col-span-2"><span className="text-gray-500">Interests:</span> {interests.join(', ')}</div>
              <div><span className="text-gray-500">Daily Budget:</span> ${budget}</div>
              <div><span className="text-gray-500">Duration:</span> {duration} days</div>
              <div><span className="text-gray-500">Estimated Reach:</span> {estimatedReach.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(4)} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Back</button>
            <a href={`/pay?context=sponsorship&amount=${(budget * duration).toFixed(2)}`} className="px-5 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700">Proceed to Payment</a>
          </div>
        </div>
      )}
    </div>
  );
}