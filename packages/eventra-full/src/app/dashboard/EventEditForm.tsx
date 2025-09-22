"use client";

import { useState } from "react";
import type { Event } from "./EventList";

export default function EventEditForm({ event, onSaved, onCancel }: {
  event: Event, onSaved: () => void, onCancel: () => void
}) {
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(event.date.slice(0,16));
  const [description, setDescription] = useState(event.description);
  const [location, setLocation] = useState(event.location);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/events/${event.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id, title, date, description, location })
    });
    const data = await res.json();
    if (!data.success) setError(data.error || "Unknown error");
    else onSaved();
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="border rounded p-4 bg-white shadow flex flex-col gap-2 max-w-md mb-4">
      <h2 className="text-lg font-bold mb-2">Edit Event</h2>
      <input required value={title} onChange={e => setTitle(e.target.value)} className="border p-2 rounded" />
      <input required type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
      <input value={location} onChange={e => setLocation(e.target.value)} className="border p-2 rounded" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border p-2 rounded" />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" disabled={loading} className="bg-green-700 text-white py-2 rounded px-3 disabled:opacity-60">Save</button>
        <button type="button" className="py-2 px-3 rounded border" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
