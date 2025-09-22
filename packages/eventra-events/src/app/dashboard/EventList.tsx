import { useEffect, useState } from "react";
import EventEditForm from "./EventEditForm";
import { useLanguage } from "../components/LanguageProvider";

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  publicId: string;
};

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetch("/api/events").then(res => res.json()).then(setEvents).finally(() => setLoading(false));
  }, []);

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    if (res.ok) setEvents(prev => prev.filter(e => e.id !== id));
  }

  function refreshEvents() {
    fetch("/api/events").then(res => res.json()).then(setEvents);
    setEditingId(null);
  }

  if (loading) return <div>Loading events...</div>;
  if (!events.length) return <div>No events yet. Create one!</div>;
  
  return (
    <div className="mt-4 grid gap-4">
      {events.map(e => (
        <div key={e.id}>
          {editingId === e.id ? (
            <EventEditForm 
              event={e} 
              onSaved={refreshEvents} 
              onCancel={() => setEditingId(null)} 
            />
          ) : (
            <div className="border rounded p-4 bg-white shadow">
              <h3 className="font-bold text-lg">{e.title}</h3>
              <div className="text-sm text-gray-600 mb-2">{e.date && (new Date(e.date).toLocaleString())} @ {e.location}</div>
              <p className="mb-2">{e.description}</p>
              <div className="flex gap-2 items-center">
<a className="text-blue-600 underline" href={`/${language}/event/${e.publicId}`} target="_blank" rel="noopener noreferrer">View public page</a>
                <button onClick={() => setEditingId(e.id)} className="text-green-600 underline">Edit</button>
                <button onClick={() => deleteEvent(e.id)} className="text-red-600 underline">Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}